import { Worker, Job } from 'bullmq'
import { ITEMS_QUEUE_NAME } from '../queue/items.queue'
import prisma from '../config/db'
import { ScraperService } from '../scraper/scraper.service'
import { generateTags } from '../ai/tagger.chain'
import { generateEmbedding, storeItemEmbedding } from '../ai/embedder.service'
import { SimilarityService } from '../modules/search/similarity.service'
import { extractMetadata } from '../ai/extractor.chain'
import { logger } from '../utils/logger'
import { getIo } from '../socket/socket'
import { redisConnection } from '../config/redis'

/**
 * The BullMQ worker that processes background jobs from the Items Queue.
 * Listens for "process-url" jobs, scrapes content, AI-tags, embeds, and links.
 */
export const itemsWorker = new Worker(
  ITEMS_QUEUE_NAME,
  async (job: Job<{ itemId: string; url: string }>) => {
    const { itemId, url } = job.data

    logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    logger.info(`[Worker] 🚀 STARTED processing job ${job.id}`)
    logger.info(`[Worker]    Item ID: ${itemId}`)
    logger.info(`[Worker]    URL: ${url}`)
    logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

    try {
      // STEP 1: Scrape the URL
      logger.info(`[Worker] 📥 Step 1/5: Scraping URL...`)
      const scrapedData = await ScraperService.scrape(url)
      logger.info(
        `[Worker] ✅ Scraped: type=${scrapedData.type}, title="${scrapedData.title?.substring(0, 60)}", content=${scrapedData.content?.length || 0} chars`,
      )

      // STEP 2: Extract Semantic Metadata
      let aiSummary = null
      let aiInsight = null
      let aiHighlights = null

      if (scrapedData.content) {
        logger.info(`[Worker] 🧠 Step 2/6: Extracting precise AI metadata...`)
        try {
          const metadata = await extractMetadata(scrapedData.content)
          aiSummary = metadata.summary
          aiInsight = metadata.aiInsight
          aiHighlights = metadata.highlights
          logger.info(
            `[Worker] ✅ Extracted deep semantic context successfully`,
          )
        } catch (metaErr) {
          logger.warn(`[Worker] ⚠️ Metadata extraction failed:`, metaErr)
        }
      }

      // STEP 3: Update the Item in the Database
      logger.info(`[Worker] 💾 Step 3/6: Saving scraped and AI data to DB...`)
      const updatedItem = await prisma.item.update({
        where: { id: itemId },
        data: {
          title: scrapedData.title,
          content: scrapedData.content,
          imageUrl: (scrapedData as any).imageUrl || null,
          summary: aiSummary,
          aiInsight: aiInsight,
          highlights: aiHighlights ? (aiHighlights as any) : null,
          type: scrapedData.type,
          status: 'processed',
        },
      })
      logger.info(`[Worker] ✅ Item updated → status: processed`)

      // 🚀 EMIT EARLY: Unblock the Frontend immediately now that primary text is processed!
      try {
        const io = getIo()
        io.to(updatedItem.userId).emit('item_processed', { itemId })
        logger.info(
          `[Worker] 📡 Broadcasted early 'item_processed' socket event (Unblocked UI)`,
        )
      } catch (socketErr) {
        // Ignore silent socket drops on isolated worker processes
      }

      // STEP 3: Generate AI Tags
      let tags: string[] = []
      if (scrapedData.content) {
        logger.info(`[Worker] 🏷️  Step 4/6: Generating AI tags...`)
        try {
          tags = await generateTags(scrapedData.content)
          logger.info(
            `[Worker] ✅ Generated ${tags.length} tags: [${tags.join(', ')}]`,
          )
        } catch (tagError) {
          logger.warn(
            `[Worker] ⚠️  Tag generation failed (non-fatal):`,
            tagError,
          )
        }
      } else {
        logger.warn(`[Worker] ⚠️  No content to tag, skipping Step 4`)
      }

      // STEP 4: Save tags to DB
      if (tags.length > 0) {
        logger.info(`[Worker] 💾 Step 5/6: Saving ${tags.length} tags to DB...`)
        for (const tagName of tags) {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          })
          await prisma.itemTag.create({
            data: { itemId, tagId: tag.id },
          })
        }
        logger.info(`[Worker] ✅ Tags saved`)
      } else {
        logger.info(`[Worker] ⏭️  Step 5/6: No tags to save, skipping`)
      }

      // STEP 5: Generate and store vector embeddings
      if (scrapedData.content) {
        logger.info(`[Worker] 🧮 Step 6/6: Generating vector embeddings...`)
        try {
          // Create Rich Embedding Text from Metadata
          const richTextParts = [
            scrapedData.title ? `Title: ${scrapedData.title}` : '',
            aiSummary ? `Summary: ${aiSummary}` : '',
            tags.length > 0 ? `Tags: ${tags.join(', ')}` : '',
            `Content: ${scrapedData.content.substring(0, 4000)}`, // Safeguard token limits
          ]
          const richTextForEmbedding = richTextParts
            .filter(Boolean)
            .join('\n\n')

          logger.info(
            `[Worker] 🧩 Generated Rich Text Embedding Input (${richTextForEmbedding.length} chars)`,
          )
          const vector =
            await generateEmbedding(richTextForEmbedding)
          if (vector) {
            await storeItemEmbedding(itemId, vector)
            logger.info(`[Worker] ✅ ${vector.length}-d vector stored`)

            // Auto-link semantically related items ONLY IF it's not a private document like a PDF/Image CV
            if (scrapedData.type === 'pdf') {
              logger.info(`[Worker] ⏭️ Skipping similarity linking for PDF to protect global graph privacy.`)
            } else {
              logger.info(`[Worker] 🔗 Discovering semantic similarities...`)
              await SimilarityService.linkSimilarItems(itemId, updatedItem.userId)
              logger.info(`[Worker] ✅ Similarity linking complete`)
            }
          } else {
            logger.warn(`[Worker] ⚠️  Embedding generation returned null`)
          }
        } catch (embedError) {
          logger.warn(
            `[Worker] ⚠️  Embedding step failed (non-fatal):`,
            embedError,
          )
        }
      } else {
        logger.warn(`[Worker] ⏭️  Step 6/6: No content to embed, skipping`)
      }

      logger.info(`[Worker] 🎉 COMPLETED item: ${itemId}`)

      // STEP 7: Schedule Memory Resurfacing Reminders
      try {
        const { scheduleTimeReminders } = await import('../modules/memory/reminder.queue')
        await scheduleTimeReminders(updatedItem.userId, itemId)
        logger.info(`[Worker] ⏰ Scheduled memory resurfacing reminders`)
      } catch (scheduleErr) {
        logger.warn(`[Worker] ⚠️ Could not schedule reminders:`, scheduleErr)
      }

      // STEP 8: Emit WebSocket Event for Real-time Frontend Updates
      try {
        const itemOwner = await prisma.item.findUnique({
          where: { id: itemId },
          select: { userId: true },
        })
        if (itemOwner) {
          const io = getIo()
          io.to(itemOwner.userId).emit('item_processed', { itemId })
          logger.info(
            `[Worker] 📡 Broadcasted 'item_processed' socket event to user room: ${itemOwner.userId}`,
          )
        }
      } catch (socketErr) {
        logger.warn(`[Worker] ⚠️ Could not emit socket event:`, socketErr)
      }

      logger.info(`[Worker] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      return { success: true, itemId }
    } catch (error: any) {
      logger.error(`[Worker] ❌ FAILED item ${itemId}:`, error)

      await prisma.item
        .update({
          where: { id: itemId },
          data: { status: 'failed' },
        })
        .catch(() => { })

      throw error
    }
  },
  {
    connection: redisConnection as any,
    concurrency: 5,
  },
)

itemsWorker.on('failed', (job, err) => {
  logger.error(`[Worker] ❌ Job ${job?.id} FAILED: ${err.message}`)
})

itemsWorker.on('completed', (job) => {
  logger.info(`[Worker] ✅ Job ${job.id} completed`)
})

itemsWorker.on('ready', () => {
  logger.info(
    `[Worker] 🟢 Worker is READY and listening for jobs on queue: "${ITEMS_QUEUE_NAME}"`,
  )
})

logger.info(
  `[Worker] 🔄 Initializing worker for queue: "${ITEMS_QUEUE_NAME}"...`,
)

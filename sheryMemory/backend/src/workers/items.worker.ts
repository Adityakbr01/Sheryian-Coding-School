import { Job, Worker } from 'bullmq'
import { processContentWithAI } from '../ai/content-processor.chain'
import { generateEmbedding, storeItemEmbedding } from '../ai/embedder.service'
import prisma from '../config/db'
import { redisConnection } from '../config/redis'
import { SimilarityService } from '../modules/search/similarity.service'
import { ITEMS_QUEUE_NAME } from '../queue/items.queue'
import { ScraperService } from '../scraper/scraper.service'
import { getIo } from '../socket/socket'
import { logger } from '../utils/logger'

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

      // STEP 2: Unified AI Processing (summary, tags, insight, highlights)
      let aiResult = {
        summary: null as string | null,
        insight: null as string | null,
        highlights: null as any,
        tags: [] as string[]
      }

      if (scrapedData.content) {
        logger.info(`[Worker] 🧠 Step 2/5: Processing content with AI (single call)...`)
        try {
          const result = await processContentWithAI(scrapedData.content)
          aiResult = {
            summary: result.summary,
            insight: result.insight,
            highlights: result.highlights,
            tags: result.tags
          }
          logger.info(`[Worker] ✅ Unified AI processing complete`)
        } catch (aiErr) {
          logger.warn(`[Worker] ⚠️ AI processing failed:`, aiErr)
        }
      }

      // STEP 3: Update Item & Save Tags
      logger.info(`[Worker] 💾 Step 3/5: Saving processed data to DB...`)
      const updatedItem = await prisma.item.update({
        where: { id: itemId },
        data: {
          title: scrapedData.title,
          content: scrapedData.content,
          imageUrl: (scrapedData as any).imageUrl || null,
          summary: aiResult.summary,
          aiInsight: aiResult.insight,
          highlights: aiResult.highlights ? (aiResult.highlights as any) : null,
          type: scrapedData.type,
          status: 'processed',
        },
      })

      // Save tags
      if (aiResult.tags && aiResult.tags.length > 0) {
        for (const tagName of aiResult.tags) {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          })
          await prisma.itemTag.create({
            data: { itemId, tagId: tag.id },
          }).catch(() => { }) // Ignore duplicates
        }
        logger.info(`[Worker] ✅ ${aiResult.tags.length} tags saved`)
      }

      // 🚀 EMIT EARLY: Unblock the Frontend immediately
      try {
        const io = getIo()
        io.to(updatedItem.userId).emit('item_processed', { itemId })
        logger.info(`[Worker] 📡 Broadcasted early 'item_processed' socket event`)
      } catch (socketErr) { }

      // STEP 4: Vector Embeddings
      if (scrapedData.content) {
        logger.info(`[Worker] 🧮 Step 4/5: Generating vector embeddings...`)
        try {
          const richTextParts = [
            scrapedData.title ? `Title: ${scrapedData.title}` : '',
            aiResult.summary ? `Summary: ${aiResult.summary}` : '',
            aiResult.tags.length > 0 ? `Tags: ${aiResult.tags.join(', ')}` : '',
            `Content: ${scrapedData.content.substring(0, 4000)}`,
          ]
          const richTextForEmbedding = richTextParts.filter(Boolean).join('\n\n')

          const vector = await generateEmbedding(richTextForEmbedding)
          if (vector) {
            await storeItemEmbedding(itemId, vector)
            logger.info(`[Worker] ✅ Embedding stored`)

            if (scrapedData.type !== 'pdf') {
              logger.info(`[Worker] 🔗 Linking similar items...`)
              await SimilarityService.linkSimilarItems(itemId, updatedItem.userId)
            }
          }
        } catch (embedError) {
          logger.warn(`[Worker] ⚠️ Embedding failed (non-fatal):`, embedError)
        }
      }

      logger.info(`[Worker] 🎉 COMPLETED item: ${itemId}`)

      // STEP 5: Reminders & Final Socket
      try {
        const { scheduleTimeReminders } = await import('../modules/memory/reminder.queue')
        await scheduleTimeReminders(updatedItem.userId, itemId)
      } catch (err) { }

      logger.info(`[Worker] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      return { success: true, itemId }
    } catch (error: any) {
      logger.error(`[Worker] ❌ FAILED item ${itemId}:`, error)
      await prisma.item.update({
        where: { id: itemId },
        data: { status: 'failed' },
      }).catch(() => { })
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

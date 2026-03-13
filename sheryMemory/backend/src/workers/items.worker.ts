import { Worker, Job } from 'bullmq'
import { redisConnection } from '../queue/connection'
import { ITEMS_QUEUE_NAME } from '../queue/items.queue'
import prisma from '../config/db'
import { ScraperService } from '../scraper/scraper.service'
import { generateTags } from '../ai/tagger.chain'
import { EmbedderService } from '../ai/embedder.service'
import { SimilarityService } from '../modules/search/similarity.service'
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
            logger.info(`[Worker] ✅ Scraped: type=${scrapedData.type}, title="${scrapedData.title?.substring(0, 60)}", content=${scrapedData.content?.length || 0} chars`)

            // STEP 2: Update the Item in the Database
            logger.info(`[Worker] 💾 Step 2/5: Saving scraped data to DB...`)
            const updatedItem = await prisma.item.update({
                where: { id: itemId },
                data: {
                    title: scrapedData.title,
                    content: scrapedData.content,
                    type: scrapedData.type,
                    status: 'processed'
                }
            })
            logger.info(`[Worker] ✅ Item updated → status: processed`)

            // STEP 3: Generate AI Tags
            let tags: string[] = []
            if (scrapedData.content) {
                logger.info(`[Worker] 🏷️  Step 3/5: Generating AI tags...`)
                try {
                    tags = await generateTags(scrapedData.content)
                    logger.info(`[Worker] ✅ Generated ${tags.length} tags: [${tags.join(', ')}]`)
                } catch (tagError) {
                    logger.warn(`[Worker] ⚠️  Tag generation failed (non-fatal):`, tagError)
                }
            } else {
                logger.warn(`[Worker] ⚠️  No content to tag, skipping Step 3`)
            }

            // STEP 4: Save tags to DB
            if (tags.length > 0) {
                logger.info(`[Worker] 💾 Step 4/5: Saving ${tags.length} tags to DB...`)
                for (const tagName of tags) {
                    const tag = await prisma.tag.upsert({
                        where: { name: tagName },
                        update: {},
                        create: { name: tagName }
                    })
                    await prisma.itemTag.create({
                        data: { itemId, tagId: tag.id }
                    })
                }
                logger.info(`[Worker] ✅ Tags saved`)
            } else {
                logger.info(`[Worker] ⏭️  Step 4/5: No tags to save, skipping`)
            }

            // STEP 5: Generate and store vector embeddings
            if (scrapedData.content) {
                logger.info(`[Worker] 🧮 Step 5/5: Generating vector embeddings...`)
                try {
                    const vector = await EmbedderService.generateEmbedding(scrapedData.content)
                    if (vector) {
                        await EmbedderService.storeItemEmbedding(itemId, vector)
                        logger.info(`[Worker] ✅ ${vector.length}-d vector stored`)

                        // Auto-link semantically related items
                        logger.info(`[Worker] 🔗 Discovering semantic similarities...`)
                        await SimilarityService.linkSimilarItems(itemId, updatedItem.userId)
                        logger.info(`[Worker] ✅ Similarity linking complete`)
                    } else {
                        logger.warn(`[Worker] ⚠️  Embedding generation returned null`)
                    }
                } catch (embedError) {
                    logger.warn(`[Worker] ⚠️  Embedding step failed (non-fatal):`, embedError)
                }
            } else {
                logger.warn(`[Worker] ⏭️  Step 5/5: No content to embed, skipping`)
            }

            logger.info(`[Worker] 🎉 COMPLETED item: ${itemId}`)
            logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
            return { success: true, itemId }
        } catch (error: any) {
            logger.error(`[Worker] ❌ FAILED item ${itemId}:`, error)

            await prisma.item.update({
                where: { id: itemId },
                data: { status: 'failed' }
            }).catch(() => { })

            throw error
        }
    },
    {
        connection: redisConnection as any,
        concurrency: 5
    }
)

itemsWorker.on('failed', (job, err) => {
    logger.error(`[Worker] ❌ Job ${job?.id} FAILED: ${err.message}`)
})

itemsWorker.on('completed', job => {
    logger.info(`[Worker] ✅ Job ${job.id} completed`)
})

itemsWorker.on('ready', () => {
    logger.info(`[Worker] 🟢 Worker is READY and listening for jobs on queue: "${ITEMS_QUEUE_NAME}"`)
})

logger.info(`[Worker] 🔄 Initializing worker for queue: "${ITEMS_QUEUE_NAME}"...`)

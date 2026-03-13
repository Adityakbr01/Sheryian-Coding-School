import { Queue } from 'bullmq'
import { redisConnection } from './connection'

export const ITEMS_QUEUE_NAME = 'items-processing-queue'

export const itemsQueue = new Queue(ITEMS_QUEUE_NAME, {
    connection: redisConnection as any,
})

export async function addUrlToQueue(itemId: string, url: string) {
    return await itemsQueue.add(
        'process-url',
        { itemId, url },
        {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        }
    )
}

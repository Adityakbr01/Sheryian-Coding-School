import { Worker, Job } from 'bullmq'
import { REMINDER_QUEUE_NAME } from '../modules/memory/reminder.queue'
import { ReminderService } from '../modules/memory/reminder.service'
import { logger } from '../utils/logger'
import { redisConnection } from '../config/redis'

const worker = new Worker(
  REMINDER_QUEUE_NAME,
  async (job: Job) => {
    if (job.name === 'resurface-item') {
      const { userId, itemId, intervalName } = job.data
      await ReminderService.processItemReminder(userId, itemId, intervalName)
    }
  },
  {
    connection: redisConnection as any,
    concurrency: 5, // Process up to 5 reminders concurrently
  },
)

worker.on('completed', (job) => {
  logger.info(`[Reminder Worker] Completed job ${job.id} for item ${job.data?.itemId}`)
})

worker.on('failed', (job, err) => {
  logger.error(`[Reminder Worker] Failed job ${job?.id} with error: ${err.message}`)
})

logger.info(`[Reminder Worker] Started listening to queue: ${REMINDER_QUEUE_NAME}`)

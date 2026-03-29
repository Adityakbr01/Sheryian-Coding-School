import { Queue } from 'bullmq'
import { redisConnection } from '../../config/redis';

// --- CONFIGURATION ---
export const REMINDER_TEST_MODE = true; // Set to false for production
const PROD_INTERVALS = [
  { delay: 1000 * 60 * 60 * 24, name: '1-day' },
  { delay: 1000 * 60 * 60 * 24 * 7, name: '7-days' },
  { delay: 1000 * 60 * 60 * 24 * 30, name: '30-days' },
]
const TEST_INTERVALS = [
  { delay: 2000, name: '2-seconds-test' },
  { delay: 6000, name: '6-seconds-test' },
  { delay: 10000, name: '10-seconds-test' },
]
// ---------------------

export const REMINDER_QUEUE_NAME = 'memory-reminder-queue'

export const reminderQueue = new Queue(REMINDER_QUEUE_NAME, {
  connection: redisConnection as any,
})

export async function scheduleTimeReminders(userId: string, itemId: string) {
  const intervals = REMINDER_TEST_MODE ? TEST_INTERVALS : PROD_INTERVALS;

  for (const interval of intervals) {
    await reminderQueue.add(
      'resurface-item',
      { userId, itemId, intervalName: interval.name },
      { delay: interval.delay, jobId: `resurface-${itemId}-${interval.name}` }
    )
  }
}

import prisma from './config/db'
import { reminderQueue } from './modules/memory/reminder.queue'

async function runTest() {
  console.log("🚀 Starting Instant Reminder Injection Test...")
  
  // Fetch up to 3 existing processed items
  const items = await prisma.item.findMany({ 
    where: { status: 'processed' },
    take: 3 
  })

  if (items.length === 0) {
    console.log("⚠️ No processed items found in your DB.")
    process.exit(0)
  }

  // Push them to the queue with a 2-second delay
  for (const item of items) {
    console.log(`> Queuing reminder for: ${item.title || item.url} (Delay: 2 seconds)`)
    await reminderQueue.add(
      'resurface-item',
      { userId: item.userId, itemId: item.id, intervalName: 'test-2s' },
      { delay: 2000 }
    )
  }

  console.log("✅ Done! Switch to your browser to see the notifications pop up!")
  process.exit(0)
}

runTest().catch((err) => {
  console.error("Test failed:", err)
  process.exit(1)
})

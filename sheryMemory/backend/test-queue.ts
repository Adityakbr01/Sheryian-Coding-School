import prisma from './src/config/db'
import { ItemsService } from './src/modules/items/items.service'

async function testWorker() {
    let user = await prisma.user.findFirst()

    // Create dummy user if none exists
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: 'test@sherymemory.com',
                password: 'password123',
                name: 'Test Setup User'
            }
        })
    }

    console.log('Using User:', user.email)

    console.log('Saving item to queue...')
    const item = await ItemsService.saveItem(user.id, {
        url: 'https://en.wikipedia.org/wiki/Artificial_intelligence'
    })

    console.log('Item saved! Waiting 15s for worker to process it...')
    await new Promise(r => setTimeout(r, 15000))

    const dbItem = await prisma.item.findUnique({
        where: { id: item.id },
        include: { tags: { include: { tag: true } } }
    })

    console.log('\n--- Final Processed Item ---')
    console.log('Title:', dbItem?.title)
    console.log('Status:', dbItem?.status)
    console.log('Tags:', dbItem?.tags.map(t => t.tag.name))
}

testWorker().catch(console.error).finally(() => process.exit(0))

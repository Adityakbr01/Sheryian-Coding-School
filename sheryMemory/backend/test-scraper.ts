import { ScraperService } from './src/scraper/scraper.service'

async function run() {
    console.log('Testing Article Scraper (Cheerio)...')

    // Choose a fast, simple article URL
    const url = 'https://example.com'

    const result = await ScraperService.scrape(url)

    console.log('\n--- SCRAPE RESULT ---')
    console.log(`TYPE: ${result.type}`)
    console.log(`TITLE: ${result.title}`)
    console.log(`CONTENT PREVIEW (first 100 chars): ${result.content?.slice(0, 100)}...`)
    console.log('---------------------\n')

    if (result.type === 'article' && result.content) {
        console.log('✅ Scraper module successfully routed, fetched, and parsed HTML logic.')
    } else {
        console.log('❌ Scraper module failed to parse correctly.')
    }
}

run()

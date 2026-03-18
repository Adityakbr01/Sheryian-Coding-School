import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const scraperTool = new DynamicStructuredTool({
  name: "web_scraper",
  description: "Scrape the text content of a given URL.",
  schema: z.object({
    url: z.string().url().describe("The URL of the webpage to scrape"),
  }),
  func: async ({ url }) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      const html = await response.text();
      // Simple regex to extract text content, replace with cheerio or similar for production
      const text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                       .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                       .replace(/<[^>]+>/g, ' ')
                       .replace(/\s+/g, ' ')
                       .trim();
      return text.substring(0, 2000) + '...'; // Limit output size
    } catch (error: any) {
      return `Error scraping ${url}: ${error.message}`;
    }
  },
});

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { tavilyClient } from "@/configs/tavily.config";

export const webSearchTool = tool(
    async ({ query }: { query: string }) => {
        const result = await tavilyClient.search(query, {
            searchDepth: "advanced",
        });
        return JSON.stringify(result.results);
    },
    {
        name: "web_search",
        description: "Search the web for real-time information, news, or general facts.",
        schema: z.object({
            query: z.string().describe("The search query"),
        }),
    }
);

import { tavily } from "@tavily/core";
import env from "@/configs/ENV";

// Initialize and export the Tavily client
export const tavilyClient = tavily({ apiKey: env.TAVILY_API_KEY });

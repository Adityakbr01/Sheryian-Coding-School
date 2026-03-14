
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import readline from "readline/promises";
import MistralAI from "./src/configs/mistral.config";
import env from "./src/configs/ENV";
import { tavily } from "@tavily/core";

// readline setup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Tavily client
const tavilyClient = tavily({ apiKey: env.TAVILY_API_KEY });

// Tavily search tool
const searchTool = tool(
  async ({ query }: { query: string }) => {
    const result = await tavilyClient.search(query, {
      searchDepth: "advanced",
    });

    return JSON.stringify(result.results);
  },
  {
    name: "web_search",
    description: "Search the web for real-time information",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);

// Bind tool to model
const model = MistralAI.bindTools([searchTool]);

// chat history
const chatHistory: (HumanMessage | AIMessage)[] = [];

async function startChat() {
  console.log("AI Assistant Started (type 'exit' to quit)\n");

  while (true) {
    const userInput = await rl.question("You: ");

    if (userInput.toLowerCase() === "exit") {
      console.log("Goodbye 👋");
      rl.close();
      process.exit(0);
    }

    const humanMessage = new HumanMessage(userInput);
    chatHistory.push(humanMessage);

    const response = await model.invoke(chatHistory);

    chatHistory.push(response);

    console.log(`Assistant: ${response.content}\n`);
  }
}

startChat();
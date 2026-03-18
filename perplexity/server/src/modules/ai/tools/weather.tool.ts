import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const weatherTool = new DynamicStructuredTool({
  name: "weather_tool",
  description: "Get the current weather for a specific location.",
  schema: z.object({
    location: z.string().describe("The city and state, e.g. London, UK"),
  }),
  func: async ({ location }) => {
    // Simulated weather tool, replace with real API like OpenWeatherMap
    return `The current weather in ${location} is sunny and 22 degrees Celsius.`;
  },
});

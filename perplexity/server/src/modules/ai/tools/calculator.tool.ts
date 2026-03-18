import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const calculatorTool = new DynamicStructuredTool({
  name: "calculator",
  description: "Useful for performing mathematical calculations. Input must be a math expression.",
  schema: z.object({
    expression: z.string().describe("A mathematical expression to evaluate, e.g. '2 + 2' or '3 * 4'"),
  }),
  func: async ({ expression }) => {
    try {
      // Evaluate the expression safely or use a math evaluation library
      // Here using Function as a basic evaluator for demo purposes (use mathjs in prod)
      const result = new Function(`return ${expression}`)();
      return result.toString();
    } catch (error: any) {
      return `Error calculating expression: ${error.message}`;
    }
  },
});

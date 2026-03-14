import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const currentTimeTool = tool(
    async ({ timezone }: { timezone?: string }) => {
        try {
            return new Date().toLocaleString("en-US", { timeZone: timezone || "UTC" }) + ` (Timezone: ${timezone || "UTC"})`;
        } catch (e) {
            return new Date().toLocaleString("en-US", { timeZone: "UTC" }) + " (Invalid timezone provided, defaulting to UTC)";
        }
    },
    {
        name: "get_current_time",
        description: "Get the exact current local time. You can optionally pass a standard IANA timezone string like 'Asia/Kolkata' or 'America/New_York'.",
        schema: z.object({
            timezone: z.string().optional().describe("The IANA timezone string"),
        }),
    }
);

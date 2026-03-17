import prisma from "@/configs/db";
import logger from "@/utils/logger";

export const memoryRepository = {
  searchMemories: async (userId: string, embedding: number[]) => {
    try {
      logger.debug(`Searching memories in DB for userId: ${userId}`);
      const vectorString = `[${embedding.join(',')}]`;
      const result = await prisma.$queryRaw`
        SELECT * FROM "Memory"
        WHERE "userId" = ${userId}
        ORDER BY embedding <-> ${vectorString}::vector
        LIMIT 5
      `;
      logger.debug(`Successfully searched memories in DB for userId: ${userId}`);
      return result;
    } catch (error: any) {
      logger.error(`Error searching memories for userId: ${userId} - ${error.message}`);
      throw error;
    }
  }
};













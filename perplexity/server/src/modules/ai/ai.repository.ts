import prisma from "@/configs/db";

export class AiRepository {
    /**
     * Saves a message (either Human or AI) to a Chat in the Database.
     */
    static async saveMessage(chatId: string, role: "user" | "assistant", content: string) {
        return prisma.message.create({
            data: {
                chatId,
                role,
                content,
            },
        });
    }

    /**
     * Retrieves all ordered messages for a given chat, with pagination support.
     */
    static async getHistoryByChat(chatId: string, page: number = 1, limit: number = 20) {
        const offset = (page - 1) * limit;
        return prisma.message.findMany({
            where: {
                chatId,
            },
            take: limit,
            skip: offset,
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    /**
     * Retrieves or creates a chat sequence.
     */
    static async getOrCreateChat(userId: string, chatId: string | null = null, title?: string) {
        if (chatId) {
            const chat = await prisma.chat.findUnique({ where: { id: chatId } });
            if (chat) return chat;
        }

        return prisma.chat.create({
            data: {
                userId,
                title: title || "New Chat",
            },
        });
    }

    /**
     * Update chat title
     */
    static async updateChatTitle(chatId: string, title: string) {
        return prisma.chat.update({
            where: { id: chatId },
            data: { title },
        });
    }

    /**
     * Get memory embeddings by similarity using PgVector
     */
    static async searchMemories(userId: string, queryEmbedding: number[], limit: number = 5) {
        // Warning: Requires prisma client config with pgvector
        // The implementation assumes prisma raw query capabilities for vector search
        const result = await prisma.$queryRaw`
          SELECT * FROM "Memory" 
          WHERE "userId" = ${userId}
          ORDER BY "embedding" <-> ${queryEmbedding}::vector 
          LIMIT ${limit};
        `;
        return result as any[];
    }
}

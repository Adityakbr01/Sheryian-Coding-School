import prisma from "@/configs/db";

export const aiRepository = {
    /**
     * Saves a message (either Human or AI) to a Chat in the Database.
     */
    saveMessage: async (chatId: string, role: "user" | "assistant", content: string) => {
        return prisma.message.create({
            data: {
                chatId,
                role,
                content,
            },
        });
    },

    /**
     * Retrieves all ordered messages for a given chat, with pagination support.
     */
    getHistoryByChat: async (chatId: string, page: number = 1, limit: number = 20) => {
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
    },

    /**
     * Retrieves or creates a chat sequence.
     */
    getOrCreateChat: async (userId: string, chatId: string | null = null, title?: string) => {
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
    },

    /**
     * Update chat title
     */
    updateChatTitle: async (chatId: string, title: string) => {
        return prisma.chat.update({
            where: { id: chatId },
            data: { title },
        });
    },

    /**
     * Get memory embeddings by similarity using PgVector
     */
    searchMemories: async (userId: string, queryEmbedding: number[], limit: number = 5) => {
        // Form array directly into vector castable string
        const vectorString = `[${queryEmbedding.join(',')}]`;
        const result = await prisma.$queryRaw`
          SELECT * FROM "Memory" 
          WHERE "userId" = ${userId}
          ORDER BY "embedding" <-> ${vectorString}::vector 
          LIMIT ${limit};
        `;
        return result as any[];
    }
};

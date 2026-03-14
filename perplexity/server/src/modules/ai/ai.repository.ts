import prisma from "@/configs/db";

export class AiRepository {
    /**
     * Saves a message (either Human or AI) to the Prisma Database.
     */
    static async saveMessage(userId: string, role: "user" | "assistant", content: string) {
        return prisma.message.create({
            data: {
                userId,
                role,
                content,
            },
        });
    }

    /**
     * Retrieves all ordered messages for a given user.
     */
    static async getHistoryByUser(userId: string) {
        return prisma.message.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }
}

import prisma from '../../config/db'
import { CreateHighlightInput } from './highlights.schema'
import { AppError } from '../../utils/AppError'

export class HighlightsService {
    static async create(userId: string, data: CreateHighlightInput) {
        return prisma.highlight.create({
            data: {
                userId,
                url: data.url,
                text: data.text
            }
        })
    }

    static async getAll(userId: string) {
        return prisma.highlight.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })
    }

    static async delete(userId: string, id: string) {
        const highlight = await prisma.highlight.findFirst({
            where: { id, userId }
        })

        if (!highlight) {
            throw new AppError('Highlight not found', 404)
        }

        await prisma.highlight.delete({ where: { id } })
        return { success: true }
    }
}

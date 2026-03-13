import prisma from '../../config/db'

export class GraphService {
    /**
     * Returns the full knowledge graph for a user:
     * - nodes: all processed items (id, title, type, url)
     * - edges: all relations between those items (source, target, score)
     */
    static async getGraph(userId: string) {
        // Get all processed items as nodes
        const items = await prisma.item.findMany({
            where: { userId, status: 'processed' },
            select: {
                id: true,
                title: true,
                url: true,
                type: true,
                createdAt: true
            }
        })

        const itemIds = items.map(i => i.id)

        // Get all relations where both source and target belong to this user's items
        const relations = await prisma.relation.findMany({
            where: {
                sourceId: { in: itemIds },
                targetId: { in: itemIds }
            },
            select: {
                sourceId: true,
                targetId: true,
                score: true
            }
        })

        // Format as graph data
        const nodes = items.map(item => ({
            id: item.id,
            title: item.title || item.url,
            type: item.type,
            url: item.url,
            createdAt: item.createdAt
        }))

        const edges = relations.map(rel => ({
            source: rel.sourceId,
            target: rel.targetId,
            score: rel.score
        }))

        return { nodes, edges }
    }
}

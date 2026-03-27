import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Color palette mapped to common tag categories
const TAG_COLORS: Record<string, string> = {
  javascript: '#f7df1e',
  react: '#61dafb',
  nextjs: '#000000',
  nodejs: '#68a063',
  typescript: '#3178c6',
  git: '#f05032',
  github: '#333333',
  css: '#264de4',
  html: '#e34c26',
  python: '#3776ab',
  backend: '#6366f1',
  frontend: '#ec4899',
  database: '#10b981',
  api: '#f59e0b',
  default: '#8b5cf6',
}

function getTagColor(tagName: string): string {
  const lower = tagName.toLowerCase()
  for (const [keyword, color] of Object.entries(TAG_COLORS)) {
    if (lower.includes(keyword)) return color
  }
  return TAG_COLORS.default
}

function getLinkLabel(score: number): string {
  if (score >= 0.85) return 'strong'
  if (score >= 0.75) return 'medium'
  return 'weak'
}

const TYPE_COLORS: Record<string, string> = {
  video: '#ef4444',
  article: '#3b82f6',
  tweet: '#1da1f2',
  pdf: '#f97316',
  default: '#8b5cf6',
}

export class GraphService {
  /**
   * Production-grade graph builder with:
   * - Dynamic node sizing based on tag count
   * - Tag nodes connecting items into cluster groups
   * - Link labels (weak/medium/strong) based on similarity
   * - Similarity threshold filtering (> 0.7)
   * - Max 50 item nodes for performance
   */
  static async getGraphData(userId: string) {
    // ── Step 1: Fetch items with tags ──────────────────────────────
    const items = await prisma.item.findMany({
      where: { userId, status: 'processed' },
      select: {
        id: true,
        title: true,
        type: true,
        url: true,
        summary: true,
        imageUrl: true,
        collectionId: true,
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit graph density
    })

    // ── Step 2: Build Item Nodes with dynamic sizing ──────────────
    const nodes: any[] = items.map((item) => ({
      id: item.id,
      name: item.title || item.url,
      val: Math.max(2, (item.tags?.length || 0) + 1), // Dynamic size based on tag count
      group: item.tags?.[0]?.tag?.name || item.type || 'misc',
      type: item.type || 'article',
      nodeType: 'item', // Distinguish from tag nodes
      color: TYPE_COLORS[item.type || 'default'] || TYPE_COLORS.default,
      summary: item.summary || null,
      imageUrl: item.imageUrl || null,
      tags: item.tags?.map((t) => t.tag.name) || [],
    }))

    // ── Step 3: Build Tag Nodes ───────────────────────────────────
    const tagMap = new Map<string, { name: string; count: number }>()

    for (const item of items) {
      for (const it of item.tags || []) {
        const tagName = it.tag.name
        const existing = tagMap.get(tagName)
        if (existing) {
          existing.count++
        } else {
          tagMap.set(tagName, { name: tagName, count: 1 })
        }
      }
    }

    // Create tag nodes and item→tag links
    const tagLinks: any[] = []
    for (const [tagName, tagInfo] of tagMap) {
      const tagNodeId = `tag-${tagName}`

      nodes.push({
        id: tagNodeId,
        name: `#${tagName}`,
        val: Math.max(3, tagInfo.count * 2), // Larger tags = more connected
        group: tagName,
        type: 'tag',
        nodeType: 'tag',
        color: getTagColor(tagName),
        summary: `${tagInfo.count} items tagged with "${tagName}"`,
        imageUrl: null,
        tags: [],
      })

      // Connect all items with this tag to the tag node
      for (const item of items) {
        const hasTag = item.tags?.some((t) => t.tag.name === tagName)
        if (hasTag) {
          tagLinks.push({
            source: item.id,
            target: tagNodeId,
            value: 0.5,
            label: 'tag',
          })
        }
      }
    }

    // ── Step 4: Build Semantic Links (only > 0.7 similarity) ─────
    const itemIds = items.map((i) => i.id)

    const dbRelations = await prisma.relation.findMany({
      where: {
        sourceId: { in: itemIds },
        targetId: { in: itemIds },
        score: { gte: 0.7 }, // Only strong semantic connections
      },
    })

    const semanticLinks = dbRelations.map((rel) => ({
      source: rel.sourceId,
      target: rel.targetId,
      value: rel.score,
      label: getLinkLabel(rel.score),
    }))

    // ── Step 5: Merge all links ──────────────────────────────────
    const links = [...semanticLinks, ...tagLinks]

    return { nodes, links }
  }

  /**
   * Pure mathematical DB-layer Semantic sync overriding JS looping.
   * Executes a raw PgVector matching query cross-referencing all 1024-dim embeddings.
   * Only connecting boundaries holding > 70% vector correlation.
   */
  static async syncSemanticRelations(userId: string) {
    await prisma.$executeRaw`
      INSERT INTO "Relation" ("id", "sourceId", "targetId", "score", "createdAt")
      SELECT 
         gen_random_uuid()::text as id, 
         a.id as "sourceId", 
         b.id as "targetId", 
         1 - (a.embedding <=> b.embedding) as score,
         now() as "createdAt"
      FROM "Item" a
      JOIN "Item" b ON a."userId" = b."userId" AND a.id < b.id
      WHERE a."userId" = ${userId}
        AND a.embedding IS NOT NULL 
        AND b.embedding IS NOT NULL
        AND 1 - (a.embedding <=> b.embedding) > 0.70
      ON CONFLICT ("sourceId", "targetId") DO UPDATE 
         SET score = EXCLUDED.score;
    `

    return { success: true }
  }

  /**
   * Get items semantically related to a given item.
   * Looks up Relation table for both source→target and target→source.
   */
  static async getRelatedItems(
    userId: string,
    itemId: string,
    limit: number = 5,
  ) {
    // Find relations where this item is either source or target
    const relations = await prisma.relation.findMany({
      where: {
        OR: [{ sourceId: itemId }, { targetId: itemId }],
        score: { gte: 0.7 },
      },
      orderBy: { score: 'desc' },
      take: limit * 2, // Get extra since we'll filter by userId
    })

    // Collect the IDs of related items (the other side of the relation)
    const relatedIdScores = relations.map((r) => ({
      id: r.sourceId === itemId ? r.targetId : r.sourceId,
      score: r.score,
    }))

    // Deduplicate
    const seen = new Set<string>()
    const unique = relatedIdScores
      .filter((r) => {
        if (seen.has(r.id)) return false
        seen.add(r.id)
        return true
      })
      .slice(0, limit)

    if (unique.length === 0) return []

    // Fetch the actual items (only those belonging to this user)
    const items = await prisma.item.findMany({
      where: {
        id: { in: unique.map((u) => u.id) },
        userId,
      },
      select: {
        id: true,
        title: true,
        url: true,
        type: true,
        summary: true,
        tags: {
          include: { tag: true },
          take: 3,
        },
      },
    })

    // Attach similarity scores and sort
    return items
      .map((item) => ({
        ...item,
        similarity: unique.find((u) => u.id === item.id)?.score || 0,
        tags: item.tags.map((t) => t.tag.name),
      }))
      .sort((a, b) => b.similarity - a.similarity)
  }
}

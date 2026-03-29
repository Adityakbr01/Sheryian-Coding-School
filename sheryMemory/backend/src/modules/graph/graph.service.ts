import { GraphDao } from './graph.dao'

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

const TYPE_COLORS: Record<string, string> = {
  video: '#ef4444',
  article: '#3b82f6',
  tweet: '#1da1f2',
  pdf: '#f97316',
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

export const GraphService = {
  /**
   * Production-grade graph builder with:
   * - Dynamic node sizing based on tag count
   * - Tag nodes connecting items into cluster groups
   * - Link labels (weak/medium/strong) based on similarity
   * - Similarity threshold filtering (> 0.7)
   */
  async getGraphData(userId: string) {
    const items = await GraphDao.findItemsForGraph(userId, 50)

    const nodes: any[] = items.map((item) => ({
      id: item.id,
      name: item.title || item.url,
      val: Math.max(2, (item.tags?.length || 0) + 1),
      group: item.tags?.[0]?.tag?.name || item.type || 'misc',
      type: item.type || 'article',
      nodeType: 'item',
      color: TYPE_COLORS[item.type || 'default'] || TYPE_COLORS.default,
      summary: item.summary || null,
      imageUrl: item.imageUrl || null,
      tags: (item.tags as any[])?.map((t) => t.tag.name) || [],
    }))

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

    const tagLinks: any[] = []
    for (const [tagName, tagInfo] of tagMap) {
      const tagNodeId = `tag-${tagName}`
      nodes.push({
        id: tagNodeId,
        name: `#${tagName}`,
        val: Math.max(3, tagInfo.count * 2),
        group: tagName,
        type: 'tag',
        nodeType: 'tag',
        color: getTagColor(tagName),
        summary: `${tagInfo.count} items tagged with "${tagName}"`,
        imageUrl: null,
        tags: [],
      })

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

    const itemIds = items.map((i) => i.id)
    const dbRelations = await GraphDao.findRelationsForGraph(itemIds, 0.7)

    const semanticLinks = dbRelations.map((rel) => ({
      source: rel.sourceId,
      target: rel.targetId,
      value: rel.score,
      label: getLinkLabel(rel.score),
    }))

    return { nodes, links: [...semanticLinks, ...tagLinks] }
  },

  async syncSemanticRelations(userId: string) {
    await GraphDao.syncRelationsRaw(userId)
    return { success: true }
  },

  async getRelatedItems(
    userId: string,
    itemId: string,
    limit: number = 5,
  ) {
    const relations = await GraphDao.findRelationsByItemId(itemId, 0.7, limit * 2)

    const seen = new Set<string>()
    const relatedIdScores = relations
      .map((r) => ({
        id: r.sourceId === itemId ? r.targetId : r.sourceId,
        score: r.score,
      }))
      .filter((r) => {
        if (seen.has(r.id)) return false
        seen.add(r.id)
        return true
      })
      .slice(0, limit)

    if (relatedIdScores.length === 0) return []

    const items = await GraphDao.findRelatedItems(relatedIdScores.map((u) => u.id), userId)

    return items
      .map((item) => ({
        ...item,
        similarity: relatedIdScores.find((u) => u.id === item.id)?.score || 0,
        tags: (item.tags as any[]).map((t) => t.tag.name),
      }))
      .sort((a, b) => b.similarity - a.similarity)
  },
}


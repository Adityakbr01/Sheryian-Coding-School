import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { graphApi } from '../api/graph.api'
import { useState, useCallback, useMemo, useEffect } from 'react'
import type { GraphNode, GraphLink, GraphData } from '../types/graph.types'

export function useGraph() {
  const queryClient = useQueryClient()

  // ── Network Data ────────────────────────────────────────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ['graph'],
    queryFn: graphApi.getGraph,
    staleTime: 60 * 1000,
  })

  const syncMutation = useMutation({
    mutationFn: graphApi.syncGraph,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graph'] })
    },
  })

  // ── Perspective States ──────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'network' | 'hierarchy'>('network')

  // ── Interaction States ──────────────────────────────────────────
  const [highlightNodes, setHighlightNodes] = useState(new Set<GraphNode>())
  const [highlightLinks, setHighlightLinks] = useState(new Set<GraphLink>())
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null)

  // ── Search Interface ────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [searchMatchIds, setSearchMatchIds] = useState<Set<string>>(new Set())

  const graphData: GraphData = useMemo(() => data || { nodes: [], links: [] }, [data])
  const nodeById = useMemo(() => {
    const map = new Map<string, GraphNode>()
    graphData.nodes.forEach((node) => map.set(node.id, node))
    return map
  }, [graphData.nodes])

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchMatchIds(new Set())
      return
    }
    const q = searchQuery.toLowerCase()
    const matchIds = new Set<string>()
    graphData.nodes.forEach((node) => {
      const name = (node.name || '').toLowerCase()
      const tags = (node.tags || []).join(' ').toLowerCase()
      const summary = (node.summary || '').toLowerCase()
      if (name.includes(q) || tags.includes(q) || summary.includes(q)) {
        matchIds.add(node.id)
      }
    })
    setSearchMatchIds(matchIds)
  }, [searchQuery, graphData])

  // Hover Interaction logic
  const handleNodeHover = useCallback((node: GraphNode | null) => {
    const newHighlightNodes = new Set<GraphNode>()
    const newHighlightLinks = new Set<GraphLink>()

    if (node) {
      newHighlightNodes.add(node)
      graphData.links.forEach((link) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source
        const targetId = typeof link.target === 'object' ? link.target.id : link.target

        if (sourceId === node.id || targetId === node.id) {
          newHighlightLinks.add(link)

          const neighborId = sourceId === node.id ? targetId : sourceId
          const neighbor = nodeById.get(neighborId)
          if (neighbor) {
            newHighlightNodes.add(neighbor)
          }
        }
      })
    }

    setHoverNode(node)
    setHighlightNodes(newHighlightNodes)
    setHighlightLinks(newHighlightLinks)
  }, [graphData.links, nodeById])

  // ── Computed Stats ──────────────────────────────────────────────
  const stats = useMemo(() => {
    const itemNodes = graphData.nodes.filter((n) => n.nodeType !== 'tag').length
    const tagNodes = graphData.nodes.filter((n) => n.nodeType === 'tag').length
    const totalNodes = graphData.nodes.length
    const totalLinks = graphData.links.length
    const avgDegree = totalNodes > 0 ? (2 * totalLinks) / totalNodes : 0
    const density = totalNodes > 1
      ? (2 * totalLinks) / (totalNodes * (totalNodes - 1))
      : 0

    return {
      itemNodes,
      tagNodes,
      links: totalLinks,
      totalNodes,
      avgDegree,
      density,
    }
  }, [graphData])

  return {
    graphData,
    isLoading,
    error,
    syncGraph: syncMutation.mutate,
    isSyncing: syncMutation.isPending,

    // View state
    viewMode,
    setViewMode,

    // Interaction state
    highlightNodes,
    highlightLinks,
    hoverNode,
    handleNodeHover,

    // Search state
    searchQuery,
    setSearchQuery,
    searchMatchIds,
    hasSearch: searchQuery.trim().length > 0,

    // Computed
    stats
  }
}

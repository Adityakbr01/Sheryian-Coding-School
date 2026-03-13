"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { useAuthStore } from "@/store/auth.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  type: string;
  url: string;
}

interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  score: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Color scheme by content type
const TYPE_COLORS: Record<string, string> = {
  article: "#3B82F6", // blue
  video: "#EF4444", // red
  pdf: "#F59E0B", // amber
  tweet: "#06B6D4", // cyan
  image: "#8B5CF6", // purple
  default: "#6B7280", // gray
};

function getTypeColor(type: string): string {
  return TYPE_COLORS[type] || TYPE_COLORS.default;
}

export default function GraphPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore.getState().token;

  // Fetch graph data
  const fetchGraph = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/graph`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch graph");
      const json = await res.json();
      setGraphData(json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  // D3 Force simulation
  useEffect(() => {
    if (!graphData || !svgRef.current || !containerRef.current) return;
    if (graphData.nodes.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous SVG content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // Create a group for zoom
    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Deep copy data so D3 doesn't mutate our state
    const nodes: GraphNode[] = graphData.nodes.map((n) => ({ ...n }));
    const edges: GraphEdge[] = graphData.edges.map((e) => ({ ...e }));

    // Force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, any>(edges)
          .id((d: any) => d.id)
          .distance(120)
          .strength((d: any) => d.score || 0.5),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    // Draw edges
    const link = g
      .append("g")
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke", "#374151")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", (d: any) => Math.max(1, d.score * 3));

    // Draw nodes
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer");

    // Node circles
    node
      .append("circle")
      .attr("r", 16)
      .attr("fill", (d: GraphNode) => getTypeColor(d.type))
      .attr("stroke", "#1F2937")
      .attr("stroke-width", 2)
      .on("mouseover", function () {
        d3.select(this)
          .attr("r", 22)
          .attr("stroke", "#F9FAFB")
          .attr("stroke-width", 3);
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("r", 16)
          .attr("stroke", "#1F2937")
          .attr("stroke-width", 2);
      });

    // Node labels
    node
      .append("text")
      .text(
        (d: GraphNode) =>
          (d.title || "").substring(0, 20) +
          (d.title && d.title.length > 20 ? "…" : ""),
      )
      .attr("dy", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#D1D5DB")
      .attr("font-size", "11px")
      .attr("pointer-events", "none");

    // Click to select
    node.on("click", (event: MouseEvent, d: GraphNode) => {
      setSelectedNode(d);
    });

    // Drag behavior
    const drag = d3
      .drag<SVGGElement, GraphNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag as any);

    // Tick update
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: GraphNode) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [graphData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-gray-400">
        <svg
          className="h-16 w-16 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <p className="text-lg">No items processed yet.</p>
        <p className="text-sm mt-1">
          Save some URLs and let them process — your knowledge graph will appear
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)]">
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl p-4 text-sm">
        <h3 className="text-white font-semibold mb-2">Knowledge Graph</h3>
        <p className="text-gray-400 text-xs mb-3">
          {graphData.nodes.length} nodes · {graphData.edges.length} connections
        </p>
        <div className="space-y-1.5">
          {Object.entries(TYPE_COLORS)
            .filter(([k]) => k !== "default")
            .map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                ></span>
                <span className="text-gray-300 capitalize">{type}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Selected node detail */}
      {selectedNode && (
        <div className="absolute top-4 right-4 z-10 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl p-4 max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
              style={{
                backgroundColor: getTypeColor(selectedNode.type),
                color: "#fff",
              }}
            >
              {selectedNode.type}
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <h4 className="text-white font-medium text-sm mb-1">
            {selectedNode.title}
          </h4>
          <a
            href={selectedNode.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 text-xs break-all"
          >
            {selectedNode.url}
          </a>
        </div>
      )}

      {/* D3 Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full bg-gray-950 rounded-xl border border-gray-800"
      >
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}

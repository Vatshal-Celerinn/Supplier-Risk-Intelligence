"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { ForceGraphProps } from "react-force-graph-2d";
import api from "@/lib/api";

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d"),
  { ssr: false }
) as React.ComponentType<ForceGraphProps>;

type GraphNode = {
  id: string;
  type?: string;
  tier?: number;
  risk_score?: number;
  risk_level?: "GREEN" | "YELLOW" | "RED";
  sanctioned?: boolean;
};

type GraphLink = {
  source: string | any;
  target: string | any;
  type?: string;
};

type GraphResponse = {
  nodes: GraphNode[];
  links: GraphLink[];
  sanction_paths?: string[][];
};

export default function TrustGraph({ name }: { name: string }) {
  const [data, setData] = useState<GraphResponse>({
    nodes: [],
    links: [],
    sanction_paths: [],
  });

  const [riskFilter, setRiskFilter] = useState<
    "" | "GREEN" | "YELLOW" | "RED"
  >("");

  // -----------------------------------------
  // Fetch Graph
  // -----------------------------------------
  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const res = await api.get(`/graph/${name}`);
        setData({
          nodes: res.data.nodes || [],
          links: res.data.links || [],
          sanction_paths: res.data.sanction_paths || [],
        });
      } catch (err) {
        console.error("Graph fetch error:", err);
        setData({ nodes: [], links: [], sanction_paths: [] });
      }
    };

    if (name) {
      fetchGraph();
    }
  }, [name]);

  // -----------------------------------------
  // Risk Filtering
  // -----------------------------------------
  const filteredGraph = useMemo(() => {
    if (!riskFilter) return data;

    const filteredNodes = data.nodes.filter(
      (node) => node.risk_level === riskFilter || node.tier === 0
    );

    const allowedIds = new Set(filteredNodes.map((n) => n.id));

    const filteredLinks = data.links.filter((link: any) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source;
      const targetId = typeof link.target === "object" ? link.target.id : link.target;
      return allowedIds.has(sourceId) && allowedIds.has(targetId);
    });

    return {
      ...data,
      nodes: filteredNodes,
      links: filteredLinks,
    };
  }, [data, riskFilter]);

  // -----------------------------------------
  // Sanction Path Highlight Check
  // -----------------------------------------
  const isSanctionLink = (link: any) => {
    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;

    return data.sanction_paths?.some((path) => {
      for (let i = 0; i < path.length - 1; i++) {
        if (path[i] === sourceId && path[i + 1] === targetId) {
          return true;
        }
      }
      return false;
    });
  };

  const nodeCount = filteredGraph.nodes.length;
  const linkCount = filteredGraph.links.length;
  const sanctionedCount = filteredGraph.nodes.filter((n) => n.sanctioned).length;

  return (
    <div>
      {/* ---------------- CONTROLS + STATS ROW ---------------- */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 uppercase tracking-wider">
            Filter by Risk:
          </label>
          <select
            value={riskFilter}
            onChange={(e) =>
              setRiskFilter(e.target.value as "" | "GREEN" | "YELLOW" | "RED")
            }
            className="bg-[#0a0f18] border border-zinc-700 text-gray-300 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-zinc-500"
          >
            <option value="">All Nodes</option>
            <option value="GREEN">Green (Low Risk)</option>
            <option value="YELLOW">Yellow (Medium Risk)</option>
            <option value="RED">Red (High Risk)</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-gray-500">
          <span>{nodeCount} nodes</span>
          <span className="text-zinc-700">·</span>
          <span>{linkCount} connections</span>
          {sanctionedCount > 0 && (
            <>
              <span className="text-zinc-700">·</span>
              <span className="text-red-500 font-bold">{sanctionedCount} sanctioned</span>
            </>
          )}
        </div>
      </div>

      {/* ---------------- LEGEND ---------------- */}
      <div className="flex items-center gap-5 mb-3 text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
          Low Risk
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#facc15]" />
          Medium Risk
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
          High / Sanctioned
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#9ca3af]" />
          Unknown
        </div>
        <div className="flex items-center gap-1.5 ml-4">
          <span className="inline-block w-5 h-0.5 bg-[#dc2626]" />
          Sanction Path
        </div>
      </div>

      {/* ---------------- GRAPH ---------------- */}
      <div style={{ height: 550 }} className="border border-zinc-800/50 rounded-md overflow-hidden bg-[#060a11]">
        <ForceGraph2D
          graphData={filteredGraph}
          nodeLabel={(node: any) =>
            `${node.id}\nTier: ${node.tier ?? "-"}\nRisk Score: ${node.risk_score ?? 0}\nRisk Level: ${node.risk_level ?? "N/A"}\nSanctioned: ${node.sanctioned ? "Yes" : "No"}`
          }
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const colorMap: any = {
              GREEN: "#22c55e",
              YELLOW: "#facc15",
              RED: "#ef4444",
            };

            const size = node.tier === 0 ? 12 : node.tier === 1 ? 8 : 6;
            const color = colorMap[node.risk_level] || "#9ca3af";

            // Glow for sanctioned nodes
            if (node.sanctioned) {
              ctx.beginPath();
              ctx.arc(node.x!, node.y!, size + 5, 0, 2 * Math.PI);
              ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
              ctx.fill();
            }

            // Node circle
            ctx.beginPath();
            ctx.arc(node.x!, node.y!, size, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();

            // Label for tier 0 and tier 1 nodes
            if (node.tier <= 1) {
              const label = node.id;
              const fontSize = Math.max(10 / globalScale, 3);
              ctx.font = `${fontSize}px Inter, sans-serif`;
              ctx.fillStyle = "#d1d5db";
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              ctx.fillText(label, node.x!, node.y! + size + 3);
            }
          }}
          linkDirectionalArrowLength={5}
          linkDirectionalArrowRelPos={1}
          linkWidth={(link: any) => (isSanctionLink(link) ? 2.5 : 1)}
          linkColor={(link: any) =>
            isSanctionLink(link) ? "#dc2626" : "rgba(156, 163, 175, 0.3)"
          }
          linkCanvasObjectMode={() => "after"}
          linkCanvasObject={(link: any, ctx, globalScale) => {
            // Render relationship type labels on links
            if (!link.type) return;

            const start = link.source;
            const end = link.target;

            if (typeof start !== "object" || typeof end !== "object") return;

            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;

            const fontSize = Math.max(8 / globalScale, 2);
            ctx.font = `${fontSize}px Inter, sans-serif`;
            ctx.fillStyle = "rgba(156, 163, 175, 0.5)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(link.type, midX, midY);
          }}
        />
      </div>
    </div>
  );
}
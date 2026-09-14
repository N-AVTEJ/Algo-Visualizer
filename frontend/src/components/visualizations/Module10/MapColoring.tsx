import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Palette, AlertCircle, CheckCircle } from 'lucide-react';
import type { GraphColoringStep, SimpleGraphEdge } from '../../../types';

interface MapColoringProps {
  step: GraphColoringStep | null;
  vertices: string[];
  edges: SimpleGraphEdge[];
  chromaticNumber: number;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

const PALETTES: Record<string, string[]> = {
  neon: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'],
  classic: ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#0891b2'],
  pastel: ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#38bdf8', '#c084fc'],
};

export const MapColoring: React.FC<MapColoringProps> = ({
  step,
  vertices,
  edges,
  chromaticNumber,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const nodePositionsRef = useRef<Record<string, { x: number; y: number }>>({});
  const [selectedPalette, setSelectedPalette] = useState<string>('neon');

  const paletteColors = PALETTES[selectedPalette] || PALETTES.neon;

  const currentVertex = step?.vertex ?? null;
  const currentAction = step?.action ?? null;
  const partialColoring = step?.partial_coloring ?? {};
  const conflictingVertex = step?.conflicting_vertex ?? null;
  const conflictReason = step?.conflict_reason ?? null;

  useEffect(() => {
    if (!svgRef.current || vertices.length === 0) return;

    const width = 640;
    const height = 420;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 140;

    // Initialize circular layout if positions not stored
    vertices.forEach((v, idx) => {
      if (!nodePositionsRef.current[v]) {
        const angle = (2 * Math.PI * idx) / vertices.length - Math.PI / 2;
        nodePositionsRef.current[v] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        };
      }
    });

    const nodesData: SimNode[] = vertices.map((v) => ({
      id: v,
      x: nodePositionsRef.current[v]?.x ?? centerX,
      y: nodePositionsRef.current[v]?.y ?? centerY,
    }));

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.attr('viewBox', `0 0 ${width} ${height}`).append('g');

    // Draw Edges
    const linkGroup = g.append('g').attr('class', 'edges');
    const links = linkGroup
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        // Highlight conflict edge
        const isConflictEdge =
          (d.u === currentVertex && d.v === conflictingVertex) ||
          (d.v === currentVertex && d.u === conflictingVertex);
        if (isConflictEdge && currentAction === 'conflict') return '#ef4444';
        return '#334155'; // slate-700
      })
      .attr('stroke-width', (d) => {
        const isConflictEdge =
          (d.u === currentVertex && d.v === conflictingVertex) ||
          (d.v === currentVertex && d.u === conflictingVertex);
        if (isConflictEdge && currentAction === 'conflict') return 4;
        return 2;
      })
      .attr('stroke-dasharray', (d) => {
        const isConflictEdge =
          (d.u === currentVertex && d.v === conflictingVertex) ||
          (d.v === currentVertex && d.u === conflictingVertex);
        if (isConflictEdge && currentAction === 'conflict') return '6,3';
        return 'none';
      });

    // Draw Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeElements = nodeGroup
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodesData)
      .enter()
      .append('g')
      .attr('cursor', 'grab');

    // Drag behavior
    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on('start', function () {
        d3.select(this).attr('cursor', 'grabbing');
      })
      .on('drag', function (event, d) {
        d.x = event.x;
        d.y = event.y;
        nodePositionsRef.current[d.id] = { x: event.x, y: event.y };
        d3.select(this).attr('transform', `translate(${d.x}, ${d.y})`);

        // Update links connected to this node
        links
          .attr('x1', (l) => nodePositionsRef.current[l.u]?.x ?? 0)
          .attr('y1', (l) => nodePositionsRef.current[l.u]?.y ?? 0)
          .attr('x2', (l) => nodePositionsRef.current[l.v]?.x ?? 0)
          .attr('y2', (l) => nodePositionsRef.current[l.v]?.y ?? 0);
      })
      .on('end', function () {
        d3.select(this).attr('cursor', 'grab');
      });

    nodeElements.call(drag);

    // Initial position update for nodes & links
    nodeElements.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    links
      .attr('x1', (d) => nodePositionsRef.current[d.u]?.x ?? 0)
      .attr('y1', (d) => nodePositionsRef.current[d.u]?.y ?? 0)
      .attr('x2', (d) => nodePositionsRef.current[d.v]?.x ?? 0)
      .attr('y2', (d) => nodePositionsRef.current[d.v]?.y ?? 0);

    // Node circles
    nodeElements
      .append('circle')
      .attr('r', 24)
      .attr('fill', (d) => {
        const colorIdx = partialColoring[d.id];
        if (colorIdx && colorIdx > 0) {
          return paletteColors[(colorIdx - 1) % paletteColors.length];
        }
        // If it's being evaluated currently
        if (d.id === currentVertex && step?.color) {
          return paletteColors[(step.color - 1) % paletteColors.length];
        }
        return '#0f172a'; // slate-900 unassigned
      })
      .attr('stroke', (d) => {
        if (d.id === currentVertex) {
          if (currentAction === 'conflict') return '#ef4444'; // red
          if (currentAction === 'backtrack') return '#f97316'; // orange
          return '#38bdf8'; // sky blue
        }
        if (d.id === conflictingVertex && currentAction === 'conflict') {
          return '#ef4444';
        }
        return '#475569'; // slate-600
      })
      .attr('stroke-width', (d) => (d.id === currentVertex ? 4 : 2));

    // Outer pulse ring for active vertex
    nodeElements
      .filter((d) => d.id === currentVertex)
      .append('circle')
      .attr('r', 32)
      .attr('fill', 'none')
      .attr('stroke', currentAction === 'conflict' ? '#ef4444' : '#38bdf8')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,3')
      .attr('opacity', 0.8);

    // Vertex name label
    nodeElements
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -2)
      .attr('fill', '#ffffff')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .text((d) => d.id);

    // Color number label below name
    nodeElements
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 12)
      .attr('fill', '#e2e8f0')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .text((d) => {
        const colorIdx = partialColoring[d.id];
        if (colorIdx) return `C:${colorIdx}`;
        if (d.id === currentVertex && step?.color) return `Try:${step.color}`;
        return 'Unset';
      });

    // Badge above vertex indicating action state
    nodeElements
      .filter((d) => d.id === currentVertex && Boolean(currentAction))
      .append('rect')
      .attr('x', -32)
      .attr('y', -42)
      .attr('width', 64)
      .attr('height', 16)
      .attr('rx', 4)
      .attr('fill', () => {
        if (currentAction === 'conflict') return '#7f1d1d';
        if (currentAction === 'backtrack') return '#7c2d12';
        if (currentAction === 'assigned') return '#064e3b';
        return '#1e1b4b';
      })
      .attr('stroke', () => {
        if (currentAction === 'conflict') return '#ef4444';
        if (currentAction === 'backtrack') return '#f97316';
        if (currentAction === 'assigned') return '#10b981';
        return '#6366f1';
      })
      .attr('stroke-width', 1);

    nodeElements
      .filter((d) => d.id === currentVertex && Boolean(currentAction))
      .append('text')
      .attr('x', 0)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '8px')
      .attr('font-weight', 'bold')
      .text(() => {
        if (currentAction === 'conflict') return 'CONFLICT ✕';
        if (currentAction === 'backtrack') return 'BACKTRACK ↩';
        if (currentAction === 'assigned') return 'ASSIGNED ✓';
        if (currentAction === 'solution_found') return 'SOLVED ★';
        return 'ATTEMPT';
      });
  }, [vertices, edges, step, selectedPalette, paletteColors, currentVertex, conflictingVertex, currentAction, partialColoring]);

  return (
    <div className="w-full flex flex-col items-center bg-slate-950/80 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Legend & Palette Selector Ribbon */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 px-3 py-2 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full border-2 border-sky-400 bg-sky-950"></span>
            Current Node
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full border-2 border-rose-500 bg-rose-950"></span>
            Conflict Detected
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full border-2 border-orange-500 bg-orange-950"></span>
            Backtracking
          </span>
          <span className="text-slate-400 italic">Drag nodes to reposition</span>
        </div>

        {/* Palette Selector */}
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <label htmlFor="palette-select" className="text-xs text-slate-400">
            Color Theme:
          </label>
          <select
            id="palette-select"
            value={selectedPalette}
            onChange={(e) => setSelectedPalette(e.target.value)}
            className="px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="neon">Neon Cyberpunk</option>
            <option value="classic">Academic Classic</option>
            <option value="pastel">Pastel Minimal</option>
          </select>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full flex justify-center overflow-x-auto">
        <svg
          ref={svgRef}
          className="w-full max-w-[640px] h-[420px] select-none"
          aria-label="Graph Coloring Map Visualization"
        />
      </div>

      {/* Step State Announcement Card */}
      {step && (
        <div className="w-full mt-4 p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-600/40 text-indigo-300 font-mono font-bold uppercase">
              {step.action.replace('_', ' ')}
            </span>
            <span className="text-slate-200">{step.description}</span>
          </div>

          {conflictReason && (
            <div className="flex items-center gap-1 text-rose-400 font-medium bg-rose-950/40 px-2.5 py-1 rounded border border-rose-900/50">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{conflictReason}</span>
            </div>
          )}

          {chromaticNumber > 0 && step.action === 'solution_found' && (
            <div className="flex items-center gap-1 text-emerald-400 font-medium bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-900/50">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Chromatic Number: {chromaticNumber}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

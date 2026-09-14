import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GraphEdge, Module7Step } from '../../../types';

interface GraphCanvasProps {
  step: Module7Step | null;
  vertices: string[];
  edges: GraphEdge[];
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ step, vertices, edges }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const nodePositionsRef = useRef<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    if (!svgRef.current || vertices.length === 0) return;

    const mstEdges = step?.mst_edges || [];
    const rejectedEdges = step?.rejected_edges || [];
    const currentEdge = step?.current_edge;

    const width = 640;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 135;

    // Initialize default circular positions if not already stored
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

    // Edges group
    const linkGroup = g.append('g').attr('class', 'links');
    // Nodes group
    const nodeGroup = g.append('g').attr('class', 'nodes');

    // Helper to get edge key
    const edgeKey = (u: string, v: string) => (u < v ? `${u}-${v}` : `${v}-${u}`);
    const mstSet = new Set(mstEdges.map((e) => edgeKey(e.u, e.v)));
    const rejectedSet = new Set(rejectedEdges.map((e) => edgeKey(e.u, e.v)));
    const currentKey = currentEdge ? edgeKey(currentEdge.u, currentEdge.v) : null;

    // Render Edges
    const linkElements = linkGroup
      .selectAll('.edge-group')
      .data(edges)
      .enter()
      .append('g')
      .attr('class', 'edge-group');

    // Background wide edge line for hit area & glow
    linkElements.each(function (e) {
      const el = d3.select(this);
      const k = edgeKey(e.u, e.v);
      const isMst = mstSet.has(k);
      const isRejected = rejectedSet.has(k);
      const isCurrent = currentKey === k;

      let strokeColor = '#334155'; // gray pending
      let strokeWidth = 1.5;
      let dashArray = 'none';

      if (isCurrent) {
        strokeColor = '#f59e0b'; // amber checking
        strokeWidth = 3.5;
      } else if (isMst) {
        strokeColor = '#10b981'; // emerald added
        strokeWidth = 3;
      } else if (isRejected) {
        strokeColor = '#f43f5e'; // rose rejected
        strokeWidth = 2;
        dashArray = '4 4';
      }

      // Line
      el.append('line')
        .attr('class', 'edge-line')
        .attr('stroke', strokeColor)
        .attr('stroke-width', strokeWidth)
        .attr('stroke-dasharray', dashArray)
        .attr('opacity', isRejected ? 0.45 : 1);

      // Label background rect
      el.append('rect')
        .attr('class', 'weight-box')
        .attr('width', 26)
        .attr('height', 16)
        .attr('rx', 4)
        .attr(
          'fill',
          isCurrent ? '#78350f' : isMst ? '#064e3b' : isRejected ? '#881337' : '#0f172a'
        )
        .attr('stroke', strokeColor)
        .attr('stroke-width', 1);

      // Weight text
      el.append('text')
        .attr('class', 'weight-text')
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr(
          'fill',
          isCurrent ? '#fef08a' : isMst ? '#6ee7b7' : isRejected ? '#fca5a5' : '#94a3b8'
        )
        .text(e.weight);

      // Accessible Status Icon / Label
      if (isMst || isRejected || isCurrent) {
        el.append('text')
          .attr('class', 'status-tag')
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('font-weight', 'bold')
          .attr('fill', isCurrent ? '#fbbf24' : isMst ? '#34d399' : '#fb7185')
          .text(isCurrent ? 'CHECK' : isMst ? '✓ MST' : '✕ CYCLE');
      }
    });

    // Render Nodes
    const nodeElements = nodeGroup
      .selectAll('.node')
      .data(nodesData)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('cursor', 'grab');

    nodeElements.each(function (d) {
      const el = d3.select(this);
      const isIncidentToCurrent = currentEdge && (currentEdge.u === d.id || currentEdge.v === d.id);

      // Active pulse ring for currently evaluated edge vertices
      if (isIncidentToCurrent) {
        el.append('circle')
          .attr('r', 24)
          .attr('fill', 'none')
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '3 3')
          .attr('opacity', 0.85);
      }

      // Base circle
      el.append('circle')
        .attr('r', 18)
        .attr('fill', isIncidentToCurrent ? '#78350f' : '#1e293b')
        .attr('stroke', isIncidentToCurrent ? '#f59e0b' : '#64748b')
        .attr('stroke-width', 2);

      // Vertex label
      el.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .attr('font-size', '12px')
        .attr('font-family', 'sans-serif')
        .attr('font-weight', 'bold')
        .attr('fill', '#ffffff')
        .text(d.id);
    });

    // Position updates function
    const updatePositions = () => {
      const posMap = new Map<string, { x: number; y: number }>();
      nodesData.forEach((n) => {
        posMap.set(n.id, { x: n.x ?? 0, y: n.y ?? 0 });
      });

      linkElements.each(function (e) {
        const uPos = posMap.get(e.u);
        const vPos = posMap.get(e.v);
        if (!uPos || !vPos) return;

        const el = d3.select(this);
        el.select('line')
          .attr('x1', uPos.x)
          .attr('y1', uPos.y)
          .attr('x2', vPos.x)
          .attr('y2', vPos.y);

        const midX = (uPos.x + vPos.x) / 2;
        const midY = (uPos.y + vPos.y) / 2;

        el.select('.weight-box')
          .attr('x', midX - 13)
          .attr('y', midY - 8);

        el.select('.weight-text')
          .attr('x', midX)
          .attr('y', midY + 4);

        el.select('.status-tag')
          .attr('x', midX)
          .attr('y', midY - 12);
      });

      nodeElements.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    };

    // D3 Drag Behavior for Draggable Nodes
    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on('start', function () {
        d3.select(this).attr('cursor', 'grabbing');
      })
      .on('drag', function (event, d) {
        d.x = Math.max(25, Math.min(width - 25, event.x));
        d.y = Math.max(25, Math.min(height - 25, event.y));
        nodePositionsRef.current[d.id] = { x: d.x, y: d.y };
        updatePositions();
      })
      .on('end', function () {
        d3.select(this).attr('cursor', 'grab');
      });

    nodeElements.call(drag as never);

    updatePositions();
  }, [step, vertices, edges]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Legend with Accessible Visual Identifiers */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs mb-3">
        <span className="flex items-center space-x-1.5 text-slate-400">
          <span className="w-4 h-0.5 bg-slate-600 inline-block" />
          <span>Pending</span>
        </span>
        <span className="flex items-center space-x-1.5 text-amber-400">
          <span className="w-4 h-1 bg-amber-400 inline-block" />
          <span>Evaluating Edge</span>
        </span>
        <span className="flex items-center space-x-1.5 text-emerald-400">
          <span className="w-4 h-1 bg-emerald-400 inline-block" />
          <span className="font-bold">✓ Added to MST</span>
        </span>
        <span className="flex items-center space-x-1.5 text-rose-400">
          <span className="w-4 h-0.5 border-t border-dashed border-rose-400 inline-block" />
          <span className="font-bold">✕ Rejected (Cycle)</span>
        </span>
      </div>

      <div className="w-full overflow-x-auto flex justify-center bg-slate-950/70 rounded-2xl border border-slate-800 p-2 shadow-inner">
        <svg ref={svgRef} className="w-full max-w-[640px] h-auto min-h-[380px]" />
      </div>

      <span className="text-[11px] text-slate-500 font-mono mt-2">
        Tip: Graph nodes are interactive and draggable. Drag vertices to rearrange topology.
      </span>
    </div>
  );
};

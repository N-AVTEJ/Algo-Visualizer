import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { Module4Step } from '../../../types';

interface GraphCanvasProps {
  step: Module4Step | null;
  labels: string[];
  initialMatrix: (number | null)[][];
}

interface GraphNode {
  id: number;
  label: string;
  x: number;
  y: number;
}

interface GraphLink {
  source: number;
  target: number;
  weight: number;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ step, labels, initialMatrix }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || labels.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 460;
    const height = 340;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 110;

    // Build node coordinates in a circular arrangement
    const v = labels.length;
    const nodes: GraphNode[] = labels.map((label, idx) => {
      // Start from top (-pi/2)
      const angle = (2 * Math.PI * idx) / v - Math.PI / 2;
      return {
        id: idx,
        label,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    // Extract directed edges from initial adjacency matrix
    const links: GraphLink[] = [];
    for (let r = 0; r < v; r++) {
      for (let c = 0; c < v; c++) {
        if (r !== c && initialMatrix[r] && initialMatrix[r][c] !== null) {
          links.push({
            source: r,
            target: c,
            weight: initialMatrix[r][c] as number,
          });
        }
      }
    }

    const g = svg.attr('viewBox', `0 0 ${width} ${height}`).append('g');

    // Arrow markers
    const defs = svg.append('defs');

    // Default marker
    defs
      .append('marker')
      .attr('id', 'arrow-default')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#475569');

    // Active marker
    defs
      .append('marker')
      .attr('id', 'arrow-active')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#f59e0b');

    // Edges
    links.forEach((link) => {
      const src = nodes[link.source];
      const tgt = nodes[link.target];

      const isIk = step && step.i === link.source && step.k === link.target;
      const isKj = step && step.k === link.source && step.j === link.target;
      const isDirect = step && step.i === link.source && step.j === link.target;
      const isActive = isIk || isKj || isDirect;

      // Slight curve for bi-directional visibility
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;

      g.append('path')
        .attr('d', `M${src.x},${src.y}A${dr},${dr} 0 0,1 ${tgt.x},${tgt.y}`)
        .attr('fill', 'none')
        .attr('stroke', isActive ? '#f59e0b' : '#334155')
        .attr('stroke-width', isActive ? 2.5 : 1.5)
        .attr('stroke-dasharray', isDirect && !isActive ? '3 3' : 'none')
        .attr('marker-end', isActive ? 'url(#arrow-active)' : 'url(#arrow-default)');

      // Weight label position (midpoint along curve)
      const midX = (src.x + tgt.x) / 2 + (dy / dr) * 14;
      const midY = (src.y + tgt.y) / 2 - (dx / dr) * 14;

      g.append('rect')
        .attr('x', midX - 12)
        .attr('y', midY - 9)
        .attr('width', 24)
        .attr('height', 16)
        .attr('rx', 4)
        .attr('fill', isActive ? '#78350f' : '#0f172a')
        .attr('stroke', isActive ? '#f59e0b' : '#334155')
        .attr('stroke-width', 1);

      g.append('text')
        .attr('x', midX)
        .attr('y', midY + 3)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('fill', isActive ? '#fef08a' : '#94a3b8')
        .text(link.weight);
    });

    // Nodes
    nodes.forEach((n) => {
      const isI = step && step.i === n.id;
      const isJ = step && step.j === n.id;
      const isK = step && step.k === n.id;

      let strokeColor = '#475569';
      let fillColor = '#1e293b';

      if (isK) {
        strokeColor = '#f59e0b'; // amber intermediate
        fillColor = '#78350f';
      } else if (isI) {
        strokeColor = '#38bdf8'; // sky source
        fillColor = '#0369a1';
      } else if (isJ) {
        strokeColor = '#a855f7'; // purple dest
        fillColor = '#581c87';
      }

      const nodeG = g.append('g').attr('transform', `translate(${n.x}, ${n.y})`);

      // Outer active ring
      if (isI || isJ || isK) {
        nodeG
          .append('circle')
          .attr('r', 24)
          .attr('fill', 'none')
          .attr('stroke', strokeColor)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '3 3')
          .attr('opacity', 0.8);
      }

      // Main circle
      nodeG
        .append('circle')
        .attr('r', 18)
        .attr('fill', fillColor)
        .attr('stroke', strokeColor)
        .attr('stroke-width', 2);

      // Label
      nodeG
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .attr('font-size', '12px')
        .attr('font-family', 'sans-serif')
        .attr('font-weight', 'bold')
        .attr('fill', '#ffffff')
        .text(n.label);

      // Role pill
      if (isK || isI || isJ) {
        const role = isK ? 'Intermediate (k)' : isI ? 'Source (i)' : 'Dest (j)';
        nodeG
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', -24)
          .attr('font-size', '9px')
          .attr('font-weight', 'bold')
          .attr('fill', strokeColor)
          .text(role);
      }
    });
  }, [step, labels, initialMatrix]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs mb-2">
        <span className="flex items-center space-x-1.5 text-sky-300">
          <span className="w-3 h-3 rounded-full bg-sky-500 border border-sky-300" />
          <span>Source Vertex (i)</span>
        </span>
        <span className="flex items-center space-x-1.5 text-amber-300">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-300" />
          <span>Intermediate Pivot (k)</span>
        </span>
        <span className="flex items-center space-x-1.5 text-purple-300">
          <span className="w-3 h-3 rounded-full bg-purple-500 border border-purple-300" />
          <span>Destination (j)</span>
        </span>
      </div>

      <div className="w-full overflow-x-auto flex justify-center bg-slate-950/60 rounded-xl border border-slate-800 p-2">
        <svg ref={svgRef} className="w-full max-w-[460px] h-auto min-h-[300px]" />
      </div>
    </div>
  );
};

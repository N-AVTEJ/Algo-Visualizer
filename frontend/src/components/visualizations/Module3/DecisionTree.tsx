import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import type { Module3Step } from '../../../types';

interface DecisionTreeProps {
  steps: Module3Step[];
  currentStepIndex: number;
}

interface D3TreeNode {
  id: string;
  name: string;
  status: 'root' | 'placed' | 'conflict' | 'backtracked' | 'solution';
  row: number;
  col: number;
  isCurrent: boolean;
  children?: D3TreeNode[];
}

export const DecisionTree: React.FC<DecisionTreeProps> = ({ steps, currentStepIndex }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Build the explored tree topology up to the current step
  const treeData = useMemo(() => {
    const rootNode: D3TreeNode = {
      id: 'root',
      name: 'Start',
      status: 'root',
      row: -1,
      col: -1,
      isCurrent: currentStepIndex === 0,
      children: [],
    };

    const nodeMap = new Map<string, D3TreeNode>();
    nodeMap.set('root', rootNode);

    const currentStep = steps[currentStepIndex];

    // Replay steps up to current step
    for (let idx = 0; idx <= currentStepIndex && idx < steps.length; idx++) {
      const s = steps[idx];
      if (s.node_id === 'root') continue;

      const isCurrent = currentStep?.node_id === s.node_id;
      let existing = nodeMap.get(s.node_id);

      if (!existing) {
        existing = {
          id: s.node_id,
          name: `R${s.row}:C${s.col}`,
          status: s.tree_status,
          row: s.row,
          col: s.col,
          isCurrent,
          children: [],
        };
        nodeMap.set(s.node_id, existing);

        const parentId = s.parent_id && nodeMap.has(s.parent_id) ? s.parent_id : 'root';
        const parent = nodeMap.get(parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(existing);
      } else {
        existing.status = s.tree_status;
        existing.isCurrent = isCurrent;
      }
    }

    return rootNode;
  }, [steps, currentStepIndex]);

  // Render with D3
  useEffect(() => {
    if (!svgRef.current || !treeData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 800;
    const height = 360;
    const margin = { top: 30, right: 30, bottom: 30, left: 30 };

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const root = d3.hierarchy<D3TreeNode>(treeData);
    const treeLayout = d3.tree<D3TreeNode>().size([innerWidth, innerHeight]);
    treeLayout(root);

    // Links
    g.selectAll('.tree-link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'tree-link')
      .attr('d', (d) => {
        return `M${d.source.x},${d.source.y}
                C${d.source.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${d.target.y}`;
      })
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (d.target.data.status === 'solution') return '#10b981';
        if (d.target.data.status === 'conflict') return '#f43f5e';
        if (d.target.data.status === 'backtracked') return '#f59e0b';
        return '#3b82f6';
      })
      .attr('stroke-width', (d) => (d.target.data.isCurrent ? 2.5 : 1.2))
      .attr('stroke-opacity', 0.7);

    // Nodes
    const nodeGroups = g
      .selectAll('.tree-node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'tree-node')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`);

    // Circle representation
    nodeGroups.each(function (d) {
      const el = d3.select(this);
      const { status, isCurrent, name } = d.data;

      let fillColor = '#1e293b';
      let strokeColor = '#64748b';
      let symbolText = '';

      if (status === 'solution') {
        fillColor = '#065f46';
        strokeColor = '#34d399';
        symbolText = '★';
      } else if (status === 'placed') {
        fillColor = '#1e3a8a';
        strokeColor = '#60a5fa';
        symbolText = '✓';
      } else if (status === 'conflict') {
        fillColor = '#881337';
        strokeColor = '#fb7185';
        symbolText = '✕';
      } else if (status === 'backtracked') {
        fillColor = '#78350f';
        strokeColor = '#fbbf24';
        symbolText = '↩';
      }

      if (isCurrent) {
        strokeColor = '#fbbf24';
      }

      // Outer glow for current
      if (isCurrent) {
        el.append('circle')
          .attr('r', 16)
          .attr('fill', 'none')
          .attr('stroke', '#fbbf24')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '3 3')
          .attr('opacity', 0.8);
      }

      // Base circle
      el.append('circle')
        .attr('r', 12)
        .attr('fill', fillColor)
        .attr('stroke', strokeColor)
        .attr('stroke-width', 1.5);

      // Symbol (accessible state marker)
      el.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 4)
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#ffffff')
        .text(symbolText);

      // Node label
      el.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 22)
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('fill', isCurrent ? '#fbbf24' : '#94a3b8')
        .text(name);
    });
  }, [treeData]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs mb-3 px-4">
        <span className="flex items-center space-x-1 text-slate-300">
          <span className="w-4 h-4 rounded-full bg-blue-900 border border-blue-400 flex items-center justify-center text-[9px] font-bold text-white">
            ✓
          </span>
          <span>Valid Placement</span>
        </span>
        <span className="flex items-center space-x-1 text-slate-300">
          <span className="w-4 h-4 rounded-full bg-rose-900 border border-rose-400 flex items-center justify-center text-[9px] font-bold text-white">
            ✕
          </span>
          <span>Conflict / Dead End</span>
        </span>
        <span className="flex items-center space-x-1 text-slate-300">
          <span className="w-4 h-4 rounded-full bg-amber-900 border border-amber-400 flex items-center justify-center text-[9px] font-bold text-white">
            ↩
          </span>
          <span>Backtrack</span>
        </span>
        <span className="flex items-center space-x-1 text-slate-300">
          <span className="w-4 h-4 rounded-full bg-emerald-900 border border-emerald-400 flex items-center justify-center text-[9px] font-bold text-white">
            ★
          </span>
          <span>Solution</span>
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto flex justify-center bg-slate-950/60 p-2 rounded-xl border border-slate-800">
        <svg ref={svgRef} className="w-full max-w-[800px] h-auto min-h-[300px]" />
      </div>
    </div>
  );
};

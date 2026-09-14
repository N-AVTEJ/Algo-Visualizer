import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { BranchBoundNode, BranchBoundStep, KnapsackBBItem } from '../../../types';

interface BranchBoundTreeProps {
  step: BranchBoundStep | null;
  treeNodes: BranchBoundNode[];
  items: KnapsackBBItem[];
  capacity: number;
}

interface TreeNodeHierarchy {
  id: string;
  node: BranchBoundNode;
  children: TreeNodeHierarchy[];
}

export const BranchBoundTree: React.FC<BranchBoundTreeProps> = ({ step, treeNodes, capacity }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Derive visible nodes up to the current step
  const activeStepIndex = step?.step_index ?? 0;

  useEffect(() => {
    if (!svgRef.current || treeNodes.length === 0) return;

    // Filter which nodes exist up to current step
    // A node is visible if it was created on or before current step
    const visibleNodeIds = new Set<string>();
    visibleNodeIds.add('node_0'); // root always visible

    // If step is provided, highlight current node
    const currentNodeId = step?.node_id ?? 'node_0';

    // Map all nodes by id
    const nodeMap = new Map<string, BranchBoundNode>();
    treeNodes.forEach((n) => nodeMap.set(n.id, n));

    // Construct hierarchy from root
    function buildHierarchy(id: string): TreeNodeHierarchy | null {
      const n = nodeMap.get(id);
      if (!n) return null;
      // find children
      const childrenNodes = treeNodes.filter((child) => child.parent_id === id);
      const childrenHierarchies: TreeNodeHierarchy[] = [];
      for (const ch of childrenNodes) {
        const sub = buildHierarchy(ch.id);
        if (sub) childrenHierarchies.push(sub);
      }
      return { id, node: n, children: childrenHierarchies };
    }

    const rootHierarchy = buildHierarchy('node_0');
    if (!rootHierarchy) return;

    const width = 850;
    const height = 480;
    const margin = { top: 40, right: 30, bottom: 40, left: 30 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // D3 tree layout
    const d3Hierarchy = d3.hierarchy<TreeNodeHierarchy>(rootHierarchy, (d) => d.children);
    const treeLayout = d3
      .tree<TreeNodeHierarchy>()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom - 40]);

    const treeData = treeLayout(d3Hierarchy);

    // Links
    const linkGenerator = d3
      .linkVertical<
        d3.HierarchyPointLink<TreeNodeHierarchy>,
        d3.HierarchyPointNode<TreeNodeHierarchy>
      >()
      .x((d) => d.x)
      .y((d) => d.y);

    // Render links
    g.selectAll('.tree-link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'tree-link')
      .attr('d', linkGenerator)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (d.target.data.node.pruned) return '#f43f5e'; // red-rose for pruned branch
        return '#475569'; // slate-600 default
      })
      .attr('stroke-width', (d) => (d.target.data.id === currentNodeId ? 3 : 1.5))
      .attr('stroke-dasharray', (d) => (d.target.data.node.pruned ? '4,4' : 'none'))
      .attr('opacity', (d) => (d.target.data.node.pruned ? 0.7 : 0.9));

    // Decision labels on branches
    g.selectAll('.branch-label')
      .data(treeData.links())
      .enter()
      .append('text')
      .attr('class', 'branch-label')
      .attr('x', (d) => (d.source.x + d.target.x) / 2)
      .attr('y', (d) => (d.source.y + d.target.y) / 2 - 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .text((d) => {
        const dec = d.target.data.node.decision;
        if (dec.startsWith('Include')) return '+Inc';
        if (dec.startsWith('Exclude')) return '-Exc';
        return '';
      });

    // Node groups
    const nodeGroups = g
      .selectAll('.tree-node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'tree-node')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`);

    // Node circles / boxes
    nodeGroups
      .append('rect')
      .attr('x', -38)
      .attr('y', -22)
      .attr('width', 76)
      .attr('height', 44)
      .attr('rx', 8)
      .attr('fill', (d) => {
        const n = d.data.node;
        if (n.id === currentNodeId) return '#1e1b4b'; // dark indigo
        if (n.is_best) return '#451a03'; // deep amber
        if (n.pruned) return '#2a1215'; // dark rose
        if (n.status === 'expanded') return '#0f172a'; // slate-900
        return '#18181b'; // zinc-900
      })
      .attr('stroke', (d) => {
        const n = d.data.node;
        if (n.id === currentNodeId) return '#6366f1'; // bright indigo
        if (n.is_best) return '#f59e0b'; // amber gold
        if (n.pruned) return '#f43f5e'; // red-rose
        if (n.status === 'expanded') return '#38bdf8'; // sky blue
        return '#52525b'; // zinc-600
      })
      .attr('stroke-width', (d) => {
        const n = d.data.node;
        if (n.id === currentNodeId) return 3;
        if (n.is_best) return 2.5;
        return 1.5;
      })
      .attr('stroke-dasharray', (d) => (d.data.node.pruned ? '4,3' : 'none'));

    // Best solution star indicator
    nodeGroups
      .filter((d) => Boolean(d.data.node.is_best))
      .append('text')
      .attr('x', 32)
      .attr('y', -16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f59e0b')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('★');

    // Node Title (ID / Depth)
    nodeGroups
      .append('text')
      .attr('x', 0)
      .attr('y', -8)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => (d.data.id === currentNodeId ? '#a5b4fc' : '#e2e8f0'))
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .text((d) => d.data.id);

    // Node Weight & Value (W: w, V: v)
    nodeGroups
      .append('text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px')
      .text((d) => `w:${d.data.node.current_weight} v:${d.data.node.current_value}`);

    // Upper Bound label (UB: b)
    nodeGroups
      .append('text')
      .attr('x', 0)
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('fill', (d) => (d.data.node.pruned ? '#f87171' : '#34d399'))
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .text((d) => `UB: ${d.data.node.bound}`);

    // Prune reason / status badge below pruned nodes
    nodeGroups
      .filter((d) => d.data.node.pruned)
      .append('text')
      .attr('x', 0)
      .attr('y', 32)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fca5a5')
      .attr('font-size', '8px')
      .attr('font-weight', '500')
      .text((d) => {
        const r = d.data.node.prune_reason || '';
        if (r.includes('exceeds')) return '✕ W > Cap';
        if (r.includes('Current Best') || r.includes('Bound')) return '✕ UB ≤ Best';
        return '✕ Pruned';
      });
  }, [step, treeNodes, capacity, activeStepIndex]);

  return (
    <div className="w-full flex flex-col items-center bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-xl">
      {/* Legend & Summary Ribbon */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 px-2 py-2 bg-slate-900/90 rounded-lg border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded bg-indigo-600 border border-indigo-400"></span>
            Current Active
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded bg-amber-600 border border-amber-400"></span>★ Best
            Solution
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded bg-rose-950 border border-dashed border-rose-500"></span>
            Pruned Branch
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded bg-slate-900 border border-slate-700"></span>
            Pending/Expanded
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-emerald-400">Capacity: {capacity}</span>
          <span className="text-amber-400">Current Best: {step?.best_value ?? 0}</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto">
        <svg
          ref={svgRef}
          className="w-full min-w-[700px] h-[480px] select-none"
          aria-label="Branch and Bound Search Tree"
        />
      </div>

      {/* Active Step Details Callout */}
      {step && (
        <div className="w-full mt-3 p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-600/40 text-indigo-300 font-mono font-semibold uppercase">
              {step.action.replace('_', ' ')}
            </span>
            <span className="text-slate-200">{step.description}</span>
          </div>
          {step.prune_reason && (
            <span className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-800 text-rose-300 font-medium">
              Pruning Reason: {step.prune_reason}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

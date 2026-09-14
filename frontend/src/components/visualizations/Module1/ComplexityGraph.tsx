import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ComplexityGraphProps {
  currentN: number;
}

export const ComplexityGraph: React.FC<ComplexityGraphProps> = ({ currentN }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG contents
    d3.select(svgRef.current).selectAll('*').remove();

    const maxN = Math.max(32, Math.min(100, currentN * 2));
    const data: Array<{ n: number; linear: number; binary: number }> = [];

    for (let i = 1; i <= maxN; i++) {
      data.push({
        n: i,
        linear: i,
        binary: Math.ceil(Math.log2(i + 1)),
      });
    }

    const width = 620;
    const height = 300;
    const margin = { top: 25, right: 30, bottom: 45, left: 45 };

    const svg = d3
      .select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .style('overflow', 'visible');

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale (Input size n)
    const xScale = d3.scaleLinear().domain([0, maxN]).range([0, innerWidth]);

    // Y scale (Worst-case comparisons)
    const yScale = d3.scaleLinear().domain([0, maxN]).range([innerHeight, 0]);

    // Grid lines
    const makeXGrid = () => d3.axisBottom(xScale).ticks(6);
    const makeYGrid = () => d3.axisLeft(yScale).ticks(6);

    g.append('g')
      .attr('class', 'grid text-slate-800/80')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        makeXGrid()
          .tickSize(-innerHeight)
          .tickFormat(() => ''),
      )
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '2,2');

    g.append('g')
      .attr('class', 'grid text-slate-800/80')
      .call(
        makeYGrid()
          .tickSize(-innerWidth)
          .tickFormat(() => ''),
      )
      .selectAll('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '2,2');

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(6);
    const yAxis = d3.axisLeft(yScale).ticks(6);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px');

    g.append('g')
      .call(yAxis)
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px');

    // Axis Labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 38)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text('Input Array Size (n)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -32)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .text('Worst-Case Comparisons');

    // Line generators
    const linearLine = d3
      .line<{ n: number; linear: number }>()
      .x((d) => xScale(d.n))
      .y((d) => yScale(d.linear))
      .curve(d3.curveMonotoneX);

    const binaryLine = d3
      .line<{ n: number; binary: number }>()
      .x((d) => xScale(d.n))
      .y((d) => yScale(d.binary))
      .curve(d3.curveMonotoneX);

    // Linear curve (Violet)
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#a855f7')
      .attr('stroke-width', 3)
      .attr('d', linearLine);

    // Binary curve (Sky)
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 3)
      .attr('d', binaryLine);

    // Current N indicator
    if (currentN > 0 && currentN <= maxN) {
      const currentX = xScale(currentN);
      const linearY = yScale(currentN);
      const binaryY = yScale(Math.ceil(Math.log2(currentN + 1)));

      // Dotted vertical line
      g.append('line')
        .attr('x1', currentX)
        .attr('x2', currentX)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', '#cbd5e1')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.6);

      // Linear point marker
      g.append('circle')
        .attr('cx', currentX)
        .attr('cy', linearY)
        .attr('r', 5)
        .attr('fill', '#a855f7')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);

      // Binary point marker
      g.append('circle')
        .attr('cx', currentX)
        .attr('cy', binaryY)
        .attr('r', 5)
        .attr('fill', '#38bdf8')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);

      // Current N label
      g.append('text')
        .attr('x', currentX)
        .attr('y', -8)
        .attr('text-anchor', 'middle')
        .attr('fill', '#cbd5e1')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(`n = ${currentN}`);
    }
  }, [currentN]);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white">Theoretical Asymptotic Growth</h3>
          <p className="text-xs text-slate-400">
            Conceptual curve comparison: Linear Search vs Binary Search worst-case comparisons.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <span className="flex items-center space-x-1.5 text-purple-400">
            <span className="w-3 h-0.5 bg-purple-500 inline-block rounded-full" />
            <span>Linear O(n)</span>
          </span>
          <span className="flex items-center space-x-1.5 text-sky-400">
            <span className="w-3 h-0.5 bg-sky-400 inline-block rounded-full" />
            <span>Binary O(log n)</span>
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full h-64 sm:h-72">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
        <span>
          Current array size: <strong className="text-white font-mono">{currentN}</strong> elements
        </span>
        <span className="text-[11px] text-slate-500">
          * Representative asymptotic curves, not physical execution times
        </span>
      </div>
    </div>
  );
};

export default ComplexityGraph;

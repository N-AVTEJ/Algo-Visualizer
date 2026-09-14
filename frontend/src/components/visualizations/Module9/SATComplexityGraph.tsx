import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { AlertTriangle, TrendingUp } from 'lucide-react';

export const SATComplexityGraph: React.FC = () => {
  const [nValue, setNValue] = useState<number>(10);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 640;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Generate data points for n in 1..28
    const maxPlotN = Math.max(15, Math.min(30, nValue + 2));
    const data: { n: number; operations: number }[] = [];
    for (let i = 1; i <= maxPlotN; i++) {
      data.push({ n: i, operations: Math.pow(2, i) });
    }

    // Scales
    const xScale = d3.scaleLinear().domain([1, maxPlotN]).range([0, innerWidth]);

    const yScale = d3
      .scaleLog()
      .domain([2, Math.pow(2, maxPlotN)])
      .range([innerHeight, 0])
      .base(10);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(maxPlotN > 20 ? 10 : maxPlotN))
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('color', '#94a3b8');

    // Y Axis (Log scale 10^0, 10^3, 10^6...)
    g.append('g')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickFormat((d) => `10^${Math.round(Math.log10(Number(d)))}`)
      )
      .attr('color', '#64748b')
      .selectAll('text')
      .attr('color', '#94a3b8');

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.15)
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      );

    // Line generator
    const line = d3
      .line<{ n: number; operations: number }>()
      .x((d) => xScale(d.n))
      .y((d) => yScale(d.operations))
      .curve(d3.curveMonotoneX);

    // Draw exponential curve
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#6366f1')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Highlight current selected n
    const currentOps = Math.pow(2, nValue);
    const currX = xScale(nValue);
    const currY = yScale(currentOps);

    // Vertical indicator line
    g.append('line')
      .attr('x1', currX)
      .attr('x2', currX)
      .attr('y1', innerHeight)
      .attr('y2', currY)
      .attr('stroke', '#f43f5e')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');

    // Indicator point
    g.append('circle')
      .attr('cx', currX)
      .attr('cy', currY)
      .attr('r', 6)
      .attr('fill', '#f43f5e')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Axis Labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .text('Variables Count (n)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .text('Truth Assignments (2^n, log scale)');
  }, [nValue]);

  return (
    <div className="w-full flex flex-col gap-4 bg-slate-950/80 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            SAT Computational Complexity: n vs 2^n
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="n-slider" className="text-xs text-slate-300 font-medium">
            Test n variables: <span className="font-mono text-indigo-400 font-bold">{nValue}</span>
          </label>
          <input
            id="n-slider"
            type="range"
            min="1"
            max="30"
            value={nValue}
            onChange={(e) => setNValue(parseInt(e.target.value, 10))}
            className="w-36 accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Warning Banner when n > 25 */}
      {nValue > 25 && (
        <div
          role="alert"
          className="p-4 rounded-lg bg-amber-950/40 border border-amber-500/80 text-amber-200 flex items-start gap-3 text-xs"
        >
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300 uppercase tracking-wide">
              Exponential Growth Warning (n &gt; 25)
            </span>
            <p className="text-amber-200/90 leading-relaxed">
              For <span className="font-mono font-bold">n = {nValue}</span>, the truth assignment
              space contains{' '}
              <span className="font-mono font-bold text-amber-300">
                2^{nValue} = {Math.pow(2, nValue).toLocaleString()}
              </span>{' '}
              assignments. Brute-force enumeration grows exponentially and becomes computationally
              impractical on classical hardware. This highlights why Boolean Satisfiability (SAT) is
              the canonical NP-Complete problem (Cook-Levin Theorem) and why modern solvers rely on
              DPLL, clause learning (CDCL), and heuristics rather than exhaustive evaluation.
            </p>
          </div>
        </div>
      )}

      {/* D3 Curve Canvas */}
      <div className="w-full overflow-x-auto">
        <svg
          ref={svgRef}
          className="w-full min-w-[500px] h-[300px]"
          aria-label="Complexity Curve"
        />
      </div>

      {/* Info Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1">
          <span className="text-slate-400">Variables (n)</span>
          <span className="text-base font-bold text-slate-100">{nValue}</span>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1">
          <span className="text-slate-400">Truth Assignments (2^n)</span>
          <span className="text-base font-bold text-indigo-400">
            {Math.pow(2, nValue).toLocaleString()}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col gap-1">
          <span className="text-slate-400">Complexity Class</span>
          <span className="text-base font-bold text-emerald-400">O(2^n · m) NP-Complete</span>
        </div>
      </div>
    </div>
  );
};

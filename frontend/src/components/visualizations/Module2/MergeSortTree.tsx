import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Play, AlertTriangle, Layers, ArrowDownUp } from 'lucide-react';
import { algorithmsApi, ApiError } from '../../../api/client';
import type { Module2Step, Module2RunResponse } from '../../../types';
import { AnimationPlayer, MetricsPanel, CodeDisplay } from '../../common';

const MERGE_SORT_CODE = `def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    # Divide
    left_half = merge_sort(arr[:mid])
    right_half = merge_sort(arr[mid:])

    # Conquer & Combine
    return merge(left_half, right_half)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`;

const QUICK_SORT_CODE = `def quick_sort(arr, low, high):
    if low < high:
        # Partition the array
        pi = partition(arr, low, high)
        # Recursively sort elements before and after partition
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]  # Lomuto scheme: last element as pivot
    i = low - 1

    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]  # Swap

    arr[i + 1], arr[high] = arr[high], arr[i + 1]  # Place pivot
    return i + 1`;

const PRESETS = [
  { name: 'Standard (8 items)', array: [38, 27, 43, 3, 9, 82, 10, 19] },
  { name: 'Already Sorted', array: [5, 12, 23, 34, 45, 56, 67, 78] },
  { name: 'Reversed', array: [90, 75, 60, 45, 30, 15, 8] },
  { name: 'Duplicates', array: [14, 7, 21, 7, 35, 14, 2] },
];

interface TreeNodeData {
  id: string;
  left: number;
  right: number;
  depth: number;
  initialSubArray: number[];
  children?: TreeNodeData[];
}

export const MergeSortTree: React.FC = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<'merge_sort' | 'quick_sort'>('merge_sort');
  const [inputStr, setInputStr] = useState<string>('38, 27, 43, 3, 9, 82, 10, 19');
  const [parsedArray, setParsedArray] = useState<number[]>([38, 27, 43, 3, 9, 82, 10, 19]);

  const [traceData, setTraceData] = useState<Module2RunResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(500);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Parse input
  const handleApplyInput = (str: string) => {
    setError(null);
    const nums = str
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => Number(s));

    if (nums.some((n) => isNaN(n))) {
      setError('Please enter valid comma-separated numbers.');
      return;
    }
    if (nums.length < 2) {
      setError('Please provide at least 2 numbers to visualize divide & conquer.');
      return;
    }
    if (nums.length > 20) {
      setError('Maximum 20 elements allowed to maintain clear tree layout.');
      return;
    }

    setParsedArray(nums);
    setTraceData(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Run algorithm
  const handleRun = async () => {
    setError(null);
    setLoading(true);
    setIsPlaying(false);
    setCurrentStepIndex(0);

    try {
      const res = await algorithmsApi.runModule2({
        array: parsedArray,
        algorithm: selectedAlgo,
      });
      setTraceData(res);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to execute algorithm.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = traceData?.steps || [];
  const currentStep: Module2Step | null = steps[currentStepIndex] || null;

  // Build recursive tree hierarchy for Merge Sort
  const treeHierarchy = useMemo(() => {
    if (parsedArray.length === 0) return null;

    function buildNode(left: number, right: number, depth: number): TreeNodeData {
      const id = `${depth}_${left}_${right}`;
      const sub = parsedArray.slice(left, right + 1);
      if (left >= right) {
        return { id, left, right, depth, initialSubArray: sub };
      }
      const mid = Math.floor((left + right) / 2);
      return {
        id,
        left,
        right,
        depth,
        initialSubArray: sub,
        children: [
          buildNode(left, mid, depth + 1),
          buildNode(mid + 1, right, depth + 1),
        ],
      };
    }

    return buildNode(0, parsedArray.length - 1, 0);
  }, [parsedArray]);

  // Determine state of each node based on steps up to currentStepIndex
  const nodeStates = useMemo(() => {
    const states: Record<string, {
      status: 'unreached' | 'active_split' | 'active_merge' | 'merged';
      displayArray: number[];
      isCurrentActive: boolean;
    }> = {};

    if (!traceData || steps.length === 0) return states;

    for (let i = 0; i <= currentStepIndex; i++) {
      const s = steps[i];
      if (!s.node_id) continue;

      const isCurrent = i === currentStepIndex;

      if (s.action === 'split') {
        states[s.node_id] = {
          status: 'active_split',
          displayArray: s.sub_array || [],
          isCurrentActive: isCurrent,
        };
      } else if (s.action === 'merge_compare' || s.action === 'merge_place') {
        states[s.node_id] = {
          status: 'active_merge',
          displayArray: states[s.node_id]?.displayArray || s.sub_array || [],
          isCurrentActive: isCurrent,
        };
      } else if (s.action === 'merged') {
        states[s.node_id] = {
          status: 'merged',
          displayArray: s.sub_array || [],
          isCurrentActive: isCurrent,
        };
      } else if (s.action === 'base_case') {
        states[s.node_id] = {
          status: 'merged',
          displayArray: s.sub_array || [],
          isCurrentActive: isCurrent,
        };
      }
    }

    // Mark current active
    if (currentStep?.node_id && states[currentStep.node_id]) {
      states[currentStep.node_id].isCurrentActive = true;
    }

    return states;
  }, [traceData, steps, currentStepIndex, currentStep]);

  // D3 Tree Rendering
  useEffect(() => {
    if (!svgRef.current || !treeHierarchy || selectedAlgo !== 'merge_sort') return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 860;
    const height = 440;
    const margin = { top: 40, right: 30, bottom: 40, left: 30 };

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const root = d3.hierarchy<TreeNodeData>(treeHierarchy);
    const treeLayout = d3.tree<TreeNodeData>().size([innerWidth, innerHeight]);
    treeLayout(root);

    // Links / Branches
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d) => {
        return `M${d.source.x},${d.source.y + 20}
                C${d.source.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${(d.source.y + d.target.y) / 2}
                 ${d.target.x},${d.target.y - 18}`;
      })
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        const sourceState = nodeStates[d.source.data.id];
        const targetState = nodeStates[d.target.data.id];
        if (targetState?.status === 'merged') return '#10b981'; // green
        if (targetState?.status === 'active_merge') return '#a855f7'; // purple
        if (sourceState?.status === 'active_split') return '#38bdf8'; // sky
        return '#334155'; // slate
      })
      .attr('stroke-width', (d) => {
        const targetState = nodeStates[d.target.data.id];
        return targetState?.isCurrentActive ? 3 : 1.5;
      })
      .attr('stroke-dasharray', (d) => {
        const targetState = nodeStates[d.target.data.id];
        return targetState ? 'none' : '4 4';
      });

    // Node Groups
    const nodes = g
      .selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x}, ${d.y})`);

    // Render node box
    nodes.each(function (d) {
      const el = d3.select(this);
      const state = nodeStates[d.data.id];
      const items = state?.displayArray || d.data.initialSubArray;
      const isCurrent = currentStep?.node_id === d.data.id;
      const isMerged = state?.status === 'merged';
      const isMergeActive = state?.status === 'active_merge';
      const isSplitActive = state?.status === 'active_split';

      let strokeColor = '#334155';
      let bgColor = '#0f172a';
      if (isMerged) {
        strokeColor = '#10b981';
        bgColor = '#064e3b';
      } else if (isMergeActive) {
        strokeColor = '#c084fc';
        bgColor = '#581c87';
      } else if (isSplitActive) {
        strokeColor = '#38bdf8';
        bgColor = '#0369a1';
      }

      if (isCurrent) {
        strokeColor = '#f59e0b'; // amber pulse
      }

      const boxWidth = Math.max(36, items.length * 24 + 16);
      const boxHeight = 32;

      // Background rect
      el.append('rect')
        .attr('x', -boxWidth / 2)
        .attr('y', -boxHeight / 2)
        .attr('width', boxWidth)
        .attr('height', boxHeight)
        .attr('rx', 8)
        .attr('fill', bgColor)
        .attr('stroke', strokeColor)
        .attr('stroke-width', isCurrent ? 2.5 : 1.5)
        .attr('filter', isCurrent ? 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))' : 'none');

      // Array text
      el.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 4)
        .attr('font-size', items.length > 5 ? '10px' : '11px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('fill', isMerged ? '#6ee7b7' : isCurrent ? '#fef08a' : '#f8fafc')
        .text(`[${items.join(', ')}]`);

      // Depth tag if root or current
      if (isCurrent) {
        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', -22)
          .attr('font-size', '9px')
          .attr('font-family', 'sans-serif')
          .attr('font-weight', '600')
          .attr('fill', '#f59e0b')
          .text(`ACTIVE (Depth ${d.data.depth})`);
      }
    });
  }, [treeHierarchy, nodeStates, currentStep, selectedAlgo]);

  return (
    <div className="space-y-8">
      {/* Control Panel */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-amber-400" />
              <span>Divide &amp; Conquer Arena</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Visualize recursive subproblem decomposition, depth levels, and recombination.
            </p>
          </div>

          {/* Algorithm Toggle */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setSelectedAlgo('merge_sort');
                setTraceData(null);
                setCurrentStepIndex(0);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedAlgo === 'merge_sort'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Merge Sort (Tree)
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedAlgo('quick_sort');
                setTraceData(null);
                setCurrentStepIndex(0);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedAlgo === 'quick_sort'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Quick Sort (Partition)
            </button>
          </div>
        </div>

        {/* Presets & Input */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold mr-1">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setInputStr(p.array.join(', '));
                  handleApplyInput(p.array.join(', '));
                }}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g. 38, 27, 43, 3, 9, 82, 10, 19"
              />
            </div>
            <button
              type="button"
              onClick={() => handleApplyInput(inputStr)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Apply Array
            </button>
            <button
              type="button"
              onClick={handleRun}
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all inline-flex items-center space-x-2 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{loading ? 'Running Trace...' : `Execute ${selectedAlgo === 'merge_sort' ? 'Merge Sort' : 'Quick Sort'}`}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Shared AnimationPlayer */}
      {traceData && steps.length > 0 && (
        <AnimationPlayer
          steps={steps}
          currentStepIndex={currentStepIndex}
          isPlaying={isPlaying}
          onPlayToggle={(playing) => setIsPlaying(playing)}
          onStepChange={(idx) => setCurrentStepIndex(idx)}
          onReset={() => setCurrentStepIndex(0)}
          initialSpeedMs={speedMs}
          onSpeedChange={(spd) => setSpeedMs(spd)}
        />
      )}

      {/* Main Visualization Stage */}
      <div className="grid grid-cols-1 gap-6">
        {/* State Banner */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
              Step {currentStepIndex + 1} of {steps.length || 1}
            </div>
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-white">Action: </span>
              <span className="font-mono text-amber-300 uppercase font-bold">
                {currentStep?.action || 'idle'}
              </span>
              {currentStep && (
                <span className="ml-3 text-slate-400">
                  Subrange: [{currentStep.left} .. {currentStep.right}]
                </span>
              )}
            </div>
          </div>

          {/* Recursion Depth Indicator */}
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Recursion Depth:</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60">
              Level {currentStep?.depth ?? 0}
            </span>
          </div>
        </div>

        {/* Algorithm-Specific Visualization */}
        {selectedAlgo === 'merge_sort' ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col items-center justify-center min-h-[460px]">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-2">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span>Divide (Split)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Conquer (Merge)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Sorted</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">D3.js Recursive Tree Canvas</span>
            </div>

            <div className="w-full overflow-x-auto flex justify-center py-2">
              <svg ref={svgRef} className="w-full max-w-[860px] h-auto" />
            </div>

            {/* Current Array in-place state */}
            {currentStep?.array && (
              <div className="mt-6 w-full pt-4 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  In-Memory Array Buffer:
                </span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentStep.array.map((val, idx) => {
                    const isInRange = idx >= currentStep.left && idx <= currentStep.right;
                    const isComparing = currentStep.indices?.includes(idx);
                    const isPlaced = currentStep.placed_index === idx;

                    let bg = 'bg-slate-900 border-slate-800 text-slate-400';
                    if (isPlaced) {
                      bg = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold scale-110';
                    } else if (isComparing) {
                      bg = 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold scale-110';
                    } else if (isInRange) {
                      bg = 'bg-amber-500/10 border-amber-500/50 text-amber-200';
                    }

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-mono text-xs transition-all ${bg}`}>
                          {val}
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 mt-1">[{idx}]</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Quick Sort Partition Canvas */
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1.5">
                <ArrowDownUp className="w-4 h-4 text-sky-400" />
                <span className="font-semibold text-slate-200">Lomuto Partition Scheme Visualization</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Pivot &amp; Two-Pointer Partitioning</span>
            </div>

            <div className="flex flex-wrap gap-2 justify-center py-6">
              {(currentStep?.array || parsedArray).map((val, idx) => {
                const isPivot = currentStep?.pivot_index === idx;
                const isI = currentStep?.i === idx;
                const isJ = currentStep?.j === idx;
                const isInSubarray = currentStep ? idx >= currentStep.left && idx <= currentStep.right : true;

                let borderStyle = 'border-slate-800 bg-slate-900 text-slate-400';
                if (isPivot) {
                  borderStyle = 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold scale-110 shadow-lg shadow-amber-500/20';
                } else if (isJ) {
                  borderStyle = 'border-sky-400 bg-sky-500/20 text-sky-300 font-bold scale-105';
                } else if (isI) {
                  borderStyle = 'border-purple-400 bg-purple-500/20 text-purple-300 font-bold';
                } else if (isInSubarray) {
                  borderStyle = 'border-slate-700 bg-slate-800/80 text-white';
                }

                return (
                  <div key={idx} className="flex flex-col items-center">
                    {/* Role Tag */}
                    <div className="h-5 text-[10px] font-mono font-bold">
                      {isPivot && <span className="text-amber-400">PIVOT</span>}
                      {isJ && !isPivot && <span className="text-sky-400">j</span>}
                      {isI && !isPivot && !isJ && <span className="text-purple-400">i</span>}
                    </div>

                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center font-mono text-sm transition-all ${borderStyle}`}>
                      {val}
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-1">[{idx}]</span>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-sky-400">Active Subarray: </span>
              {currentStep ? (
                <span>
                  Indices [{currentStep.left} .. {currentStep.right}], Pivot ={' '}
                  <span className="font-mono font-bold text-amber-300">{currentStep.pivot_value ?? 'N/A'}</span>.
                  {currentStep.action === 'compare' && (
                    <span className="ml-2 text-sky-300">
                      Comparing arr[{currentStep.j}] ({currentStep.comparing?.[0]}) with pivot ({currentStep.comparing?.[1]}).
                    </span>
                  )}
                  {currentStep.action === 'swap' && (
                    <span className="ml-2 text-purple-300 font-bold">
                      Swapping arr[{currentStep.swapped?.[0]}] and arr[{currentStep.swapped?.[1]}]!
                    </span>
                  )}
                </span>
              ) : (
                'Run algorithm to view partitioning steps.'
              )}
            </div>
          </div>
        )}

        {/* Shared Reusable MetricsPanel */}
        <MetricsPanel
          title={selectedAlgo === 'merge_sort' ? 'Merge Sort Telemetry' : 'Quick Sort Telemetry'}
          complexity={selectedAlgo === 'merge_sort' ? 'O(n log n)' : 'O(n log n) avg / O(n²) worst'}
          status={currentStepIndex >= steps.length - 1 && steps.length > 0 ? 'found' : isPlaying ? 'searching' : 'idle'}
          statusMessage={
            currentStepIndex >= steps.length - 1 && steps.length > 0
              ? 'Sorting Completed'
              : isPlaying
                ? 'Decomposing Subproblems...'
                : 'Awaiting Execution'
          }
          metrics={{
            'Total Comparisons': currentStep?.comparisons ?? 0,
            ...(selectedAlgo === 'quick_sort' ? { 'Total Swaps': currentStep?.swaps ?? 0 } : {}),
            'Recursion Depth': currentStep?.depth ?? 0,
            'Execution Step': `${currentStepIndex + 1} / ${steps.length || 0}`,
          }}
          complexityDetails={{
            bestCase: selectedAlgo === 'merge_sort' ? 'O(n log n)' : 'O(n log n)',
            averageCase: 'O(n log n)',
            worstCase: selectedAlgo === 'merge_sort' ? 'O(n log n)' : 'O(n²)',
          }}
          accentColor={selectedAlgo === 'merge_sort' ? 'amber' : 'sky'}
        />

        {/* Shared Reusable CodeDisplay */}
        <CodeDisplay
          title={`${selectedAlgo === 'merge_sort' ? 'Merge Sort' : 'Quick Sort'} Implementation`}
          code={selectedAlgo === 'merge_sort' ? MERGE_SORT_CODE : QUICK_SORT_CODE}
          language="python"
        />
      </div>
    </div>
  );
};

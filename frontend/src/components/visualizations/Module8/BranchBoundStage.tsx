import React, { useState, useMemo } from 'react';
import { Play, RotateCcw, AlertTriangle, GitFork } from 'lucide-react';
import { algorithmsApi, ApiError } from '../../../api/client';
import type { KnapsackBBItem, Module8RunResponse, BranchBoundStep } from '../../../types';
import { AnimationPlayer, MetricsPanel, CodeDisplay } from '../../common';
import { BranchBoundTree } from './BranchBoundTree';

const BB_KNAPSACK_CODE = `def branch_and_bound_knapsack(items, capacity):
    # 1. Sort items by value-to-weight ratio descending
    items.sort(key=lambda x: x.value / x.weight, reverse=True)

    # 2. State-space tree node with fractional knapsack upper bound
    def calculate_bound(node, level):
        if node.weight >= capacity:
            return 0
        bound = node.value
        total_w = node.weight
        for i in range(level, len(items)):
            if total_w + items[i].weight <= capacity:
                total_w += items[i].weight
                bound += items[i].value
            else:
                bound += items[i].value * ((capacity - total_w) / items[i].weight)
                break
        return bound

    # 3. Explore tree: prune if bound <= best_value or weight > capacity
    root = Node(weight=0, value=0, bound=calculate_bound(root, 0))
    queue = [root]
    best_value = 0

    while queue:
        curr = queue.pop(0)
        if curr.bound <= best_value:
            continue  # Prune branch
        # Branch Left: Include item | Branch Right: Exclude item
        ...`;

const PRESETS: { name: string; items: KnapsackBBItem[]; capacity: number }[] = [
  {
    name: 'Standard 5-Item Instance',
    items: [
      { id: 'Item 1', weight: 2, value: 40 },
      { id: 'Item 2', weight: 3, value: 50 },
      { id: 'Item 3', weight: 1, value: 100 },
      { id: 'Item 4', weight: 5, value: 95 },
      { id: 'Item 5', weight: 3, value: 30 },
    ],
    capacity: 10,
  },
  {
    name: 'Compact 4-Item Instance',
    items: [
      { id: 'A', weight: 2, value: 24 },
      { id: 'B', weight: 3, value: 18 },
      { id: 'C', weight: 2, value: 18 },
      { id: 'D', weight: 4, value: 10 },
    ],
    capacity: 5,
  },
  {
    name: 'Tight Capacity Pruning',
    items: [
      { id: 'Gold', weight: 5, value: 150 },
      { id: 'Silver', weight: 4, value: 100 },
      { id: 'Bronze', weight: 3, value: 60 },
      { id: 'Copper', weight: 2, value: 30 },
    ],
    capacity: 7,
  },
];

export const BranchBoundStage: React.FC = () => {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [traceData, setTraceData] = useState<Module8RunResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(500);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async (presetIdx: number = selectedPresetIdx) => {
    setError(null);
    setLoading(true);
    setIsPlaying(false);
    setCurrentStepIndex(0);

    const preset = PRESETS[presetIdx];
    try {
      const response = await algorithmsApi.runModule8({
        items: preset.items,
        capacity: preset.capacity,
      });
      setTraceData(response);
      setCurrentStepIndex(0);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to execute Branch & Bound Knapsack algorithm.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    setSelectedPresetIdx(idx);
    setTraceData(null);
    setCurrentStepIndex(0);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const steps = traceData?.steps ?? [];

  const metricsDisplay: Record<string, string | number | boolean> = useMemo(() => {
    if (!traceData) return {};
    return {
      'Nodes Created': traceData.metrics.nodes_created,
      'Nodes Expanded': traceData.metrics.nodes_expanded,
      'Nodes Pruned': traceData.metrics.nodes_pruned,
      'Optimal Value': traceData.optimal_value,
      'Final Weight': `${traceData.final_weight} / ${traceData.capacity}`,
      'Max Search Depth': traceData.metrics.maximum_search_depth,
    };
  }, [traceData]);

  return (
    <div className="w-full space-y-6">
      {/* Configuration Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-400" />
            <label htmlFor="bb-preset" className="text-sm font-semibold text-slate-200">
              Problem Instance:
            </label>
          </div>
          <select
            id="bb-preset"
            value={selectedPresetIdx}
            onChange={handlePresetChange}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            disabled={loading || isPlaying}
          >
            {PRESETS.map((p, idx) => (
              <option key={p.name} value={idx}>
                {p.name} (Cap: {p.capacity})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRun()}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {loading ? 'Solving...' : 'Run Search'}
          </button>
          <button
            onClick={handleReset}
            disabled={!traceData || loading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-200 flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Interactive Stage */}
      {traceData && steps.length > 0 ? (
        <div className="space-y-6">
          <BranchBoundTree
            step={currentStep}
            treeNodes={traceData.tree_nodes}
            items={traceData.items}
            capacity={traceData.capacity}
          />

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <MetricsPanel
                title="Search Tree Metrics"
                complexity="O(2^n) branch & bound"
                status={currentStep?.action === 'solution_candidate' || currentStep?.action === 'best_solution_updated' ? 'found' : isPlaying ? 'searching' : 'idle'}
                statusMessage={
                  currentStep?.action === 'best_solution_updated'
                    ? `Optimal Solution: Value ${currentStep.best_value}`
                    : currentStep?.action === 'branch_pruned'
                    ? `Pruned: ${currentStep.prune_reason}`
                    : isPlaying
                    ? 'Exploring State-Space Tree...'
                    : 'Awaiting Exploration'
                }
                metrics={metricsDisplay}
                accentColor="amber"
              />
            </div>
            <div className="lg:col-span-2">
              <CodeDisplay
                title="Branch & Bound 0/1 Knapsack"
                code={BB_KNAPSACK_CODE}
                language="python"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
          <GitFork className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Ready to Explore State-Space Tree</h3>
          <p className="text-sm text-slate-500 max-w-md mt-1">
            Click &ldquo;Run Search&rdquo; above to compute fractional relaxation upper bounds and animate the 0/1 Knapsack Branch & Bound search tree.
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Play, RotateCcw, AlertTriangle, Boxes } from 'lucide-react';
import { algorithmsApi, ApiError } from '../../../api/client';
import type { KnapsackItem, Module5RunResponse, Module5Step } from '../../../types';
import { AnimationPlayer, MetricsPanel, CodeDisplay } from '../../common';
import { KnapsackTable } from './KnapsackTable';
import { DPBacktrack } from './DPBacktrack';

const KNAPSACK_CODE = `def knapsack_01(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    # 1. Fill DP Table
    for i in range(1, n + 1):
        wt = weights[i - 1]
        val = values[i - 1]
        for w in range(1, capacity + 1):
            if wt <= w:
                dp[i][w] = max(dp[i - 1][w], val + dp[i - 1][w - wt])
            else:
                dp[i][w] = dp[i - 1][w]

    # 2. Backtrack to find optimal items
    selected = []
    curr_w = capacity
    for i in range(n, 0, -1):
        if dp[i][curr_w] != dp[i - 1][curr_w]:
            selected.append(i - 1)
            curr_w -= weights[i - 1]

    return dp[n][capacity], selected[::-1]`;

const PRESETS: { name: string; items: KnapsackItem[]; capacity: number }[] = [
  {
    name: 'Standard (4 items, Cap: 8)',
    capacity: 8,
    items: [
      { id: 'Item 1', weight: 2, value: 3 },
      { id: 'Item 2', weight: 3, value: 4 },
      { id: 'Item 3', weight: 4, value: 5 },
      { id: 'Item 4', weight: 5, value: 6 },
    ],
  },
  {
    name: 'High Density (5 items, Cap: 10)',
    capacity: 10,
    items: [
      { id: 'Watch', weight: 1, value: 6 },
      { id: 'Ring', weight: 2, value: 10 },
      { id: 'Phone', weight: 3, value: 12 },
      { id: 'Tablet', weight: 4, value: 16 },
      { id: 'Laptop', weight: 5, value: 20 },
    ],
  },
];

export const KnapsackStage: React.FC = () => {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [traceData, setTraceData] = useState<Module5RunResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(300);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activePreset = PRESETS[selectedPresetIdx];

  const handleRun = async (presetIdx: number = selectedPresetIdx) => {
    setError(null);
    setLoading(true);
    setIsPlaying(false);
    setCurrentStepIndex(0);

    const targetPreset = PRESETS[presetIdx];

    try {
      const res = await algorithmsApi.runModule5({
        items: targetPreset.items,
        capacity: targetPreset.capacity,
      });
      setTraceData(res);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to execute 0/1 Knapsack algorithm.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = useMemo(() => traceData?.steps || [], [traceData]);
  const currentStep: Module5Step | null = steps[currentStepIndex] || null;

  return (
    <div className="space-y-8">
      {/* Control Panel */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Boxes className="w-5 h-5 text-emerald-400" />
              <span>Dynamic Programming II: 0/1 Knapsack</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Observe 2D dynamic programming table generation followed by backtracking to recover
              the exact optimal subset.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold mr-1">Presets:</span>
            {PRESETS.map((p, idx) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setSelectedPresetIdx(idx);
                  setTraceData(null);
                  setCurrentStepIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedPresetIdx === idx
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleRun(selectedPresetIdx)}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all inline-flex items-center space-x-2 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? 'Computing Table...' : 'Execute 0/1 Knapsack'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const nextIdx = (selectedPresetIdx + 1) % PRESETS.length;
              setSelectedPresetIdx(nextIdx);
              handleRun(nextIdx);
            }}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all inline-flex items-center space-x-1.5 cursor-pointer"
            title="Autofill preset and run knapsack"
          >
            <span>🎲 Autofill &amp; Run</span>
          </button>

          {traceData && (
            <button
              type="button"
              onClick={() => {
                setCurrentStepIndex(0);
                setIsPlaying(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Trace</span>
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Shared Reusable AnimationPlayer */}
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

      {/* Main Dual Stage: Table + Backtrack Reconstruction */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* DP Table */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>2D DP Table dp[i][w]</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60">
              Capacity: {activePreset.capacity}
            </span>
          </div>

          <KnapsackTable
            step={currentStep}
            items={activePreset.items}
            capacity={activePreset.capacity}
          />
        </div>

        {/* Backtracking Item Recovery */}
        <div className="lg:col-span-4 flex flex-col">
          <DPBacktrack
            step={currentStep}
            items={activePreset.items}
            capacity={activePreset.capacity}
          />
        </div>
      </div>

      {/* Shared MetricsPanel */}
      <MetricsPanel
        title="0/1 Knapsack Telemetry"
        complexity="O(N × W)"
        status={currentStep?.phase === 'completed' ? 'found' : isPlaying ? 'searching' : 'idle'}
        statusMessage={
          currentStep?.phase === 'completed'
            ? 'Optimal Knapsack Computed & Recovered'
            : currentStep?.phase === 'backtrack'
              ? 'Backtracking Optimal Item Subset...'
              : isPlaying
                ? 'Filling DP Matrix Cells...'
                : 'Awaiting Run'
        }
        metrics={{
          'Maximum Value Achieved': `$${currentStep?.metrics?.max_value ?? 0}`,
          'Optimal Items Selected': `${currentStep?.metrics?.selected_count ?? 0} / ${activePreset.items.length}`,
          'Total Weight Packed': `${currentStep?.metrics?.total_weight ?? 0} / ${activePreset.capacity}`,
          'Current Step': `${currentStepIndex + 1} / ${steps.length || 1}`,
        }}
        accentColor="emerald"
      />

      {/* Shared CodeDisplay */}
      <CodeDisplay title="0/1 Knapsack DP Implementation" code={KNAPSACK_CODE} language="python" />
    </div>
  );
};

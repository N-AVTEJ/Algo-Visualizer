import React, { useState } from 'react';
import { Play, RotateCcw, AlertTriangle, Network } from 'lucide-react';
import { algorithmsApi, ApiError } from '../../../api/client';
import type { Module4Step, Module4RunResponse } from '../../../types';
import { AnimationPlayer, MetricsPanel, CodeDisplay } from '../../common';
import { GraphCanvas } from './GraphCanvas';
import { MatrixHeatmap } from './MatrixHeatmap';

const FLOYD_WARSHALL_CODE = `def floyd_warshall(graph, V):
    # Initialize dist matrix from graph adjacency
    dist = [[graph[i][j] for j in range(V)] for i in range(V)]

    # Triple loop: k is the intermediate pivot vertex
    for k in range(V):
        for i in range(V):
            for j in range(V):
                # If path through vertex k is shorter, update
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]

    return dist`;

const PRESETS = [
  {
    name: 'Standard 4-Node (A->B->C->D)',
    labels: ['A', 'B', 'C', 'D'],
    matrix: [
      [0, 5, null, 10],
      [null, 0, 3, null],
      [null, null, 0, 1],
      [null, null, null, 0],
    ],
  },
  {
    name: 'Cyclic Shortcut Graph',
    labels: ['A', 'B', 'C', 'D'],
    matrix: [
      [0, 3, 8, null],
      [null, 0, null, 1],
      [null, 4, 0, null],
      [2, null, null, 0],
    ],
  },
];

export const FloydWarshallStage: React.FC = () => {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [traceData, setTraceData] = useState<Module4RunResponse | null>(null);
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
      const res = await algorithmsApi.runModule4({
        matrix: targetPreset.matrix,
        labels: targetPreset.labels,
      });
      setTraceData(res);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to execute Floyd-Warshall algorithm.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = traceData?.steps || [];
  const currentStep: Module4Step | null = steps[currentStepIndex] || null;

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Network className="w-5 h-5 text-emerald-400" />
              <span>Dynamic Programming I: Floyd–Warshall</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Synchronized all-pairs shortest paths relaxation between directed graph topology and
              distance matrix heatmap.
            </p>
          </div>

          {/* Preset Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold mr-1">Graph Preset:</span>
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
            <span>{loading ? 'Computing Shortest Paths...' : 'Execute Floyd–Warshall'}</span>
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

      {/* Dual Synchronized Stage: Graph + Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: D3 Weighted Graph Canvas */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Input Directed Weighted Graph</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60">
              V = {activePreset.labels.length} Vertices
            </span>
          </div>

          <GraphCanvas
            step={currentStep}
            labels={activePreset.labels}
            initialMatrix={activePreset.matrix}
          />

          {/* Explanation Text */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
            {currentStep?.explanation ||
              'Run algorithm to view step-by-step relaxation explanation.'}
          </div>
        </div>

        {/* Right: Distance Matrix Heatmap */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span>All-Pairs Distance Matrix D[i][j]</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Step {currentStepIndex + 1} / {steps.length || 1}
            </span>
          </div>

          <MatrixHeatmap step={currentStep} labels={activePreset.labels} />
        </div>
      </div>

      {/* Shared MetricsPanel */}
      <MetricsPanel
        title="Floyd–Warshall DP Telemetry"
        complexity="O(V³)"
        status={currentStep?.action === 'completed' ? 'found' : isPlaying ? 'searching' : 'idle'}
        statusMessage={
          currentStep?.action === 'completed'
            ? 'All-Pairs Shortest Paths Matrix Complete!'
            : isPlaying
              ? 'Evaluating Triple Relaxations...'
              : 'Awaiting Run'
        }
        metrics={{
          'Relaxation Triple Steps': currentStep?.metrics.relaxations ?? 0,
          'Shorter Paths Found (Updates)': currentStep?.metrics.updates ?? 0,
          'Active Pivot Vertex (k)':
            currentStep && currentStep.k >= 0 && activePreset.labels[currentStep.k]
              ? `${activePreset.labels[currentStep.k]} (${currentStep.k + 1}/${activePreset.labels.length})`
              : 'None',
          'Matrix Dimensions': `${activePreset.labels.length} × ${activePreset.labels.length}`,
        }}
        accentColor="emerald"
      />

      {/* Shared CodeDisplay */}
      <CodeDisplay
        title="Floyd–Warshall Algorithm Source"
        code={FLOYD_WARSHALL_CODE}
        language="python"
      />
    </div>
  );
};

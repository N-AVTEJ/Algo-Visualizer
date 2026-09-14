import React, { useState, useMemo } from 'react';
import { Play, RotateCcw, AlertTriangle, Network } from 'lucide-react';
import { algorithmsApi, ApiError } from '../../../api/client';
import type { Module10RunResponse, GraphColoringStep, SimpleGraphEdge } from '../../../types';
import { AnimationPlayer, MetricsPanel, CodeDisplay } from '../../common';
import { MapColoring } from './MapColoring';

const GRAPH_COLORING_CODE = `def graph_coloring_backtracking(graph, k_colors):
    coloring = {}

    def is_safe(v, color):
        # Check if adjacent vertices share the attempted color
        for neighbor in graph[v]:
            if neighbor in coloring and coloring[neighbor] == color:
                return False
        return True

    def backtrack(vertex_index):
        if vertex_index == len(vertices):
            return True  # Valid k-coloring found

        v = vertices[vertex_index]
        for color in range(1, k_colors + 1):
            if is_safe(v, color):
                coloring[v] = color  # Assign
                if backtrack(vertex_index + 1):
                    return True
                del coloring[v]      # Backtrack

        return False`;

const PRESETS: {
  name: string;
  vertices: string[];
  edges: SimpleGraphEdge[];
  maxColors?: number;
}[] = [
  {
    name: '5-Vertex Cycle with Chord',
    vertices: ['A', 'B', 'C', 'D', 'E'],
    edges: [
      { u: 'A', v: 'B' },
      { u: 'B', v: 'C' },
      { u: 'C', v: 'D' },
      { u: 'D', v: 'E' },
      { u: 'E', v: 'A' },
      { u: 'A', v: 'C' },
    ],
    maxColors: 3,
  },
  {
    name: 'Triangle K3 (Complete Graph)',
    vertices: ['1', '2', '3'],
    edges: [
      { u: '1', v: '2' },
      { u: '2', v: '3' },
      { u: '3', v: '1' },
    ],
    maxColors: 3,
  },
  {
    name: 'Bipartite 4-Cycle (C4)',
    vertices: ['V1', 'V2', 'V3', 'V4'],
    edges: [
      { u: 'V1', v: 'V2' },
      { u: 'V2', v: 'V3' },
      { u: 'V3', v: 'V4' },
      { u: 'V4', v: 'V1' },
    ],
    maxColors: 2,
  },
  {
    name: 'Wheel Graph W5 (Hub & Cycle)',
    vertices: ['Hub', 'N1', 'N2', 'N3', 'N4'],
    edges: [
      { u: 'Hub', v: 'N1' },
      { u: 'Hub', v: 'N2' },
      { u: 'Hub', v: 'N3' },
      { u: 'Hub', v: 'N4' },
      { u: 'N1', v: 'N2' },
      { u: 'N2', v: 'N3' },
      { u: 'N3', v: 'N4' },
      { u: 'N4', v: 'N1' },
    ],
    maxColors: 3,
  },
];

export const GraphColoringStage: React.FC = () => {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [traceData, setTraceData] = useState<Module10RunResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(450);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activePreset = PRESETS[selectedPresetIdx];

  const handleRun = async (presetIdx: number = selectedPresetIdx) => {
    setError(null);
    setLoading(true);
    setIsPlaying(false);
    setCurrentStepIndex(0);

    const preset = PRESETS[presetIdx];
    try {
      const response = await algorithmsApi.runModule10({
        vertices: preset.vertices,
        edges: preset.edges,
        max_colors: preset.maxColors,
      });
      setTraceData(response);
      setCurrentStepIndex(0);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to execute Graph Coloring algorithm.');
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

  const currentStep: GraphColoringStep | null = useMemo(() => {
    if (!traceData || traceData.steps.length === 0) return null;
    return traceData.steps[currentStepIndex] || null;
  }, [traceData, currentStepIndex]);

  const metricsDisplay = useMemo(() => {
    if (!traceData) return [];
    return [
      { label: 'Vertices Count (|V|)', value: traceData.metrics.vertices_count },
      { label: 'Edges Count (|E|)', value: traceData.metrics.edges_count },
      { label: 'Colors Attempted', value: traceData.metrics.colors_attempted },
      { label: 'Conflicts Detected', value: traceData.metrics.conflicts_detected },
      { label: 'Backtracks Performed', value: traceData.metrics.backtracks_performed },
      {
        label: 'Chromatic Number χ(G)',
        value: traceData.chromatic_number > 0 ? traceData.chromatic_number : 'N/A',
      },
      {
        label: 'Colorable',
        value: traceData.is_colorable ? 'Valid Coloring Found' : 'Uncolorable',
      },
    ];
  }, [traceData]);

  return (
    <div className="w-full space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            <label htmlFor="coloring-preset" className="text-sm font-semibold text-slate-200">
              Graph Instance:
            </label>
          </div>
          <select
            id="coloring-preset"
            value={selectedPresetIdx}
            onChange={handlePresetChange}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            disabled={loading || isPlaying}
          >
            {PRESETS.map((p, idx) => (
              <option key={p.name} value={idx}>
                {p.name}
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
            {loading ? 'Coloring...' : 'Color Graph'}
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
      {traceData ? (
        <div className="space-y-6">
          <MapColoring
            step={currentStep}
            vertices={traceData.vertices}
            edges={traceData.edges}
            chromaticNumber={traceData.chromatic_number}
          />

          <AnimationPlayer
            totalSteps={traceData.steps.length}
            currentStep={currentStepIndex}
            onStepChange={setCurrentStepIndex}
            isPlaying={isPlaying}
            onPlayPauseChange={setIsPlaying}
            speed={speedMs}
            onSpeedChange={setSpeedMs}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <MetricsPanel title="Coloring Search Metrics" metrics={metricsDisplay} />
            </div>
            <div className="lg:col-span-2">
              <CodeDisplay
                code={GRAPH_COLORING_CODE}
                language="python"
                highlightLines={
                  currentStep?.action === 'conflict'
                    ? [7, 8]
                    : currentStep?.action === 'backtrack'
                    ? [20, 21]
                    : currentStep?.action === 'assigned'
                    ? [17, 18]
                    : [12, 13]
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
          <Network className="w-12 h-12 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Ready to Color Graph</h3>
          <p className="text-sm text-slate-500 max-w-md mt-1">
            Click &ldquo;Color Graph&rdquo; above to run backtracking vertex coloring, observe neighbor conflicts, and discover the chromatic number.
          </p>
        </div>
      )}
    </div>
  );
};

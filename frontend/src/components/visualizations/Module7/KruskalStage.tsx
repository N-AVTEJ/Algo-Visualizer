import React, { useState, useMemo } from 'react';
import { Play, RotateCcw, AlertTriangle, GitPullRequest } from 'lucide-react';
import { algorithmsApi, ApiError } from '../../../api/client';
import type { GraphEdge, Module7RunResponse, Module7Step } from '../../../types';
import { AnimationPlayer, MetricsPanel, CodeDisplay } from '../../common';
import { GraphCanvas } from './GraphCanvas';

const KRUSKAL_CODE = `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))

    def find(self, i):
        if self.parent[i] == i:
            return i
        self.parent[i] = self.find(self.parent[i])
        return self.parent[i]

    def union(self, i, j):
        root_i, root_j = self.find(i), self.find(j)
        if root_i != root_j:
            self.parent[root_i] = root_j
            return True
        return False

def kruskal_mst(vertices, edges):
    # 1. Sort edges in non-decreasing weight order
    edges.sort(key=lambda x: x['weight'])
    uf = UnionFind(len(vertices))
    mst = []

    # 2. Greedily add edges that do not introduce cycles
    for edge in edges:
        if uf.union(edge['u'], edge['v']):
            mst.append(edge)

    return mst`;

const PRESETS: { name: string; vertices: string[]; edges: GraphEdge[] }[] = [
  {
    name: 'Standard 6-Vertex Graph',
    vertices: ['A', 'B', 'C', 'D', 'E', 'F'],
    edges: [
      { u: 'A', v: 'B', weight: 4 },
      { u: 'A', v: 'F', weight: 2 },
      { u: 'B', v: 'C', weight: 6 },
      { u: 'B', v: 'F', weight: 5 },
      { u: 'C', v: 'D', weight: 3 },
      { u: 'C', v: 'F', weight: 1 },
      { u: 'D', v: 'E', weight: 2 },
      { u: 'E', v: 'F', weight: 4 },
    ],
  },
  {
    name: 'Disconnected Graph (Forest)',
    vertices: ['A', 'B', 'C', 'D', 'E'],
    edges: [
      { u: 'A', v: 'B', weight: 3 },
      { u: 'B', v: 'C', weight: 5 },
      { u: 'D', v: 'E', weight: 4 },
    ],
  },
];

export const KruskalStage: React.FC = () => {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [traceData, setTraceData] = useState<Module7RunResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(400);

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
      const res = await algorithmsApi.runModule7({
        vertices: targetPreset.vertices,
        edges: targetPreset.edges,
      });
      setTraceData(res);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to execute Kruskal algorithm.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = useMemo(() => traceData?.steps || [], [traceData]);
  const currentStep: Module7Step | null = steps[currentStepIndex] || null;
  const sortedEdges = traceData?.sorted_edges || activePreset.edges;
  const mstEdges = useMemo(() => currentStep?.mst_edges || [], [currentStep]);
  const rejectedEdges = useMemo(() => currentStep?.rejected_edges || [], [currentStep]);

  const edgeKey = (u: string, v: string) => (u < v ? `${u}-${v}` : `${v}-${u}`);
  const mstSet = useMemo(() => new Set(mstEdges.map((e) => edgeKey(e.u, e.v))), [mstEdges]);
  const rejectedSet = useMemo(
    () => new Set(rejectedEdges.map((e) => edgeKey(e.u, e.v))),
    [rejectedEdges]
  );

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <GitPullRequest className="w-5 h-5 text-emerald-400" />
              <span>Greedy Method II: Kruskal&apos;s Minimum Spanning Tree</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Greedily examine edges sorted by weight, using Disjoint Set Union (DSU) to reject
              cycle-inducing edges.
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
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
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
            <span>
              {loading ? 'Building Spanning Tree...' : 'Execute Kruskal&apos;s Algorithm'}
            </span>
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

      {/* Workspace: Graph Canvas + Edge Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive D3 Graph Canvas */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Interactive Graph &amp; MST Formation</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-300 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60">
              Running Weight: {currentStep?.running_weight ?? 0}
            </span>
          </div>

          <GraphCanvas
            step={currentStep}
            vertices={activePreset.vertices}
            edges={activePreset.edges}
          />

          {/* Educational Step Explanation */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
            {currentStep?.explanation ||
              'Run Kruskal&apos;s algorithm to visualize edge evaluations.'}
          </div>
        </div>

        {/* Right: Sorted Edge Evaluation Queue */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Weight-Sorted Edges</h3>
            <span className="text-[11px] font-mono text-slate-400">
              {mstEdges.length} / {activePreset.vertices.length - 1} edges
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
            {sortedEdges.map((e, idx) => {
              const k = edgeKey(e.u, e.v);
              const isCurrent =
                currentStep?.current_edge &&
                edgeKey(currentStep.current_edge.u, currentStep.current_edge.v) === k;
              const isMst = mstSet.has(k);
              const isRejected = rejectedSet.has(k);

              let badge = 'bg-slate-950 border-slate-800 text-slate-400';
              if (isCurrent) {
                badge = 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/50';
              } else if (isMst) {
                badge = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300';
              } else if (isRejected) {
                badge = 'bg-rose-500/20 border-rose-500/40 text-rose-400 opacity-60';
              }

              return (
                <div
                  key={`${e.u}-${e.v}-${idx}`}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${badge}`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 text-center font-mono text-xs text-slate-500">
                      {idx + 1}.
                    </span>
                    <span className="font-mono font-bold text-white text-xs">
                      {e.u} &mdash; {e.v}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-slate-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      wt: {e.weight}
                    </span>
                    <span className="text-[10px] font-mono font-bold">
                      {isMst ? (
                        <span className="text-emerald-400">✓ MST</span>
                      ) : isRejected ? (
                        <span className="text-rose-400">✕ CYCLE</span>
                      ) : isCurrent ? (
                        <span className="text-amber-400">CHECK</span>
                      ) : (
                        <span className="text-slate-600">Pending</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DSU Components Count */}
          <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>DSU Disjoint Sets:</span>
            <span className="font-mono font-bold text-white">
              {currentStep?.components.length ?? activePreset.vertices.length} component(s)
            </span>
          </div>
        </div>
      </div>

      {/* Shared MetricsPanel */}
      <MetricsPanel
        title="Kruskal's MST Telemetry"
        complexity="O(E log E)"
        status={currentStep?.action === 'completed' ? 'found' : isPlaying ? 'searching' : 'idle'}
        statusMessage={
          currentStep?.action === 'completed'
            ? traceData?.is_connected
              ? 'Minimum Spanning Tree Complete'
              : 'Spanning Forest Formed (Disconnected Graph)'
            : currentStep?.action === 'added'
              ? 'Acyclic Edge Accepted into MST'
              : currentStep?.action === 'rejected'
                ? 'Cycle Detected & Discarded'
                : isPlaying
                  ? 'Testing Component Connectivity...'
                  : 'Awaiting Run'
        }
        metrics={{
          'Total MST Weight': currentStep?.running_weight ?? 0,
          'MST Edges Accepted': `${mstEdges.length} / ${activePreset.vertices.length - 1}`,
          'Edges Evaluated': `${currentStep?.metrics.edges_considered ?? 0} / ${sortedEdges.length}`,
          'Connectivity Status':
            traceData?.is_connected === false
              ? 'Disconnected Forest'
              : `${currentStep?.components.length ?? activePreset.vertices.length} Component(s)`,
        }}
        accentColor="emerald"
      />

      {/* Shared CodeDisplay */}
      <CodeDisplay title="Kruskal's MST with Union-Find" code={KRUSKAL_CODE} language="python" />
    </div>
  );
};

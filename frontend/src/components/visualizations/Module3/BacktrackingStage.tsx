import React, { useState } from 'react';
import { Play, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { algorithmsApi, ApiError } from '../../../api/client';
import type { Module3Step, Module3RunResponse } from '../../../types';
import { AnimationPlayer, MetricsPanel, CodeDisplay } from '../../common';
import { Chessboard } from './Chessboard';
import { DecisionTree } from './DecisionTree';

const N_QUEENS_CODE = `def solve_n_queens(n):
    board = [-1] * n
    solutions = []

    def is_safe(row, col):
        for prev_row in range(row):
            prev_col = board[prev_row]
            # Check column conflict
            if prev_col == col:
                return False
            # Check diagonal conflict
            if abs(prev_row - row) == abs(prev_col - col):
                return False
        return True

    def backtrack(row):
        if row == n:
            solutions.append(list(board))
            return True  # Stop at first solution

        for col in range(n):
            if is_safe(row, col):
                board[row] = col  # Place
                if backtrack(row + 1):
                    return True
                board[row] = -1   # Backtrack

        return False

    backtrack(0)
    return solutions`;

export const BacktrackingStage: React.FC = () => {
  const [n, setN] = useState<number>(8);
  const [traceData, setTraceData] = useState<Module3RunResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(350);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'both' | 'board' | 'tree'>('both');

  const handleRun = async (boardSize: number = n) => {
    setError(null);
    setLoading(true);
    setIsPlaying(false);
    setCurrentStepIndex(0);

    try {
      const res = await algorithmsApi.runModule3({
        n: boardSize,
        stop_at_first_solution: true,
      });
      setTraceData(res);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to execute N-Queens search.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = traceData?.steps || [];
  const currentStep: Module3Step | null = steps[currentStepIndex] || null;

  return (
    <div className="space-y-8">
      {/* Search Controls */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              <span>Backtracking Arena: N-Queens Problem</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Observe depth-first tree search, constraint propagation, pruning, and backtracking on
              an 8×8 chessboard.
            </p>
          </div>

          {/* Dimension Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold mr-1">Board Size:</span>
            {[4, 6, 8].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setN(size);
                  handleRun(size);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  n === size
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {size}×{size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleRun(n)}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all inline-flex items-center space-x-2 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? 'Searching State Space...' : `Solve ${n}-Queens`}</span>
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
              <span>Reset Search</span>
            </button>
          )}

          {/* View Tab Selector */}
          <div className="ml-auto flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('both')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'both'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('board')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'board'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Board Only
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tree')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeTab === 'tree'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Decision Tree Only
            </button>
          </div>
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

      {/* Main Dual Stage */}
      <div
        className={`grid gap-8 ${activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}
      >
        {/* Stage A: Chessboard */}
        {(activeTab === 'both' || activeTab === 'board') && (
          <div
            className={`${activeTab === 'both' ? 'lg:col-span-6' : ''} p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col items-center justify-center`}
          >
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Physical Chessboard State</span>
              </h3>
              <span className="text-[11px] font-mono text-purple-300 font-bold px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60">
                Depth {currentStep?.depth ?? 0}
              </span>
            </div>
            <Chessboard step={currentStep} n={n} />
          </div>
        )}

        {/* Stage B: D3 Decision Tree */}
        {(activeTab === 'both' || activeTab === 'tree') && (
          <div
            className={`${activeTab === 'both' ? 'lg:col-span-6' : ''} p-6 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col`}
          >
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Explored Search Space Tree (D3.js)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Nodes Explored: {currentStepIndex + 1}
              </span>
            </div>
            <DecisionTree steps={steps} currentStepIndex={currentStepIndex} />
          </div>
        )}
      </div>

      {/* Shared MetricsPanel */}
      <MetricsPanel
        title="N-Queens Backtracking Metrics"
        complexity="O(N!)"
        status={currentStep?.action === 'solution' ? 'found' : isPlaying ? 'searching' : 'idle'}
        statusMessage={
          currentStep?.action === 'solution'
            ? 'Valid Solution Discovered!'
            : isPlaying
              ? 'Pruning Invalid Branches...'
              : 'Search Idle'
        }
        metrics={{
          'Placement Attempts': currentStep?.metrics.attempts ?? 0,
          'Valid Placements': currentStep?.metrics.placements ?? 0,
          'Backtracks Executed': currentStep?.metrics.backtracks ?? 0,
          'Current Depth': `${currentStep?.depth ?? 0} / ${n}`,
        }}
        accentColor="violet"
      />

      {/* Shared CodeDisplay */}
      <CodeDisplay title="Backtracking Algorithm Source" code={N_QUEENS_CODE} language="python" />
    </div>
  );
};

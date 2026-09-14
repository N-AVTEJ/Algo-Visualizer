import React from 'react';
import { motion } from 'framer-motion';
import type { Module4Step } from '../../../types';

interface MatrixHeatmapProps {
  step: Module4Step | null;
  labels: string[];
}

export const MatrixHeatmap: React.FC<MatrixHeatmapProps> = ({ step, labels }) => {
  const matrix = step?.matrix || [];
  const currentI = step?.i ?? -1;
  const currentJ = step?.j ?? -1;
  const currentK = step?.k ?? -1;
  const wasUpdated = step?.updated ?? false;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Relaxation Status / Formula Header */}
      <div className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span className="font-semibold text-amber-400">Current Pivot k = </span>
          <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/60">
            {currentK >= 0 && labels[currentK] ? `${labels[currentK]} (idx ${currentK})` : 'None'}
          </span>
        </div>

        {step && currentI >= 0 && currentJ >= 0 && (
          <div className="font-mono text-xs">
            D[{labels[currentI]}][{labels[currentJ]}] = min(
            <span className="text-slate-400">{step.prev_dist !== null ? step.prev_dist : '∞'}</span>
            ,{' '}
            <span className="text-amber-300">
              {step.candidate_dist !== null ? step.candidate_dist : '∞'}
            </span>
            ){' '}
            {wasUpdated && (
              <span className="text-emerald-400 font-bold ml-1">
                &rarr; {step.new_dist} (UPDATED!)
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2D Distance Heatmap Grid */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-x-auto max-w-full">
        <div className="table border-collapse">
          {/* Column Header */}
          <div className="table-row">
            <div className="table-cell p-2 text-center text-xs font-mono font-bold text-slate-500">
              i \ j
            </div>
            {labels.map((colLabel, cIdx) => (
              <div
                key={colLabel}
                className={`table-cell p-2 text-center text-xs font-mono font-bold ${
                  currentJ === cIdx ? 'text-purple-400' : 'text-slate-400'
                }`}
              >
                {colLabel}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {matrix.map((row, rIdx) => (
            <div key={`row-${rIdx}`} className="table-row">
              {/* Row Header */}
              <div
                className={`table-cell p-2 text-center text-xs font-mono font-bold ${
                  currentI === rIdx ? 'text-sky-400' : 'text-slate-400'
                }`}
              >
                {labels[rIdx]}
              </div>

              {/* Cells */}
              {row.map((val, cIdx) => {
                const isCurrent = currentI === rIdx && currentJ === cIdx;
                const isIK = currentI === rIdx && currentK === cIdx;
                const isKJ = currentK === rIdx && currentJ === cIdx;
                const isDiag = rIdx === cIdx;
                const isInfinity = val === null;

                let cellBg = 'bg-slate-900 border-slate-800 text-slate-200';
                if (isCurrent) {
                  cellBg = wasUpdated
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold scale-105 shadow-md shadow-emerald-500/30'
                    : 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold scale-105 shadow-md shadow-amber-500/30';
                } else if (isIK) {
                  cellBg = 'bg-sky-500/15 border-sky-400/80 text-sky-300';
                } else if (isKJ) {
                  cellBg = 'bg-purple-500/15 border-purple-400/80 text-purple-300';
                } else if (isDiag) {
                  cellBg = 'bg-slate-900/60 border-slate-800/80 text-slate-400';
                } else if (isInfinity) {
                  cellBg = 'bg-slate-950 border-slate-800/60 text-slate-600';
                } else {
                  // Finite positive distance
                  cellBg = 'bg-teal-950/40 border-teal-800/40 text-teal-200';
                }

                return (
                  <div key={`cell-${rIdx}-${cIdx}`} className="table-cell p-1.5">
                    <motion.div
                      animate={{
                        scale: isCurrent ? 1.08 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex flex-col items-center justify-center font-mono transition-all ${cellBg}`}
                    >
                      <span className="text-sm font-bold">{isInfinity ? '∞' : val}</span>
                      {isCurrent && (
                        <span className="text-[9px] uppercase tracking-tighter opacity-80">
                          {wasUpdated ? 'new' : 'eval'}
                        </span>
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] mt-4 text-slate-400">
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-400" />
          <span>Evaluating Cell (i, j)</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-400" />
          <span>Relaxation Updated</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-sky-500/30 border border-sky-400" />
          <span>D[i][k] Subpath</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-purple-500/30 border border-purple-400" />
          <span>D[k][j] Subpath</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-slate-950 border border-slate-700 text-slate-500 font-mono text-center flex items-center justify-center font-bold">
            ∞
          </span>
          <span>Infinity (Disconnected)</span>
        </span>
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import type { KnapsackItem, Module5Step } from '../../../types';

interface KnapsackTableProps {
  step: Module5Step | null;
  items: KnapsackItem[];
  capacity: number;
}

export const KnapsackTable: React.FC<KnapsackTableProps> = ({ step, items, capacity }) => {
  const dpTable = step?.dp_table || [];
  const currentRow = step?.row ?? -1;
  const currentCol = step?.col ?? -1;
  const isBacktracking = step?.phase === 'backtrack';
  const isCompleted = step?.phase === 'completed';
  const included = step?.included ?? false;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Step Formula / Explanation Header */}
      <div className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-emerald-400">Current Evaluation:</span>
          {step && step.item_index !== null && items[step.item_index] && (
            <span className="font-mono text-white px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60">
              {items[step.item_index].id} (Wt: {items[step.item_index].weight}, Val: $
              {items[step.item_index].value})
            </span>
          )}
        </div>

        {step && step.phase === 'table_fill' && (
          <div className="font-mono text-xs text-slate-300">
            dp[{currentRow}][{currentCol}] ={' '}
            <span className="text-slate-400">max(exclude: {step.prev_dp}, </span>
            <span className="text-amber-300">
              include: {step.candidate_val !== null ? step.candidate_val : 'N/A'}
            </span>
            ) &rarr;{' '}
            <span className={`font-bold ${included ? 'text-emerald-400' : 'text-slate-200'}`}>
              {step.result_val} {included ? '(INCLUDED)' : '(EXCLUDED)'}
            </span>
          </div>
        )}

        {isBacktracking && (
          <div className="font-mono text-xs text-purple-300">
            Backtracking cell ({currentRow}, {currentCol}) &rarr;{' '}
            <span className="font-bold text-white">
              {included ? 'ITEM SELECTED!' : 'ITEM SKIPPED'}
            </span>
          </div>
        )}
      </div>

      {/* 2D DP Matrix Table */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-x-auto max-w-full">
        <table className="border-collapse text-center">
          <thead>
            <tr>
              <th className="p-2 text-xs font-mono font-bold text-slate-500 border-b border-r border-slate-800">
                Item \ Cap
              </th>
              {Array.from({ length: capacity + 1 }, (_, w) => (
                <th
                  key={`cap-${w}`}
                  className={`p-2 text-xs font-mono font-bold border-b border-slate-800 min-w-[42px] ${
                    currentCol === w ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400'
                  }`}
                >
                  w={w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dpTable.map((row, rIdx) => {
              const item = rIdx > 0 ? items[rIdx - 1] : null;
              const isRowActive = currentRow === rIdx;

              return (
                <tr key={`row-${rIdx}`} className={isRowActive ? 'bg-slate-900/60' : ''}>
                  {/* Row Header */}
                  <td
                    className={`p-2 text-xs font-mono font-bold border-r border-slate-800 whitespace-nowrap text-left ${
                      isRowActive ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {rIdx === 0 ? (
                      '0 (Base)'
                    ) : (
                      <span>
                        {item?.id || `Item ${rIdx}`}{' '}
                        <span className="text-[10px] text-slate-500 font-normal">
                          (w:{item?.weight}, v:{item?.value})
                        </span>
                      </span>
                    )}
                  </td>

                  {/* Row Cells */}
                  {row.map((val, cIdx) => {
                    const isCurrent = currentRow === rIdx && currentCol === cIdx;
                    const isCandidateParent =
                      step?.phase === 'table_fill' &&
                      step.item_weight !== null &&
                      rIdx === currentRow - 1 &&
                      cIdx === currentCol - step.item_weight;
                    const isAboveParent =
                      step?.phase === 'table_fill' &&
                      rIdx === currentRow - 1 &&
                      cIdx === currentCol;

                    let cellBg = 'bg-slate-900/50 border-slate-800 text-slate-300';
                    if (isCurrent) {
                      cellBg = isBacktracking
                        ? included
                          ? 'bg-purple-600/30 border-purple-400 text-purple-200 font-bold scale-110 shadow-lg shadow-purple-500/30'
                          : 'bg-amber-600/30 border-amber-400 text-amber-200 font-bold scale-110'
                        : included
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold scale-110 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 border-amber-400/80 text-amber-300 font-bold scale-105';
                    } else if (isCandidateParent) {
                      cellBg = 'bg-amber-500/15 border-amber-500/60 text-amber-300 font-semibold';
                    } else if (isAboveParent) {
                      cellBg = 'bg-sky-500/15 border-sky-500/60 text-sky-300';
                    } else if (isCompleted && rIdx === items.length && cIdx === capacity) {
                      cellBg = 'bg-emerald-500/30 border-emerald-400 text-emerald-200 font-bold';
                    }

                    return (
                      <td key={`cell-${rIdx}-${cIdx}`} className="p-1">
                        <motion.div
                          animate={{
                            scale: isCurrent ? 1.1 : 1,
                          }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex flex-col items-center justify-center font-mono text-xs transition-all ${cellBg}`}
                        >
                          <span className="font-bold">{val}</span>
                          {isCurrent && (
                            <span className="text-[8px] uppercase tracking-tighter opacity-70">
                              {isBacktracking ? 'trace' : included ? 'inc' : 'calc'}
                            </span>
                          )}
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Visual Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] mt-4 text-slate-400">
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-400" />
          <span>Included (Value Increased)</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-400" />
          <span>Excluded / Inherited</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-purple-500/30 border border-purple-400" />
          <span>Backtracking Path</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-amber-500/15 border border-amber-500/60" />
          <span>Candidate Dependency dp[i-1][w-wt]</span>
        </span>
      </div>
    </div>
  );
};

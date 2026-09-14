import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Package, DollarSign, Scale } from 'lucide-react';
import type { KnapsackItem, Module5Step } from '../../../types';

interface DPBacktrackProps {
  step: Module5Step | null;
  items: KnapsackItem[];
  capacity: number;
}

export const DPBacktrack: React.FC<DPBacktrackProps> = ({ step, items, capacity }) => {
  const selectedIndices = step?.selected_items || [];
  const runningWeight = step?.running_weight || 0;
  const runningValue = step?.running_value || 0;
  const currentStepItemIndex = step?.item_index;
  const isBacktrackPhase = step?.phase === 'backtrack' || step?.phase === 'completed';

  return (
    <div className="w-full p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
      {/* Title & Phase Status */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white">Backtracking Solution Reconstruction</h3>
        </div>
        <span
          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
            isBacktrackPhase
              ? 'bg-purple-950/80 text-purple-300 border-purple-800/60'
              : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}
        >
          {step?.phase === 'completed'
            ? 'Optimal Solution Found'
            : isBacktrackPhase
              ? 'Tracing Back...'
              : 'Waiting for DP Fill'}
        </span>
      </div>

      {/* Items Consideration List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, idx) => {
          const isSelected = selectedIndices.includes(idx);
          const isBeingEvaluated = currentStepItemIndex === idx && step?.phase === 'backtrack';

          let borderClass = 'border-slate-800 bg-slate-950/60 opacity-60';
          if (isSelected) {
            borderClass =
              'border-emerald-500/80 bg-emerald-950/40 text-white shadow-md shadow-emerald-500/10 opacity-100';
          } else if (isBeingEvaluated) {
            borderClass =
              'border-amber-400 bg-amber-950/30 text-amber-200 animate-pulse opacity-100';
          }

          return (
            <motion.div
              key={item.id}
              layout
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${borderClass}`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950'
                      : isBeingEvaluated
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isSelected ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200">{item.id}</span>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                    <span>Wt: {item.weight}</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400">Val: ${item.value}</span>
                  </div>
                </div>
              </div>

              <div>
                {isSelected ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    INCLUDED
                  </span>
                ) : isBacktrackPhase &&
                  !isSelected &&
                  currentStepItemIndex != null &&
                  idx > currentStepItemIndex ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-500 flex items-center space-x-1">
                    <X className="w-3 h-3" />
                    <span>SKIPPED</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-600 font-mono">Pending</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Running Totals Gauge */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-sky-950/80 text-sky-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Total Weight
            </span>
            <span className="text-base font-mono font-bold text-white">
              {runningWeight} <span className="text-xs text-slate-500">/ {capacity}</span>
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Total Value
            </span>
            <span className="text-base font-mono font-bold text-emerald-300">${runningValue}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

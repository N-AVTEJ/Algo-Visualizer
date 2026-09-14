import React from 'react';
import { Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';

export interface MetricsPanelProps {
  title: string;
  complexity: string;
  bestComplexity?: string;
  worstComplexity?: string;
  comparisons: number;
  currentStep: number;
  totalSteps: number;
  status: 'idle' | 'running' | 'found' | 'not_found';
  foundIndex?: number;
  accentColor?: 'violet' | 'sky';
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  title,
  complexity,
  bestComplexity = 'O(1)',
  worstComplexity,
  comparisons,
  currentStep,
  totalSteps,
  status,
  foundIndex,
  accentColor = 'violet',
}) => {
  const isViolet = accentColor === 'violet';

  return (
    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-4 shadow-sm">
      {/* Header & Big-O Badge */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white flex items-center space-x-2">
          <Activity className={`w-4 h-4 ${isViolet ? 'text-violet-400' : 'text-sky-400'}`} />
          <span>{title} Metrics</span>
        </span>
        <span
          className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
            isViolet
              ? 'bg-violet-950/80 text-violet-300 border-violet-800/60'
              : 'bg-sky-950/80 text-sky-300 border-sky-800/60'
          }`}
          title="Theoretical Algorithmic Complexity (Not runtime benchmark)"
        >
          {complexity}
        </span>
      </div>

      {/* Primary Counters Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Comparisons */}
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
            Comparisons
          </span>
          <span className="text-xl font-mono font-extrabold text-white">{comparisons}</span>
        </div>

        {/* Step Progress */}
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
            Trace Step
          </span>
          <span className="text-xl font-mono font-extrabold text-slate-200">
            {totalSteps > 0 ? `${currentStep + 1} / ${totalSteps}` : '0 / 0'}
          </span>
        </div>
      </div>

      {/* Complexity Metadata Breakdown */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Best: <span className="font-mono text-emerald-400">{bestComplexity}</span>
        </span>
        {worstComplexity && (
          <span>
            Worst: <span className="font-mono text-amber-400">{worstComplexity}</span>
          </span>
        )}
      </div>

      {/* Search Status Pill */}
      <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-500">Status:</span>
        {status === 'running' && (
          <span className="inline-flex items-center space-x-1 text-amber-400 font-medium">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Scanning...</span>
          </span>
        )}
        {status === 'found' && (
          <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Found at index {foundIndex}</span>
          </span>
        )}
        {status === 'not_found' && (
          <span className="inline-flex items-center space-x-1 text-rose-400 font-semibold">
            <XCircle className="w-3.5 h-3.5" />
            <span>Target Not Found</span>
          </span>
        )}
        {status === 'idle' && <span className="text-slate-400 font-medium">Awaiting Execution</span>}
      </div>
    </div>
  );
};

export default MetricsPanel;

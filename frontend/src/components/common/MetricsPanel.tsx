import React from 'react';
import { Activity, CheckCircle2, XCircle, Clock } from 'lucide-react';

export interface MetricsPanelProps {
  title: string;
  metrics: Record<string, number | string | boolean>;
  complexity?: string;
  status?: 'idle' | 'running' | 'found' | 'not_found' | 'completed' | string;
  statusMessage?: string;
  accentColor?: 'violet' | 'sky' | 'emerald' | 'amber';
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  title,
  metrics,
  complexity,
  status,
  statusMessage,
  accentColor = 'violet',
}) => {
  const isViolet = accentColor === 'violet';
  const isSky = accentColor === 'sky';

  const accentBorder = isViolet
    ? 'border-violet-800/60 bg-violet-950/80 text-violet-300'
    : isSky
      ? 'border-sky-800/60 bg-sky-950/80 text-sky-300'
      : 'border-emerald-800/60 bg-emerald-950/80 text-emerald-300';

  const iconColor = isViolet ? 'text-violet-400' : isSky ? 'text-sky-400' : 'text-emerald-400';

  // Format label from camelCase or snake_case to Title Case
  const formatLabel = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-4 shadow-sm">
      {/* Header & Big-O Complexity Badge */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white flex items-center space-x-2">
          <Activity className={`w-4 h-4 ${iconColor}`} />
          <span>{title} Metrics</span>
        </span>
        {complexity && (
          <span
            className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${accentBorder}`}
            title="Theoretical Algorithmic Complexity (Not runtime benchmark)"
          >
            {complexity}
          </span>
        )}
      </div>

      {/* Dynamic Labeled Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
        {Object.entries(metrics).map(([key, value]) => {
          // If the key is complexity and already shown in badge, we can still show or display
          if (key === 'complexity') return null;

          return (
            <div key={key} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1 truncate">
                {formatLabel(key)}
              </span>
              <span className="text-xl font-mono font-extrabold text-white truncate block">
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Execution Status Pill */}
      {status && (
        <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-500">Status:</span>
          {status === 'running' && (
            <span className="inline-flex items-center space-x-1 text-amber-400 font-medium">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>{statusMessage || 'Running...'}</span>
            </span>
          )}
          {(status === 'found' || status === 'completed') && (
            <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{statusMessage || 'Completed'}</span>
            </span>
          )}
          {status === 'not_found' && (
            <span className="inline-flex items-center space-x-1 text-rose-400 font-semibold">
              <XCircle className="w-3.5 h-3.5" />
              <span>{statusMessage || 'Target Not Found'}</span>
            </span>
          )}
          {status === 'idle' && (
            <span className="text-slate-400 font-medium">
              {statusMessage || 'Awaiting Execution'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricsPanel;

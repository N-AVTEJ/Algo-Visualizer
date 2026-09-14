import React from 'react';
import { GitCompare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ComparePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 text-center space-y-8">
      <div className="w-16 h-16 rounded-2xl bg-violet-950/60 border border-violet-800/60 text-violet-400 flex items-center justify-center mx-auto shadow-xl shadow-violet-900/20">
        <GitCompare className="w-8 h-8" />
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Feature Placeholder &bull; Comparative Analysis</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Algorithm Comparison Stage</h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Side-by-side multi-algorithm execution and telemetry comparison will be unlocked in later phases.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900/50 border-2 border-dashed border-slate-800 max-w-2xl mx-auto text-slate-400 text-sm">
        <p className="mb-4">
          Compare different approaches (e.g., Merge Sort vs. Quick Sort, Dijkstra vs. Bellman-Ford)
          under identical inputs and stress tests.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          Return to Modules
        </Link>
      </div>
    </div>
  );
};

export default ComparePage;

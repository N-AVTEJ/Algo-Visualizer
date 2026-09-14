import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Terminal, ArrowLeft, Sparkles } from 'lucide-react';

export const PracticePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto py-12 text-center space-y-8">
      <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-900/20">
        <Terminal className="w-8 h-8" />
      </div>

      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Interactive Practice Challenge &bull; #{id || 'Generic'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Algorithm Practice Arena</h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Interactive trace problems, quizzes, and code challenges will be integrated in subsequent
          phases.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900/50 border-2 border-dashed border-slate-800 max-w-2xl mx-auto text-slate-400 text-sm">
        <p className="mb-4">
          Test your mastery of algorithmic state transitions, recursion invariants, and loop
          boundaries.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Modules</span>
        </Link>
      </div>
    </div>
  );
};

export default PracticePage;

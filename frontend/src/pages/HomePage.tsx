import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Activity,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  GitCompare,
  RefreshCw,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { modulesApi, algorithmsApi } from '../api/client';
import { useModuleStore } from '../store/moduleStore';
import { useProgressStore } from '../store/progressStore';
import type { Module, Algorithm } from '../types';

export const HomePage: React.FC = () => {
  const { modules, setModules } = useModuleStore();
  const { progressMap, fetchProgress, getCompletedCount } = useProgressStore();

  const [loading, setLoading] = useState(modules.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [moduleAlgoMap, setModuleAlgoMap] = useState<Record<number, Algorithm[]>>({});

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    let isMounted = true;
    modulesApi
      .list()
      .then(async (data) => {
        if (!isMounted) return;
        setModules(data);
        setLoading(false);

        // Fetch algorithms per module to compute per-module completion
        const algoMap: Record<number, Algorithm[]> = {};
        for (const m of data) {
          try {
            const algos = await algorithmsApi.list(m.id);
            algoMap[m.id] = algos;
          } catch {
            algoMap[m.id] = [];
          }
        }
        if (isMounted) {
          setModuleAlgoMap(algoMap);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message || 'Failed to connect to backend service');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [setModules]);

  const totalAlgorithms = Object.values(moduleAlgoMap).reduce((sum, algos) => sum + algos.length, 0) || 15;
  const completedCount = getCompletedCount();
  const progressPercent = Math.min(100, Math.round((completedCount / totalAlgorithms) * 100));

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-violet-950/80 border border-violet-800/60 text-violet-300 text-xs font-medium mb-6">
          <ShieldCheck className="w-4 h-4 text-violet-400" />
          <span>DAA Curriculum Visualizer • Vite + React 18 + FastAPI</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
          High-Performance{' '}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
            Algorithm Visualizer
          </span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-8">
          AlgoLens delivers deep algorithmic insight through frame-by-frame visual execution,
          real-time telemetry, and complete 10-module DAA curriculum coverage.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#curriculum-modules"
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-600/30 transition-all inline-flex items-center space-x-2 focus:ring-2 focus:ring-violet-400"
          >
            <span>Explore Modules</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <Link
            to="/compare"
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold transition-all inline-flex items-center space-x-2"
          >
            <GitCompare className="w-4 h-4" />
            <span>Algorithm Compare</span>
          </Link>

          <Link
            to="/practice"
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold transition-all inline-flex items-center space-x-2"
          >
            <Award className="w-4 h-4 text-violet-400" />
            <span>Practice Arena</span>
          </Link>
        </div>
      </section>

      {/* Learning Progress Overview Card */}
      <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-violet-950/30 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-violet-400 uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Curriculum Mastery Progress</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {completedCount === 0
                ? 'Begin Your Algorithm Journey'
                : `${completedCount} of ${totalAlgorithms} Algorithms Mastered`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Execute visualizations through to the final step or complete quizzes in the Practice Arena to track your mastery.
            </p>
          </div>

          <div className="w-full md:w-72 space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Overall Progress</span>
              <span className="font-mono font-bold text-violet-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 block text-right font-mono">
              {completedCount}/{totalAlgorithms} Completed
            </span>
          </div>
        </div>
      </section>

      {/* Curriculum Modules Grid */}
      <section id="curriculum-modules" className="pt-4">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-violet-400" />
              <span>DAA Curriculum Modules</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select a foundational algorithm domain to view its algorithms, step-trace execution, and telemetry.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            {modules.length} Modules
          </span>
        </div>

        {loading ? (
          <div className="p-12 rounded-2xl bg-slate-900/50 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-violet-400 animate-spin" />
            <p className="text-sm text-slate-400">Loading curriculum modules from backend API...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-center flex flex-col items-center justify-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <div className="text-amber-200 font-medium">Backend Connection Notice</div>
            <p className="text-xs text-amber-300/80 max-w-md">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod: Module) => {
              const algos = moduleAlgoMap[mod.id] || [];
              const completedInMod = algos.filter((a) => progressMap[a.id]?.completed).length;
              const isModCompleted = algos.length > 0 && completedInMod === algos.length;
              const isInProgress = completedInMod > 0 && !isModCompleted;

              return (
                <Link
                  key={mod.id}
                  to={`/module/${mod.id}`}
                  className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900/80 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-violet-950/80 text-violet-300 border border-violet-800/50">
                        Module {mod.order_index}
                      </span>
                      {isModCompleted ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Completed</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          <span>{completedInMod}/{algos.length} Done</span>
                        </span>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors mb-2">
                      {mod.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {mod.description || 'Comprehensive algorithm study and telemetry.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 group-hover:text-slate-400">
                    <span>{algos.length > 0 ? `${algos.length} Algorithms` : 'Enter Stage'}</span>
                    <Play className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Feature Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
            <Play className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">Step Timeline Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deterministic step controls allowing forward and backward scrubbing with speed
            adjustment.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">Real-Time Telemetry</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dynamic operation counts, comparisons, and canonical time/space complexities.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white mb-2">DAA Alignment</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Full alignment with standard academic Design & Analysis of Algorithms syllabi.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

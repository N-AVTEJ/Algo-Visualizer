import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, RotateCcw, ArrowRight, Gauge, CheckCircle2 } from 'lucide-react';

export const InteractiveRaceTeaser: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progressA, setProgressA] = useState(0); // Merge Sort O(n log n)
  const [progressB, setProgressB] = useState(0); // Bubble Sort O(n^2)
  const [opsA, setOpsA] = useState(0);
  const [opsB, setOpsB] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);

  const startRace = () => {
    setProgressA(0);
    setProgressB(0);
    setOpsA(0);
    setOpsB(0);
    setWinner(null);
    setIsRunning(true);
  };

  const resetRace = () => {
    setIsRunning(false);
    setProgressA(0);
    setProgressB(0);
    setOpsA(0);
    setOpsB(0);
    setWinner(null);
  };

  useEffect(() => {
    if (!isRunning) return;

    let pA = 0;
    let pB = 0;
    let oA = 0;
    let oB = 0;

    const interval = setInterval(() => {
      // Merge Sort progresses much faster due to O(n log n)
      pA = Math.min(100, pA + 4.8);
      oA = Math.floor(pA * 8.5);

      // Bubble sort progresses slower due to quadratic comparisons
      pB = Math.min(100, pB + 1.3);
      oB = Math.floor(pB * 48.2);

      setProgressA(pA);
      setProgressB(pB);
      setOpsA(oA);
      setOpsB(oB);

      if (pA >= 100 && !winner) {
        setWinner('Merge Sort');
      }

      if (pA >= 100 && pB >= 100) {
        setIsRunning(false);
        clearInterval(interval);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [isRunning, winner]);

  return (
    <div className="rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-indigo-950/40 border border-slate-800 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dual-Engine Asymptotic Arena</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            See Asymptotic Complexity in Real-Time
          </h3>
          <p className="text-sm text-slate-400 max-w-xl mt-1">
            Observe the dramatic physical difference between logarithmic divide & conquer and quadratic
            brute-force on identical randomized inputs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={startRace}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs inline-flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? 'Racing...' : 'Simulate Race'}</span>
          </button>
          <button
            onClick={resetRace}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 text-xs font-medium"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <Link
            to="/compare"
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors"
          >
            <span>Full Arena</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Race Bars */}
      <div className="space-y-5">
        {/* Competitor 1: Merge Sort */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="font-semibold text-white text-sm">Merge Sort</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-medium">
                O(n log n)
              </span>
              {progressA >= 100 && (
                <span className="inline-flex items-center space-x-1 text-xs text-emerald-400 font-bold ml-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Finished First!</span>
                </span>
              )}
            </div>
            <div className="text-xs font-mono text-slate-400">
              Operations: <span className="text-emerald-400 font-bold">{opsA.toLocaleString()}</span>
            </div>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800/80 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              style={{ width: `${progressA}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        </div>

        {/* Competitor 2: Bubble Sort */}
        <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="font-semibold text-white text-sm">Bubble Sort</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-medium">
                O(n²)
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Operations: <span className="text-rose-400 font-bold">{opsB.toLocaleString()}</span>
            </div>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800/80 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
              style={{ width: `${progressB}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <span className="font-mono">
          N = 500 Elements • Merge Sort completes in ~4,500 operations vs ~125,000 operations for Bubble Sort
        </span>
        <span className="text-indigo-400 font-medium">
          ~28x Fewer Operations with Optimal Paradigm
        </span>
      </div>
    </div>
  );
};

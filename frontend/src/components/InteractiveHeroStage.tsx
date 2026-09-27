import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Shuffle, ChevronRight, Activity, Terminal } from 'lucide-react';

interface SimulationStep {
  array: number[];
  comparing: number[]; // indices being compared
  pivotIndex?: number;
  sortedIndices: number[];
  description: string;
  comparisons: number;
  swaps: number;
}

const INITIAL_ARRAY = [44, 18, 72, 31, 88, 55, 23, 67];

function generateQuickSortSteps(input: number[]): SimulationStep[] {
  const steps: SimulationStep[] = [];
  const arr = [...input];
  let comparisons = 0;
  let swaps = 0;
  const sorted: number[] = [];

  steps.push({
    array: [...arr],
    comparing: [],
    sortedIndices: [],
    description: 'Initial randomized array loaded. Ready to run Lomuto Partitioning.',
    comparisons: 0,
    swaps: 0,
  });

  function partition(low: number, high: number) {
    const pivot = arr[high];
    let i = low - 1;

    steps.push({
      array: [...arr],
      comparing: [],
      pivotIndex: high,
      sortedIndices: [...sorted],
      description: `Select pivot element = ${pivot} at index ${high}.`,
      comparisons,
      swaps,
    });

    for (let j = low; j < high; j++) {
      comparisons++;
      steps.push({
        array: [...arr],
        comparing: [j, high],
        pivotIndex: high,
        sortedIndices: [...sorted],
        description: `Compare arr[${j}] (${arr[j]}) with pivot (${pivot}).`,
        comparisons,
        swaps,
      });

      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          swaps++;
          const tmp = arr[i];
          arr[i] = arr[j];
          arr[j] = tmp;

          steps.push({
            array: [...arr],
            comparing: [i, j],
            pivotIndex: high,
            sortedIndices: [...sorted],
            description: `${arr[i]} < ${pivot}. Swap arr[${i}] and arr[${j}].`,
            comparisons,
            swaps,
          });
        }
      }
    }

    swaps++;
    const tmp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = tmp;

    const pivotPlacement = i + 1;
    sorted.push(pivotPlacement);

    steps.push({
      array: [...arr],
      comparing: [pivotPlacement],
      pivotIndex: pivotPlacement,
      sortedIndices: [...sorted],
      description: `Place pivot ${arr[pivotPlacement]} into its final sorted position at index ${pivotPlacement}.`,
      comparisons,
      swaps,
    });

    return pivotPlacement;
  }

  function quickSort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      sorted.push(low);
    }
  }

  quickSort(0, arr.length - 1);

  steps.push({
    array: [...arr],
    comparing: [],
    sortedIndices: arr.map((_, idx) => idx),
    description: 'Execution complete! Array is sorted in O(n log n) expected time.',
    comparisons,
    swaps,
  });

  return steps;
}

export const InteractiveHeroStage: React.FC = () => {
  const [arrayData, setArrayData] = useState<number[]>(INITIAL_ARRAY);
  const [steps, setSteps] = useState<SimulationStep[]>(() => generateQuickSortSteps(INITIAL_ARRAY));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  const initSimulation = (arr: number[]) => {
    const generated = generateQuickSortSteps(arr);
    setSteps(generated);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleShuffle = () => {
    const shuffled = [...arrayData].sort(() => Math.random() - 0.5);
    setArrayData(shuffled);
    initSimulation(shuffled);
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length]);

  const currentStep = steps[currentStepIndex] || steps[0];
  const maxVal = Math.max(...currentStep.array, 90);

  return (
    <div className="w-full rounded-3xl bg-gradient-to-b from-[#0F1423]/90 via-[#0B0F19]/80 to-[#07090F]/90 border border-slate-800/80 p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
      {/* Decorative top ambient soft glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-28 bg-indigo-500/15 blur-3xl pointer-events-none" />

      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white tracking-wide">Live Execution Engine</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/70 border border-emerald-800/60 text-emerald-300">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Algorithm: Lomuto Quick Sort Partitioning</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/25'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleNextStep}
            disabled={currentStepIndex >= steps.length - 1}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold flex items-center space-x-1 transition-colors border border-slate-700"
          >
            <span>Step</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            title="Reset"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleShuffle}
            title="Shuffle Values"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Array Bars Visualization Canvas */}
      <div className="bg-[#07090F]/90 rounded-2xl p-4 sm:p-6 border border-slate-800/80 mb-5 min-h-[190px] flex flex-col justify-end">
        <div className="flex items-end justify-between gap-2 sm:gap-4 h-36 px-2">
          {currentStep.array.map((value, idx) => {
            const isComparing = currentStep.comparing.includes(idx);
            const isPivot = currentStep.pivotIndex === idx;
            const isSorted = currentStep.sortedIndices.includes(idx);

            let barBg = 'bg-slate-800 border-slate-700 text-slate-400';
            if (isPivot) {
              barBg = 'bg-gradient-to-t from-indigo-700 to-indigo-500 border-indigo-300 shadow-lg shadow-indigo-500/25 text-white font-bold';
            } else if (isComparing) {
              barBg = 'bg-gradient-to-t from-amber-600 to-amber-400 border-amber-300 shadow-lg shadow-amber-500/25 text-amber-950 font-bold';
            } else if (isSorted) {
              barBg = 'bg-gradient-to-t from-emerald-600 to-teal-500 border-emerald-300 text-emerald-950 font-bold shadow-md shadow-emerald-500/20';
            } else {
              barBg = 'bg-gradient-to-t from-slate-800 to-slate-700 border-slate-600 text-slate-200';
            }

            const heightPct = Math.max(18, (value / maxVal) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-[10px] font-mono text-slate-400 mb-1">{value}</span>
                <motion.div
                  layout
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className={`w-full rounded-t-xl border flex items-center justify-center transition-colors duration-300 ${barBg}`}
                  style={{ height: `${heightPct}%` }}
                >
                  {isPivot && <span className="text-[9px] uppercase tracking-tighter">P</span>}
                </motion.div>
                <span className="text-[9px] font-mono text-slate-500 mt-1">[{idx}]</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-700 border border-slate-600" />
            <span>Unsorted</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 border border-indigo-400" />
            <span>Pivot</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 border border-amber-300" />
            <span>Active Comparison</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-emerald-400" />
            <span>Sorted Position</span>
          </div>
        </div>
      </div>

      {/* Execution Telemetry Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step description */}
        <div className="md:col-span-2 bg-[#07090F]/90 rounded-xl p-3 border border-slate-800 flex items-start space-x-2">
          <Terminal className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <div className="text-xs">
            <div className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
              Step {currentStepIndex + 1} / {steps.length}
            </div>
            <p className="text-slate-300 font-mono mt-0.5 leading-snug">{currentStep.description}</p>
          </div>
        </div>

        {/* Live Counters */}
        <div className="bg-[#07090F]/90 rounded-xl p-3 border border-slate-800 flex items-center justify-around text-center">
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-500">Comparisons</div>
            <div className="text-base font-bold font-mono text-amber-300">{currentStep.comparisons}</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-500">Swaps</div>
            <div className="text-base font-bold font-mono text-indigo-300">{currentStep.swaps}</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-500">Complexity</div>
            <div className="text-xs font-bold font-mono text-slate-300">O(n log n)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

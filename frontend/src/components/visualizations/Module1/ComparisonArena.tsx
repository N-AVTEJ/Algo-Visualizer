import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, Target, Play, FileCode } from 'lucide-react';
import { algorithmsApi, ApiError } from '../../../api/client';
import type { Module1Step, Module1Trace } from '../../../types';
import { AnimationPlayer, MetricsPanel, CodeDisplay } from '../../common';
import { ComplexityGraph } from './ComplexityGraph';

const LINEAR_SEARCH_CODE = `def linear_search(arr, target):
    for i in range(len(arr)):
        # Compare current element with target
        if arr[i] == target:
            return i  # Target found
    return -1  # Target absent`;

const BINARY_SEARCH_CODE = `def binary_search(arr, target):
    # Requires sorted input array
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid  # Target matched at midpoint
        elif arr[mid] < target:
            left = mid + 1  # Discard left half
        else:
            right = mid - 1  # Discard right half

    return -1  # Target absent`;

const PRESETS = [
  {
    name: 'Sorted (Standard)',
    array: [10, 23, 35, 42, 58, 67, 74, 89, 95],
    target: 58,
  },
  {
    name: 'Target at Start',
    array: [5, 12, 19, 27, 34, 48, 56, 63, 71],
    target: 5,
  },
  {
    name: 'Target at End',
    array: [4, 15, 22, 38, 45, 59, 68, 77, 86, 99],
    target: 99,
  },
  {
    name: 'Target Absent',
    array: [10, 20, 30, 40, 50, 60, 70, 80],
    target: 45,
  },
  {
    name: 'Unsorted (Binary Error Demo)',
    array: [45, 12, 89, 23, 67, 34],
    target: 23,
  },
];

export const ComparisonArena: React.FC = () => {
  // Input state
  const [arrayInput, setArrayInput] = useState<string>('10, 23, 35, 42, 58, 67, 74, 89, 95');
  const [targetInput, setTargetInput] = useState<string>('58');
  const [parsedArray, setParsedArray] = useState<number[]>([10, 23, 35, 42, 58, 67, 74, 89, 95]);
  const [target, setTarget] = useState<number>(58);

  // Execution traces
  const [linearTrace, setLinearTrace] = useState<Module1Trace | null>(null);
  const [binaryTrace, setBinaryTrace] = useState<Module1Trace | null>(null);

  // Playback state
  const [linearStepIndex, setLinearStepIndex] = useState<number>(0);
  const [binaryStepIndex, setBinaryStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(600);

  // UI / Error state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'both' | 'linear' | 'binary'>('both');

  // Parse input string
  const handleApplyInputs = (newArrayStr: string, newTargetStr: string) => {
    setError(null);
    const parsed = newArrayStr
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .map((item) => Number(item));

    if (parsed.some((n) => isNaN(n))) {
      setError('Please enter valid numbers separated by commas.');
      return;
    }

    const parsedTargetNum = Number(newTargetStr);
    if (isNaN(parsedTargetNum)) {
      setError('Please enter a valid target number.');
      return;
    }

    setParsedArray(parsed);
    setTarget(parsedTargetNum);
    setLinearTrace(null);
    setBinaryTrace(null);
    setLinearStepIndex(0);
    setBinaryStepIndex(0);
    setIsPlaying(false);
  };

  // Run comparison
  const handleRun = async () => {
    setError(null);
    setLoading(true);
    setIsPlaying(false);
    setLinearStepIndex(0);
    setBinaryStepIndex(0);

    try {
      const [lTrace, bTrace] = await Promise.all([
        algorithmsApi.runModule1({
          array: parsedArray,
          target,
          algorithm: 'linear',
        }),
        algorithmsApi.runModule1({
          array: parsedArray,
          target,
          algorithm: 'binary',
        }),
      ]);

      setLinearTrace(lTrace);
      setBinaryTrace(bTrace);
      setLinearStepIndex(0);
      setBinaryStepIndex(0);
      setIsPlaying(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to execute search comparison.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Synthetic coordinated step array for the generic AnimationPlayer
  const maxStepsCount = Math.max(
    linearTrace ? linearTrace.steps.length : 0,
    binaryTrace ? binaryTrace.steps.length : 0
  );

  const coordinatedSteps = useMemo(() => {
    return Array.from({ length: maxStepsCount }, (_, i) => i);
  }, [maxStepsCount]);

  const coordinatedActiveIndex = Math.max(linearStepIndex, binaryStepIndex);

  const handleCoordinatedStepChange = (index: number) => {
    if (linearTrace) {
      setLinearStepIndex(Math.min(index, linearTrace.steps.length - 1));
    }
    if (binaryTrace) {
      setBinaryStepIndex(Math.min(index, binaryTrace.steps.length - 1));
    }
  };

  const handleCoordinatedReset = () => {
    setLinearStepIndex(0);
    setBinaryStepIndex(0);
  };

  // Current active step data
  const currentLinearStep: Module1Step | undefined =
    linearTrace && linearStepIndex >= 0 ? linearTrace.steps[linearStepIndex] : undefined;

  const currentBinaryStep: Module1Step | undefined =
    binaryTrace && binaryStepIndex >= 0 ? binaryTrace.steps[binaryStepIndex] : undefined;

  // Status determinations
  const linearStatus = useMemo(() => {
    if (!linearTrace) return 'idle';
    if (linearStepIndex < linearTrace.steps.length - 1) return 'running';
    return linearTrace.result_index !== -1 ? 'found' : 'not_found';
  }, [linearTrace, linearStepIndex]);

  const binaryStatus = useMemo(() => {
    if (!binaryTrace) return 'idle';
    if (binaryStepIndex < binaryTrace.steps.length - 1) return 'running';
    return binaryTrace.result_index !== -1 ? 'found' : 'not_found';
  }, [binaryTrace, binaryStepIndex]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-800/60 text-xs font-semibold text-violet-300 mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Comparison Arena &bull; Module 1 Reference Implementation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Linear Search vs. Binary Search
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Compare asymptotic behavior side-by-side using deterministic backend execution traces.
          </p>
        </div>

        {/* Target Badge */}
        <div className="flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <Target className="w-5 h-5 text-violet-400" />
          <div>
            <span className="text-[11px] text-slate-400 block uppercase tracking-wider">
              Search Target
            </span>
            <span className="text-lg font-mono font-bold text-white">{target}</span>
          </div>
        </div>
      </div>

      {/* Input Configuration & Presets */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Configuration & Test Inputs
        </h3>

        {/* Presets Pills & Autofill */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 self-center mr-1">Presets:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                const strArr = preset.array.join(', ');
                const strTarget = String(preset.target);
                setArrayInput(strArr);
                setTargetInput(strTarget);
                handleApplyInputs(strArr, strTarget);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              {preset.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              const sampleArrays = [
                { arr: [12, 24, 35, 48, 56, 67, 78, 89, 95], target: 56 },
                { arr: [5, 15, 23, 38, 42, 59, 71, 84, 99], target: 42 },
                { arr: [10, 20, 30, 40, 50, 60, 70, 80], target: 20 },
                { arr: [3, 9, 17, 25, 33, 49, 62, 77, 88, 94], target: 77 },
                { arr: [8, 14, 29, 36, 45, 58, 63, 81], target: 100 },
              ];
              const picked = sampleArrays[Math.floor(Math.random() * sampleArrays.length)];
              const strArr = picked.arr.join(', ');
              const strTarget = String(picked.target);
              setArrayInput(strArr);
              setTargetInput(strTarget);
              handleApplyInputs(strArr, strTarget);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all ml-auto flex items-center space-x-1"
          >
            <span>🎲 Autofill</span>
          </button>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="md:col-span-3">
            <label
              htmlFor="array-input"
              className="block text-xs font-semibold text-slate-300 mb-1"
            >
              Array Elements (comma-separated):
            </label>
            <input
              id="array-input"
              type="text"
              value={arrayInput}
              onChange={(e) => setArrayInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="10, 20, 30, 40, 50"
            />
          </div>

          <div>
            <label
              htmlFor="target-input"
              className="block text-xs font-semibold text-slate-300 mb-1"
            >
              Target Value:
            </label>
            <input
              id="target-input"
              type="number"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="30"
            />
          </div>
        </div>

        {/* Apply & Run Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleApplyInputs(arrayInput, targetInput)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Apply Inputs
          </button>

          <button
            type="button"
            onClick={() => {
              const sampleArrays = [
                { arr: [12, 24, 35, 48, 56, 67, 78, 89, 95], target: 56 },
                { arr: [5, 15, 23, 38, 42, 59, 71, 84, 99], target: 42 },
                { arr: [10, 20, 30, 40, 50, 60, 70, 80], target: 20 },
                { arr: [3, 9, 17, 25, 33, 49, 62, 77, 88, 94], target: 77 },
                { arr: [8, 14, 29, 36, 45, 58, 63, 81], target: 100 },
              ];
              const picked = sampleArrays[Math.floor(Math.random() * sampleArrays.length)];
              const strArr = picked.arr.join(', ');
              const strTarget = String(picked.target);
              setArrayInput(strArr);
              setTargetInput(strTarget);
              handleApplyInputs(strArr, strTarget);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <span>🎲 Autofill</span>
          </button>

          <button
            type="button"
            onClick={handleRun}
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all inline-flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{loading ? 'Fetching Traces...' : 'Run Comparison'}</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/80 flex items-start space-x-3 text-red-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Extracted Reusable AnimationPlayer Controls */}
      {(linearTrace || binaryTrace) && (
        <AnimationPlayer
          steps={coordinatedSteps}
          currentStepIndex={coordinatedActiveIndex}
          isPlaying={isPlaying}
          onPlayToggle={(playing) => setIsPlaying(playing)}
          onStepChange={handleCoordinatedStepChange}
          onReset={handleCoordinatedReset}
          initialSpeedMs={speedMs}
          onSpeedChange={(newSpeed) => setSpeedMs(newSpeed)}
        />
      )}

      {/* Side-by-Side Arena Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stage 1: Linear Search */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                  <span>Linear Search</span>
                </h3>
                <span className="text-xs text-slate-400">Sequential element-by-element scan</span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-violet-950/80 text-violet-300 border border-violet-800/60">
                O(n)
              </span>
            </div>

            {/* Array Canvas */}
            <div className="py-4">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-2 font-semibold">
                Array Stage:
              </span>
              <div className="flex flex-wrap gap-2.5 p-4 rounded-xl bg-slate-950 border border-slate-800/80 min-h-[90px] items-center">
                {parsedArray.map((val, idx) => {
                  const isCurrent = currentLinearStep?.index === idx;
                  const isChecked = currentLinearStep && currentLinearStep.index > idx;
                  const isFound = isCurrent && currentLinearStep?.found;

                  let cellStyle = 'border-slate-800 bg-slate-900/90 text-slate-300';
                  if (isFound) {
                    cellStyle =
                      'border-emerald-500 bg-emerald-950 text-emerald-200 shadow-lg shadow-emerald-500/20';
                  } else if (isCurrent) {
                    cellStyle =
                      'border-violet-500 bg-violet-950 text-violet-100 shadow-lg shadow-violet-500/30';
                  } else if (isChecked) {
                    cellStyle = 'border-slate-800/60 bg-slate-900/30 text-slate-600';
                  }

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <motion.div
                        animate={{
                          scale: isCurrent ? 1.15 : 1,
                          y: isCurrent ? -4 : 0,
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center font-mono font-bold text-sm transition-colors ${cellStyle}`}
                      >
                        {val}
                      </motion.div>
                      <span className="text-[10px] font-mono text-slate-500 mt-1">[{idx}]</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Explanation Banner */}
            <AnimatePresence mode="wait">
              {currentLinearStep ? (
                <motion.div
                  key={linearStepIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300"
                >
                  <span className="font-semibold text-violet-400">
                    Step {linearStepIndex + 1}:{' '}
                  </span>
                  Comparing element at index{' '}
                  <code className="text-white font-mono font-bold">
                    [{currentLinearStep.index}]
                  </code>{' '}
                  (value:{' '}
                  <span className="text-white font-mono font-bold">{currentLinearStep.value}</span>)
                  with target <span className="text-white font-mono font-bold">{target}</span>.
                  {currentLinearStep.found ? (
                    <span className="text-emerald-400 font-bold ml-1">Match found!</span>
                  ) : (
                    <span className="text-slate-400 ml-1">
                      Not a match, continuing sequential scan.
                    </span>
                  )}
                </motion.div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/40 text-xs text-slate-500">
                  Click &apos;Run Comparison&apos; to view execution trace.
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Generic Common MetricsPanel */}
          <MetricsPanel
            title="Linear Search"
            complexity="O(n)"
            status={linearStatus}
            statusMessage={
              linearStatus === 'found'
                ? `Found at index ${linearTrace?.result_index}`
                : linearStatus === 'not_found'
                  ? 'Target Not Found'
                  : linearStatus === 'running'
                    ? 'Scanning...'
                    : 'Awaiting Execution'
            }
            metrics={{
              comparisons: currentLinearStep ? currentLinearStep.comparisons : 0,
              traceStep: linearTrace
                ? `${linearStepIndex + 1} / ${linearTrace.steps.length}`
                : '0 / 0',
              bestCase: 'O(1)',
              worstCase: 'O(n)',
            }}
            accentColor="violet"
          />
        </div>

        {/* Stage 2: Binary Search */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span>Binary Search</span>
                </h3>
                <span className="text-xs text-slate-400">Divide & conquer logarithmic halving</span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-sky-950/80 text-sky-300 border border-sky-800/60">
                O(log n)
              </span>
            </div>

            {/* Array Canvas */}
            <div className="py-4">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-2 font-semibold">
                Array Stage:
              </span>
              <div className="flex flex-wrap gap-2.5 p-4 rounded-xl bg-slate-950 border border-slate-800/80 min-h-[90px] items-center">
                {parsedArray.map((val, idx) => {
                  const isMid = currentBinaryStep?.mid === idx;
                  const isFound = isMid && currentBinaryStep?.found;
                  const isWithinRange =
                    currentBinaryStep &&
                    currentBinaryStep.left !== undefined &&
                    currentBinaryStep.right !== undefined
                      ? idx >= currentBinaryStep.left && idx <= currentBinaryStep.right
                      : true;

                  let cellStyle = 'border-slate-800 bg-slate-900/90 text-slate-300';
                  if (isFound) {
                    cellStyle =
                      'border-emerald-500 bg-emerald-950 text-emerald-200 shadow-lg shadow-emerald-500/20';
                  } else if (isMid) {
                    cellStyle =
                      'border-sky-400 bg-sky-950 text-sky-100 shadow-lg shadow-sky-400/30';
                  } else if (!isWithinRange && currentBinaryStep) {
                    cellStyle = 'border-slate-900 bg-slate-950 text-slate-700 opacity-40';
                  } else if (isWithinRange && currentBinaryStep) {
                    cellStyle = 'border-slate-700 bg-slate-900 text-slate-200';
                  }

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <motion.div
                        animate={{
                          scale: isMid ? 1.15 : 1,
                          y: isMid ? -4 : 0,
                        }}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center font-mono font-bold text-sm transition-colors ${cellStyle}`}
                      >
                        {val}
                      </motion.div>
                      <span className="text-[10px] font-mono text-slate-500 mt-1">[{idx}]</span>
                    </div>
                  );
                })}
              </div>

              {/* Boundary Indicators */}
              {currentBinaryStep && (
                <div className="flex items-center space-x-3 mt-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Left: {currentBinaryStep.left}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                    Mid: {currentBinaryStep.mid}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Right: {currentBinaryStep.right}
                  </span>
                </div>
              )}
            </div>

            {/* Step Explanation Banner */}
            <AnimatePresence mode="wait">
              {currentBinaryStep ? (
                <motion.div
                  key={binaryStepIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300"
                >
                  <span className="font-semibold text-sky-400">Step {binaryStepIndex + 1}: </span>
                  Evaluating midpoint index{' '}
                  <code className="text-white font-mono font-bold">
                    [{currentBinaryStep.mid}]
                  </code>{' '}
                  (value:{' '}
                  <span className="text-white font-mono font-bold">{currentBinaryStep.value}</span>
                  ).
                  {currentBinaryStep.found ? (
                    <span className="text-emerald-400 font-bold ml-1">
                      Target matched at midpoint!
                    </span>
                  ) : currentBinaryStep.value < target ? (
                    <span className="text-sky-300 ml-1">
                      {currentBinaryStep.value} &lt; {target} &rarr; Target is in right half;
                      adjusting Left to {currentBinaryStep.mid! + 1}.
                    </span>
                  ) : (
                    <span className="text-sky-300 ml-1">
                      {currentBinaryStep.value} &gt; {target} &rarr; Target is in left half;
                      adjusting Right to {currentBinaryStep.mid! - 1}.
                    </span>
                  )}
                </motion.div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/40 text-xs text-slate-500">
                  Click &apos;Run Comparison&apos; to view execution trace.
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Generic Common MetricsPanel */}
          <MetricsPanel
            title="Binary Search"
            complexity="O(log n)"
            status={binaryStatus}
            statusMessage={
              binaryStatus === 'found'
                ? `Found at index ${binaryTrace?.result_index}`
                : binaryStatus === 'not_found'
                  ? 'Target Not Found'
                  : binaryStatus === 'running'
                    ? 'Scanning...'
                    : 'Awaiting Execution'
            }
            metrics={{
              comparisons: currentBinaryStep ? currentBinaryStep.comparisons : 0,
              traceStep: binaryTrace
                ? `${binaryStepIndex + 1} / ${binaryTrace.steps.length}`
                : '0 / 0',
              bestCase: 'O(1)',
              worstCase: 'O(log n)',
            }}
            accentColor="sky"
          />
        </div>
      </div>

      {/* Algorithm Source Code Display */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-violet-400" />
            <h3 className="text-base font-bold text-white">Algorithm Implementation Reference</h3>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveCodeTab('both')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                activeCodeTab === 'both'
                  ? 'bg-violet-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Both
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('linear')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                activeCodeTab === 'linear'
                  ? 'bg-violet-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Linear Search
            </button>
            <button
              type="button"
              onClick={() => setActiveCodeTab('binary')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                activeCodeTab === 'binary'
                  ? 'bg-violet-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Binary Search
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(activeCodeTab === 'both' || activeCodeTab === 'linear') && (
            <div className={activeCodeTab === 'linear' ? 'md:col-span-2' : ''}>
              <CodeDisplay
                code={LINEAR_SEARCH_CODE}
                language="python"
                title="Linear Search (Python 3)"
              />
            </div>
          )}

          {(activeCodeTab === 'both' || activeCodeTab === 'binary') && (
            <div className={activeCodeTab === 'binary' ? 'md:col-span-2' : ''}>
              <CodeDisplay
                code={BINARY_SEARCH_CODE}
                language="python"
                title="Binary Search (Python 3)"
              />
            </div>
          )}
        </div>
      </section>

      {/* Conceptual Complexity Growth Graph (D3.js) */}
      <ComplexityGraph currentN={parsedArray.length} />
    </div>
  );
};

export default ComparisonArena;

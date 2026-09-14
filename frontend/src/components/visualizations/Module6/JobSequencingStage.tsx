import React, { useState, useMemo } from 'react';
import { Play, RotateCcw, AlertTriangle, ListOrdered } from 'lucide-react';
import { algorithmsApi, ApiError } from '../../../api/client';
import type { JobItem, Module6RunResponse, Module6Step } from '../../../types';
import { AnimationPlayer, MetricsPanel, CodeDisplay } from '../../common';
import { JobTimeline } from './JobTimeline';
import { GanttChart } from './GanttChart';

const JOB_SEQUENCING_CODE = `def job_sequencing(jobs):
    # 1. Sort jobs in descending order of profit
    jobs.sort(key=lambda x: x['profit'], reverse=True)

    max_deadline = max(j['deadline'] for j in jobs)
    slots = [None] * (max_deadline + 1)
    total_profit = 0

    # 2. Greedily allocate each job to latest available slot <= deadline
    for job in jobs:
        for slot in range(job['deadline'], 0, -1):
            if slots[slot] is None:
                slots[slot] = job['id']
                total_profit += job['profit']
                break

    return total_profit, [s for s in slots if s is not None]`;

const PRESETS: { name: string; jobs: JobItem[] }[] = [
  {
    name: 'Standard (5 jobs)',
    jobs: [
      { id: 'J1', deadline: 4, profit: 70 },
      { id: 'J2', deadline: 1, profit: 80 },
      { id: 'J3', deadline: 1, profit: 30 },
      { id: 'J4', deadline: 2, profit: 100 },
      { id: 'J5', deadline: 2, profit: 20 },
    ],
  },
  {
    name: 'Slot Collision (6 jobs)',
    jobs: [
      { id: 'Alpha', deadline: 2, profit: 120 },
      { id: 'Beta', deadline: 1, profit: 100 },
      { id: 'Gamma', deadline: 2, profit: 90 },
      { id: 'Delta', deadline: 1, profit: 70 },
      { id: 'Epsilon', deadline: 3, profit: 60 },
      { id: 'Zeta', deadline: 3, profit: 50 },
    ],
  },
];

export const JobSequencingStage: React.FC = () => {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [traceData, setTraceData] = useState<Module6RunResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(350);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activePreset = PRESETS[selectedPresetIdx];

  const handleRun = async (presetIdx: number = selectedPresetIdx) => {
    setError(null);
    setLoading(true);
    setIsPlaying(false);
    setCurrentStepIndex(0);

    const targetPreset = PRESETS[presetIdx];

    try {
      const res = await algorithmsApi.runModule6({
        jobs: targetPreset.jobs,
      });
      setTraceData(res);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to execute Job Sequencing algorithm.');
      }
    } finally {
      setLoading(false);
    }
  };

  const steps = useMemo(() => traceData?.steps || [], [traceData]);
  const currentStep: Module6Step | null = steps[currentStepIndex] || null;
  const maxSlots = traceData?.max_slots || Math.max(...activePreset.jobs.map((j) => j.deadline));

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <ListOrdered className="w-5 h-5 text-amber-400" />
              <span>Greedy Method I: Job Sequencing with Deadlines</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Maximize cumulative profit by greedily allocating highest-profit jobs to the latest
              available free timeline slot.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold mr-1">Presets:</span>
            {PRESETS.map((p, idx) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setSelectedPresetIdx(idx);
                  setTraceData(null);
                  setCurrentStepIndex(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedPresetIdx === idx
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleRun(selectedPresetIdx)}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all inline-flex items-center space-x-2 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? 'Sequencing Jobs...' : 'Schedule Jobs Greedily'}</span>
          </button>

          {traceData && (
            <button
              type="button"
              onClick={() => {
                setCurrentStepIndex(0);
                setIsPlaying(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors inline-flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Schedule</span>
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Shared AnimationPlayer */}
      {traceData && steps.length > 0 && (
        <AnimationPlayer
          steps={steps}
          currentStepIndex={currentStepIndex}
          isPlaying={isPlaying}
          onPlayToggle={(playing) => setIsPlaying(playing)}
          onStepChange={(idx) => setCurrentStepIndex(idx)}
          onReset={() => setCurrentStepIndex(0)}
          initialSpeedMs={speedMs}
          onSpeedChange={(spd) => setSpeedMs(spd)}
        />
      )}

      {/* Dual Workspace: Sorted Queue + Gantt Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Job Timeline / Queue */}
        <div className="lg:col-span-5 flex flex-col">
          <JobTimeline step={currentStep} />
        </div>

        {/* Right: Gantt Chart */}
        <div className="lg:col-span-7 flex flex-col">
          <GanttChart step={currentStep} maxSlots={maxSlots} />
        </div>
      </div>

      {/* Shared MetricsPanel */}
      <MetricsPanel
        title="Job Sequencing Telemetry"
        complexity="O(N²)"
        status={currentStep?.action === 'completed' ? 'found' : isPlaying ? 'searching' : 'idle'}
        statusMessage={
          currentStep?.action === 'completed'
            ? 'Optimal Schedule Completed'
            : currentStep?.action === 'assigned'
              ? 'Job Successfully Allocated'
              : currentStep?.action === 'rejected'
                ? 'Slot Collision / Missed Deadline'
                : isPlaying
                  ? 'Searching Available Slots...'
                  : 'Awaiting Run'
        }
        metrics={{
          'Accumulated Profit': `$${currentStep?.metrics.total_profit ?? 0}`,
          'Scheduled Jobs': `${currentStep?.metrics.scheduled_count ?? 0} / ${activePreset.jobs.length}`,
          'Available Slots Left': `${currentStep?.metrics.available_slots ?? maxSlots}`,
          'Current Step': `${currentStepIndex + 1} / ${steps.length || 1}`,
        }}
        accentColor="amber"
      />

      {/* Shared CodeDisplay */}
      <CodeDisplay
        title="Job Sequencing Greedy Implementation"
        code={JOB_SEQUENCING_CODE}
        language="python"
      />
    </div>
  );
};

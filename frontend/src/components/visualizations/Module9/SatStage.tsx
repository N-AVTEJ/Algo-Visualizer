import React, { useState, useMemo } from 'react';
import { Play, RotateCcw, AlertTriangle, Binary, BarChart3, CheckSquare } from 'lucide-react';
import { algorithmsApi, ApiError } from '../../../api/client';
import type { Module9RunResponse, SatStep } from '../../../types';
import { AnimationPlayer, MetricsPanel, CodeDisplay } from '../../common';
import { TruthTable } from './TruthTable';
import { SATComplexityGraph } from './SATComplexityGraph';

const SAT_SOLVER_CODE = `def brute_force_sat_solver(variables, clauses):
    # Enumerate all 2^n truth assignments
    for assignment in itertools.product([False, True], repeat=len(variables)):
        env = dict(zip(variables, assignment))
        satisfied = True

        # Check all clauses (CNF: clause1 AND clause2 AND ...)
        for clause in clauses:
            clause_ok = False
            for lit in clause:
                var = lit.lstrip('~')
                val = env[var] if not lit.startswith('~') else (not env[var])
                if val:
                    clause_ok = True
                    break
            if not clause_ok:
                satisfied = False
                break

        if satisfied:
            return True, env  # SAT (early termination)

    return False, None  # UNSAT (exhausted 2^n assignments)`;

const PRESETS: { name: string; variables: string[]; clauses: string[][] }[] = [
  {
    name: 'Standard 3-Variable Formula (SAT)',
    variables: ['x1', 'x2', 'x3'],
    clauses: [
      ['x1', '~x2'],
      ['~x1', 'x3'],
      ['x2', '~x3'],
    ],
  },
  {
    name: 'Contradictory Formula (UNSAT)',
    variables: ['p', 'q'],
    clauses: [['p'], ['~p'], ['q', '~q']],
  },
  {
    name: 'Chained 4-Variable Horn Formula (SAT)',
    variables: ['a', 'b', 'c', 'd'],
    clauses: [
      ['a', 'b'],
      ['~b', 'c'],
      ['~c', 'd'],
      ['~a', '~d'],
    ],
  },
];

export const SatStage: React.FC = () => {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'truthtable' | 'complexity'>('truthtable');

  const [traceData, setTraceData] = useState<Module9RunResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(450);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async (presetIdx: number = selectedPresetIdx) => {
    setError(null);
    setLoading(true);
    setIsPlaying(false);
    setCurrentStepIndex(0);

    const preset = PRESETS[presetIdx];
    try {
      const response = await algorithmsApi.runModule9({
        variables: preset.variables,
        clauses: preset.clauses,
        stop_on_first_satisfying: true,
      });
      setTraceData(response);
      setCurrentStepIndex(0);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to execute SAT solver algorithm.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    setSelectedPresetIdx(idx);
    setTraceData(null);
    setCurrentStepIndex(0);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const currentStep: SatStep | null = useMemo(() => {
    if (!traceData || traceData.steps.length === 0) return null;
    return traceData.steps[currentStepIndex] || null;
  }, [traceData, currentStepIndex]);

  const steps = traceData?.steps ?? [];

  const metricsDisplay: Record<string, string | number | boolean> = useMemo(() => {
    const m: Record<string, string | number | boolean> = {};
    if (traceData) {
      m['Variables Count (n)'] = traceData.metrics.variables_count;
      m['Clauses Count (m)'] = traceData.metrics.clauses_count;
      m['Total Space (2^n)'] = traceData.metrics.total_possible_assignments;
      m['Assignments Checked'] = traceData.metrics.assignments_checked;
      m['Result'] = traceData.is_satisfiable ? 'SAT (Satisfiable)' : 'UNSAT (Unsatisfiable)';
      m['Early Termination'] = traceData.early_termination
        ? 'Yes (Halted on SAT)'
        : 'No (Exhausted)';
    }
    return m;
  }, [traceData]);

  return (
    <div className="w-full space-y-6">
      {/* Header & Preset Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Binary className="w-5 h-5 text-indigo-400" />
            <label htmlFor="sat-preset" className="text-sm font-semibold text-slate-200">
              Formula Preset:
            </label>
          </div>
          <select
            id="sat-preset"
            value={selectedPresetIdx}
            onChange={handlePresetChange}
            className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            disabled={loading || isPlaying}
          >
            {PRESETS.map((p, idx) => (
              <option key={p.name} value={idx}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('truthtable')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'truthtable'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Truth Table
          </button>
          <button
            onClick={() => setActiveTab('complexity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'complexity'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Complexity (2^n)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRun()}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {loading ? 'Evaluating...' : 'Solve Formula'}
          </button>
          <button
            onClick={handleReset}
            disabled={!traceData || loading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-200 flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Tab View */}
      {activeTab === 'truthtable' ? (
        traceData ? (
          <div className="space-y-6">
            <TruthTable
              step={currentStep}
              variables={traceData.variables}
              clauses={traceData.clauses}
              totalAssignments={traceData.total_assignments}
            />

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <MetricsPanel
                  title="SAT Solver Telemetry"
                  complexity="O(2^n · m)"
                  status={
                    currentStep?.is_satisfying_found ? 'found' : isPlaying ? 'searching' : 'idle'
                  }
                  statusMessage={
                    currentStep?.all_satisfied
                      ? 'Satisfying Truth Assignment Found!'
                      : isPlaying
                        ? `Testing Assignment #${currentStep?.assignment_number ?? 0}...`
                        : 'Awaiting Formula Evaluation'
                  }
                  metrics={metricsDisplay}
                  accentColor="emerald"
                />
              </div>
              <div className="lg:col-span-2">
                <CodeDisplay
                  title="Brute-Force Boolean SAT Solver"
                  code={SAT_SOLVER_CODE}
                  language="python"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
            <Binary className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-300">
              Ready to Enumerate Truth Table
            </h3>
            <p className="text-sm text-slate-500 max-w-md mt-1">
              Click &ldquo;Solve Formula&rdquo; above to evaluate CNF clauses over the truth
              assignment space with animated step traces.
            </p>
          </div>
        )
      ) : (
        <SATComplexityGraph />
      )}
    </div>
  );
};

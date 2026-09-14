import React from 'react';
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import type { SatStep } from '../../../types';

interface TruthTableProps {
  step: SatStep | null;
  variables: string[];
  clauses: string[][];
  totalAssignments: number;
}

export const TruthTable: React.FC<TruthTableProps> = ({
  step,
  variables,
  clauses,
  totalAssignments,
}) => {
  const currentAssignmentNum = step?.assignment_number ?? 0;
  const currentVars = step?.variable_values ?? {};
  const evaluations = step?.clause_evaluations ?? [];
  const isSatisfied = step?.all_satisfied ?? false;

  return (
    <div className="w-full flex flex-col gap-4 bg-slate-950/80 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Top Banner: Formula Representation */}
      <div className="w-full p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-medium">CNF Formula:</span>
          <div className="flex items-center gap-2 font-mono font-semibold">
            {clauses.map((clause, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300"
              >
                ({clause.join(' ∨ ')})
                {idx < clauses.length - 1 && (
                  <span className="text-slate-500 ml-2 font-bold">∧</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-slate-400">
            Variables: <span className="text-slate-200">{variables.length}</span>
          </span>
          <span className="text-slate-400">
            Total Space:{' '}
            <span className="text-indigo-400">
              2^{variables.length} = {totalAssignments}
            </span>
          </span>
        </div>
      </div>

      {/* Current Assignment Truth State Card */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Variable Bindings */}
        <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Assignment #{currentAssignmentNum} Truth Values</span>
            <span>
              Progress: {currentAssignmentNum} / {totalAssignments}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {variables.map((v) => {
              const val = currentVars[v];
              return (
                <div
                  key={v}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono transition-colors ${
                    val
                      ? 'bg-emerald-950/60 border-emerald-600/80 text-emerald-300 font-bold'
                      : 'bg-rose-950/60 border-rose-600/80 text-rose-300 font-bold'
                  }`}
                >
                  <span>{v}</span>
                  <span>=</span>
                  <span className="uppercase">{val ? 'True (T)' : 'False (F)'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overall Status */}
        <div
          className={`p-4 rounded-lg border flex flex-col justify-center gap-1.5 transition-all ${
            isSatisfied
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
              : 'bg-slate-900/90 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {isSatisfied ? (
              <>
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-300">Satisfying Assignment Encountered!</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>Unsatisfied Assignment</span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {step?.description || 'Evaluating formula over assignment space...'}
          </p>
        </div>
      </div>

      {/* Clause Evaluation Breakdown */}
      <div className="w-full flex flex-col gap-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Individual Clause Breakdown
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {evaluations.map((c) => (
            <div
              key={c.clause_index}
              className={`p-3 rounded-lg border flex flex-col gap-2 transition-all ${
                c.satisfied
                  ? 'bg-emerald-950/20 border-emerald-800/60 text-slate-200'
                  : 'bg-rose-950/30 border-rose-800/80 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-300">Clause #{c.clause_index + 1}</span>
                {c.satisfied ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Satisfied
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 font-semibold">
                    <XCircle className="w-3.5 h-3.5" /> Fails
                  </span>
                )}
              </div>

              <div className="font-mono text-sm px-2 py-1 rounded bg-slate-900/80 border border-slate-800 text-indigo-300">
                ({c.clause_str})
              </div>

              <div className="flex flex-wrap gap-1.5 text-xs font-mono">
                {c.literals.map((lit, lIdx) => (
                  <span
                    key={lIdx}
                    className={`px-2 py-0.5 rounded text-[11px] border ${
                      lit.lit_value
                        ? 'bg-emerald-900/40 border-emerald-600 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    {lit.literal}: {lit.lit_value ? 'T' : 'F'}
                  </span>
                ))}
              </div>

              {c.satisfied && c.satisfying_literals.length > 0 && (
                <div className="text-[11px] text-emerald-400/90 font-mono">
                  Satisfied via literal: {c.satisfying_literals.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import type { Module6Step } from '../../../types';

interface JobTimelineProps {
  step: Module6Step | null;
}

export const JobTimeline: React.FC<JobTimelineProps> = ({ step }) => {
  const sortedJobs = step?.sorted_jobs || [];
  const currentJob = step?.job;
  const scheduledJobs = step?.scheduled_jobs || [];
  const rejectedJobs = step?.rejected_jobs || [];
  const currentAction = step?.action || 'init';

  return (
    <div className="w-full p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Profit-Sorted Jobs Queue</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          Evaluated: {scheduledJobs.length + rejectedJobs.length} / {sortedJobs.length}
        </span>
      </div>

      {/* Decision Banner */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
        <span className="font-semibold text-amber-400">Status: </span>
        <span className="font-mono text-white">
          {step?.explanation || 'Awaiting algorithm execution.'}
        </span>
      </div>

      {/* Jobs Queue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
        {sortedJobs.map((j) => {
          const isCurrent = currentJob?.id === j.id;
          const isScheduled = scheduledJobs.includes(j.id);
          const isRejected = rejectedJobs.includes(j.id);

          let cardStyle = 'border-slate-800 bg-slate-950/50 text-slate-400';
          if (isCurrent) {
            cardStyle =
              currentAction === 'rejected'
                ? 'border-rose-500 bg-rose-950/40 text-rose-200 ring-2 ring-rose-500/50'
                : currentAction === 'assigned'
                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-2 ring-emerald-500/50'
                  : 'border-amber-400 bg-amber-950/40 text-amber-200 ring-2 ring-amber-400/50';
          } else if (isScheduled) {
            cardStyle = 'border-emerald-800/80 bg-emerald-950/20 text-emerald-300';
          } else if (isRejected) {
            cardStyle = 'border-rose-900/60 bg-rose-950/20 text-rose-400 opacity-60';
          }

          return (
            <motion.div
              key={j.id}
              layout
              animate={{
                scale: isCurrent ? 1.02 : 1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${cardStyle}`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isScheduled
                      ? 'bg-emerald-500 text-slate-950'
                      : isRejected
                        ? 'bg-rose-500 text-slate-950'
                        : isCurrent
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {isScheduled ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isRejected ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    j.id
                  )}
                </div>

                <div>
                  <span className="text-xs font-bold font-mono text-white">{j.id}</span>
                  <div className="flex items-center space-x-3 text-[11px] mt-0.5 text-slate-400">
                    <span className="flex items-center space-x-0.5 text-emerald-400 font-semibold font-mono">
                      <DollarSign className="w-3 h-3" />
                      <span>{j.profit}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center space-x-0.5 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Deadline: slot {j.deadline}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {isScheduled && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    SCHEDULED
                  </span>
                )}
                {isRejected && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    REJECTED
                  </span>
                )}
                {isCurrent && !isScheduled && !isRejected && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                    <span>EVALUATING</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}
                {!isScheduled && !isRejected && !isCurrent && (
                  <span className="text-[10px] text-slate-500 font-mono">In Queue</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

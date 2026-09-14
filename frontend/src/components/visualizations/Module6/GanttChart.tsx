import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, DollarSign, AlertOctagon, Check } from 'lucide-react';
import type { Module6Step } from '../../../types';

interface GanttChartProps {
  step: Module6Step | null;
  maxSlots: number;
}

export const GanttChart: React.FC<GanttChartProps> = ({ step, maxSlots }) => {
  const timeline = step?.timeline || [];
  const checkedSlot = step?.checked_slot;
  const currentAction = step?.action;
  const currentJob = step?.job;
  const runningProfit = step?.running_profit || 0;
  const rejectedJobs = step?.rejected_jobs || [];

  // Red flash animation trigger when rejected
  const isRejected = currentAction === 'rejected';

  return (
    <div className="w-full p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 relative overflow-hidden">
      {/* Transient Red Flash Overlay on Rejection */}
      <AnimatePresence>
        {isRejected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-rose-500 pointer-events-none rounded-2xl z-10"
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Timeline Gantt Schedule</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Total Profit:</span>
          <span className="text-sm font-mono font-bold text-emerald-400 flex items-center">
            <DollarSign className="w-3.5 h-3.5" />
            <span>{runningProfit}</span>
          </span>
        </div>
      </div>

      {/* Discrete Timeline Slots (1..maxSlots) */}
      <div className="space-y-2">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block">
          Unit Time Slots:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {Array.from({ length: maxSlots }, (_, i) => i + 1).map((slotNum) => {
            const slotData = timeline.find((t) => t.slot === slotNum);
            const isOccupied = slotData && slotData.job_id !== null;
            const isBeingChecked = checkedSlot === slotNum;
            const isJustAssigned = currentAction === 'assigned' && checkedSlot === slotNum;

            let slotStyle = 'border-slate-800 bg-slate-950/70 text-slate-400';
            if (isJustAssigned) {
              slotStyle =
                'border-emerald-400 bg-emerald-950/50 text-emerald-200 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/20';
            } else if (isBeingChecked) {
              slotStyle = isOccupied
                ? 'border-rose-500 bg-rose-950/40 text-rose-300 ring-2 ring-rose-500/40'
                : 'border-amber-400 bg-amber-950/40 text-amber-200 ring-2 ring-amber-400/50';
            } else if (isOccupied) {
              slotStyle = 'border-emerald-800/80 bg-emerald-950/25 text-emerald-300';
            }

            return (
              <motion.div
                key={`slot-${slotNum}`}
                animate={{
                  scale: isBeingChecked || isJustAssigned ? 1.05 : 1,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-between min-h-[90px] transition-all ${slotStyle}`}
              >
                <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                  <span>Slot {slotNum}</span>
                  <span>
                    [t={slotNum - 1}..{slotNum}]
                  </span>
                </div>

                <div className="my-auto text-center">
                  {isOccupied ? (
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold font-mono text-white">
                        {slotData.job_id}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-semibold flex items-center space-x-0.5 mt-0.5">
                        <Check className="w-3 h-3" />
                        <span>Allocated</span>
                      </span>
                    </div>
                  ) : isBeingChecked ? (
                    <span className="text-[11px] font-bold text-amber-300 animate-pulse">
                      Checking...
                    </span>
                  ) : (
                    <span className="text-xs text-slate-600 font-mono">Empty</span>
                  )}
                </div>

                {isBeingChecked && !isOccupied && (
                  <span className="text-[9px] font-mono text-amber-400">Available</span>
                )}
                {isBeingChecked && isOccupied && (
                  <span className="text-[9px] font-mono text-rose-400">Collided</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Rejected Jobs Area */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-rose-400">
          <AlertOctagon className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Rejected Jobs (Deadline Missed):
          </span>
        </div>

        {rejectedJobs.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No rejected jobs yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {rejectedJobs.map((jId) => (
              <span
                key={jId}
                className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 font-mono text-xs font-bold"
              >
                {jId}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Current Job Action Highlight */}
      {currentJob && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
          <span>
            Evaluating <strong className="text-white font-mono">{currentJob.id}</strong> (Profit: $
            {currentJob.profit}, Deadline: slot {currentJob.deadline})
          </span>
          <span
            className={`font-mono font-bold ${
              currentAction === 'assigned'
                ? 'text-emerald-400'
                : currentAction === 'rejected'
                  ? 'text-rose-400'
                  : 'text-amber-400'
            }`}
          >
            {currentAction ? currentAction.toUpperCase() : ''}
          </span>
        </div>
      )}
    </div>
  );
};

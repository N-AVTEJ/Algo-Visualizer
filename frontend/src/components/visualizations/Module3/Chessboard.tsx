import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Module3Step } from '../../../types';

interface ChessboardProps {
  step: Module3Step | null;
  n?: number;
}

export const Chessboard: React.FC<ChessboardProps> = ({ step, n = 8 }) => {
  const queens = step?.board || Array(n).fill(-1);
  const isSolution = step?.action === 'solution';
  const conflict = step?.conflict_with;
  const currentTryRow = step?.row ?? -1;
  const currentTryCol = step?.col ?? -1;

  const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, n);

  return (
    <div className="flex flex-col items-center">
      {/* Board Container with Rank & File coordinate markers */}
      <div className="p-4 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-2xl relative">
        {/* Top File Labels */}
        <div className="grid grid-flow-col auto-cols-fr mb-1 pl-6 pr-2 text-center">
          {colLabels.map((label) => (
            <span key={label} className="text-[11px] font-mono font-bold text-slate-500">
              {label}
            </span>
          ))}
        </div>

        <div className="flex">
          {/* Left Rank Labels (8 down to 1) */}
          <div className="flex flex-col justify-around pr-2 text-right">
            {Array.from({ length: n }, (_, r) => n - r).map((rank) => (
              <span key={rank} className="text-[11px] font-mono font-bold text-slate-500 h-9 sm:h-11 flex items-center justify-end">
                {rank}
              </span>
            ))}
          </div>

          {/* Grid Squares */}
          <div
            className="grid gap-[2px] bg-slate-800 p-[2px] rounded-xl overflow-hidden border border-slate-700"
            style={{
              gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: n }).map((_, row) =>
              Array.from({ length: n }).map((_, col) => {
                const isLight = (row + col) % 2 === 0;
                const hasQueen = queens[row] === col;
                const isAttemptingHere = currentTryRow === row && currentTryCol === col;
                const isConflictHere =
                  (isAttemptingHere && step?.action === 'conflict') ||
                  (conflict && conflict.row === row && conflict.col === col);

                let squareBg = isLight ? 'bg-slate-800/90' : 'bg-slate-900/90';
                if (isSolution && hasQueen) {
                  squareBg = isLight ? 'bg-emerald-800/80' : 'bg-emerald-900/80';
                } else if (isConflictHere) {
                  squareBg = 'bg-rose-950/90 border border-rose-600/80';
                } else if (isAttemptingHere) {
                  squareBg = 'bg-amber-950/70 border border-amber-500/80';
                }

                return (
                  <div
                    key={`${row}-${col}`}
                    className={`w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center relative transition-colors ${squareBg}`}
                  >
                    <AnimatePresence>
                      {hasQueen && (
                        <motion.div
                          key={`queen-${row}-${col}`}
                          initial={{ scale: 0, y: -10 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center ${
                            isSolution
                              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40'
                              : 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                          }`}
                        >
                          <Crown className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Transient Attempt Marker (when not yet confirmed placed) */}
                    {isAttemptingHere && !hasQueen && (
                      <motion.div
                        animate={{ scale: [0.85, 1.1, 0.85] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border-2 ${
                          step?.action === 'conflict'
                            ? 'border-rose-500 bg-rose-500/20 text-rose-400'
                            : 'border-amber-400 bg-amber-400/20 text-amber-300'
                        }`}
                      >
                        {step?.action === 'conflict' ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <Crown className="w-4 h-4 opacity-70" />
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Board Search Status Footer */}
        <div className="mt-4 flex items-center justify-between text-xs px-2">
          <div className="flex items-center space-x-2">
            {isSolution ? (
              <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Valid 8-Queens Solution Formed!</span>
              </span>
            ) : step?.action === 'conflict' ? (
              <span className="flex items-center space-x-1.5 text-rose-400">
                <AlertCircle className="w-4 h-4" />
                <span>
                  Conflict at ({colLabels[currentTryCol] || currentTryCol}, {n - currentTryRow}):{' '}
                  {conflict?.reason || 'Invalid position'}
                </span>
              </span>
            ) : step?.action === 'backtrack' ? (
              <span className="text-amber-400">
                Backtracking from row {currentTryRow + 1} — removing queen.
              </span>
            ) : step?.action === 'place' ? (
              <span className="text-emerald-300">
                Placed queen safely at ({colLabels[currentTryCol] || currentTryCol}, {n - currentTryRow}).
              </span>
            ) : (
              <span className="text-slate-400">Search ready.</span>
            )}
          </div>

          <span className="text-slate-500 font-mono text-[11px]">
            Queens Placed: {queens.filter((c) => c !== -1).length} / {n}
          </span>
        </div>
      </div>
    </div>
  );
};

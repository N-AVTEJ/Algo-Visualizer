import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Cpu,
  GitBranch,
  Table,
  Network,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface RoadmapPhase {
  phase: string;
  title: string;
  description: string;
  moduleIds: number[];
  moduleNames: string[];
  tag: string;
  icon: React.ReactNode;
  gradient: string;
  borderGlow: string;
  badgeStyle: string;
  dotStyle: string;
  dotPulse: string;
  linkHover: string;
  numColor: string;
}

const PHASES: RoadmapPhase[] = [
  {
    phase: 'Phase 01',
    title: 'Foundations & Asymptotic Growth',
    description: 'Master Big-O, recurrence equations, divide & conquer trees, and log-linear divide strategies.',
    moduleIds: [1, 2],
    moduleNames: ['Algorithm Analysis', 'Divide & Conquer'],
    tag: 'Asymptotic & Recurrence',
    icon: <Cpu className="w-5 h-5 text-violet-400" />,
    gradient: 'from-violet-500/20 to-indigo-500/10',
    borderGlow: 'hover:border-violet-500/60',
    badgeStyle: 'text-violet-300 border-violet-800/40',
    dotStyle: 'border-violet-500/80 shadow-violet-500/20',
    dotPulse: 'bg-violet-400',
    linkHover: 'hover:bg-violet-950/70 hover:text-violet-300 hover:border-violet-700/50',
    numColor: 'text-violet-400',
  },
  {
    phase: 'Phase 02',
    title: 'State-Space Traversal & Pruning',
    description: 'Exhaustive combinatorial exploration, constraint satisfaction, and intelligent dead-end pruning.',
    moduleIds: [3],
    moduleNames: ['Backtracking'],
    tag: 'State-Space Pruning',
    icon: <GitBranch className="w-5 h-5 text-amber-400" />,
    gradient: 'from-amber-500/20 to-orange-500/10',
    borderGlow: 'hover:border-amber-500/60',
    badgeStyle: 'text-amber-300 border-amber-800/40',
    dotStyle: 'border-amber-500/80 shadow-amber-500/20',
    dotPulse: 'bg-amber-400',
    linkHover: 'hover:bg-amber-950/70 hover:text-amber-300 hover:border-amber-700/50',
    numColor: 'text-amber-400',
  },
  {
    phase: 'Phase 03',
    title: 'Dynamic Programming & Memoization',
    description: 'Identify optimal substructure, overlapping subproblems, state transitions, and tabular all-pairs shortest paths.',
    moduleIds: [4, 5],
    moduleNames: ['Dynamic Programming I', 'Dynamic Programming II'],
    tag: 'Optimal Substructure',
    icon: <Table className="w-5 h-5 text-emerald-400" />,
    gradient: 'from-emerald-500/20 to-teal-500/10',
    borderGlow: 'hover:border-emerald-500/60',
    badgeStyle: 'text-emerald-300 border-emerald-800/40',
    dotStyle: 'border-emerald-500/80 shadow-emerald-500/20',
    dotPulse: 'bg-emerald-400',
    linkHover: 'hover:bg-emerald-950/70 hover:text-emerald-300 hover:border-emerald-700/50',
    numColor: 'text-emerald-400',
  },
  {
    phase: 'Phase 04',
    title: 'Greedy Heuristics & Graph Spanning',
    description: 'Locally optimal choice proofs, disjoint-set union find, matroid theory, and minimum spanning forests.',
    moduleIds: [6, 7],
    moduleNames: ['Greedy Method I', 'Greedy Method II'],
    tag: 'Locally Optimal Choices',
    icon: <Network className="w-5 h-5 text-sky-400" />,
    gradient: 'from-sky-500/20 to-blue-500/10',
    borderGlow: 'hover:border-sky-500/60',
    badgeStyle: 'text-sky-300 border-sky-800/40',
    dotStyle: 'border-sky-500/80 shadow-sky-500/20',
    dotPulse: 'bg-sky-400',
    linkHover: 'hover:bg-sky-950/70 hover:text-sky-300 hover:border-sky-700/50',
    numColor: 'text-sky-400',
  },
  {
    phase: 'Phase 05',
    title: 'State-Space Bounding & Intractability',
    description: 'Bounding functions, best-first branch search, polynomial-time reductions, and Cook-Levin NP-completeness.',
    moduleIds: [8, 9, 10],
    moduleNames: ['Branch & Bound', 'P and NP Problems', 'NP-Hard & NP-Complete'],
    tag: 'Reductions & NP-C',
    icon: <Lock className="w-5 h-5 text-rose-400" />,
    gradient: 'from-rose-500/20 to-pink-500/10',
    borderGlow: 'hover:border-rose-500/60',
    badgeStyle: 'text-rose-300 border-rose-800/40',
    dotStyle: 'border-rose-500/80 shadow-rose-500/20',
    dotPulse: 'bg-rose-400',
    linkHover: 'hover:bg-rose-950/70 hover:text-rose-300 hover:border-rose-700/50',
    numColor: 'text-rose-400',
  },
];

export const CurriculumRoadmap: React.FC = () => {
  return (
    <nav aria-label="Curriculum Roadmap" className="relative py-8">
      {/* Background connecting line (left-aligned on mobile, centered on desktop) */}
      <div
        aria-hidden="true"
        className="absolute left-6 sm:left-1/2 top-12 bottom-12 w-0.5 -translate-x-1/2 bg-gradient-to-b from-violet-500 via-indigo-500 to-rose-500/40 opacity-40"
      />

      <ol className="space-y-10 sm:space-y-12 list-none p-0 m-0">
        {PHASES.map((phase, idx) => {
          const isEven = idx % 2 === 0;

          return (
            <motion.li
              key={phase.phase}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 pl-12 sm:pl-0 ${
                isEven ? 'sm:flex-row-reverse' : ''
              }`}
            >
              {/* Timeline Center Node Badge (left rail on mobile, centered on desktop) */}
              <div
                aria-hidden="true"
                className={`absolute left-6 sm:left-1/2 -translate-x-1/2 top-6 sm:top-auto w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950 border-2 ${phase.dotStyle} items-center justify-center shadow-lg z-10 flex`}
              >
                <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${phase.dotPulse} animate-pulse`} />
              </div>

              {/* Content Card */}
              <div className="w-full sm:w-[calc(50%-1.5rem)]">
                <div
                  className={`p-6 rounded-2xl bg-gradient-to-br ${phase.gradient} bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm transition-all duration-300 ${phase.borderGlow}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-950/80 border ${phase.badgeStyle}`}>
                      {phase.phase}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{phase.tag}</span>
                  </div>

                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      {phase.icon}
                    </div>
                    <h4 className="text-lg font-bold text-white tracking-tight">{phase.title}</h4>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                    {phase.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/70">
                    {phase.moduleIds.map((mId, mIdx) => (
                      <Link
                        key={mId}
                        to={`/module/${mId}`}
                        className={`inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg bg-slate-950/70 text-slate-300 border border-slate-800 transition-colors ${phase.linkHover}`}
                      >
                        <span className={`font-mono text-[11px] ${phase.numColor}`}>M{mId}:</span>
                        <span>{phase.moduleNames[mIdx]}</span>
                        <ArrowRight className="w-3 h-3 ml-0.5 opacity-60" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Spacer on opposite side for desktop centering */}
              <div aria-hidden="true" className="hidden sm:block sm:w-[calc(50%-1.5rem)]" />
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
};

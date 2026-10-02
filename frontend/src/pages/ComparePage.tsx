import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  GitCompare,
  Sparkles,
  Clock,
  Cpu,
  Scale,
  Play,
  RotateCcw,
  CheckCircle2,
  Award,
  ArrowRight,
  Search,
  BarChart3,
  Database,
  Network,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { ComparisonArena } from '../components/visualizations/Module1/ComparisonArena';

type CompareTab = 'search' | 'sorting' | 'knapsack' | 'mst';

interface SuggestedComparison {
  id: CompareTab;
  title: string;
  tag: string;
  tagColor: string;
  algorithms: [string, string];
  keyQuestion: string;
  tradeoffSummary: string;
  metricComparison: { label: string; a: string; b: string }[];
}

const SUGGESTED_COMPARISONS: SuggestedComparison[] = [
  {
    id: 'search',
    title: 'Linear Search vs. Binary Search',
    tag: 'Search Paradigm',
    tagColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/30',
    algorithms: ['Linear Search', 'Binary Search'],
    keyQuestion: 'When is preprocessing (sorting) worth the overhead for search speed?',
    tradeoffSummary:
      'Linear search requires zero setup (works on unsorted lists) but runs in O(N). Binary search achieves exponential logarithmic speedup O(log N) on sorted data by cutting search space in half each step.',
    metricComparison: [
      { label: 'Time Complexity', a: 'O(N)', b: 'O(log N)' },
      { label: 'Input Requirement', a: 'Any unsorted array', b: 'Pre-sorted array mandatory' },
      { label: 'Comparisons for N=1,000,000', a: 'Up to 1,000,000 checks', b: 'At most 20 checks' },
      { label: 'Extra Memory', a: 'O(1) in-place', b: 'O(1) iterative' },
    ],
  },
  {
    id: 'sorting',
    title: 'Merge Sort vs. Quick Sort vs. Bubble Sort',
    tag: 'Sorting Battle Royale',
    tagColor: 'border-violet-500/30 text-violet-400 bg-violet-950/30',
    algorithms: ['Merge Sort', 'Quick Sort'],
    keyQuestion: 'Why does Quick Sort dominate real-world engines despite Merge Sort having a better worst case?',
    tradeoffSummary:
      'Merge Sort guarantees O(N log N) worst-case time and is stable, but requires O(N) auxiliary RAM. Quick Sort is in-place and cache-friendly, making it 2-3x faster in practice despite an O(N²) worst-case on unbalanced pivots.',
    metricComparison: [
      { label: 'Average Time', a: 'O(N log N)', b: 'O(N log N)' },
      { label: 'Worst-Case Time', a: 'O(N log N) Guaranteed', b: 'O(N²) on sorted pivot' },
      { label: 'Memory Overhead', a: 'O(N) Auxiliary Buffer', b: 'O(log N) Call Stack' },
      { label: 'Stability', a: 'Stable (Preserves Order)', b: 'Unstable in standard form' },
    ],
  },
  {
    id: 'knapsack',
    title: '0/1 Knapsack (DP) vs. Fractional Knapsack (Greedy)',
    tag: 'Optimization Clash',
    tagColor: 'border-amber-500/30 text-amber-400 bg-amber-950/30',
    algorithms: ['0/1 DP Knapsack', 'Fractional Greedy'],
    keyQuestion: 'Why does the intuitive greedy heuristic fail completely on discrete choices?',
    tradeoffSummary:
      'Greedy sorting by value-to-weight ratio is optimal when items can be divided into fractions. But for discrete all-or-nothing items, greedy fails to find the global optimum, requiring Dynamic Programming memoization.',
    metricComparison: [
      { label: 'Time Complexity', a: 'O(N · W) Pseudo-polynomial', b: 'O(N log N) Sort-dominated' },
      { label: 'Divisible Items', a: 'Overkill (DP unnecessary)', b: 'Provably globally optimal' },
      { label: 'Discrete 0/1 Items', a: 'Guaranteed 100% optimal', b: 'Heuristic only (sub-optimal)' },
      { label: 'Space Complexity', a: 'O(N · W) or O(W) table', b: 'O(1) extra space' },
    ],
  },
  {
    id: 'mst',
    title: "Kruskal's vs. Prim's Algorithm (MST)",
    tag: 'Graph Spanning Trees',
    tagColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30',
    algorithms: ["Kruskal's (Edge-Centric)", "Prim's (Vertex-Centric)"],
    keyQuestion: 'Does graph density dictate which minimum spanning tree algorithm to choose?',
    tradeoffSummary:
      'Kruskal builds forests by sorting all edges and unioning disjoint sets (best for sparse graphs E << V²). Prim grows a single tree outward via priority queues (best for dense graphs E ≈ V²).',
    metricComparison: [
      { label: 'Time Complexity', a: 'O(E log E) or O(E log V)', b: 'O(E + V log V) with Fib Heap' },
      { label: 'Core Data Structure', a: 'Disjoint Set Union (DSU)', b: 'Min-Priority Queue / Heap' },
      { label: 'Ideal Topology', a: 'Sparse Graphs (few edges)', b: 'Dense Graphs (many edges)' },
      { label: 'Cycle Detection', a: 'Explicit Union-Find find()', b: 'Implicit via visited set' },
    ],
  },
];

export const ComparePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CompareTab>('search');

  // Sorting race simulation state
  const [nElements, setNElements] = useState<number>(100);
  const [inputDist, setInputDist] = useState<'random' | 'nearly_sorted' | 'reversed'>('random');
  const [raceRunning, setRaceRunning] = useState<boolean>(false);
  const [raceProgress, setRaceProgress] = useState<{ quick: number; merge: number; bubble: number }>({
    quick: 0,
    merge: 0,
    bubble: 0,
  });
  const [raceWinner, setRaceWinner] = useState<string | null>(null);

  const raceRef = useRef<{
    quick: number;
    merge: number;
    bubble: number;
    running: boolean;
  }>({ quick: 0, merge: 0, bubble: 0, running: false });

  const startSortingRace = () => {
    raceRef.current = { quick: 0, merge: 0, bubble: 0, running: true };
    setRaceProgress({ quick: 0, merge: 0, bubble: 0 });
    setRaceWinner(null);
    setRaceRunning(true);
  };

  const resetSortingRace = () => {
    raceRef.current = { quick: 0, merge: 0, bubble: 0, running: false };
    setRaceRunning(false);
    setRaceProgress({ quick: 0, merge: 0, bubble: 0 });
    setRaceWinner(null);
  };

  useEffect(() => {
    if (!raceRunning) return;

    const interval = setInterval(() => {
      const cur = raceRef.current;
      if (!cur.running) return;

      // Rate scaling based on algorithmic complexity:
      const quickSpeed = inputDist === 'reversed' ? 1.8 : 4.6;
      const mergeSpeed = 3.8;
      const bubbleSpeed = inputDist === 'nearly_sorted' ? 3.0 : 0.8;

      cur.quick = Math.min(100, cur.quick + quickSpeed);
      cur.merge = Math.min(100, cur.merge + mergeSpeed);
      cur.bubble = Math.min(100, cur.bubble + bubbleSpeed);

      setRaceProgress({
        quick: Math.round(cur.quick),
        merge: Math.round(cur.merge),
        bubble: Math.round(cur.bubble),
      });

      if (!raceWinner) {
        if (cur.quick >= 100 && cur.quick > cur.merge) {
          setRaceWinner('Quick Sort (In-Place Partitioning)');
        } else if (cur.merge >= 100 && cur.merge > cur.quick) {
          setRaceWinner('Merge Sort (Divide & Conquer)');
        }
      }

      if (cur.quick >= 100 && cur.merge >= 100 && cur.bubble >= 100) {
        cur.running = false;
        setRaceRunning(false);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [raceRunning, inputDist, raceWinner]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-violet-950/30 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-800/50 text-xs font-semibold text-violet-300">
              <GitCompare className="w-3.5 h-3.5 text-violet-400" />
              <span>Side-by-Side Algorithmic Telemetry</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Algorithm Comparison Matrix
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Compare competing algorithms under identical inputs, constraints, and stress tests.
              Evaluate frame-accurate execution, operational overhead, and Big-O scaling trade-offs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
              <span className="text-slate-200 font-semibold">4 Comparative Arenas</span> Ready
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md">
          {[
            { id: 'search' as CompareTab, label: 'Search: Linear vs Binary', icon: Search },
            { id: 'sorting' as CompareTab, label: 'Sorting: Merge vs Quick vs Bubble', icon: BarChart3 },
            { id: 'knapsack' as CompareTab, label: 'Optimization: 0/1 DP vs Fractional Greedy', icon: Database },
            { id: 'mst' as CompareTab, label: "MST: Kruskal's vs Prim's", icon: Network },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Comparison Canvas */}
      <div className="space-y-6">
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="p-4 sm:p-5 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 text-cyan-200 text-xs sm:text-sm flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Interactive Frame-by-Frame Arena:</span> Enter an array and search target below. Use the playback controls to scrub step-by-step and inspect exact midpoint index calculations versus sequential step scans.
              </div>
            </div>
            <ComparisonArena />
          </div>
        )}

        {activeTab === 'sorting' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-400" />
                  Sorting Race Simulator (N = {nElements} Items)
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Simulates operations count, recursion depth, and cache efficiency under various initial array distributions.
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={nElements}
                  onChange={(e) => {
                    setNElements(Number(e.target.value));
                    resetSortingRace();
                  }}
                  disabled={raceRunning}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium focus:outline-none focus:border-violet-500"
                >
                  <option value={50}>N = 50 Items</option>
                  <option value={100}>N = 100 Items</option>
                  <option value={500}>N = 500 Items</option>
                  <option value={1000}>N = 1,000 Items</option>
                </select>

                <select
                  value={inputDist}
                  onChange={(e) => {
                    setInputDist(e.target.value as any);
                    resetSortingRace();
                  }}
                  disabled={raceRunning}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium focus:outline-none focus:border-violet-500"
                >
                  <option value="random">Distribution: Random</option>
                  <option value="nearly_sorted">Distribution: Nearly Sorted</option>
                  <option value="reversed">Distribution: Reversed (Worst Case)</option>
                </select>

                {!raceRunning ? (
                  <button
                    onClick={startSortingRace}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Start Race
                  </button>
                ) : (
                  <button
                    onClick={resetSortingRace}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Live Progress HUDs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quick Sort */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-violet-800/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-violet-400 tracking-wider uppercase">Quick Sort</span>
                  <span className="text-xs text-slate-400 font-mono">O(N log N) avg</span>
                </div>
                <div className="text-2xl font-black text-white font-mono mb-2">{raceProgress.quick}%</div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                    style={{ width: `${raceProgress.quick}%` }}
                  />
                </div>
                <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Extra RAM: O(log N)</span>
                  <span>In-Place: Yes</span>
                </div>
              </div>

              {/* Merge Sort */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-cyan-800/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">Merge Sort</span>
                  <span className="text-xs text-slate-400 font-mono">O(N log N) stable</span>
                </div>
                <div className="text-2xl font-black text-white font-mono mb-2">{raceProgress.merge}%</div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full"
                    style={{ width: `${raceProgress.merge}%` }}
                  />
                </div>
                <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Extra RAM: O(N)</span>
                  <span>Stable: Yes</span>
                </div>
              </div>

              {/* Bubble Sort */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-amber-800/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">Bubble Sort</span>
                  <span className="text-xs text-slate-400 font-mono">O(N²) quadratic</span>
                </div>
                <div className="text-2xl font-black text-white font-mono mb-2">{raceProgress.bubble}%</div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-600 to-rose-500 rounded-full"
                    style={{ width: `${raceProgress.bubble}%` }}
                  />
                </div>
                <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Extra RAM: O(1)</span>
                  <span>In-Place: Yes</span>
                </div>
              </div>
            </div>

            {/* Winner Badge */}
            {raceWinner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm flex items-center gap-3"
              >
                <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white">Race Winner:</span> {raceWinner} completed execution first with superior hardware throughput.
                </div>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'knapsack' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 shadow-xl">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                The Knapsack Paradigm Clash (Capacity W = 50 kg)
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Comparing how Dynamic Programming and Greedy heuristics tackle identical item inputs.
              </p>
            </div>

            {/* Items Table */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="font-bold text-slate-200 mb-1">Item 1: Ruby Gem</div>
                <div className="text-slate-400">Weight: 10 kg | Value: $60</div>
                <div className="text-amber-400 font-mono mt-1 font-semibold">Ratio: $6.00 / kg</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="font-bold text-slate-200 mb-1">Item 2: Gold Bar</div>
                <div className="text-slate-400">Weight: 20 kg | Value: $100</div>
                <div className="text-amber-400 font-mono mt-1 font-semibold">Ratio: $5.00 / kg</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="font-bold text-slate-200 mb-1">Item 3: Diamond Chest</div>
                <div className="text-slate-400">Weight: 30 kg | Value: $120</div>
                <div className="text-amber-400 font-mono mt-1 font-semibold">Ratio: $4.00 / kg</div>
              </div>
            </div>

            {/* Comparison Outcome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* 0/1 DP Outcome */}
              <div className="p-5 rounded-2xl bg-violet-950/20 border border-violet-800/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">0/1 Knapsack (DP Tabulation)</span>
                  <span className="px-2 py-0.5 rounded-full bg-violet-900/60 text-[10px] text-violet-300 font-semibold">Discrete Choice</span>
                </div>
                <div className="text-3xl font-black text-white font-mono">$220 Total Value</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Items Selected: <span className="font-semibold text-white">Item 2 (20kg) + Item 3 (30kg)</span> = exactly 50kg capacity filled.
                </p>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Guarantees 100% global optimum for discrete items.</span>
                </div>
              </div>

              {/* Greedy Outcome */}
              <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Fractional Knapsack (Greedy Ratio)</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-900/60 text-[10px] text-amber-300 font-semibold">Continuous Choice</span>
                </div>
                <div className="text-3xl font-black text-white font-mono">$240 Total Value</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Takes Item 1 ($60) + Item 2 ($100) + 2/3 of Item 3 ($80) = 50kg capacity filled.
                </p>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-amber-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>If forced to take whole items, greedy yields only $160 (sub-optimal!).</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mst' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6 shadow-xl">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-emerald-400" />
                Minimum Spanning Tree: Kruskal's vs. Prim's
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Two greedy paradigms producing identical total weight MSTs through completely different topological traversal orders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kruskal */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Kruskal's Algorithm</span>
                  <span className="text-xs text-slate-400 font-mono">O(E log E)</span>
                </div>
                <div className="text-sm font-semibold text-white">Edge-Centric Forest Merging</div>
                <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                  <li>• Sorts all graph edges globally by ascending weight.</li>
                  <li>• Uses <strong>Disjoint Set Union (DSU)</strong> to check if edge creates a cycle in O(α(V)) time.</li>
                  <li>• Independent disconnected trees merge until exactly V-1 edges are selected.</li>
                  <li className="text-emerald-300 font-medium">• Optimal choice when E &lt;&lt; V² (sparse networks like road maps).</li>
                </ul>
              </div>

              {/* Prim */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Prim's Algorithm</span>
                  <span className="text-xs text-slate-400 font-mono">O(E + V log V)</span>
                </div>
                <div className="text-sm font-semibold text-white">Vertex-Centric Tree Expansion</div>
                <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                  <li>• Starts at a single arbitrary root vertex and grows one connected component.</li>
                  <li>• Uses a <strong>Min-Heap / Priority Queue</strong> to select the cheapest crossing edge.</li>
                  <li>• Never encounters disconnected components during execution.</li>
                  <li className="text-cyan-300 font-medium">• Optimal choice when E ≈ V² (dense networks with numerous interconnects).</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Comparisons & Educational Guide Section */}
      <div className="space-y-6 pt-4 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              Curriculum Study Guide
            </div>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              Why Compare Algorithms? (Core DAA Principles)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              In software engineering and competitive programming, multiple algorithms solve the same problem.
              Comparative telemetry reveals when to pick one over another based on 4 critical engineering dimensions:
            </p>
          </div>
        </div>

        {/* 4 Pillars of Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white">1. Asymptotic Scaling</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              How execution time scales as input N increases from 10 to 1,000,000 items (e.g., O(log N) vs O(N) vs O(N²)).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-violet-950 border border-violet-800/60 text-violet-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white">2. Memory Trade-Offs</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              In-place algorithms with O(1) space versus memory-hungry recursion stacks or dynamic programming tables.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800/60 text-amber-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white">3. Paradigm Fitness</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Understanding whether a problem satisfies the greedy choice property or requires global dynamic programming search.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white">4. Stability & Hardware</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cache locality, CPU branch prediction, and stability (preserving relative order of equal keys).
            </p>
          </div>
        </div>

        {/* Suggested Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {SUGGESTED_COMPARISONS.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${item.tagColor}`}>
                    {item.tag}
                  </span>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Launch Battle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-xs text-violet-300/90 font-medium italic">
                  "{item.keyQuestion}"
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.tradeoffSummary}
                </p>
              </div>

              {/* Metric Matrix Mini-Table */}
              <div className="rounded-xl bg-slate-950/70 border border-slate-800/70 overflow-hidden text-[11px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800/70 text-slate-500 bg-slate-950/40">
                      <th className="py-2 px-3 font-semibold">Metric</th>
                      <th className="py-2 px-3 font-semibold text-slate-300">{item.algorithms[0]}</th>
                      <th className="py-2 px-3 font-semibold text-slate-300">{item.algorithms[1]}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-slate-400">
                    {item.metricComparison.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/30">
                        <td className="py-1.5 px-3 font-medium text-slate-400">{m.label}</td>
                        <td className="py-1.5 px-3 font-mono text-slate-200">{m.a}</td>
                        <td className="py-1.5 px-3 font-mono text-slate-200">{m.b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComparePage;

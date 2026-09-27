import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Play,
  ArrowRight,
  BookOpen,
  GitCompare,
  RefreshCw,
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  Zap,
  Layers,
  Cpu,
  BarChart3,
  Bot,
} from 'lucide-react';
import { modulesApi, algorithmsApi } from '../api/client';
import { useModuleStore } from '../store/moduleStore';
import { useProgressStore } from '../store/progressStore';
import type { Algorithm } from '../types';
import {
  DEFAULT_CURRICULUM_MODULES,
  CURRICULUM_CATEGORIES,
} from '../data/curriculumData';
import { InteractiveHeroStage } from '../components/InteractiveHeroStage';
import { InteractiveRaceTeaser } from '../components/InteractiveRaceTeaser';
import { ScrollProgressIndicator } from '../components/ScrollProgressIndicator';
import { CurriculumRoadmap } from '../components/CurriculumRoadmap';

export const HomePage: React.FC = () => {
  const { modules, setModules } = useModuleStore();
  const { progressMap, fetchProgress, getCompletedCount } = useProgressStore();

  const [loading, setLoading] = useState(modules.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [moduleAlgoMap, setModuleAlgoMap] = useState<Record<number, Algorithm[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('All Modules');
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll animations for hero parallax
  const { scrollY } = useScroll();
  const heroOrbY = useTransform(scrollY, [0, 600], [0, 160]);
  const heroOrbOpacity = useTransform(scrollY, [0, 500], [0.35, 0.05]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    let isMounted = true;
    modulesApi
      .list()
      .then(async (data) => {
        if (!isMounted) return;
        setModules(data);
        setLoading(false);

        // Fetch algorithms per module to compute per-module completion
        const algoMap: Record<number, Algorithm[]> = {};
        for (const m of data) {
          try {
            const algos = await algorithmsApi.list(m.id);
            algoMap[m.id] = algos;
          } catch {
            algoMap[m.id] = [];
          }
        }
        if (isMounted) {
          setModuleAlgoMap(algoMap);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message || 'Failed to connect to backend service');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [setModules]);

  // Merge backend data with rich curriculum metadata
  const enrichedModules = useMemo(() => {
    // If backend has modules, map them or merge with DEFAULT_CURRICULUM_MODULES
    const sourceList = modules.length > 0 ? modules : DEFAULT_CURRICULUM_MODULES;

    return sourceList.map((m) => {
      const meta =
        DEFAULT_CURRICULUM_MODULES.find(
          (d) => d.id === m.id || d.order_index === m.order_index || d.name === m.name
        ) || DEFAULT_CURRICULUM_MODULES[0];

      return {
        id: m.id,
        order_index: m.order_index,
        name: m.name,
        description: m.description || meta.description,
        category: meta.category,
        short_tag: meta.short_tag,
        key_algorithms: meta.key_algorithms,
        time_complexity: meta.time_complexity,
        space_complexity: meta.space_complexity,
        paradigm: meta.paradigm,
        accent: meta.accent,
        highlights: meta.highlights,
      };
    });
  }, [modules]);

  // Filter modules based on category and search query
  const filteredModules = useMemo(() => {
    return enrichedModules.filter((mod) => {
      const matchesCategory =
        selectedCategory === 'All Modules' ||
        mod.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === 'Divide & Conquer' && mod.name.includes('Divide')) ||
        (selectedCategory === 'Dynamic Programming' && mod.name.includes('Dynamic')) ||
        (selectedCategory === 'Greedy' && mod.name.includes('Greedy')) ||
        (selectedCategory === 'Backtracking & Branch' &&
          (mod.name.includes('Backtracking') || mod.name.includes('Branch'))) ||
        (selectedCategory === 'Complexity & NP' &&
          (mod.name.includes('P and NP') || mod.name.includes('NP-Hard')));

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        mod.name.toLowerCase().includes(q) ||
        mod.description.toLowerCase().includes(q) ||
        mod.key_algorithms.some((algo) => algo.toLowerCase().includes(q)) ||
        mod.paradigm.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [enrichedModules, selectedCategory, searchQuery]);

  const totalAlgorithms =
    Object.values(moduleAlgoMap).reduce((sum, algos) => sum + algos.length, 0) || 15;
  const completedCount = getCompletedCount();
  const progressPercent = Math.min(100, Math.round((completedCount / totalAlgorithms) * 100));

  return (
    <div className="space-y-16 sm:space-y-24 relative overflow-hidden pb-12">
      {/* Scroll Progress Bar and Floating Quick Jump */}
      <ScrollProgressIndicator />

      {/* Hero Section Ambient Soft Glow Orbs */}
      <motion.div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-b from-indigo-500/15 via-violet-500/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full"
        style={{ y: heroOrbY, opacity: heroOrbOpacity }}
      />
      <div className="absolute top-80 right-0 w-96 h-96 bg-indigo-500/5 blur-3xl pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-[900px] left-0 w-96 h-96 bg-violet-500/5 blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* 1. HERO SECTION */}
      <section className="text-center max-w-5xl mx-auto pt-6 sm:pt-10 px-2">
        {/* Eyebrow Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-[#0E1322]/90 border border-slate-700/60 text-slate-300 text-xs font-semibold mb-8 shadow-xl backdrop-blur-xl"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>DAA Curriculum Visualizer 2.0</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-400">10 Modules &bull; Real-Time Telemetry</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
        >
          Master Algorithms Through{' '}
          <span className="bg-gradient-to-r from-indigo-200 via-violet-200 to-amber-100 bg-clip-text text-transparent">
            Visual Execution
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl text-slate-300/90 leading-relaxed max-w-3xl mx-auto mb-10 font-normal"
        >
          AlgoLens Pro delivers deep algorithmic insight through frame-by-frame visual execution,
          dynamic memory matrices, dual-algorithm benchmark racing, and complete 10-module DAA curriculum coverage.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <a
            href="#curriculum-modules"
            className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center space-x-2"
          >
            <span>Explore 10 Modules</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="#live-stage"
            className="px-6 py-3.5 rounded-xl bg-[#0E1322]/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all inline-flex items-center space-x-2 hover:border-indigo-500/50 shadow-lg"
          >
            <Play className="w-4 h-4 text-indigo-400" />
            <span>Try Interactive Sandbox</span>
          </a>

          <Link
            to="/compare"
            className="px-6 py-3.5 rounded-xl bg-[#0E1322]/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all inline-flex items-center space-x-2 hover:border-indigo-500/50 shadow-lg"
          >
            <GitCompare className="w-4 h-4 text-amber-400" />
            <span>Algorithm Race Mode</span>
          </Link>
        </motion.div>

        {/* High-Impact Stat Badges */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-2"
        >
          <div className="p-4 rounded-2xl bg-[#0E1322]/80 border border-slate-800/90 backdrop-blur-sm text-left">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">10</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Curriculum Modules</div>
            <div className="text-[10px] text-indigo-400 font-mono mt-0.5">Asymptotic to NP-C</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E1322]/80 border border-slate-800/90 backdrop-blur-sm text-left">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-300">30+</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Interactive Algos</div>
            <div className="text-[10px] text-indigo-400 font-mono mt-0.5">Step-by-step states</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E1322]/80 border border-slate-800/90 backdrop-blur-sm text-left">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300">0 ms</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Scrub Latency</div>
            <div className="text-[10px] text-amber-400 font-mono mt-0.5">Deterministic trace</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0E1322]/80 border border-slate-800/90 backdrop-blur-sm text-left">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Open Classroom Access</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">No login required</div>
          </div>
        </motion.div>
      </section>

      {/* 2. LIVE INTERACTIVE ENGINE SANDBOX */}
      <motion.section
        id="live-stage"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
        className="max-w-5xl mx-auto"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-800/50 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Interactive Demo Sandbox</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Experience Frame-by-Frame Execution
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
            Interact with the live simulator below. Step through Lomuto partitioning in real time with
            comparison highlights and active telemetry.
          </p>
        </div>

        <InteractiveHeroStage />
      </motion.section>

      {/* 3. CURRICULUM MASTERY & LEARNING PROGRESS */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-violet-950/30 border border-slate-800 shadow-xl"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-violet-400 uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Curriculum Mastery Progress</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {completedCount === 0
                ? 'Begin Your Algorithm Journey'
                : `${completedCount} of ${totalAlgorithms} Algorithms Mastered`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Execute visualizations through to the final step or complete quizzes in the Practice Arena to track your mastery.
            </p>
          </div>

          <div className="w-full md:w-80 space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Overall Completion</span>
              <span className="font-mono font-bold text-violet-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progressPercent}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>{completedCount}/{totalAlgorithms} Completed</span>
              <Link to="/practice/1" className="text-violet-400 hover:underline">
                Practice Arena &rarr;
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 4. CURRICULUM MODULES SHOWCASE WITH CATEGORY FILTER & SEARCH */}
      <section id="curriculum-modules" className="pt-2">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-slate-800/80 pb-6"
        >
          <div>
            <div className="inline-flex items-center space-x-2 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              <span>DAA Academic Syllabus</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Curriculum Modules Matrix
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Choose an algorithm domain to step through execution trees, inspect memory graphs, and
              study mathematical complexity proofs.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 w-fit">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span>Showing {filteredModules.length} of 10 Modules</span>
          </div>
        </motion.div>

        {/* Filter Controls: Categories + Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8"
        >
          {/* Category Chips */}
          <div className="flex items-center flex-wrap gap-2">
            {CURRICULUM_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                      : 'bg-[#0E1322]/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search algorithms, paradigms..."
              className="w-full bg-[#0B0F19]/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="p-16 rounded-2xl bg-slate-900/50 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-violet-400 animate-spin" />
            <p className="text-sm text-slate-400">Loading curriculum modules from backend API...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-center flex flex-col items-center justify-center space-y-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <div className="text-amber-200 font-medium">Backend Connection Notice</div>
            <p className="text-xs text-amber-300/80 max-w-md">
              {error} — AlgoLens Pro is running in local fallback mode with full curriculum preview.
            </p>
          </div>
        ) : null}

        {/* Modules Grid with Scroll Stagger */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((mod, index) => {
            const algos = moduleAlgoMap[mod.id] || [];
            const completedInMod = algos.filter((a) => progressMap[a.id]?.completed).length;
            const isModCompleted = algos.length > 0 && completedInMod === algos.length;
            const isInProgress = completedInMod > 0 && !isModCompleted;

            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="h-full"
              >
                <Link
                  to={`/module/${mod.id}`}
                  className="group h-full p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800/80 hover:border-violet-500/60 transition-all flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-violet-600/10"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-violet-950/80 text-violet-300 border border-violet-800/50">
                          Module {mod.order_index}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {mod.paradigm}
                        </span>
                      </div>

                      {isModCompleted ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mastered</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          <span>{completedInMod}/{algos.length}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono group-hover:text-violet-400 transition-colors">
                          Ready &rarr;
                        </span>
                      )}
                    </div>

                    {/* Module Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors mb-2">
                      {mod.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                      {mod.description}
                    </p>

                    {/* Key Algorithms Chips */}
                    <div className="space-y-2 mb-4">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                        Featured Algorithms:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {mod.key_algorithms.slice(0, 3).map((algoName) => (
                          <span
                            key={algoName}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-950/70 text-slate-300 border border-slate-800/80 group-hover:border-slate-700 transition-colors"
                          >
                            {algoName}
                          </span>
                        ))}
                        {mod.key_algorithms.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 text-slate-500">
                            +{mod.key_algorithms.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Complexity & Enter Action */}
                  <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-950/50 text-violet-300 border border-violet-800/40">
                        {mod.time_complexity}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-slate-400 group-hover:text-white font-semibold transition-colors">
                      <span>Launch Stage</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-violet-400" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5. INTERACTIVE RACE ARENA BENCHMARK TEASER */}
      <motion.section
        id="race-arena"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
        className="max-w-5xl mx-auto"
      >
        <InteractiveRaceTeaser />
      </motion.section>

      {/* 6. PLATFORM CAPABILITIES & ENGINE ARCHITECTURE */}
      <section className="pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-800/60 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            <span>Under The Hood</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Deep Algorithmic Intuition
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            AlgoLens Pro replaces static pseudocode with interactive, deterministic state machines,
            deep telemetry, and automated verification.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-violet-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5">
                <Play className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Deterministic Step Engine</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Scrub backward and forward through states with sub-millisecond precision. Inspect
                variables, recursion stacks, and loop invariants at any execution snapshot.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 text-xs font-mono text-violet-400">
              Zero state re-computation
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Real-Time Telemetry</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Observe exact comparison counts, memory array allocations, and execution depth. Verify
                theoretical asymptotic limits against live measured telemetry.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 text-xs font-mono text-indigo-400">
              Live Big-O verification
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Curriculum Tutor</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Ask targeted conceptual questions on recurrence trees, Bellman-Ford negative cycles, or
                Cook-Levin reductions and get verified, mathematically grounded explanations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/60 text-xs font-mono text-cyan-400">
              RAG with DAA knowledge base
            </div>
          </motion.div>
        </div>
      </section>

      {/* 7. DAA CURRICULUM ROADMAP TIMELINE */}
      <section className="pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Learning Pathway</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Curriculum Progression Timeline
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Structured from foundational mathematical asymptotic growth to NP-completeness and
            intractability reductions.
          </p>
        </motion.div>

        <CurriculumRoadmap />
      </section>

      {/* 8. CLASSROOM-READY CALL TO ACTION BANNER */}
      <motion.section
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-violet-950/60 via-slate-900 to-indigo-950/60 border border-violet-800/40 text-center relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-violet-900/60 border border-violet-700/60 text-violet-300 text-xs font-semibold">
            <Zap className="w-4 h-4 text-violet-400" />
            <span>Ready for Lectures, Interviews, and Exams</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Elevate Your Algorithmic Mastery
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Whether preparing for DAA university exams or technical interviews, AlgoLens Pro gives you
            the frame-by-frame clarity you need to master algorithm design.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/module/1"
              className="px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 hover:scale-105 transition-all inline-flex items-center space-x-2"
            >
              <span>Launch Module 1: Algorithm Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/ai-assistant"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition-all inline-flex items-center space-x-2"
            >
              <Bot className="w-4 h-4 text-violet-400" />
              <span>Ask AI Assistant</span>
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;

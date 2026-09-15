import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  PlayCircle,
  RefreshCw,
  Sparkles,
  Video,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { modulesApi, algorithmsApi } from '../api/client';
import { useModuleStore } from '../store/moduleStore';
import { useProgressStore } from '../store/progressStore';
import type { Algorithm, Module } from '../types';
import { ComparisonArena } from '../components/visualizations/Module1/ComparisonArena';
import { MergeSortTree } from '../components/visualizations/Module2';
import { BacktrackingStage } from '../components/visualizations/Module3';
import { FloydWarshallStage } from '../components/visualizations/Module4';
import { KnapsackStage } from '../components/visualizations/Module5';
import { JobSequencingStage } from '../components/visualizations/Module6';
import { KruskalStage } from '../components/visualizations/Module7';
import { BranchBoundStage } from '../components/visualizations/Module8';
import { SatStage } from '../components/visualizations/Module9';
import { GraphColoringStage } from '../components/visualizations/Module10';

// Fallback curated YouTube lecture embeds by algorithm key/name
const YOUTUBE_LECTURE_FALLBACKS: Record<string, string> = {
  'linear search': 'https://www.youtube.com/embed/C46QfTjVCNU',
  'binary search': 'https://www.youtube.com/embed/C46QfTjVCNU',
  'merge sort': 'https://www.youtube.com/embed/jlHkDBEumP0',
  'quick sort': 'https://www.youtube.com/embed/7h1s2SojIRw',
  'n-queens': 'https://www.youtube.com/embed/xFv_Hl4B83A',
  'floyd-warshall': 'https://www.youtube.com/embed/oNI0rf2P9gE',
  '0/1 knapsack': 'https://www.youtube.com/embed/nLmhmB6NzcM',
  'knapsack': 'https://www.youtube.com/embed/nLmhmB6NzcM',
  'job sequencing': 'https://www.youtube.com/embed/zPtI8q9gvX8',
  'kruskal': 'https://www.youtube.com/embed/4ZlRH0eK-qQ',
  'branch and bound': 'https://www.youtube.com/embed/yV1d-b_SkVA',
  'sat': 'https://www.youtube.com/embed/e2UFfcqXA8A',
  'graph coloring': 'https://www.youtube.com/embed/052VkKhIaQ4',
};

function getEmbedUrl(algo: Algorithm | null): string {
  if (!algo) return '';
  if (algo.video_url) {
    // If it's a full watch URL: convert https://www.youtube.com/watch?v=XYZ to embed/XYZ
    if (algo.video_url.includes('watch?v=')) {
      const vid = algo.video_url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${vid}`;
    }
    if (algo.video_url.includes('youtu.be/')) {
      const vid = algo.video_url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${vid}`;
    }
    return algo.video_url;
  }

  const nameLower = algo.name.toLowerCase();
  for (const [key, url] of Object.entries(YOUTUBE_LECTURE_FALLBACKS)) {
    if (nameLower.includes(key)) {
      return url;
    }
  }
  return 'https://www.youtube.com/embed/nLmhmB6NzcM';
}

export const ModulePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const moduleId = id ? parseInt(id, 10) : NaN;

  const { currentModule, currentAlgorithm, setCurrentModule, setCurrentAlgorithm } =
    useModuleStore();
  const { fetchProgress, recordCompletion, isCompleted } = useProgressStore();

  const [moduleData, setModuleData] = useState<Module | null>(currentModule);
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    if (isNaN(moduleId)) {
      setError({ status: 400, message: 'Invalid module ID provided in URL' });
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([modulesApi.getById(moduleId), algorithmsApi.list(moduleId)])
      .then(([mod, algos]) => {
        if (!isMounted) return;
        setModuleData(mod);
        setCurrentModule(mod);
        setAlgorithms(algos);
        if (algos.length > 0) {
          setCurrentAlgorithm(algos[0]);
        } else {
          setCurrentAlgorithm(null);
        }
        setLoading(false);
      })
      .catch((err: { status?: number; message?: string }) => {
        if (!isMounted) return;
        setError({
          status: err.status || 500,
          message:
            err.status === 404
              ? `Module #${moduleId} does not exist.`
              : err.message || 'Failed to fetch module data from backend',
        });
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [moduleId, setCurrentModule, setCurrentAlgorithm]);

  const handleMarkCompleted = async () => {
    if (!currentAlgorithm) return;
    await recordCompletion(currentAlgorithm.id, 100, 60);
    setJustCompleted(true);
    setTimeout(() => setJustCompleted(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="w-10 h-10 text-violet-400 animate-spin" />
        <p className="text-slate-400 text-sm">Loading module details and algorithms...</p>
      </div>
    );
  }

  if (error || !moduleData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">
            {error?.status === 404 ? 'Module Not Found' : 'Error Loading Module'}
          </h2>
          <p className="text-sm text-slate-400">
            {error?.message || `Could not find module with ID ${id}.`}
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Modules Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const isCurrentAlgoCompleted = currentAlgorithm ? isCompleted(currentAlgorithm.id) : false;
  const embedUrl = getEmbedUrl(currentAlgorithm);

  return (
    <div className="space-y-8">
      {/* Back Link & Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-slate-400">
        <Link to="/" className="hover:text-slate-200 inline-flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Modules</span>
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-medium">
          Module {moduleData.order_index}: {moduleData.name}
        </span>
      </div>

      {/* Completion Toast Notification */}
      {justCompleted && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 flex items-center justify-between text-sm shadow-lg shadow-emerald-900/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold">Algorithm Mastered! Progress recorded to your account.</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">+100 XP</span>
        </div>
      )}

      {/* Module Header */}
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-md bg-violet-950/80 text-violet-300 border border-violet-800/60 text-xs font-mono font-semibold">
              Module {moduleData.order_index} of 10
            </span>
            <span className="text-xs text-slate-500 font-medium">DAA Syllabus Focus</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{moduleData.name}</h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed">
          {moduleData.description || 'Foundational algorithm module in academic DAA curriculum.'}
        </p>
      </div>

      {/* Algorithm Selector & Video Toggle */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-violet-400" />
            <span>Curriculum Algorithms</span>
          </h2>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowVideo(!showVideo)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-violet-500/50 text-xs font-medium text-slate-300 hover:text-white inline-flex items-center space-x-1.5 transition-colors"
            >
              <Video className="w-3.5 h-3.5 text-violet-400" />
              <span>{showVideo ? 'Hide Lecture' : 'Video Lecture'}</span>
              {showVideo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <span className="text-xs text-slate-400">
              {algorithms.length} {algorithms.length === 1 ? 'algorithm' : 'algorithms'}
            </span>
          </div>
        </div>

        {algorithms.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-sm text-slate-400">
            No algorithms registered under this module yet.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {algorithms.map((algo) => {
              const isSelected = currentAlgorithm?.id === algo.id;
              const completed = isCompleted(algo.id);
              return (
                <button
                  key={algo.id}
                  type="button"
                  onClick={() => setCurrentAlgorithm(algo)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all inline-flex items-center space-x-2 border focus:outline-none focus:ring-2 focus:ring-violet-400 ${
                    isSelected
                      ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/30'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span>{algo.name}</span>
                  {completed && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-1 shrink-0" aria-label="Completed" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Embedded YouTube Video Lecture Section */}
      {showVideo && embedUrl && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-violet-800/40 space-y-4 animate-in fade-in duration-300 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-sm font-bold text-white">
              <PlayCircle className="w-5 h-5 text-violet-400" />
              <span>Video Lecture: {currentAlgorithm?.name}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">Academic DAA Walkthrough</span>
          </div>

          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
            <iframe
              src={embedUrl}
              title={`Video Lecture - ${currentAlgorithm?.name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Selected Algorithm Details / Complexity Pills & Completion Status */}
      {currentAlgorithm && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-slate-500 block">Selected:</span>
              <span className="font-semibold text-white">{currentAlgorithm.name}</span>
            </div>
            {currentAlgorithm.time_complexity && (
              <div>
                <span className="text-slate-500 block">Time Complexity:</span>
                <span className="font-mono text-violet-300 font-bold">{currentAlgorithm.time_complexity}</span>
              </div>
            )}
            {currentAlgorithm.space_complexity && (
              <div>
                <span className="text-slate-500 block">Space Complexity:</span>
                <span className="font-mono text-sky-300 font-bold">{currentAlgorithm.space_complexity}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isCurrentAlgoCompleted ? (
              <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-semibold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Completed</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleMarkCompleted}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 transition-colors inline-flex items-center space-x-1.5"
                title="Mark this algorithm as completed in your progress record"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Done</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary Workspace: Modules 1-10 Visualizers */}
      {moduleData.id === 1 ? (
        <ComparisonArena />
      ) : moduleData.id === 2 ? (
        <MergeSortTree />
      ) : moduleData.id === 3 ? (
        <BacktrackingStage />
      ) : moduleData.id === 4 ? (
        <FloydWarshallStage />
      ) : moduleData.id === 5 ? (
        <KnapsackStage />
      ) : moduleData.id === 6 ? (
        <JobSequencingStage />
      ) : moduleData.id === 7 ? (
        <KruskalStage />
      ) : moduleData.id === 8 ? (
        <BranchBoundStage />
      ) : moduleData.id === 9 ? (
        <SatStage />
      ) : moduleData.id === 10 ? (
        <GraphColoringStage />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Visualization Area Placeholder */}
          <div className="lg:col-span-3 min-h-[380px] p-8 rounded-2xl bg-slate-900/50 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-950/40 border border-violet-800/40 text-violet-400 flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-white mb-1">Visualization Area</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Interactive visualization canvas with step-by-step playback engine will be
                implemented in subsequent phases for this module.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-mono">
              Module {moduleData.order_index} Stage &bull; Visualization Engine Scheduled
            </div>
          </div>

          {/* Metrics Panel Placeholder */}
          <div className="lg:col-span-1 min-h-[380px] p-6 rounded-2xl bg-slate-900/50 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-400 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Metrics Panel</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Telemetry counters (comparisons, memory allocations, operations) will be connected
                here during visualization engine integration.
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 text-xs font-mono">
              Telemetry Idle
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulePage;

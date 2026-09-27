import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { getLectureForAlgorithm, type VideoLectureInfo } from '../data/videoLectures';

interface Props {
  algorithmName?: string | null;
  moduleId: number;
}

export const AlgorithmVideoLecture: React.FC<Props> = ({ algorithmName, moduleId }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const lecture: VideoLectureInfo = getLectureForAlgorithm(algorithmName, moduleId);

  // Convert embedUrl to watchUrl for the external link
  const watchUrl = lecture.embedUrl.replace('/embed/', '/watch?v=');

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950 border border-slate-800 shadow-xl backdrop-blur-xl overflow-hidden transition-all">
      {/* Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors border-b border-slate-800/80"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500/20 to-red-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Video Lecture: {lecture.title}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/70 border border-rose-800/50 text-rose-300 font-semibold">
                DAA Core
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center space-x-1 text-slate-300 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lecture.educator}</span>
              </span>
              <span>&bull;</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className="font-mono">{lecture.duration}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition-colors"
            title="Open in YouTube"
          >
            <span>YouTube</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>

          <button
            type="button"
            aria-label={isOpen ? 'Collapse video lecture' : 'Expand video lecture'}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 sm:p-6 space-y-4"
          >
            {/* Embedded Video Iframe */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
              <iframe
                src={lecture.embedUrl}
                title={`Video Lecture - ${lecture.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>

            {/* Lecture Summary and Key Concepts */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-2">
              <div className="space-y-1.5 max-w-xl">
                <div className="text-[11px] uppercase font-mono font-semibold text-slate-500 tracking-wider">
                  Lecture Synopsis
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{lecture.description}</p>
              </div>

              <div className="space-y-1.5 sm:max-w-md w-full sm:w-auto">
                <div className="text-[11px] uppercase font-mono font-semibold text-slate-500 tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>Key Concepts Taught</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {lecture.keyTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 border border-slate-800 font-mono"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

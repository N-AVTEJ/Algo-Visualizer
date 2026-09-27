import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowUp, Play, BookOpen, GitCompare } from 'lucide-react';

export const ScrollProgressIndicator: React.FC = () => {
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [showFloatingPill, setShowFloatingPill] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setShowFloatingPill(latest > 400);
    });
  }, [scrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Fixed Scroll Progress Bar with Luxury Gradient */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-200/80 z-50 origin-left shadow-[0_0_10px_rgba(99,102,241,0.35)]"
        style={{ scaleX }}
      />

      {/* Floating Bottom Navigation Pill */}
      {showFloatingPill && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-1.5 p-1.5 rounded-full bg-[#0E1322]/90 border border-slate-700/70 shadow-2xl backdrop-blur-xl text-xs font-medium text-slate-300"
        >
          <a
            href="#live-stage"
            className="px-3 py-1.5 rounded-full hover:bg-slate-800 hover:text-white transition-colors flex items-center space-x-1"
            title="Jump to Interactive Sandbox"
          >
            <Play className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Sandbox</span>
          </a>

          <a
            href="#curriculum-modules"
            className="px-3 py-1.5 rounded-full hover:bg-slate-800 hover:text-white transition-colors flex items-center space-x-1"
            title="Jump to Curriculum Modules"
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">Modules</span>
          </a>

          <a
            href="#race-arena"
            className="px-3 py-1.5 rounded-full hover:bg-slate-800 hover:text-white transition-colors flex items-center space-x-1"
            title="Jump to Benchmark Race"
          >
            <GitCompare className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Race</span>
          </a>

          <div className="w-px h-4 bg-slate-800 mx-0.5" />

          <button
            onClick={scrollToTop}
            className="p-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white transition-all shadow-md shadow-indigo-600/30"
            title="Back to Top"
            aria-label="Back to Top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </>
  );
};

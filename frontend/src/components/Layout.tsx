import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Zap, GitCompare, ChevronDown, Bot } from 'lucide-react';
import { useModuleStore } from '../store/moduleStore';
import { modulesApi } from '../api/client';

export const Layout: React.FC = () => {
  const { modules, setModules } = useModuleStore();
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);

  useEffect(() => {
    // Fetch curriculum modules if not already loaded
    if (modules.length === 0) {
      modulesApi
        .list()
        .then((data) => setModules(data))
        .catch(() => {
          // Backend might not be running yet; fail gracefully
        });
    }
  }, [modules.length, setModules]);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Global Ambient Background Mesh */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_75%_55%_at_50%_-15%,rgba(99,102,241,0.14),rgba(255,255,255,0))]" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-1/3 -left-40 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navigation */}
      <header className="border-b border-slate-800/70 bg-[#0B0F19]/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-indigo-500/40 rounded-xl p-1"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  AlgoLens Pro
                </span>
                <span className="ml-2 text-[10px] tracking-widest uppercase text-indigo-300 font-bold px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800/50">
                  DAA Lab
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1.5">
              {/* Modules Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setModulesDropdownOpen((prev) => !prev)}
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 inline-flex items-center space-x-1.5 focus:outline-none transition-colors"
                >
                  <span>Modules</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {modulesDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#0F1422] border border-slate-800 shadow-2xl py-2 z-50 max-h-96 overflow-y-auto backdrop-blur-xl"
                    onMouseLeave={() => setModulesDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                      Curriculum Modules
                    </div>
                    {modules.length > 0 ? (
                      modules.map((mod) => (
                        <Link
                          key={mod.id}
                          to={`/module/${mod.id}`}
                          onClick={() => setModulesDropdownOpen(false)}
                          className="block px-3.5 py-2 text-xs text-slate-300 hover:text-white hover:bg-indigo-950/40 transition-colors"
                        >
                          <span className="text-indigo-400 font-mono font-semibold mr-2">
                            {mod.order_index}.
                          </span>
                          {mod.name}
                        </Link>
                      ))
                    ) : (
                      <div className="px-3.5 py-3 text-xs text-slate-500">
                        Connect to backend to view modules
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Compare Page Link */}
              <NavLink
                to="/compare"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <GitCompare className="w-4 h-4" />
                <span>Compare</span>
              </NavLink>

              {/* AI Assistant Link */}
              <NavLink
                to="/ai-assistant"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>AI Assistant</span>
              </NavLink>
            </nav>
          </div>

          {/* Open Access Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="hidden sm:inline">Open Access &bull; Full Syllabus</span>
              <span className="sm:hidden">Open Access</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <Outlet />
      </main>

      {/* Modern Refined Footer */}
      <footer className="border-t border-slate-800/70 bg-[#07090F] py-7 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">AlgoLens Pro</span>
            <span>&bull;</span>
            <span>Design & Analysis of Algorithms Visualization Lab</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-500 text-xs">
            <span>Deterministic Step Engine</span>
            <span>&bull;</span>
            <span>Classroom Mode</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

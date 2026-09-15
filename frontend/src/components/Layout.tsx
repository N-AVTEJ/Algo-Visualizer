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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-lg p-1"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-violet-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
                  AlgoLens Pro
                </span>
                <span className="ml-2 text-xs uppercase tracking-wider text-violet-400 font-semibold px-2 py-0.5 rounded-full bg-violet-950/60 border border-violet-800/50">
                  DAA
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-2">
              {/* Modules Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setModulesDropdownOpen((prev) => !prev)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 inline-flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <span>Modules</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {modulesDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 max-h-96 overflow-y-auto"
                    onMouseLeave={() => setModulesDropdownOpen(false)}
                  >
                    <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      Curriculum Modules
                    </div>
                    {modules.length > 0 ? (
                      modules.map((mod) => (
                        <Link
                          key={mod.id}
                          to={`/module/${mod.id}`}
                          onClick={() => setModulesDropdownOpen(false)}
                          className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-violet-950/40 transition-colors"
                        >
                          <span className="text-violet-400 font-mono text-xs mr-2">
                            {mod.order_index}.
                          </span>
                          {mod.name}
                        </Link>
                      ))
                    ) : (
                      <div className="px-3 py-3 text-xs text-slate-500">
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
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
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
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Bot className="w-4 h-4 text-violet-400" />
                <span>AI Assistant</span>
              </NavLink>
            </nav>
          </div>

          {/* Open Access Badge (No login required) */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-xs font-semibold text-emerald-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline">Open Access &bull; No Login Needed</span>
              <span className="sm:hidden">Open Access</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <Outlet />
      </main>

      {/* Projector / Classroom Friendly Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AlgoLens Pro &bull; Design and Analysis of Algorithms (DAA) Visualizer</span>
          <span className="text-slate-600">Classroom & Lecture Mode Active</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

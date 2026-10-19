import React from 'react';
import { Outlet, Link } from 'react-router';
import { Boxes, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Banner / Announcement */}
      <div className="bg-gradient-to-r from-emerald-900/60 via-slate-900 to-cyan-900/60 border-b border-emerald-500/20 py-2 px-4 text-xs text-center font-medium text-emerald-300 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>SmartStock Phase A Foundation Active — Intelligent Inventory for Bangladesh SMEs</span>
        <span className="hidden sm:inline-block bg-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] text-emerald-200 border border-emerald-500/30">
          BDT Currency Ready
        </span>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Boxes className="w-5 h-5 text-slate-950" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight flex items-center gap-1.5">
                Smart<span className="text-emerald-400">Stock</span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 tracking-wider uppercase">
                Inventory Intelligence
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <a href="#features" className="hover:text-emerald-400 transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-emerald-400 transition-colors">
              Architecture
            </a>
            <a href="http://localhost:3000/api/docs" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span>Swagger API</span>
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/app"
              id="cta-enter-app"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SmartStock System — Built for SME Retailers, Wholesalers & Distributors in Bangladesh</span>
          </div>
          <div className="text-slate-400">
            © {new Date().getFullYear()} SmartStock. Phase A Foundation Setup.
          </div>
        </div>
      </footer>
    </div>
  );
};

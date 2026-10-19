import React from 'react';
import { Link } from 'react-router';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  BrainCircuit,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-8 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tailored for Small & Medium Businesses in Bangladesh</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Next-Generation Inventory Intelligence with{' '}
          <span className="text-gradient">AI-Powered Forecasting</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          SmartStock combines high-speed POS operations, automated stock deduction,
          multi-tenant business isolation, and Gemini 2.5 predictive reorder calculations
          all tailored for the Bangladeshi retail market.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/app"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-95"
          >
            <span>Launch Dashboard Shell</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="http://localhost:3000/api/docs"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-colors border border-slate-700"
          >
            <span>Explore Swagger API</span>
          </a>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">BDT Poysha Precision</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              PostgreSQL Decimal(14,2) currency calculations ensuring exact financial audit trails
              without floating-point penny rounding errors.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">Gemini 2.5 Flash Advisory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated reorder point forecasting combining deterministic safety stock algorithms
              with natural language contextual explanations.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">Multi-Tenant Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every query and transaction is strictly scoped by <code className="text-purple-300">businessId</code>,
              enabling multi-shop operations with complete data security.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Specs Section */}
      <section id="architecture" className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Engineered with Modern Performance
          </h2>
          <p className="text-xs text-slate-400">
            Phase A Foundation verified with zero deprecated libraries
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Backend Core</span>
              <p className="text-sm font-bold text-emerald-400">NestJS 11 + Fastify 5</p>
              <p className="text-[11px] text-slate-400">Blazing fast HTTP adapter</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Database & ORM</span>
              <p className="text-sm font-bold text-emerald-400">PostgreSQL + Prisma 6</p>
              <p className="text-[11px] text-slate-400">16 relational models</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Frontend Foundation</span>
              <p className="text-sm font-bold text-cyan-400">React 19 + Vite 6</p>
              <p className="text-[11px] text-slate-400">Tailwind CSS v4 styling</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Server State</span>
              <p className="text-sm font-bold text-cyan-400">TanStack Query v5</p>
              <p className="text-[11px] text-slate-400">Optimistic UI & caching</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/api-client';
import {
  Activity,
  CheckCircle2,
  Clock,
  Server,
  Database,
  ShieldAlert,
  Boxes,
  Layers,
  Sparkles,
} from 'lucide-react';

interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
}

export const DashboardShellPage: React.FC = () => {
  const { data: health, isLoading, isError, refetch } = useQuery<HealthResponse>({
    queryKey: ['system-health'],
    queryFn: () => apiRequest<HealthResponse>('/health'),
    retry: 1,
    refetchInterval: 10000,
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Workspace Overview</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Phase A Foundation
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Core layout, routing, TanStack Query, and Fastify adapter live status.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Refresh System Probe</span>
        </button>
      </div>

      {/* Backend Health Status Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Backend Health Check Probe (Fastify Adapter)</span>
        </h2>

        {isLoading ? (
          <div className="flex items-center gap-3 py-4 text-slate-400 text-sm">
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span>Pinging http://localhost:3000/api/health...</span>
          </div>
        ) : isError ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-amber-300">Backend Server Offline or Unreachable</p>
              <p className="text-slate-300">
                Run <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-200">npm run start:dev</code> inside the <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-200">backend/</code> directory to start the Fastify server on port 3000.
              </p>
            </div>
          </div>
        ) : health ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Status</span>
              <p className="text-base font-bold text-emerald-400 capitalize flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{health.status}</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Service</span>
              <p className="text-sm font-semibold text-slate-200 mt-0.5 truncate">{health.service}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Uptime</span>
              <p className="text-sm font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{health.uptime}s</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Version</span>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">v{health.version}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Implementation Roadmap */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Implementation Phase Alignment</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-300">Phase A: Foundation Setup (Active)</p>
              <p className="text-slate-300 mt-0.5">
                NestJS Fastify bootstrap, React 19 Vite scaffold, Tailwind v4 styling, separate Public/Dashboard layouts.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 opacity-75">
            <Database className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-300">Phase B: Database & Seeding (Next)</p>
              <p className="text-slate-400 mt-0.5">
                Prisma migration, PostgreSQL schema sync, seed script with realistic Bangladeshi product categories and poysha pricing.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 opacity-75">
            <Boxes className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-300">Phases C–E: Business Operations</p>
              <p className="text-slate-400 mt-0.5">
                Authentication, Role Guards (OWNER, STAFF, ACCOUNTANT), Products, Stock Movements, POS Sales & Purchases.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 opacity-75">
            <Sparkles className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-300">Phase F: AI Advisor & Analytics</p>
              <p className="text-slate-400 mt-0.5">
                Deterministic safety stock formulas + Gemini 2.5 natural language reorder recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

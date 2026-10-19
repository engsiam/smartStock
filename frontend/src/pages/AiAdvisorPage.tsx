import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { apiRequest } from '../lib/api-client';
import { formatBDT } from '../lib/formatters';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Truck,
  Globe,
} from 'lucide-react';

interface RecommendationItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  leadTimeDays: number;
  dailyVelocity: number;
  leadTimeDemand: number;
  safetyStock: number;
  reorderPoint: number;
  recommendedOrderQty: number;
  unitCost: number;
  estimatedCost: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  suggestedSupplier?: { id: string; name: string };
}

interface RecommendationsResponse {
  language: 'en' | 'bn';
  generatedAt: string;
  healthSummary: {
    totalSkus: number;
    lowStockCount: number;
    outOfStockCount: number;
    estimatedRestockCost: number;
  };
  recommendations: RecommendationItem[];
}

export const AiAdvisorPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useQuery<RecommendationsResponse>({
    queryKey: ['ai-recommendations', language],
    queryFn: () => apiRequest<RecommendationsResponse>(`/ai-advisor/recommendations?language=${language}`),
  });

  // 1-Click PO Mutation
  const createPoMutation = useMutation({
    mutationFn: (item: RecommendationItem) =>
      apiRequest('/purchases', {
        method: 'POST',
        body: JSON.stringify({
          supplierId: item.suggestedSupplier?.id,
          expectedDate: new Date(Date.now() + item.leadTimeDays * 86400000).toISOString().split('T')[0],
          items: [
            {
              productId: item.productId,
              quantity: item.recommendedOrderQty,
              unitCost: item.unitCost,
            },
          ],
        }),
      }),
    onSuccess: () => {
      setSuccessMsg('Purchase order drafted successfully! Redirecting to Purchases...');
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      setTimeout(() => {
        navigate('/app/purchases');
      }, 1500);
    },
  });

  const recommendations = data?.recommendations || [];
  const health = data?.healthSummary;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-purple-400" />
            <span>AI Reorder Advisor &amp; Demand Forecasting</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic safety-stock formulas paired with Gemini 2.5 natural language restock explanations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                language === 'en'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                language === 'bn'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলা (Bangla)
            </button>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Recalculate Demand</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Catalog Health</span>
          <p className="text-xl font-bold text-white mt-1">
            {health?.totalSkus ?? 0} <span className="text-xs font-normal text-slate-400">Total SKUs</span>
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Attention Needed</span>
          <p className="text-xl font-bold text-amber-400 mt-1">
            {health?.lowStockCount ?? 0} <span className="text-xs font-normal text-slate-400">Low Stock</span>
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Stockout Urgency</span>
          <p className="text-xl font-bold text-red-400 mt-1">
            {health?.outOfStockCount ?? 0} <span className="text-xs font-normal text-slate-400">Out of Stock</span>
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Est. Restock Budget</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">
            {formatBDT(health?.estimatedRestockCost)}
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Smart Restock Advice ({recommendations.length} Items)</span>
          </h2>
          <span className="text-[11px] text-slate-400">
            Formulas: Lead-time demand + 50% Safety buffer
          </span>
        </div>

        {isLoading ? (
          <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 border border-slate-800">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">Analyzing 30-day velocity metrics...</p>
            <p className="text-xs text-slate-500 mt-1">Consulting Gemini intelligence engine...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 border border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-white">No Items Require Restocking</h4>
            <p className="text-xs text-slate-500 mt-1">
              All inventory levels are above their calculated safety stock threshold.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((item) => {
              const isCritical = item.priority === 'CRITICAL';
              const isHigh = item.priority === 'HIGH';

              return (
                <div
                  key={item.productId}
                  className={`glass-panel rounded-2xl p-5 border transition-all ${
                    isCritical
                      ? 'border-red-500/40 bg-red-950/10'
                      : isHigh
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : 'border-slate-800 bg-slate-900/40'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Item identification */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                            isCritical
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : isHigh
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {item.priority} PRIORITY
                        </span>
                        <span className="text-xs font-mono text-slate-400">{item.sku}</span>
                      </div>

                      <h3 className="text-base font-bold text-white">{item.productName}</h3>

                      {/* AI Natural language advice */}
                      <p className="text-xs text-purple-200/90 pt-1 flex items-start gap-2 bg-purple-950/30 p-2.5 rounded-xl border border-purple-500/20">
                        <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                        <span>{item.explanation}</span>
                      </p>
                    </div>

                    {/* Math breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400">Current Stock</span>
                        <p className={`font-bold ${item.currentStock === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                          {item.currentStock} {item.unit}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400">Daily Demand</span>
                        <p className="font-bold text-slate-200">
                          {item.dailyVelocity.toFixed(1)} / day
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400">Lead Time</span>
                        <p className="font-bold text-slate-200">{item.leadTimeDays} days</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400">Safety Buffer</span>
                        <p className="font-bold text-cyan-300">+{item.safetyStock} {item.unit}</p>
                      </div>
                    </div>

                    {/* Order action */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400">Recommended Order</span>
                        <p className="text-base font-bold text-emerald-400">
                          +{item.recommendedOrderQty} {item.unit}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Cost: <span className="text-white font-medium">{formatBDT(item.estimatedCost)}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => createPoMutation.mutate(item)}
                        disabled={createPoMutation.isPending}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>1-Click Create PO</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

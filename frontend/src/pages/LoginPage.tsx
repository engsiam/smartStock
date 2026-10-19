import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Boxes, ShieldCheck, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    }
  };

  const handleQuick = async (role: 'OWNER' | 'STAFF' | 'ACCOUNTANT') => {
    setErrorMsg(null);
    try {
      await quickLogin(role);
      navigate('/app');
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30 mb-2">
            <Boxes className="w-6 h-6 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Smart<span className="text-emerald-400">Stock</span> Workspace
          </h1>
          <p className="text-xs text-slate-400">
            Intelligent Inventory & POS for Bangladeshi Retail & Wholesale
          </p>
        </div>

        {/* Quick Demo Personas Card */}
        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>One-Click Demo Personas</span>
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
              Seeded Accounts
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleQuick('OWNER')}
              disabled={isLoading}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-emerald-500/15 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                  👑
                </div>
                <div>
                  <p className="text-xs font-semibold text-white group-hover:text-emerald-300">
                    Siam Ahmed (Owner)
                  </p>
                  <p className="text-[10px] text-slate-400">Full Access • Dhaka Grocery Store</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => handleQuick('STAFF')}
              disabled={isLoading}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-amber-500/15 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                  🧑‍💼
                </div>
                <div>
                  <p className="text-xs font-semibold text-white group-hover:text-amber-300">
                    Karim Ullah (Staff)
                  </p>
                  <p className="text-[10px] text-slate-400">POS Sales & Stock In • Daily Operations</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => handleQuick('ACCOUNTANT')}
              disabled={isLoading}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 hover:bg-blue-500/15 border border-slate-800 hover:border-blue-500/40 text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs">
                  📊
                </div>
                <div>
                  <p className="text-xs font-semibold text-white group-hover:text-blue-300">
                    Nasreen Sultana (Accountant)
                  </p>
                  <p className="text-[10px] text-slate-400">Financial Reports & Auditing Access</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Standard Credentials Form */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. owner@smartstock.local"
                  required
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to SmartStock</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Role-Based Tenancy & Argon2id Encrypted Session</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { getRoleBadgeClass } from '../lib/formatters';
import {
  Boxes,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  BrainCircuit,
  Settings,
  Menu,
  X,
  Building2,
  LogOut,
  ChevronDown,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/app', icon: LayoutDashboard },
  { name: 'Inventory', path: '/app/inventory', icon: Package },
  { name: 'Sales & POS', path: '/app/sales', icon: ShoppingCart },
  { name: 'Purchases', path: '/app/purchases', icon: Truck },
  { name: 'AI Reorder Advisor', path: '/app/ai-advisor', icon: BrainCircuit },
  { name: 'Settings', path: '/app/settings', icon: Settings },
];

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, business, quickLogin, logout } = useAuth();

  const handleRoleSwitch = async (role: 'OWNER' | 'STAFF' | 'ACCOUNTANT') => {
    setRoleMenuOpen(false);
    await quickLogin(role);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentNav =
    NAV_ITEMS.find((item) =>
      item.path === '/app'
        ? location.pathname === '/app'
        : location.pathname.startsWith(item.path),
    )?.name || 'Dashboard Overview';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Boxes className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              Smart<span className="text-emerald-400">Stock</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business & Active User Selector Pill */}
        <div className="p-4 relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="w-full p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-left transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-200 truncate">
                  {business?.name || 'Dhaka Grocery & General Store'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${getRoleBadgeClass(
                      user?.role || 'OWNER',
                    )}`}
                  >
                    {user?.role || 'OWNER'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
          </button>

          {/* Quick Role Switch Dropdown */}
          {roleMenuOpen && (
            <div className="absolute top-full left-4 right-4 z-50 mt-1 rounded-xl bg-slate-900 border border-slate-700 p-2 shadow-2xl space-y-1 text-xs">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Switch Demo Persona
              </p>
              <button
                onClick={() => handleRoleSwitch('OWNER')}
                className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors ${
                  user?.role === 'OWNER'
                    ? 'bg-purple-600/20 text-purple-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>👑 Siam Ahmed (Owner)</span>
                {user?.role === 'OWNER' && <span className="text-[10px]">Active</span>}
              </button>
              <button
                onClick={() => handleRoleSwitch('STAFF')}
                className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors ${
                  user?.role === 'STAFF'
                    ? 'bg-amber-600/20 text-amber-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>🧑‍💼 Karim Ullah (Staff)</span>
                {user?.role === 'STAFF' && <span className="text-[10px]">Active</span>}
              </button>
              <button
                onClick={() => handleRoleSwitch('ACCOUNTANT')}
                className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors ${
                  user?.role === 'ACCOUNTANT'
                    ? 'bg-blue-600/20 text-blue-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>📊 Nasreen Sultana (Accountant)</span>
                {user?.role === 'ACCOUNTANT' && <span className="text-[10px]">Active</span>}
              </button>
              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/app'
                ? location.pathname === '/app'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}
                  />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Fastify API: Active</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">BDT (৳)</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 glass-panel border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="hidden sm:inline">SmartStock Workspace</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-slate-100 font-semibold">{currentNav}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>PostgreSQL Live Sync</span>
            </div>

            <Link
              to="/app/ai-advisor"
              className="p-2 rounded-lg text-purple-400 hover:bg-purple-500/10 relative transition-colors"
              title="AI Advisor"
            >
              <BrainCircuit className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-300 hover:scale-105 transition-transform"
              title="Persona & Account"
            >
              {user?.name
                ? user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'SM'}
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

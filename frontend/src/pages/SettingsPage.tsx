import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api-client';
import { formatDate, getRoleBadgeClass } from '../lib/formatters';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Building2,
  Users,
  UserCheck,
  Plus,
  Save,
  CheckCircle2,
  X,
} from 'lucide-react';

interface TeamMember {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, business, quickLogin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'TEAM' | 'CUSTOMERS'>('PROFILE');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Business form
  const [bizName, setBizName] = useState(business?.name || 'Dhaka Grocery & General Store');
  const [legalType, setLegalType] = useState('SME Retailer / Wholesaler');

  // Customer modal
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  // Fetch Team Members
  const { data: teamData, isLoading: loadingTeam } = useQuery<TeamMember[] | { data: TeamMember[] }>({
    queryKey: ['business-team'],
    queryFn: () => apiRequest<any>('/business/members'),
  });
  const team: TeamMember[] = Array.isArray(teamData) ? teamData : (teamData as any)?.data || [];

  // Fetch Customers
  const { data: customersData, isLoading: loadingCustomers } = useQuery<
    Customer[] | { data: Customer[] }
  >({
    queryKey: ['customers'],
    queryFn: () => apiRequest<any>('/business/customers'),
  });
  const customers: Customer[] = Array.isArray(customersData)
    ? customersData
    : (customersData as any)?.data || [];

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (body: any) =>
      apiRequest('/business/current', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      setSuccessMsg('Business profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['business-profile'] });
      setTimeout(() => setSuccessMsg(null), 3000);
    },
  });

  // Add Customer Mutation
  const addCustomerMutation = useMutation({
    mutationFn: (body: any) =>
      apiRequest('/business/customers', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsAddCustomerOpen(false);
      setNewCustomer({ name: '', phone: '', email: '', address: '' });
      setSuccessMsg('Customer added successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      name: bizName,
      legalType,
    });
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomerMutation.mutate(newCustomer);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-400" />
            <span>Workspace Settings &amp; Tenancy</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your shop profile, team memberships, customer book, and demo role switching.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'PROFILE'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Business Profile
          </button>
          <button
            onClick={() => setActiveTab('TEAM')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'TEAM'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Team &amp; Roles
          </button>
          <button
            onClick={() => setActiveTab('CUSTOMERS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'CUSTOMERS'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Customers
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Quick Role Switcher Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 bg-emerald-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Active Persona:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] border ${getRoleBadgeClass(user?.role || 'OWNER')}`}>
                {user?.role} — {user?.name}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Switch roles with 1-click to test Role-Based Access Control (RBAC).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => quickLogin('OWNER')}
            disabled={authLoading}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              user?.role === 'OWNER'
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            👑 Owner
          </button>
          <button
            onClick={() => quickLogin('STAFF')}
            disabled={authLoading}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              user?.role === 'STAFF'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            🧑‍💼 Staff
          </button>
          <button
            onClick={() => quickLogin('ACCOUNTANT')}
            disabled={authLoading}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              user?.role === 'ACCOUNTANT'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            📊 Accountant
          </button>
        </div>
      </div>

      {activeTab === 'PROFILE' && (
        /* BUSINESS PROFILE TAB */
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Business Information</h3>
              <p className="text-xs text-slate-400">Settings and operational parameters for your business</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Shop / Business Trade Name
              </label>
              <input
                type="text"
                required
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Primary Currency
                </label>
                <input
                  type="text"
                  disabled
                  value="BDT (Bangladeshi Taka ৳)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Timezone
                </label>
                <input
                  type="text"
                  disabled
                  value="Asia/Dhaka (UTC+6)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Business Legal Classification
              </label>
              <input
                type="text"
                value={legalType}
                onChange={(e) => setLegalType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'TEAM' && (
        /* TEAM & ROLES TAB */
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Active Team Members</span>
              </h3>
              <p className="text-xs text-slate-400">Users who have access to this store instance</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loadingTeam ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      Loading team members...
                    </td>
                  </tr>
                ) : team.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No members found.
                    </td>
                  </tr>
                ) : (
                  team.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-900/50">
                      <td className="py-3 px-4 font-semibold text-white">{m.user?.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{m.user?.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeClass(m.role)}`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{formatDate(m.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CUSTOMERS' && (
        /* CUSTOMERS DIRECTORY TAB */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">Customer contacts and credit accounts for wholesale buyers</p>
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Address</th>
                    <th className="py-3 px-4">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loadingCustomers ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Loading customers...
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No customers recorded yet.
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-900/50">
                        <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                        <td className="py-3 px-4 text-slate-300 font-mono">{c.phone || '-'}</td>
                        <td className="py-3 px-4 text-slate-400">{c.email || '-'}</td>
                        <td className="py-3 px-4 text-slate-400">{c.address || '-'}</td>
                        <td className="py-3 px-4 text-slate-500">{formatDate(c.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Customer */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Add Customer Account</span>
              </h3>
              <button
                onClick={() => setIsAddCustomerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomerSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Customer / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahim Store (Chittagong)"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+880 1711-223344"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="buyer@domain.com"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. Khatunganj, Chittagong"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addCustomerMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  {addCustomerMutation.isPending ? 'Saving...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api-client';
import { formatBDT, formatDate } from '../lib/formatters';
import {
  Truck,
  Plus,
  CheckCircle2,
  X,
  PackageCheck,
  Building,
  AlertCircle,
  Ban,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  stockQty: number;
  unit: string;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  status: 'DRAFT' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
  expectedDate?: string;
  receivedDate?: string;
  createdAt: string;
  supplier: { id: string; name: string };
  items: Array<{
    id: string;
    product: { id: string; name: string; sku: string; unit: string };
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
}

export const PurchasesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SUPPLIERS'>('ORDERS');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isCreatePoOpen, setIsCreatePoOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [receivingOrder, setReceivingOrder] = useState<PurchaseOrder | null>(null);

  // New PO Form state
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [poItems, setPoItems] = useState<
    Array<{ productId: string; quantity: number; unitCost: number }>
  >([]);

  // Receive Form state
  const [receivePaymentMethod, setReceivePaymentMethod] = useState('BANK_TRANSFER');
  const [receiveAmountPaid, setReceiveAmountPaid] = useState('');

  // New Supplier Form state
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
  });

  // Fetch Suppliers
  const { data: suppliersData, isLoading: loadingSuppliers } = useQuery<
    Supplier[] | { data: Supplier[] }
  >({
    queryKey: ['suppliers'],
    queryFn: () => apiRequest<any>('/purchases/suppliers'),
  });
  const suppliers: Supplier[] = Array.isArray(suppliersData)
    ? suppliersData
    : (suppliersData as any)?.data || [];

  // Fetch Products for PO item selector
  const { data: productsData } = useQuery<{ data: Product[] }>({
    queryKey: ['products-for-po'],
    queryFn: () => apiRequest<{ data: Product[] }>('/products'),
  });
  const products = productsData?.data || [];

  // Fetch Purchase Orders
  const { data: ordersData, isLoading: loadingOrders } = useQuery<
    PurchaseOrder[] | { data: PurchaseOrder[] }
  >({
    queryKey: ['purchase-orders', statusFilter],
    queryFn: () => {
      const url =
        statusFilter === 'ALL'
          ? '/purchases'
          : `/purchases?status=${statusFilter}`;
      return apiRequest<any>(url);
    },
  });
  const orders: PurchaseOrder[] = Array.isArray(ordersData)
    ? ordersData
    : (ordersData as any)?.data || [];

  // Create PO Mutation
  const createPoMutation = useMutation({
    mutationFn: (body: any) =>
      apiRequest('/purchases', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      setIsCreatePoOpen(false);
      setSelectedSupplierId('');
      setExpectedDate('');
      setPoItems([]);
    },
  });

  // Receive PO Mutation
  const receivePoMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      apiRequest(`/purchases/${id}/receive`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] });
      setReceivingOrder(null);
    },
  });

  // Cancel PO Mutation
  const cancelPoMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/purchases/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Cancelled by inventory manager' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
    },
  });

  // Create Supplier Mutation
  const createSupplierMutation = useMutation({
    mutationFn: (body: any) =>
      apiRequest('/purchases/suppliers', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsAddSupplierOpen(false);
      setNewSupplier({ name: '', contactPerson: '', phone: '', email: '', address: '' });
    },
  });

  const addItemToPo = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    setPoItems((prev) => [
      ...prev,
      { productId: prod.id, quantity: 20, unitCost: prod.costPrice },
    ]);
  };

  const updatePoItem = (index: number, field: 'quantity' | 'unitCost', value: number) => {
    setPoItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    );
  };

  const removePoItem = (index: number) => {
    setPoItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCreatePoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || poItems.length === 0) return;
    createPoMutation.mutate({
      supplierId: selectedSupplierId,
      expectedDate: expectedDate || undefined,
      items: poItems,
    });
  };

  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivingOrder) return;
    receivePoMutation.mutate({
      id: receivingOrder.id,
      body: {
        paymentMethod: receivePaymentMethod,
        amountPaid: receiveAmountPaid ? parseFloat(receiveAmountPaid) : receivingOrder.totalAmount,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-400" />
            <span>Purchases &amp; Suppliers</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supplier purchase orders, atomic inventory receiving, and weighted average cost tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switch */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ORDERS'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Purchase Orders
            </button>
            <button
              onClick={() => setActiveTab('SUPPLIERS')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'SUPPLIERS'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Suppliers Directory
            </button>
          </div>

          {activeTab === 'ORDERS' ? (
            <button
              onClick={() => setIsCreatePoOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddSupplierOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'ORDERS' ? (
        /* PURCHASE ORDERS TAB */
        <div className="space-y-4">
          {/* Status filter bar */}
          <div className="glass-panel rounded-2xl p-3 border border-slate-800 flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium pl-2">Filter Status:</span>
            {['ALL', 'DRAFT', 'RECEIVED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  statusFilter === st
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All Orders' : st}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Items / SKUs</th>
                    <th className="py-3 px-4">Order Date</th>
                    <th className="py-3 px-4">Total Amount (BDT)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loadingOrders ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading purchase orders...</span>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No purchase orders found. Create a new purchase order above.
                      </td>
                    </tr>
                  ) : (
                    orders.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {po.orderNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-200 font-medium">
                          {po.supplier?.name}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {po.items?.length || 0} items
                          <span className="text-slate-500 block text-[10px] truncate max-w-xs">
                            {po.items?.map((i) => `${i.product.name} (${i.quantity})`).join(', ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{formatDate(po.createdAt)}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">
                          {formatBDT(po.totalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          {po.status === 'RECEIVED' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Received</span>
                            </span>
                          ) : po.status === 'DRAFT' ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-1 w-max">
                              <AlertCircle className="w-3 h-3" />
                              <span>Draft Pending</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-semibold flex items-center gap-1 w-max">
                              <Ban className="w-3 h-3" />
                              <span>Cancelled</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {po.status === 'DRAFT' && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setReceivingOrder(po)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1"
                              >
                                <PackageCheck className="w-3.5 h-3.5" />
                                <span>Receive Stock</span>
                              </button>
                              <button
                                onClick={() => cancelPoMutation.mutate(po.id)}
                                title="Cancel PO"
                                className="p-1 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                          {po.status === 'RECEIVED' && (
                            <span className="text-[11px] text-slate-500 italic">
                              Received {formatDate(po.receivedDate)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* SUPPLIERS DIRECTORY TAB */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loadingSuppliers ? (
            <div className="col-span-3 py-8 text-center text-slate-500">
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Loading suppliers...</span>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="col-span-3 py-8 text-center text-slate-500">
              No suppliers added yet. Click &quot;Add Supplier&quot; to begin.
            </div>
          ) : (
            suppliers.map((sup) => (
              <div
                key={sup.id}
                className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{sup.name}</h4>
                    {sup.contactPerson && (
                      <p className="text-xs text-slate-400 truncate">{sup.contactPerson}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  {sup.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-300 font-mono">{sup.phone}</span>
                    </div>
                  )}
                  {sup.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-300 truncate">{sup.email}</span>
                    </div>
                  )}
                  {sup.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-300 truncate">{sup.address}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedSupplierId(sup.id);
                    setIsCreatePoOpen(true);
                  }}
                  className="w-full mt-2 py-2 rounded-xl bg-slate-900 hover:bg-emerald-500/15 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 hover:text-emerald-300 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Issue Purchase Order</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL 1: Create Purchase Order */}
      {isCreatePoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 border border-slate-700 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                <span>Issue New Purchase Order</span>
              </h3>
              <button
                onClick={() => setIsCreatePoOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Select Supplier *
                  </label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Choose Supplier...</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Add item dropdown */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Add Item from Catalog
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addItemToPo(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">+ Click to add item to PO...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Cost: {formatBDT(p.costPrice)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected PO Items */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Ordered Line Items ({poItems.length})
                </label>
                {poItems.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
                    No products added to this PO yet.
                  </div>
                ) : (
                  poItems.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId);
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3 text-xs"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-white">{prod?.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{prod?.sku}</p>
                        </div>

                        <div className="w-24">
                          <label className="block text-[10px] text-slate-400">Qty ({prod?.unit})</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updatePoItem(idx, 'quantity', parseInt(e.target.value, 10) || 1)
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white text-right"
                          />
                        </div>

                        <div className="w-28">
                          <label className="block text-[10px] text-slate-400">Unit Cost (৳)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) =>
                              updatePoItem(idx, 'unitCost', parseFloat(e.target.value) || 0)
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white text-right"
                          />
                        </div>

                        <div className="w-28 text-right font-bold text-emerald-400">
                          {formatBDT(item.quantity * item.unitCost)}
                        </div>

                        <button
                          type="button"
                          onClick={() => removePoItem(idx)}
                          className="p-1 rounded text-red-400 hover:bg-red-500/20"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* PO Total */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-sm font-bold text-white">
                <span>Total PO Valuation:</span>
                <span className="text-emerald-400 text-base">
                  {formatBDT(
                    poItems.reduce((acc, item) => acc + item.quantity * item.unitCost, 0),
                  )}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatePoOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPoMutation.isPending || poItems.length === 0}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-40"
                >
                  {createPoMutation.isPending ? 'Issuing...' : 'Issue Purchase Order (Draft)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Receive Goods Confirmation */}
      {receivingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-400" />
                <span>Confirm Goods Receiving</span>
              </h3>
              <button
                onClick={() => setReceivingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p>
                Receiving PO <span className="font-mono font-bold text-white">{receivingOrder.orderNumber}</span> from <span className="font-bold text-white">{receivingOrder.supplier?.name}</span> will:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Atomically increment inventory quantity for all {receivingOrder.items.length} items.</li>
                <li>Recalculate moving weighted-average cost price.</li>
                <li>Create an audit trail with type <code className="text-emerald-300">PURCHASE_RECEIVE</code>.</li>
              </ul>
            </div>

            <form onSubmit={handleReceiveSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Supplier Payment Method
                </label>
                <select
                  value={receivePaymentMethod}
                  onChange={(e) => setReceivePaymentMethod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (EFT/BEFTN)</option>
                  <option value="CASH">Cash Payment</option>
                  <option value="BKASH">bKash Merchant</option>
                  <option value="CREDIT">Supplier Credit (Pay Later)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Amount Paid to Supplier (৳)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={receivingOrder.totalAmount.toString()}
                  value={receiveAmountPaid}
                  onChange={(e) => setReceiveAmountPaid(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReceivingOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={receivePoMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  {receivePoMutation.isPending ? 'Receiving...' : 'Confirm Stock Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Supplier */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-400" />
                <span>Add New Supplier</span>
              </h3>
              <button
                onClick={() => setIsAddSupplierOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createSupplierMutation.mutate(newSupplier);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meghna Group of Industries"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rafiqul Islam (Territory Manager)"
                  value={newSupplier.contactPerson}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, contactPerson: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+880 1819-000000"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="sales@supplier.com"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. Tejgaon I/A, Dhaka-1208"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSupplierMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  {createSupplierMutation.isPending ? 'Saving...' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

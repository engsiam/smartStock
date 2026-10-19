import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api-client';
import { formatBDT, formatDate } from '../lib/formatters';
import {
  Package,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  History,
  AlertTriangle,
  CheckCircle2,
  X,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  category?: Category;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
  reorderLevel: number;
  leadTimeDays: number;
  location?: string;
  isLowStock?: boolean;
}

interface StockMovement {
  id: string;
  productId: string;
  product?: { name: string; sku: string };
  type: string;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  reason?: string;
  notes?: string;
  createdAt: string;
}

export const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);

  // Add Product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    unit: 'pcs',
    costPrice: '',
    sellingPrice: '',
    stockQty: '0',
    reorderLevel: '10',
    leadTimeDays: '3',
    location: 'Main Shelf A',
  });

  // Adjust Stock form state
  const [adjustType, setAdjustType] = useState<'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT'>('ADJUSTMENT_IN');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Found inventory in warehouse audit');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Fetch categories
  const { data: categoriesData } = useQuery<Category[] | { data: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => apiRequest<any>('/categories'),
  });
  const categories: Category[] = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData?.data || [];

  // Fetch products
  const { data: productsData, isLoading } = useQuery<{ data: Product[] }>({
    queryKey: ['products', searchTerm, selectedCategory, showLowStockOnly],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'ALL') params.append('categoryId', selectedCategory);
      if (showLowStockOnly) params.append('lowStockOnly', 'true');
      return apiRequest<{ data: Product[] }>(`/products?${params.toString()}`);
    },
  });
  const products = productsData?.data || [];

  // Fetch history for selected product
  const { data: movementsData, isLoading: loadingHistory } = useQuery<{ data: StockMovement[] }>({
    queryKey: ['stock-movements', historyProduct?.id],
    queryFn: () =>
      historyProduct
        ? apiRequest<{ data: StockMovement[] }>(`/products/${historyProduct.id}/movements`)
        : Promise.resolve({ data: [] }),
    enabled: !!historyProduct,
  });
  const movements = movementsData?.data || [];

  // Create Product Mutation
  const createProductMutation = useMutation({
    mutationFn: (body: any) =>
      apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] });
      setIsAddModalOpen(false);
      setNewProduct({
        name: '',
        sku: '',
        barcode: '',
        categoryId: '',
        unit: 'pcs',
        costPrice: '',
        sellingPrice: '',
        stockQty: '0',
        reorderLevel: '10',
        leadTimeDays: '3',
        location: 'Main Shelf A',
      });
    },
  });

  // Adjust Stock Mutation
  const adjustStockMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) =>
      apiRequest(`/products/${id}/adjust-stock`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] });
      setAdjustingProduct(null);
      setAdjustQty('');
      setAdjustNotes('');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProductMutation.mutate({
      name: newProduct.name.trim(),
      sku: newProduct.sku.trim(),
      barcode: newProduct.barcode?.trim() || undefined,
      categoryId: newProduct.categoryId && newProduct.categoryId.trim() !== '' ? newProduct.categoryId : undefined,
      unit: newProduct.unit.trim() || 'pcs',
      costPrice: parseFloat(newProduct.costPrice) || 0,
      sellingPrice: parseFloat(newProduct.sellingPrice) || 0,
      stockQty: parseInt(newProduct.stockQty, 10) || 0,
      reorderLevel: parseInt(newProduct.reorderLevel, 10) || 10,
      leadTimeDays: parseInt(newProduct.leadTimeDays, 10) || 3,
      location: newProduct.location?.trim() || undefined,
    });
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    adjustStockMutation.mutate({
      id: adjustingProduct.id,
      body: {
        type: adjustType,
        quantity: parseInt(adjustQty, 10),
        reason: adjustReason,
        notes: adjustNotes || undefined,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>Inventory Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock ledger, unit pricing in BDT (৳), and automated reorder alerts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-900">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              showLowStockOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Only</span>
          </button>
        </div>
      </div>

      {/* Product List Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">In Stock</th>
                <th className="py-3 px-4">Cost Price</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Gross Margin</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading inventory products...</span>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const marginPct =
                    prod.sellingPrice > 0
                      ? (((prod.sellingPrice - prod.costPrice) / prod.sellingPrice) * 100).toFixed(1)
                      : '0.0';
                  const isLow = prod.stockQty <= prod.reorderLevel;
                  const isOut = prod.stockQty <= 0;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{prod.name}</div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                          <span>{prod.sku}</span>
                          {prod.barcode && <span>• {prod.barcode}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px]">
                          {prod.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${
                            isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white'
                          }`}
                        >
                          {prod.stockQty} {prod.unit}
                        </span>
                        <div className="text-[10px] text-slate-500">Min: {prod.reorderLevel}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{formatBDT(prod.costPrice)}</td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {formatBDT(prod.sellingPrice)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-400 font-medium">+{marginPct}%</span>
                      </td>
                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-medium">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Low Stock</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Optimal</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setAdjustingProduct(prod)}
                            title="Adjust Stock"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                          </button>
                          <button
                            onClick={() => setHistoryProduct(prod)}
                            title="View Stock Ledger"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <History className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add New Product */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-700 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                <span>Add New Product to Inventory</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhuni Pure Mustard Oil 500ml"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="OIL-RAD-500"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Cost Price (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="180.00"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Selling Price (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="210.00"
                    value={newProduct.sellingPrice}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, sellingPrice: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Initial Stock Qty
                  </label>
                  <input
                    type="number"
                    placeholder="50"
                    value={newProduct.stockQty}
                    onChange={(e) => setNewProduct({ ...newProduct, stockQty: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="pcs / kg / ltr"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Reorder Alert Level
                  </label>
                  <input
                    type="number"
                    placeholder="15"
                    value={newProduct.reorderLevel}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, reorderLevel: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    placeholder="3"
                    value={newProduct.leadTimeDays}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, leadTimeDays: e.target.value })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {createProductMutation.isError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {(createProductMutation.error as any)?.message || 'Failed to create product. Please check your inputs.'}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProductMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  {createProductMutation.isPending ? 'Saving...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Adjust Stock */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                  <span>Manual Stock Adjustment</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{adjustingProduct.name}</p>
              </div>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between text-xs">
              <span className="text-slate-400">Current Stock:</span>
              <span className="font-bold text-emerald-400">
                {adjustingProduct.stockQty} {adjustingProduct.unit}
              </span>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Adjustment Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ADJUSTMENT_IN')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      adjustType === 'ADJUSTMENT_IN'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    <span>Stock In (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('ADJUSTMENT_OUT')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                      adjustType === 'ADJUSTMENT_OUT'
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                    <span>Stock Out (-)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Quantity to Adjust *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 5"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reason</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Found inventory in warehouse audit">
                    Found inventory in warehouse audit
                  </option>
                  <option value="Damaged or expired in store">Damaged or expired in store</option>
                  <option value="Supplier sample or bonus">Supplier sample or bonus</option>
                  <option value="Shrinkage or theft write-off">Shrinkage or theft write-off</option>
                  <option value="Manual count correction">Manual count correction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Audit Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide detailed notes for accountant review..."
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {adjustStockMutation.isError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {(adjustStockMutation.error as any)?.message || 'Failed to adjust stock. Please try again.'}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustStockMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  {adjustStockMutation.isPending ? 'Saving...' : 'Apply Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Stock Movement Ledger Drawer */}
      {historyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg h-full p-6 border-l border-slate-700 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-cyan-400" />
                    <span>Stock Movement Audit Ledger</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{historyProduct.name}</p>
                </div>
                <button
                  onClick={() => setHistoryProduct(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingHistory ? (
                <div className="py-8 text-center text-slate-500">
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Loading ledger...</span>
                </div>
              ) : movements.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No movement transactions recorded for this item yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {movements.map((m) => {
                    const isPositive = m.quantity > 0;
                    return (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                              isPositive
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-red-500/20 text-red-300'
                            }`}
                          >
                            {m.type}
                          </span>
                          <span className="text-[10px] text-slate-400">{formatDate(m.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="text-slate-400">
                            {m.balanceBefore} → {m.balanceAfter}
                          </span>
                          <span
                            className={`font-bold ${
                              isPositive ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {isPositive ? `+${m.quantity}` : m.quantity}
                          </span>
                        </div>
                        {m.reason && <p className="text-[11px] text-slate-300">Reason: {m.reason}</p>}
                        {m.notes && <p className="text-[10px] text-slate-500 italic">Notes: {m.notes}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setHistoryProduct(null)}
              className="w-full mt-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
            >
              Close Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

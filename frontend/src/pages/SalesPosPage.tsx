import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api-client';
import { formatBDT, formatDate } from '../lib/formatters';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  X,
  Printer,
  Ban,
  Receipt,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  stockQty: number;
  sellingPrice: number;
  costPrice: number;
  unit: string;
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
}

interface SaleRecord {
  id: string;
  invoiceNumber?: string;
  number?: string;
  status: 'COMPLETED' | 'VOIDED';
  totalAmount?: number;
  total?: number;
  discountAmount?: number;
  discount?: number;
  finalAmount?: number;
  paymentMethod?: string;
  createdAt: string;
  customer?: { name: string; phone?: string };
  items?: Array<{
    id: string;
    product?: { name: string; sku: string };
    nameSnapshot?: string;
    quantity?: number;
    qty?: number;
    unitPrice: number;
    totalPrice?: number;
    lineTotal?: number;
  }>;
}

export const SalesPosPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, business } = useAuth();
  const [activeTab, setActiveTab] = useState<'POS' | 'INVOICES'>('POS');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [orderDiscount, setOrderDiscount] = useState<string>('0');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Receipt Modal state
  const [completedSale, setCompletedSale] = useState<SaleRecord | null>(null);

  // Voiding state
  const [voidingSaleId, setVoidingSaleId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState('Customer returned goods for full refund');

  // Fetch products
  const { data: productsData } = useQuery<{ data: Product[] }>({
    queryKey: ['pos-products', searchTerm],
    queryFn: () => apiRequest<{ data: Product[] }>(`/products?search=${encodeURIComponent(searchTerm)}`),
  });
  const products = productsData?.data || [];

  // Fetch customers
  const { data: customersData } = useQuery<{ data: Customer[] } | Customer[]>({
    queryKey: ['customers'],
    queryFn: () => apiRequest<any>('/business/customers'),
  });
  const customers: Customer[] = Array.isArray(customersData)
    ? customersData
    : (customersData as any)?.data || [];

  // Fetch recent sales invoices
  const { data: salesData, isLoading: loadingSales } = useQuery<{ data: SaleRecord[] }>({
    queryKey: ['sales-invoices'],
    queryFn: () => apiRequest<{ data: SaleRecord[] }>('/sales'),
    enabled: activeTab === 'INVOICES',
  });
  const salesList = salesData?.data || [];

  // Cart calculations
  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const discountVal = parseFloat(orderDiscount) || 0;
  const grandTotal = Math.max(0, subtotal - discountVal);
  const paidVal = amountPaid ? parseFloat(amountPaid) : grandTotal;
  const changeDue = Math.max(0, paidVal - grandTotal);

  const addToCart = (product: Product) => {
    if (product.stockQty <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQty) return prev; // Cannot exceed stock
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.sellingPrice, discount: 0 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stockQty) return item; // Stock bound
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Complete Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: (body: any) =>
      apiRequest<SaleRecord>('/sales', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      setCompletedSale(data);
      setCart([]);
      setOrderDiscount('0');
      setAmountPaid('');
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] });
      queryClient.invalidateQueries({ queryKey: ['today-summary'] });
    },
  });

  // Void Sale Mutation
  const voidMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      apiRequest(`/sales/${id}/void`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] });
      setVoidingSaleId(null);
    },
  });

  const handleCheckout = () => {
    if (cart.length === 0) return;
    checkoutMutation.mutate({
      customerId: selectedCustomerId || undefined,
      paymentMethod,
      discount: discountVal,
      paidAmount: paidVal,
      amountPaid: paidVal,
      note: notes || undefined,
      notes: notes || undefined,
      items: cart.map((i) => ({
        productId: i.product.id,
        qty: i.quantity,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discount: i.discount,
      })),
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-400" />
            <span>Point of Sale (POS)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rapid checkout, multi-channel payment in BDT (৳), stock decrement, and thermal invoicing.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('POS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'POS'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Terminal View
          </button>
          <button
            onClick={() => setActiveTab('INVOICES')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'INVOICES'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Invoice History
          </button>
        </div>
      </div>

      {activeTab === 'POS' ? (
        /* POS GRID: Catalog on Left, Live Cart on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Selection */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glass-panel rounded-2xl p-4 border border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Scan barcode or type product name/SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((prod) => {
                const isOut = prod.stockQty <= 0;
                const inCart = cart.find((i) => i.product.id === prod.id)?.quantity || 0;
                return (
                  <button
                    key={prod.id}
                    onClick={() => addToCart(prod)}
                    disabled={isOut}
                    className={`glass-panel p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all group relative overflow-hidden ${
                      isOut
                        ? 'opacity-40 border-slate-800 cursor-not-allowed'
                        : 'border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-mono">{prod.sku}</span>
                        <span
                          className={`font-semibold ${
                            prod.stockQty <= 10 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {prod.stockQty} {prod.unit}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 line-clamp-2">
                        {prod.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">
                        {formatBDT(prod.sellingPrice)}
                      </span>
                      {inCart > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px]">
                          {inCart}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Cart & Checkout Panel */}
          <div className="lg:col-span-5">
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 sticky top-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Current Cart</h3>
                </div>
                <span className="text-xs text-slate-400">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Customer Selector */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Customer (Optional)
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Walk-in Customer (General)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    Cart is empty. Tap items on the left to add.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatBDT(item.unitPrice)} × {item.quantity} ={' '}
                          <span className="text-emerald-400 font-medium">
                            {formatBDT(item.unitPrice * item.quantity)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-6 h-6 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center text-xs ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['CASH', 'BKASH', 'NAGAD', 'CARD', 'BANK_TRANSFER', 'CREDIT'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition-all ${
                        paymentMethod === method
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {method === 'BKASH' ? 'bKash' : method === 'NAGAD' ? 'Nagad' : method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>{formatBDT(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Discount (৳):</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={orderDiscount}
                    onChange={(e) => setOrderDiscount(e.target.value)}
                    className="w-20 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-right text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-1">
                  <span>Grand Total:</span>
                  <span className="text-emerald-400 text-base">{formatBDT(grandTotal)}</span>
                </div>

                {paymentMethod !== 'CREDIT' && (
                  <div className="flex items-center justify-between text-slate-400 pt-1">
                    <span>Amount Paid (৳):</span>
                    <input
                      type="number"
                      placeholder={grandTotal.toString()}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-24 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-right text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {changeDue > 0 && (
                  <div className="flex justify-between text-xs text-cyan-300 font-semibold pt-1">
                    <span>Change Due:</span>
                    <span>{formatBDT(changeDue)}</span>
                  </div>
                )}
              </div>

              {checkoutMutation.isError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {(checkoutMutation.error as any)?.message || 'Checkout failed. Please check inputs.'}
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || checkoutMutation.isPending}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {checkoutMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Sale ({formatBDT(grandTotal)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* INVOICES HISTORY TAB */
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loadingSales ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <span>Loading invoices...</span>
                    </td>
                  </tr>
                ) : salesList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No sales recorded yet. Process your first sale in the Terminal view.
                    </td>
                  </tr>
                ) : (
                  salesList.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {sale.invoiceNumber || sale.number}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{formatDate(sale.createdAt)}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {sale.customer?.name || 'Walk-in Customer'}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono">
                          {sale.paymentMethod || 'CASH'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        {formatBDT(sale.finalAmount ?? sale.total)}
                      </td>
                      <td className="py-3 px-4">
                        {sale.status === 'COMPLETED' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-semibold">
                            Voided
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setCompletedSale(sale)}
                            title="View Receipt"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          >
                            <Printer className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                          {sale.status === 'COMPLETED' && (
                            <button
                              onClick={() => setVoidingSaleId(sale.id)}
                              title="Void Sale (Return Stock)"
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Printable Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white text-slate-950 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative font-mono text-xs space-y-4">
            {/* Header */}
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h3 className="font-bold text-sm uppercase tracking-wider">
                {business?.name || 'Dhaka Grocery & General Store'}
              </h3>
              <p className="text-[10px] text-slate-500">Dhaka, Bangladesh • Ph: +880 1711-000000</p>
              <p className="text-[10px] text-slate-500">VAT Reg: 001928374-0101</p>
              <div className="mt-2 text-[11px] font-bold">
                INVOICE: {completedSale.invoiceNumber || completedSale.number}
              </div>
              <div className="text-[10px] text-slate-500">
                {formatDate(completedSale.createdAt)}
              </div>
            </div>

            {/* Customer & Cashier */}
            <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold">
                  {completedSale.customer?.name || 'Walk-in Customer'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{user?.name || 'Siam Ahmed'}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment:</span>
                <span className="font-bold">{completedSale.paymentMethod || 'CASH'}</span>
              </div>
            </div>

            {/* Line items */}
            {completedSale.items && completedSale.items.length > 0 && (
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
                {completedSale.items.map((it: any) => (
                  <div key={it.id} className="flex justify-between">
                    <span className="truncate pr-2">
                      {it.product?.name || it.nameSnapshot} ({it.quantity || it.qty}x)
                    </span>
                    <span className="font-bold shrink-0">{formatBDT(it.totalPrice ?? it.lineTotal ?? ((it.quantity || it.qty) * it.unitPrice))}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="space-y-1 pt-1 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatBDT(completedSale.totalAmount ?? completedSale.total ?? completedSale.finalAmount)}</span>
              </div>
              {((completedSale.discountAmount ?? completedSale.discount ?? 0) > 0) && (
                <div className="flex justify-between text-slate-600">
                  <span>Discount:</span>
                  <span>-{formatBDT(completedSale.discountAmount ?? completedSale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-1">
                <span>TOTAL (BDT):</span>
                <span>{formatBDT(completedSale.finalAmount ?? completedSale.total)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-slate-500 space-y-1 pt-1">
              <p>Thank you for shopping with us!</p>
              <p className="font-mono tracking-widest">*** SMARTSTOCK POS ***</p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Void Sale Prompt */}
      {voidingSaleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                <Ban className="w-5 h-5" />
                <span>Void Sale &amp; Return Stock</span>
              </h3>
              <button
                onClick={() => setVoidingSaleId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Voiding this sale will mark the invoice as VOIDED, reverse financial revenue, and
              automatically return all purchased items back to active inventory with a VOID_RETURN
              audit ledger entry.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Reason for Voiding *
              </label>
              <input
                type="text"
                required
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setVoidingSaleId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={voidMutation.isPending}
                onClick={() =>
                  voidingSaleId &&
                  voidMutation.mutate({ id: voidingSaleId, reason: voidReason })
                }
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/20"
              >
                {voidMutation.isPending ? 'Processing...' : 'Confirm Void'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

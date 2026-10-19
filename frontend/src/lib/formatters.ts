/**
 * Formats a numeric value into Bangladeshi Taka (BDT ৳) with proper separators
 */
export function formatBDT(amount: number | string | null | undefined): string {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(numeric)) return '৳0.00';
  return `৳${numeric.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Formats date into readable Bangladesh standard format (DD MMM YYYY, hh:mm A)
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns role badge styling
 */
export function getRoleBadgeClass(role: string): string {
  switch (role) {
    case 'OWNER':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'ACCOUNTANT':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'STAFF':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    default:
      return 'bg-slate-700/50 text-slate-300 border-slate-600';
  }
}

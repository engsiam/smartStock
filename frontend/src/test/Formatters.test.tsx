import { describe, it, expect } from 'vitest';
import { formatBDT, formatDate, getRoleBadgeClass } from '../lib/formatters';

describe('Formatters Helper Functions', () => {
  it('formats BDT currency with symbol and 2 decimals', () => {
    expect(formatBDT(1250)).toBe('৳1,250.00');
    expect(formatBDT(0)).toBe('৳0.00');
    expect(formatBDT('450.5')).toBe('৳450.50');
    expect(formatBDT(null)).toBe('৳0.00');
  });

  it('formats dates into British/Bangladesh convention', () => {
    const formatted = formatDate('2026-10-19T10:00:00Z');
    expect(formatted).toMatch(/19 Oct 2026/);
    expect(formatDate(null)).toBe('-');
  });

  it('assigns correct CSS class for user roles', () => {
    expect(getRoleBadgeClass('OWNER')).toContain('purple');
    expect(getRoleBadgeClass('STAFF')).toContain('amber');
    expect(getRoleBadgeClass('ACCOUNTANT')).toContain('blue');
    expect(getRoleBadgeClass('UNKNOWN')).toContain('slate');
  });
});

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
} from '../../src/lib/format';

describe('format utilities', () => {
  it('formats numbers with Persian digits and grouping', () => {
    expect(formatNumber(1234567)).toBe('۱٬۲۳۴٬۵۶۷');
    expect(formatNumber(0)).toBe('۰');
  });

  it('formats currency values', () => {
    expect(formatCurrency(1000)).toBe('۱٬۰۰۰ تومان');
  });

  it('falls back to a dash for empty dates', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDateTime(undefined)).toBe('-');
  });

  it('formats valid dates', () => {
    expect(formatDate('2024-01-01T00:00:00.000Z')).toContain('۱۴۰۲');
  });
});
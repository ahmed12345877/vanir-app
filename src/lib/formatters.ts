/**
 * Universal English number & currency formatters
 * Ensures numbers and currency amounts always render with clean Western digits (0-9)
 * regardless of device system locale (e.g. Arabic ar-EG / ar-SA).
 */

export function formatEnglishNumber(val: number | string): string {
  if (val === null || val === undefined) return '0';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, '')) || 0;
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatUSD(val: number | string): string {
  return `$${formatEnglishNumber(val)}`;
}

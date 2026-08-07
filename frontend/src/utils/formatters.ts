import { Currency } from '../types';

export function formatCurrency(amount: number, currency: Currency = '₹'): string {
  if (isNaN(amount)) amount = 0;
  return `${currency}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function calculatePercentage(current: number, total: number): number {
  if (!total || total === 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

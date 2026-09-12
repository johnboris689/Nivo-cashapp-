/**
 * Reusable currency formatting utility for Nevo.
 * Standardizes Nigerian Naira (₦) formatting with exactly two decimal places.
 *
 * Examples:
 * 0       -> ₦0.00
 * 100     -> ₦100.00
 * 1500    -> ₦1,500.00
 * 200000  -> ₦200,000.00
 * 1250.5  -> ₦1,250.50
 */

export function formatNaira(amount: number | string | null | undefined): string {
  const num = typeof amount === 'number' ? (isNaN(amount) ? 0 : amount) : Number(amount) || 0;
  return '₦' + num.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export const nairaFormat = formatNaira;
export const formatCurrency = formatNaira;

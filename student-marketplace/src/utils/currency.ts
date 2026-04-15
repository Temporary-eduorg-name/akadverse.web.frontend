/**
 * Format a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @param includeSymbol - Whether to include the ₦ symbol (default: true)
 * @returns Formatted currency string
 */
export function formatNaira(amount: number | string, includeSymbol: boolean = true): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return includeSymbol ? '₦0' : '0';
  
  const formatted = numAmount.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return includeSymbol ? `₦${formatted}` : formatted;
}

/**
 * Format input value as user types (adds commas)
 * @param value - The input value
 * @returns Formatted string with commas
 */
export function formatCurrencyInput(value: string): string {
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  
  if (!digitsOnly) return '';
  
  // Convert to number and format with commas
  const numValue = parseInt(digitsOnly, 10);
  return numValue.toLocaleString('en-NG');
}

/**
 * Parse formatted currency string back to number
 * @param value - The formatted string
 * @returns Numeric value
 */
export function parseCurrencyInput(value: string): number {
  const digitsOnly = value.replace(/\D/g, '');
  return digitsOnly ? parseInt(digitsOnly, 10) : 0;
}

/**
 * Format number input with commas for display
 * @param value - The value to format
 * @returns Formatted string
 */
export function formatNumberWithCommas(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  return numValue.toLocaleString('en-NG');
}

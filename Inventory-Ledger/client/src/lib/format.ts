/**
 * Format currency exactly as requested:
 * Whole numbers only, with " Rupees" suffix.
 * e.g., 1000 -> "1000 Rupees"
 */
export function formatRupees(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "0 Rupees";
  return `${Math.round(amount).toLocaleString('en-IN')} Rupees`;
}

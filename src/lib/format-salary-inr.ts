/** Format min/max annual amounts in INR as "12 - 22 LPA" (lakhs per annum). */
export function formatInrLpaRange(minStr: string, maxStr: string): string {
  const min = Number.parseFloat(minStr.replace(/,/g, "")) || 0;
  const max = Number.parseFloat(maxStr.replace(/,/g, "")) || 0;
  const la = min / 100_000;
  const lb = max / 100_000;
  if (!la && !lb) return "—";
  return `${la.toFixed(0)} - ${lb.toFixed(0)} LPA`;
}

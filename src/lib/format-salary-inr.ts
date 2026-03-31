const LAKH_INR = 100_000;

/**
 * Interpret stored min/max as lakhs (12 = 12 LPA) or full annual INR (1_200_000 = 12 LPA).
 * AI / APIs usually send rupees; users often type lakhs.
 */
function toLakhs(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n >= LAKH_INR) return n / LAKH_INR;
  return n;
}

function formatLakhNumber(x: number): string {
  if (!x) return "0";
  if (Number.isInteger(x)) return String(x);
  return x.toFixed(1).replace(/\.0$/, "");
}

/** Format min/max annual amounts in INR as "12 - 22 LPA" (lakhs per annum). */
export function formatInrLpaRange(minStr: string, maxStr: string): string {
  const rawMin = Number.parseFloat(String(minStr ?? "").replace(/,/g, "")) || 0;
  const rawMax = Number.parseFloat(String(maxStr ?? "").replace(/,/g, "")) || 0;
  const la = toLakhs(rawMin);
  const lb = toLakhs(rawMax);
  if (!la && !lb) return "—";
  return `${formatLakhNumber(la)} - ${formatLakhNumber(lb)} LPA`;
}

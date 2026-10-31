/** Money helpers. All amounts in the system are integer paise (₹1 = 100). */

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });
const inrCompact = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", notation: "compact", maximumFractionDigits: 1 });

export function formatINR(paise: number): string {
  return inr.format(paise / 100);
}

export function formatINRCompact(paise: number): string {
  return inrCompact.format(paise / 100);
}

/** Parses a rupee amount typed by a user ("1,499.50") into paise. Returns NaN when invalid. */
export function rupeesToPaise(value: string | number): number {
  const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(n)) return NaN;
  return Math.round(n * 100);
}

export function paiseToRupees(paise: number): string {
  return (paise / 100).toFixed(2);
}

/** Basis points → "18%" */
export function formatRate(bps: number): string {
  return `${(bps / 100).toLocaleString("en-IN", { maximumFractionDigits: 2 })}%`;
}

/** Rounds half away from zero — the convention used on Indian tax invoices. */
export function roundPaise(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value));
}

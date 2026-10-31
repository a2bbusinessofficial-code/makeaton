/**
 * Pricing engine — pure functions, no database access.
 *
 * Used for subscription totals, invoice generation and the billing preview, so every
 * screen shows exactly the same numbers. All amounts are integer paise and all rates are
 * basis points (1800 = 18%).
 *
 * Order of operations per line:  base = qty × unit price  →  − discount  →  + GST on the
 * discounted amount. Rounding happens per line, then lines are summed.
 */

export type PricingLine = {
  key: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRateBps: number;
  isActive: boolean;
};

export type PricingDiscount = {
  id: string;
  name: string;
  type: "FIXED" | "PERCENTAGE";
  value: number;
  scope: "PRODUCTS" | "SUBSCRIPTION";
  productIds: string[];
  minPurchase: number | null;
  minQuantity: number | null;
  startDate: Date;
  endDate: Date;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
};

export type PricedLine = PricingLine & {
  base: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
};

export type AppliedDiscount = { discountId: string; name: string; amount: number };

export type PricingResult = {
  lines: PricedLine[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  appliedDiscounts: AppliedDiscount[];
  skippedDiscounts: { discountId: string; name: string; reason: string }[];
};

/** Why a discount does not apply on a given date, or null if it does. */
export function discountIneligibility(
  discount: PricingDiscount,
  context: { onDate: Date; purchaseAmount: number; quantity: number },
): string | null {
  if (!discount.isActive) return "archived";
  if (context.onDate < discount.startDate) return "not started yet";
  if (context.onDate > discount.endDate) return "expired";
  if (discount.usageLimit !== null && discount.usedCount >= discount.usageLimit) return "usage limit reached";
  if (discount.minPurchase !== null && context.purchaseAmount < discount.minPurchase) return "below minimum purchase";
  if (discount.minQuantity !== null && context.quantity < discount.minQuantity) return "below minimum quantity";
  if (context.purchaseAmount <= 0) return "nothing to discount";
  return null;
}

/**
 * Splits `amount` across `weights` proportionally using the largest-remainder method,
 * so the parts always add up to exactly `amount` (no paisa lost to rounding).
 */
export function allocate(amount: number, weights: number[]): number[] {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return weights.map(() => 0);
  const raw = weights.map((w) => (amount * w) / totalWeight);
  const parts = raw.map(Math.floor);
  let remainder = amount - parts.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, frac: r - Math.floor(r) })).sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (remainder <= 0) break;
    parts[i] += 1;
    remainder -= 1;
  }
  return parts;
}

export function priceLines(lines: PricingLine[], discounts: PricingDiscount[], onDate: Date): PricingResult {
  const active = lines.filter((l) => l.isActive && l.quantity > 0);
  const priced = active.map((l) => ({ ...l, base: l.quantity * l.unitPrice, discountAmount: 0, taxAmount: 0, total: 0 }));

  const appliedDiscounts: AppliedDiscount[] = [];
  const skippedDiscounts: PricingResult["skippedDiscounts"] = [];

  for (const discount of discounts) {
    const targets = priced.filter((l) => discount.scope === "SUBSCRIPTION" || discount.productIds.includes(l.productId));
    const remaining = targets.map((l) => l.base - l.discountAmount);
    const purchaseAmount = remaining.reduce((a, b) => a + b, 0);
    const quantity = targets.reduce((a, l) => a + l.quantity, 0);

    const reason = discountIneligibility(discount, { onDate, purchaseAmount, quantity });
    if (reason) {
      skippedDiscounts.push({ discountId: discount.id, name: discount.name, reason });
      continue;
    }

    const amount =
      discount.type === "PERCENTAGE"
        ? Math.round((purchaseAmount * discount.value) / 10_000)
        : Math.min(discount.value, purchaseAmount);

    allocate(amount, remaining).forEach((part, i) => {
      targets[i].discountAmount += part;
    });
    appliedDiscounts.push({ discountId: discount.id, name: discount.name, amount });
  }

  for (const line of priced) {
    line.taxAmount = Math.round(((line.base - line.discountAmount) * line.taxRateBps) / 10_000);
    line.total = line.base - line.discountAmount + line.taxAmount;
  }

  const sum = (pick: (l: PricedLine) => number) => priced.reduce((a, l) => a + pick(l), 0);
  return {
    lines: priced,
    subtotal: sum((l) => l.base),
    discountTotal: sum((l) => l.discountAmount),
    taxTotal: sum((l) => l.taxAmount),
    total: sum((l) => l.total),
    appliedDiscounts,
    skippedDiscounts,
  };
}

/** Splits GST into CGST+SGST (same state) or IGST (inter-state), as shown on Indian invoices. */
export function splitGst(taxTotal: number, companyState: string, customerState: string | null | undefined) {
  const interState = Boolean(customerState) && customerState!.trim().toLowerCase() !== companyState.trim().toLowerCase();
  if (interState) return { igst: taxTotal, cgst: 0, sgst: 0, interState };
  const cgst = Math.floor(taxTotal / 2);
  return { igst: 0, cgst, sgst: taxTotal - cgst, interState };
}

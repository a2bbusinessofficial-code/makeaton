import { describe, expect, it } from "vitest";
import { allocate, priceLines, splitGst, type PricingDiscount, type PricingLine } from "./pricing";
import { parseDate } from "@/lib/dates";

const line = (overrides: Partial<PricingLine> = {}): PricingLine => ({
  key: "l1",
  productId: "crm",
  description: "Brightloop CRM",
  quantity: 1,
  unitPrice: 100_000, // ₹1,000
  taxRateBps: 1800,
  isActive: true,
  ...overrides,
});

const discount = (overrides: Partial<PricingDiscount> = {}): PricingDiscount => ({
  id: "d1",
  name: "Volume 10%",
  type: "PERCENTAGE",
  value: 1000,
  scope: "SUBSCRIPTION",
  productIds: [],
  minPurchase: null,
  minQuantity: null,
  startDate: parseDate("2026-01-01"),
  endDate: parseDate("2026-12-31"),
  usageLimit: null,
  usedCount: 0,
  isActive: true,
  ...overrides,
});

const on = parseDate("2026-06-15");

describe("priceLines", () => {
  it("computes GST on top of the line amount", () => {
    const r = priceLines([line({ quantity: 3 })], [], on);
    expect(r.subtotal).toBe(300_000);
    expect(r.taxTotal).toBe(54_000);
    expect(r.total).toBe(354_000);
  });

  it("ignores switched-off add-ons", () => {
    const r = priceLines([line(), line({ key: "l2", productId: "addon", isActive: false })], [], on);
    expect(r.lines).toHaveLength(1);
    expect(r.total).toBe(118_000);
  });

  it("applies a percentage discount before tax", () => {
    const r = priceLines([line({ quantity: 2 })], [discount()], on);
    expect(r.discountTotal).toBe(20_000);
    expect(r.taxTotal).toBe(32_400); // 18% of 1,80,000 paise
    expect(r.total).toBe(212_400);
  });

  it("caps a fixed discount at the purchase amount", () => {
    const r = priceLines([line()], [discount({ type: "FIXED", value: 999_999 })], on);
    expect(r.discountTotal).toBe(100_000);
    expect(r.total).toBe(0);
  });

  it("limits product-scoped discounts to matching lines", () => {
    const r = priceLines(
      [line(), line({ key: "l2", productId: "addon", unitPrice: 50_000 })],
      [discount({ scope: "PRODUCTS", productIds: ["addon"] })],
      on,
    );
    expect(r.lines.find((l) => l.productId === "addon")!.discountAmount).toBe(5_000);
    expect(r.lines.find((l) => l.productId === "crm")!.discountAmount).toBe(0);
  });

  it("skips discounts outside their dates, over their limit or below minimums", () => {
    const cases: [Partial<PricingDiscount>, string][] = [
      [{ endDate: parseDate("2026-06-14") }, "expired"],
      [{ startDate: parseDate("2026-06-16") }, "not started yet"],
      [{ usageLimit: 2, usedCount: 2 }, "usage limit reached"],
      [{ minPurchase: 500_000 }, "below minimum purchase"],
      [{ minQuantity: 5 }, "below minimum quantity"],
    ];
    for (const [overrides, reason] of cases) {
      const r = priceLines([line()], [discount(overrides)], on);
      expect(r.discountTotal).toBe(0);
      expect(r.skippedDiscounts[0].reason).toBe(reason);
    }
  });

  it("never loses a paisa when spreading a discount across lines", () => {
    const r = priceLines(
      [line({ unitPrice: 33_333 }), line({ key: "l2", unitPrice: 33_333 }), line({ key: "l3", unitPrice: 33_334 })],
      [discount({ type: "FIXED", value: 10_001 })],
      on,
    );
    expect(r.lines.reduce((a, l) => a + l.discountAmount, 0)).toBe(10_001);
  });
});

describe("allocate", () => {
  it("splits proportionally and sums exactly", () => {
    expect(allocate(100, [1, 1, 1])).toEqual([34, 33, 33]);
    expect(allocate(0, [5, 5])).toEqual([0, 0]);
  });
});

describe("splitGst", () => {
  it("uses CGST + SGST within the same state", () => {
    expect(splitGst(1801, "Gujarat", "gujarat")).toMatchObject({ cgst: 900, sgst: 901, igst: 0 });
  });
  it("uses IGST across states", () => {
    expect(splitGst(1800, "Gujarat", "Maharashtra")).toMatchObject({ igst: 1800, interState: true });
  });
});

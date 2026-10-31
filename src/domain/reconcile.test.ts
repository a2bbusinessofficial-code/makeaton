import { describe, expect, it } from "vitest";
import { matchStatement, parseCsv, parseStatementDate, readStatement, type OpenInvoice } from "./reconcile";

const invoices: OpenInvoice[] = [
  { id: "a", number: "INV/2026/00042", customerName: "Rohan Shah (Shah Textiles)", total: 117_882, amountPaid: 0 },
  { id: "b", number: "INV/2026/00043", customerName: "Priya Mehta (Mehta Foods)", total: 58_941, amountPaid: 0 },
  { id: "c", number: "INV/2026/00044", customerName: "Kabir Iyer", total: 58_941, amountPaid: 0 },
  { id: "d", number: "INV/2026/00045", customerName: "Neha Rao (Rao Pharma)", total: 200_000, amountPaid: 50_000 },
];

const line = (amount: number, narration: string, row = 2) => ({ row, date: "2026-10-30", amount, narration });

describe("matchStatement", () => {
  it("matches on the invoice number in the narration, in any common format", () => {
    const [m1, m2] = matchStatement([line(117_882, "NEFT/UTR123/INV/2026/00042/SHAH"), line(150_000, "IMPS inv-2026-45 rao")], invoices);
    expect(m1).toMatchObject({ confidence: "exact", invoice: { id: "a" } });
    expect(m2).toMatchObject({ confidence: "exact", invoice: { id: "d", due: 150_000 } });
  });

  it("flags a partial payment but still matches it", () => {
    const [m] = matchStatement([line(50_000, "UPI INV/2026/00042")], invoices);
    expect(m.confidence).toBe("exact");
    expect(m.reason).toContain("partial");
  });

  it("refuses an amount larger than the balance due", () => {
    const [m] = matchStatement([line(999_999, "INV/2026/00042")], invoices);
    expect(m.invoice).toBeNull();
  });

  it("uses amount + customer name when there is no invoice number", () => {
    const [m] = matchStatement([line(58_941, "UPI/MEHTA FOODS/OCT")], invoices);
    expect(m).toMatchObject({ confidence: "high", invoice: { id: "b" } });
  });

  it("does not guess when several invoices share the amount", () => {
    const [m] = matchStatement([line(58_941, "CASH DEPOSIT")], invoices);
    expect(m.invoice).toBeNull();
    expect(m.reason).toContain("2 invoices");
  });

  it("never matches the same invoice twice", () => {
    const [m1, m2] = matchStatement([line(117_882, "INV/2026/00042"), line(117_882, "INV/2026/00042 duplicate")], invoices);
    expect(m1.invoice?.id).toBe("a");
    expect(m2.invoice).toBeNull();
  });

  it("ignores debits", () => {
    expect(matchStatement([line(-5_000, "Bank charges")], invoices)[0].reason).toBe("Not a credit");
  });
});

describe("CSV reading", () => {
  it("parses quoted fields with commas and escaped quotes", () => {
    expect(parseCsv('a,"b, c","say ""hi"""\r\n1,2,3')).toEqual([
      ["a", "b, c", 'say "hi"'],
      ["1", "2", "3"],
    ]);
  });

  it("detects bank-specific column names and parses rupee amounts", () => {
    const { lines } = readStatement('Txn Date,Particulars,Credit Amount\n30/10/2026,"NEFT INV/2026/00042","1,178.82"');
    expect(lines[0]).toEqual({ row: 2, date: "30/10/2026", amount: 117_882, narration: "NEFT INV/2026/00042" });
  });

  it("explains missing columns", () => {
    expect(readStatement("foo,bar\n1,2").error).toMatch(/couldn't find/i);
  });
});

describe("parseStatementDate", () => {
  it.each([
    ["2026-10-30", "2026-10-30"],
    ["30/10/2026", "2026-10-30"],
    ["30-10-26", "2026-10-30"],
    ["30-Oct-2026", "2026-10-30"],
    ["31/02/2026", null],
  ])("%s → %s", (input, expected) => {
    expect(parseStatementDate(input)).toBe(expected);
  });
});

/**
 * Bank statement reconciliation — pure functions, no database access.
 *
 * Replaces "matching payments by scrolling through bank statements": each credit line of an
 * uploaded statement is matched to an outstanding invoice, most reliable rule first:
 *   1. exact  — the invoice number appears in the narration (e.g. "NEFT/INV/2026/00042/…")
 *   2. high   — amount equals the balance due AND the customer's name appears in the narration
 *   3. check  — amount equals the balance due of exactly one invoice (a human should confirm)
 * Each invoice is matched at most once per statement.
 */

export type StatementLine = { row: number; date: string; amount: number; narration: string };

export type OpenInvoice = { id: string; number: string; customerName: string; total: number; amountPaid: number };

export type Confidence = "exact" | "high" | "check";

export type Match = StatementLine & {
  invoice: (OpenInvoice & { due: number }) | null;
  confidence: Confidence | null;
  reason: string;
};

const INVOICE_NUMBER = /INV[\/\-_ ]?(\d{4})[\/\-_ ]?(\d{1,5})/i;
const STOP_WORDS = new Set(["the", "and", "pvt", "ltd", "private", "limited", "llp", "co", "company", "traders"]);

function normalizeNumber(year: string, seq: string) {
  return `INV/${year}/${seq.padStart(5, "0")}`;
}

/** Significant words of a customer name, e.g. "Rohan Shah (Shah Textiles)" → ["rohan", "shah", "textiles"]. */
function nameTokens(name: string): string[] {
  return [...new Set(name.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 3 && !STOP_WORDS.has(t)))];
}

export function matchStatement(lines: StatementLine[], invoices: OpenInvoice[]): Match[] {
  const byNumber = new Map(invoices.map((i) => [i.number.toUpperCase(), i]));
  const used = new Set<string>();
  const due = (i: OpenInvoice) => i.total - i.amountPaid;
  const result = (line: StatementLine, invoice: OpenInvoice | null, confidence: Confidence | null, reason: string): Match => {
    if (invoice) used.add(invoice.id);
    return { ...line, invoice: invoice ? { ...invoice, due: due(invoice) } : null, confidence, reason };
  };

  return lines.map((line) => {
    if (line.amount <= 0) return result(line, null, null, "Not a credit");

    const ref = line.narration.match(INVOICE_NUMBER);
    if (ref) {
      const invoice = byNumber.get(normalizeNumber(ref[1], ref[2]));
      if (invoice && !used.has(invoice.id)) {
        if (line.amount > due(invoice)) return result(line, null, null, `Mentions ${invoice.number} but exceeds its balance`);
        return result(line, invoice, "exact", line.amount < due(invoice) ? "Invoice number in narration (partial payment)" : "Invoice number in narration");
      }
    }

    const narration = line.narration.toLowerCase();
    const sameAmount = invoices.filter((i) => !used.has(i.id) && due(i) === line.amount);
    const named = sameAmount.filter((i) => nameTokens(i.customerName).some((t) => narration.includes(t)));
    if (named.length === 1) return result(line, named[0], "high", "Amount and customer name match");
    if (sameAmount.length === 1) return result(line, sameAmount[0], "check", "Only invoice with this exact amount");

    return result(line, null, null, sameAmount.length > 1 ? `${sameAmount.length} invoices have this amount — choose manually` : "No matching invoice");
  });
}

/** Minimal RFC 4180 CSV parser (quoted fields, escaped quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  return rows;
}

/**
 * Reads a bank statement CSV with a header row. Column names vary between banks, so they
 * are detected loosely: a date column, an amount (or credit) column and a narration column.
 */
export function readStatement(csv: string): { lines: StatementLine[]; error?: string } {
  const [header, ...rows] = parseCsv(csv.replace(/^﻿/, ""));
  if (!header) return { lines: [], error: "The file is empty." };
  const find = (...names: string[]) => header.findIndex((h) => names.some((n) => h.trim().toLowerCase().includes(n)));
  const dateCol = find("date");
  const amountCol = find("credit", "deposit", "amount");
  const textCol = find("narration", "description", "remarks", "particulars", "reference", "details");
  if (dateCol < 0 || amountCol < 0 || textCol < 0) {
    return { lines: [], error: "Couldn't find Date, Amount/Credit and Narration/Description columns in the header row." };
  }
  const lines = rows.map((r, i) => ({
    row: i + 2,
    date: (r[dateCol] ?? "").trim(),
    amount: Math.round(Number((r[amountCol] ?? "").replace(/[₹,\s]/g, "")) * 100) || 0,
    narration: (r[textCol] ?? "").trim(),
  }));
  return { lines };
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** Parses the date formats Indian bank statements use: 2026-10-30, 30/10/2026, 30-10-26, 30-Oct-2026. */
export function parseStatementDate(value: string): string | null {
  const v = value.trim();
  let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return iso(+m[1], +m[2], +m[3]);
  m = v.match(/^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2,4})$/);
  if (m) return iso(+m[3] < 100 ? 2000 + +m[3] : +m[3], +m[2], +m[1]);
  m = v.match(/^(\d{1,2})[\/\-. ]([a-z]{3})[a-z]*[\/\-. ](\d{2,4})$/i);
  if (m) {
    const month = MONTHS.indexOf(m[2].toLowerCase()) + 1;
    if (month) return iso(+m[3] < 100 ? 2000 + +m[3] : +m[3], month, +m[1]);
  }
  return null;
}

function iso(y: number, m: number, d: number): string | null {
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date.toISOString().slice(0, 10) : null;
}

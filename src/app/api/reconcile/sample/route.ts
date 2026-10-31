import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addDays, today, toISODate } from "@/lib/dates";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const rupees = (paise: number) => (paise / 100).toFixed(2);

/**
 * A realistic demo bank statement built from real outstanding invoices: some credits quote
 * the invoice number, one pays part of an invoice, one names the customer, plus noise.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role === "CUSTOMER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const open = await db.invoice.findMany({ where: { state: "CONFIRMED", number: { not: null } }, orderBy: { dueDate: "desc" }, take: 2000 });
  const due = (inv: (typeof open)[number]) => inv.total - inv.amountPaid;
  const amountCount = new Map<number, number>();
  open.forEach((inv) => amountCount.set(due(inv), (amountCount.get(due(inv)) ?? 0) + 1));
  const company = (inv: (typeof open)[number]) => inv.customerName.replace(/.*\(|\).*/g, "").toUpperCase();

  const d = (n: number) => toISODate(addDays(today(), -n));
  const rows: string[][] = [["Date", "Narration", "Credit Amount"]];
  open.slice(0, 3).forEach((inv, i) => rows.push([d(i), `NEFT/UTR${40213 + i}/${inv.number}/${company(inv)}`, rupees(due(inv))]));
  if (open[3]) rows.push([d(3), `IMPS/${open[3].number}/PART PAYMENT`, rupees(Math.round(due(open[3]) / 2))]);
  // No invoice number: matched by amount + customer name, so pick an invoice with a unique balance.
  const byName = open.slice(4).find((inv) => amountCount.get(due(inv)) === 1);
  if (byName) rows.push([d(4), `UPI/${company(byName)}/OCT SUBSCRIPTION`, rupees(due(byName))]);
  rows.push([d(1), "INT CREDIT SAVINGS", "112.40"]);
  rows.push([d(2), "NEFT/UNKNOWN REMITTER", "4999.00"]);

  return new NextResponse(rows.map((r) => r.map(csvCell).join(",")).join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="sample-bank-statement.csv"` },
  });
}

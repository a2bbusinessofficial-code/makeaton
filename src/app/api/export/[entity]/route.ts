import { NextResponse, type NextRequest } from "next/server";
import { customerWhere, invoiceWhere, paymentWhere, subscriptionWhere, type ListParams } from "@/domain/filters";
import { getCurrentUser } from "@/lib/auth";
import { toISODate } from "@/lib/dates";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_ROWS = 50_000;
const cell = (v: unknown) => {
  const s = v instanceof Date ? toISODate(v) : v === null || v === undefined ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const rupees = (paise: number) => (paise / 100).toFixed(2);
const toCsv = (header: string[], rows: unknown[][]) => [header, ...rows].map((r) => r.map(cell).join(",")).join("\n");

const EXPORTS: Record<string, (p: ListParams) => Promise<string>> = {
  async invoices(p) {
    const rows = await db.invoice.findMany({ where: invoiceWhere(p), orderBy: { invoiceDate: "desc" }, take: MAX_ROWS });
    return toCsv(
      ["Number", "Customer", "Email", "GSTIN", "Invoice date", "Due date", "Period start", "Period end", "Status", "Subtotal (INR)", "Discount (INR)", "GST (INR)", "Total (INR)", "Paid (INR)", "Balance (INR)"],
      rows.map((i) => [i.number ?? "Draft", i.customerName, i.customerEmail, i.customerGstin, i.invoiceDate, i.dueDate, i.periodStart, i.periodEnd, i.state, rupees(i.subtotal), rupees(i.discountTotal), rupees(i.taxTotal), rupees(i.total), rupees(i.amountPaid), rupees(i.total - i.amountPaid)]),
    );
  },
  async subscriptions(p) {
    const rows = await db.subscription.findMany({
      where: subscriptionWhere(p),
      include: { customer: true, plan: true, lines: { where: { isActive: true }, select: { quantity: true, unitPrice: true } } },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS,
    });
    return toCsv(
      ["Number", "Customer", "Company", "Plan", "Billing", "Status", "Paused", "Start", "Expiry", "Next invoice", "Recurring excl. GST (INR)"],
      rows.map((s) => [s.number, s.customer.name, s.customer.company, s.plan.name, s.plan.billingPeriod, s.state, s.isPaused ? "yes" : "no", s.startDate, s.endDate, s.nextInvoiceDate, rupees(s.lines.reduce((a, l) => a + l.quantity * l.unitPrice, 0))]),
    );
  },
  async payments(p) {
    const rows = await db.payment.findMany({ where: paymentWhere(p), include: { invoice: { select: { number: true, customerName: true } } }, orderBy: { paymentDate: "desc" }, take: MAX_ROWS });
    return toCsv(
      ["Date", "Invoice", "Customer", "Method", "Amount (INR)", "Note"],
      rows.map((x) => [x.paymentDate, x.invoice.number, x.invoice.customerName, x.method, rupees(x.amount), x.note]),
    );
  },
  async customers(p) {
    const rows = await db.customer.findMany({ where: customerWhere(p), orderBy: { name: "asc" }, take: MAX_ROWS });
    return toCsv(
      ["Name", "Company", "Email", "Phone", "State", "GSTIN", "Address", "Portal login"],
      rows.map((c) => [c.name, c.company, c.email, c.phone, c.state, c.gstin, c.address, c.profileId ? "yes" : "no"]),
    );
  },
};

/** CSV export of a back-office list with the same filters as the screen. Staff and admins only. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role === "CUSTOMER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { entity } = await params;
  const build = EXPORTS[entity];
  if (!build) return NextResponse.json({ error: "Unknown export" }, { status: 404 });

  const csv = await build(Object.fromEntries(request.nextUrl.searchParams));
  return new NextResponse(`﻿${csv}`, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="brightloop-${entity}-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}

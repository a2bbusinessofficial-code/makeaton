import Link from "next/link";
import { InvoiceStatus, SubscriptionStatus } from "@/components/status";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, Section, Stat } from "@/components/ui/page";
import { requireRole } from "@/lib/auth";
import { formatDate, PERIOD_UNIT, today } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";

export const metadata = { title: "My account" };

export default async function PortalHome({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const user = await requireRole("CUSTOMER");
  const { notice } = await searchParams;
  const customerId = user.customerId ?? "__none__";
  const [subs, invoices] = await Promise.all([
    db.subscription.findMany({ where: { customerId, state: { not: "DRAFT" } }, include: { plan: true, lines: { where: { isActive: true } } }, orderBy: { createdAt: "desc" } }),
    db.invoice.findMany({ where: { customerId, state: { in: ["CONFIRMED", "PAID"] } }, orderBy: { invoiceDate: "desc" }, take: 20 }),
  ]);
  const due = invoices.filter((i) => i.state === "CONFIRMED").reduce((a, i) => a + i.total - i.amountPaid, 0);
  const overdue = invoices.filter((i) => i.state === "CONFIRMED" && i.dueDate < today()).length;

  return (
    <>
      {notice === "password-updated" && <p className="rounded-md bg-[#e3f5ea] px-3 py-2 text-[#18794e]">Your password was updated.</p>}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">Hi {user.fullName.split(" ")[0]} 👋</h1>
          <p className="text-ink-3">Your subscriptions and invoices, all in one place.</p>
        </div>
        <LinkButton href="/portal/plans" variant="primary">
          Browse plans
        </LinkButton>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Active subscriptions" value={subs.filter((s) => s.state === "ACTIVE").length} />
        <Stat label="Amount due" value={formatINR(due)} />
        <Stat label="Overdue invoices" value={overdue} tone={overdue ? "danger" : undefined} />
      </div>

      <Section title="My subscriptions">
        {subs.length === 0 ? (
          <EmptyState title="No subscriptions yet" description="Pick a plan to get started." action={<LinkButton href="/portal/plans">See plans</LinkButton>} />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Subscription</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Next invoice</th>
                <th className="text-right">Amount (excl. GST)</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/portal/subscriptions/${s.id}`} className="font-medium hover:text-accent">
                      {s.number}
                    </Link>
                  </td>
                  <td>{s.plan.name}</td>
                  <td>
                    <SubscriptionStatus state={s.state} isPaused={s.isPaused} validUntil={s.validUntil} />
                  </td>
                  <td className="text-ink-2">{formatDate(s.nextInvoiceDate)}</td>
                  <td className="text-right tabular-nums">
                    {formatINR(s.lines.reduce((a, l) => a + l.quantity * l.unitPrice, 0))} / {PERIOD_UNIT[s.plan.billingPeriod]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <Section title="My invoices">
        {invoices.length === 0 ? (
          <p className="text-ink-3">No invoices yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Due</th>
                <th className="text-right">Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td>
                    <Link href={`/portal/invoices/${i.id}`} className="font-medium hover:text-accent">
                      {i.number}
                    </Link>
                  </td>
                  <td className="text-ink-2">{formatDate(i.invoiceDate)}</td>
                  <td className="text-ink-2">{formatDate(i.dueDate)}</td>
                  <td className="text-right tabular-nums">{formatINR(i.total)}</td>
                  <td>
                    <InvoiceStatus {...i} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </>
  );
}

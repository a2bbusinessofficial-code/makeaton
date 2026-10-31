import Link from "next/link";
import { IconChartBar } from "@tabler/icons-react";
import { Chip } from "@/components/ui/chip";
import { EmptyState, PageBody, PageHeader } from "@/components/ui/page";
import { requireBackOffice } from "@/lib/auth";
import { addDays, diffDays, formatDate, today } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";

export const metadata = { title: "Action center" };
export const dynamic = "force-dynamic";

/** One list of everything that needs a human today — so nothing depends on "whoever notices first". */
export default async function ActionCenterPage() {
  await requireBackOffice();
  const now = today();
  const [renewals, overdue, expiringQuotes, startingSoon] = await Promise.all([
    db.subscription.findMany({
      where: { state: "ACTIVE", endDate: { gte: now, lte: addDays(now, 30) } },
      include: { customer: true, plan: true, lines: { where: { isActive: true }, select: { quantity: true, unitPrice: true } } },
      orderBy: { endDate: "asc" },
      take: 25,
    }),
    db.invoice.findMany({ where: { state: "CONFIRMED", dueDate: { lt: now } }, orderBy: [{ dueDate: "asc" }], take: 25 }),
    db.subscription.findMany({ where: { state: "QUOTATION", validUntil: { lte: addDays(now, 7) } }, include: { customer: true }, orderBy: { validUntil: "asc" }, take: 25 }),
    db.subscription.findMany({ where: { state: "CONFIRMED" }, include: { customer: true, plan: true }, orderBy: { startDate: "asc" }, take: 25 }),
  ]);

  return (
    <>
      <PageHeader icon={IconChartBar} title="Action center" />
      <PageBody className="grid gap-4 lg:grid-cols-2 lg:space-y-0">
        <Panel title="Renewals due in 30 days" count={renewals.length}>
          {renewals.map((s) => (
            <Row key={s.id} href={`/subscriptions/${s.id}`} title={`${s.number} · ${s.customer.company ?? s.customer.name}`} meta={`${s.plan.name} · ends ${formatDate(s.endDate)}`}>
              <Chip color={diffDays(s.endDate!, now) <= 7 ? "orange" : "gray"}>{diffDays(s.endDate!, now)} days</Chip>
            </Row>
          ))}
        </Panel>
        <Panel title="Overdue invoices" count={overdue.length}>
          {overdue.map((i) => (
            <Row key={i.id} href={`/invoices/${i.id}`} title={`${i.number} · ${i.customerName}`} meta={`${formatINR(i.total - i.amountPaid)} due ${formatDate(i.dueDate)}`}>
              <Chip color="red">{diffDays(now, i.dueDate)} days late</Chip>
            </Row>
          ))}
        </Panel>
        <Panel title="Quotations expiring within 7 days" count={expiringQuotes.length}>
          {expiringQuotes.map((s) => (
            <Row key={s.id} href={`/subscriptions/${s.id}`} title={`${s.number} · ${s.customer.company ?? s.customer.name}`} meta={`valid until ${formatDate(s.validUntil)}`}>
              {s.validUntil! < now ? <Chip color="red">Expired</Chip> : <Chip color="blue">Follow up</Chip>}
            </Row>
          ))}
        </Panel>
        <Panel title="Confirmed, waiting to start" count={startingSoon.length}>
          {startingSoon.map((s) => (
            <Row key={s.id} href={`/subscriptions/${s.id}`} title={`${s.number} · ${s.customer.company ?? s.customer.name}`} meta={`${s.plan.name} · starts ${formatDate(s.startDate)}`} />
          ))}
        </Panel>
      </PageBody>
    </>
  );
}

function Panel({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <h2 className="font-medium">{title}</h2>
        <Chip>{count}</Chip>
      </div>
      {count === 0 ? <EmptyState title="All clear" /> : <ul className="divide-y divide-line-soft">{children}</ul>}
    </section>
  );
}

function Row({ href, title, meta, children }: { href: string; title: string; meta: string; children?: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-hover">
        <div className="min-w-0">
          <div className="truncate">{title}</div>
          <div className="truncate text-xs text-ink-3">{meta}</div>
        </div>
        {children}
      </Link>
    </li>
  );
}

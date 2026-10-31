import Link from "next/link";
import { IconLayoutDashboard } from "@tabler/icons-react";
import { BarChart } from "@/components/bar-chart";
import { SUBSCRIPTION_STATES, subscriptionStateLabel } from "@/components/status";
import { FilterBar } from "@/components/ui/filter-bar";
import { Field, Input, Select } from "@/components/ui/form";
import { PageBody, PageHeader, Section, Stat } from "@/components/ui/page";
import { getDashboardMetrics } from "@/domain/metrics";
import { requireBackOffice } from "@/lib/auth";
import { parseDate, today, toISODate } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatINR, formatINRCompact } from "@/lib/money";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = { "password-updated": "Your password was updated." };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string; planId?: string; notice?: string }> }) {
  await requireBackOffice();
  const params = await searchParams;
  const now = today();
  const from = params.from ? parseDate(params.from) : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const to = params.to ? parseDate(params.to) : now;
  const [m, plans] = await Promise.all([getDashboardMetrics({ from, to, planId: params.planId || undefined }), db.plan.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })]);
  const collectionRate = m.invoiced > 0 ? Math.round((m.collected / m.invoiced) * 100) : 0;
  const month = new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "UTC" });

  return (
    <>
      <PageHeader icon={IconLayoutDashboard} title="Dashboard" />
      <div className="border-b border-line">
        <FilterBar resetHref="/dashboard">
          <Field label="From" className="w-36">
            <Input name="from" type="date" defaultValue={toISODate(from)} />
          </Field>
          <Field label="To" className="w-36">
            <Input name="to" type="date" defaultValue={toISODate(to)} />
          </Field>
          <Field label="Plan" className="w-48">
            <Select name="planId" defaultValue={params.planId ?? ""} placeholder="All plans" options={plans.map((p) => ({ value: p.id, label: p.name }))} />
          </Field>
        </FilterBar>
      </div>
      <PageBody>
        {params.notice && NOTICES[params.notice] && <p className="rounded-md bg-[#e3f5ea] px-3 py-2 text-[#18794e]">{NOTICES[params.notice]}</p>}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Link href="/subscriptions?state=ACTIVE">
            <Stat label="Active subscriptions" value={m.active.toLocaleString("en-IN")} hint={`${m.paused} paused`} />
          </Link>
          <Link href={`/invoices?from=${toISODate(from)}&to=${toISODate(to)}`}>
            <Stat label="Revenue invoiced" value={formatINR(m.invoiced)} hint="confirmed + paid, in period" />
          </Link>
          <Link href={`/payments?from=${toISODate(from)}&to=${toISODate(to)}`}>
            <Stat label="Payments received" value={formatINR(m.collected)} hint={`${collectionRate}% of invoiced`} tone="success" />
          </Link>
          <Link href="/invoices?status=outstanding">
            <Stat label="Still owed" value={formatINR(m.outstanding)} hint="all confirmed, unpaid invoices" />
          </Link>
        </div>

        {/* Recurring revenue truth: the number "nobody could say" before. */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="MRR (monthly recurring revenue)" value={formatINR(m.mrr)} hint={`ARR ${formatINRCompact(m.arr)}`} />
          <Stat label="New MRR in period" value={formatINR(m.newMrr)} tone="success" />
          <Stat label="Churned MRR in period" value={formatINR(m.churnedMrr)} tone={m.churnedMrr > 0 ? "danger" : undefined} />
          <Link href="/action-center">
            <Stat label="Revenue at risk" value={formatINR(m.revenueAtRisk)} hint="overdue + renewals due in 30 days" tone="danger" />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Section title="Invoiced vs collected — last 6 months">
            <BarChart
              data={m.series.map((s) => ({
                label: month.format(s.month),
                values: [
                  { name: "Invoiced", value: s.invoiced, color: "#1961ed" },
                  { name: "Collected", value: s.collected, color: "#8fd4ac" },
                ],
              }))}
            />
          </Section>
          <Section title={`Overdue · ${m.overdueCount.toLocaleString("en-IN")} invoices`} actions={<Link href="/invoices?status=overdue" className="text-xs text-accent">View all</Link>}>
            <div className="mb-3 text-xl font-semibold text-danger">{formatINR(m.overdueAmount)}</div>
            {m.aging.length === 0 ? (
              <p className="text-ink-3">Nothing overdue. 🎉</p>
            ) : (
              <ul className="space-y-2">
                {m.aging.map((a) => (
                  <li key={a.bucket} className="flex justify-between">
                    <span className="text-ink-2">
                      {a.bucket} <span className="text-ink-3">({a.count})</span>
                    </span>
                    <span className="tabular-nums">{formatINR(a.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <Section title="Subscriptions by status">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {SUBSCRIPTION_STATES.map((s) => (
              <Link key={s} href={`/subscriptions?state=${s}`} className="rounded-md bg-app px-3 py-2 hover:bg-hover">
                <div className="text-xs text-ink-3">{subscriptionStateLabel(s)}</div>
                <div className="font-semibold">{(m.byState[s] ?? 0).toLocaleString("en-IN")}</div>
              </Link>
            ))}
          </div>
          {m.drafts > 0 && (
            <p className="mt-3 text-ink-2">
              {m.drafts} draft invoice(s) waiting for review —{" "}
              <Link href="/invoices?status=draft" className="text-accent">
                review drafts
              </Link>
            </p>
          )}
        </Section>
      </PageBody>
    </>
  );
}

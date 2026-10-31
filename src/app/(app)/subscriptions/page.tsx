import Link from "next/link";
import type { Prisma, SubscriptionState } from "@prisma/client";
import { IconCalendarRepeat } from "@tabler/icons-react";
import { SUBSCRIPTION_STATES, SubscriptionStatus, subscriptionStateLabel } from "@/components/status";
import { LinkButton } from "@/components/ui/button";
import { FilterBar } from "@/components/ui/filter-bar";
import { Field, Input, Select } from "@/components/ui/form";
import { EmptyState, PageBody, PageHeader } from "@/components/ui/page";
import { PAGE_SIZE, Pagination, pageFrom } from "@/components/ui/pagination";
import { requireBackOffice } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";

export const metadata = { title: "Subscriptions" };

type Search = { q?: string; state?: string; planId?: string; page?: string };

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireBackOffice();
  const params = await searchParams;
  const page = pageFrom(params.page);
  const state = SUBSCRIPTION_STATES.includes(params.state as SubscriptionState) ? (params.state as SubscriptionState) : undefined;
  const q = params.q?.trim();

  const where: Prisma.SubscriptionWhereInput = {
    state,
    planId: params.planId || undefined,
    ...(q && {
      OR: [
        { number: { contains: q, mode: "insensitive" } },
        { customer: { name: { contains: q, mode: "insensitive" } } },
        { customer: { company: { contains: q, mode: "insensitive" } } },
      ],
    }),
  };

  const [subs, total, counts, plans] = await Promise.all([
    db.subscription.findMany({
      where,
      include: { customer: true, plan: true, lines: { where: { isActive: true }, select: { quantity: true, unitPrice: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.subscription.count({ where }),
    db.subscription.groupBy({ by: ["state"], _count: true }),
    db.plan.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const countOf = (s: SubscriptionState) => counts.find((c) => c.state === s)?._count ?? 0;

  return (
    <>
      <PageHeader
        icon={IconCalendarRepeat}
        title="Subscriptions"
        actions={
          <LinkButton href="/subscriptions/new" variant="primary">
            New quotation
          </LinkButton>
        }
      />
      <PageBody>
        {/* Pipeline view: everyone on the team sees where each subscription stands. */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {SUBSCRIPTION_STATES.map((s) => (
            <Link key={s} href={`/subscriptions?state=${s}`} className={`card px-3 py-2 transition hover:border-accent ${state === s ? "border-accent" : ""}`}>
              <div className="text-xs text-ink-3">{subscriptionStateLabel(s)}</div>
              <div className="text-lg font-semibold">{countOf(s).toLocaleString("en-IN")}</div>
            </Link>
          ))}
        </div>
        <div className="card overflow-hidden">
          <FilterBar resetHref="/subscriptions">
            <Field label="Search" className="w-60">
              <Input name="q" defaultValue={q} placeholder="Number, customer or company" />
            </Field>
            <Field label="Status" className="w-36">
              <Select name="state" defaultValue={state ?? ""} placeholder="All" options={SUBSCRIPTION_STATES.map((s) => ({ value: s, label: subscriptionStateLabel(s) }))} />
            </Field>
            <Field label="Plan" className="w-48">
              <Select name="planId" defaultValue={params.planId ?? ""} placeholder="All plans" options={plans.map((p) => ({ value: p.id, label: p.name }))} />
            </Field>
          </FilterBar>
          {subs.length === 0 ? (
            <EmptyState title="No subscriptions found" description="Try another filter or create a quotation." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Customer</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Start</th>
                    <th>Next invoice</th>
                    <th>Expiry</th>
                    <th className="text-right">Recurring (excl. GST)</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <Link href={`/subscriptions/${s.id}`} className="font-medium hover:text-accent">
                          {s.number}
                        </Link>
                      </td>
                      <td className="max-w-56 truncate">{s.customer.company ?? s.customer.name}</td>
                      <td>{s.plan.name}</td>
                      <td>
                        <SubscriptionStatus state={s.state} isPaused={s.isPaused} validUntil={s.validUntil} />
                      </td>
                      <td className="text-ink-2">{formatDate(s.startDate)}</td>
                      <td className="text-ink-2">{formatDate(s.nextInvoiceDate)}</td>
                      <td className="text-ink-2">{formatDate(s.endDate)}</td>
                      <td className="text-right tabular-nums">{formatINR(s.lines.reduce((a, l) => a + l.quantity * l.unitPrice, 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} total={total} params={{ q, state, planId: params.planId }} basePath="/subscriptions" />
        </div>
      </PageBody>
    </>
  );
}

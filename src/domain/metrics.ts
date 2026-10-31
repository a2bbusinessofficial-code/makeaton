import "server-only";
import { Prisma } from "@prisma/client";
import { addDays, today } from "@/lib/dates";
import { db } from "@/lib/db";

export type MetricsFilter = { from: Date; to: Date; planId?: string };

const planClause = (planId: string | undefined, alias = "s") => (planId ? Prisma.sql`AND ${Prisma.raw(`${alias}."planId"`)} = ${planId}` : Prisma.empty);

/** Monthly-normalised list value of a subscription line (before discounts and tax). */
const MRR_EXPR = Prisma.sql`
  SUM(l."quantity" * l."unitPrice" * CASE p."billingPeriod"
    WHEN 'DAILY' THEN 30.0 WHEN 'WEEKLY' THEN 52.0 / 12 WHEN 'MONTHLY' THEN 1.0 ELSE 1.0 / 12 END)`;

const num = (v: unknown) => Number(v ?? 0);

/**
 * Everything the finance lead asks at month end, computed with aggregate SQL so it stays
 * fast with thousands of subscriptions (no rows are loaded into the app).
 */
export async function getDashboardMetrics({ from, to, planId }: MetricsFilter) {
  const now = today();
  const toExclusive = addDays(to, 1);

  // Independent aggregates run in parallel.
  const [[kpis], [mrr], series, byState, aging] = await Promise.all([
    db.$queryRaw<Record<string, unknown>[]>`
    SELECT
      (SELECT COUNT(*) FROM "Subscription" s WHERE s."state" = 'ACTIVE' ${planClause(planId)}) AS active,
      (SELECT COUNT(*) FROM "Subscription" s WHERE s."state" = 'ACTIVE' AND s."isPaused" ${planClause(planId)}) AS paused,
      (SELECT COALESCE(SUM(i."total"), 0) FROM "Invoice" i JOIN "Subscription" s ON s."id" = i."subscriptionId"
        WHERE i."state" IN ('CONFIRMED', 'PAID') AND i."invoiceDate" >= ${from} AND i."invoiceDate" < ${toExclusive} ${planClause(planId)}) AS invoiced,
      (SELECT COALESCE(SUM(pm."amount"), 0) FROM "Payment" pm JOIN "Invoice" i ON i."id" = pm."invoiceId" JOIN "Subscription" s ON s."id" = i."subscriptionId"
        WHERE pm."paymentDate" >= ${from} AND pm."paymentDate" < ${toExclusive} ${planClause(planId)}) AS collected,
      (SELECT COALESCE(SUM(i."total" - i."amountPaid"), 0) FROM "Invoice" i JOIN "Subscription" s ON s."id" = i."subscriptionId"
        WHERE i."state" = 'CONFIRMED' ${planClause(planId)}) AS outstanding,
      (SELECT COUNT(*) FROM "Invoice" i JOIN "Subscription" s ON s."id" = i."subscriptionId"
        WHERE i."state" = 'CONFIRMED' AND i."dueDate" < ${now} ${planClause(planId)}) AS overdue_count,
      (SELECT COALESCE(SUM(i."total" - i."amountPaid"), 0) FROM "Invoice" i JOIN "Subscription" s ON s."id" = i."subscriptionId"
        WHERE i."state" = 'CONFIRMED' AND i."dueDate" < ${now} ${planClause(planId)}) AS overdue_amount,
      (SELECT COUNT(*) FROM "Invoice" i JOIN "Subscription" s ON s."id" = i."subscriptionId"
        WHERE i."state" = 'DRAFT' ${planClause(planId)}) AS drafts`,
    db.$queryRaw<Record<string, unknown>[]>`
    SELECT
      COALESCE((SELECT ${MRR_EXPR} FROM "SubscriptionLine" l JOIN "Subscription" s ON s."id" = l."subscriptionId" JOIN "Plan" p ON p."id" = s."planId"
        WHERE s."state" = 'ACTIVE' AND NOT s."isPaused" AND l."isActive" ${planClause(planId)}), 0) AS mrr,
      COALESCE((SELECT ${MRR_EXPR} FROM "SubscriptionLine" l JOIN "Subscription" s ON s."id" = l."subscriptionId" JOIN "Plan" p ON p."id" = s."planId"
        WHERE s."state" = 'CLOSED' AND s."closedAt" >= ${from} AND s."closedAt" < ${toExclusive} AND l."isActive" ${planClause(planId)}), 0) AS churned,
      COALESCE((SELECT ${MRR_EXPR} FROM "SubscriptionLine" l JOIN "Subscription" s ON s."id" = l."subscriptionId" JOIN "Plan" p ON p."id" = s."planId"
        WHERE s."state" IN ('ACTIVE', 'CLOSED') AND s."startDate" >= ${from} AND s."startDate" < ${toExclusive} AND l."isActive" ${planClause(planId)}), 0) AS new_mrr,
      COALESCE((SELECT ${MRR_EXPR} FROM "SubscriptionLine" l JOIN "Subscription" s ON s."id" = l."subscriptionId" JOIN "Plan" p ON p."id" = s."planId"
        WHERE s."state" = 'ACTIVE' AND s."endDate" BETWEEN ${now} AND ${addDays(now, 30)} AND l."isActive" ${planClause(planId)}), 0) AS renewing_mrr`,
    db.$queryRaw<{ month: Date; invoiced: unknown; collected: unknown }[]>`
    WITH months AS (
      SELECT generate_series(date_trunc('month', ${now}::date) - interval '5 months', date_trunc('month', ${now}::date), interval '1 month')::date AS month
    )
    SELECT m.month,
      (SELECT COALESCE(SUM(i."total"), 0) FROM "Invoice" i JOIN "Subscription" s ON s."id" = i."subscriptionId"
        WHERE i."state" IN ('CONFIRMED', 'PAID') AND date_trunc('month', i."invoiceDate") = m.month ${planClause(planId)}) AS invoiced,
      (SELECT COALESCE(SUM(pm."amount"), 0) FROM "Payment" pm JOIN "Invoice" i ON i."id" = pm."invoiceId" JOIN "Subscription" s ON s."id" = i."subscriptionId"
        WHERE date_trunc('month', pm."paymentDate") = m.month ${planClause(planId)}) AS collected
    FROM months m ORDER BY m.month`,
    db.$queryRaw<{ state: string; count: unknown }[]>`
    SELECT s."state", COUNT(*) AS count FROM "Subscription" s WHERE TRUE ${planClause(planId)} GROUP BY s."state"`,
    db.$queryRaw<{ bucket: string; amount: unknown; count: unknown }[]>`
    SELECT CASE
        WHEN ${now}::date - i."dueDate" <= 30 THEN '1–30 days'
        WHEN ${now}::date - i."dueDate" <= 60 THEN '31–60 days'
        WHEN ${now}::date - i."dueDate" <= 90 THEN '61–90 days'
        ELSE '90+ days' END AS bucket,
      SUM(i."total" - i."amountPaid") AS amount, COUNT(*) AS count
    FROM "Invoice" i JOIN "Subscription" s ON s."id" = i."subscriptionId"
    WHERE i."state" = 'CONFIRMED' AND i."dueDate" < ${now} ${planClause(planId)}
    GROUP BY 1 ORDER BY MIN(${now}::date - i."dueDate")`,
  ]);

  const mrrValue = Math.round(num(mrr.mrr));
  return {
    active: num(kpis.active),
    paused: num(kpis.paused),
    invoiced: num(kpis.invoiced),
    collected: num(kpis.collected),
    outstanding: num(kpis.outstanding),
    overdueCount: num(kpis.overdue_count),
    overdueAmount: num(kpis.overdue_amount),
    drafts: num(kpis.drafts),
    mrr: mrrValue,
    arr: mrrValue * 12,
    churnedMrr: Math.round(num(mrr.churned)),
    newMrr: Math.round(num(mrr.new_mrr)),
    revenueAtRisk: num(kpis.overdue_amount) + Math.round(num(mrr.renewing_mrr)),
    series: series.map((r) => ({ month: r.month, invoiced: num(r.invoiced), collected: num(r.collected) })),
    byState: Object.fromEntries(byState.map((r) => [r.state, num(r.count)])) as Record<string, number>,
    aging: aging.map((r) => ({ bucket: r.bucket, amount: num(r.amount), count: num(r.count) })),
  };
}

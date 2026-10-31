import "server-only";
import { Prisma, type PaymentMethod } from "@prisma/client";
import { logActivity } from "@/lib/activity";
import { addDays, addPeriods, today, toISODate } from "@/lib/dates";
import { db, type Tx } from "@/lib/db";
import { env } from "@/lib/env";
import { sendMail } from "@/lib/mail/mailer";
import { invoiceEmail } from "@/lib/mail/templates";
import { nextNumber } from "@/lib/sequence";
import { priceLines, type PricingDiscount, type PricingLine, type PricingResult } from "./pricing";
import type { SubscriptionWithRelations } from "./subscriptions";

export class BillingError extends Error {}

// ───────────────────────────── Pricing a subscription ─────────────────────────────

/** The minimum shape pricing needs — satisfied by every subscription query in the app. */
type PriceableSubscription = {
  lines: (Pick<SubscriptionWithRelations["lines"][number], "id" | "productId" | "description" | "quantity" | "unitPrice" | "isActive"> & { taxes: { rateBps: number }[] })[];
  discounts: SubscriptionWithRelations["discounts"];
};

export function toPricingLines(sub: PriceableSubscription): PricingLine[] {
  return sub.lines.map((l) => ({
    key: l.id,
    productId: l.productId,
    description: l.description,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    taxRateBps: l.taxes.reduce((sum, t) => sum + t.rateBps, 0),
    isActive: l.isActive,
  }));
}

export function toPricingDiscounts(sub: PriceableSubscription): PricingDiscount[] {
  return sub.discounts.map((d) => ({ ...d, productIds: d.products.map((p) => p.id) }));
}

export function priceSubscription(sub: PriceableSubscription, onDate: Date): PricingResult {
  return priceLines(toPricingLines(sub), toPricingDiscounts(sub), onDate);
}

// ───────────────────────────── Invoice generation ─────────────────────────────

const billingInclude = {
  customer: true,
  plan: true,
  paymentTerm: true,
  lines: { include: { taxes: true } },
  discounts: { include: { products: { select: { id: true } } } },
} satisfies Prisma.SubscriptionInclude;

type BillableSubscription = Prisma.SubscriptionGetPayload<{ include: typeof billingInclude }>;

function periodFor(sub: BillableSubscription, periodStart: Date) {
  const anchorDay = sub.startDate.getUTCDate();
  const nextStart = addPeriods(periodStart, sub.plan.billingPeriod, 1, anchorDay);
  return { periodStart, periodEnd: addDays(nextStart, -1), nextStart };
}

/** Creates one draft invoice for a billing period, consuming discount usages atomically. */
async function createInvoiceForPeriod(tx: Tx, sub: BillableSubscription, periodStart: Date, periodEnd: Date) {
  const invoiceDate = periodStart;
  const pricing = priceSubscription(sub, invoiceDate);

  const invoice = await tx.invoice.create({
    data: {
      subscriptionId: sub.id,
      customerId: sub.customerId,
      invoiceDate,
      dueDate: addDays(invoiceDate, sub.paymentTerm.dueDays),
      periodStart,
      periodEnd,
      customerName: sub.customer.company ? `${sub.customer.name} (${sub.customer.company})` : sub.customer.name,
      customerEmail: sub.customer.email,
      customerAddress: [sub.customer.address, sub.customer.state].filter(Boolean).join(", ") || null,
      customerGstin: sub.customer.gstin,
      subtotal: pricing.subtotal,
      discountTotal: pricing.discountTotal,
      taxTotal: pricing.taxTotal,
      total: pricing.total,
      lines: {
        create: pricing.lines.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discountAmount: l.discountAmount,
          taxRateBps: l.taxRateBps,
          taxAmount: l.taxAmount,
          total: l.total,
        })),
      },
    },
  });

  for (const applied of pricing.appliedDiscounts) {
    // Conditional increment: a discount whose limit was reached concurrently is not over-used.
    const updated = await tx.$executeRaw`
      UPDATE "Discount" SET "usedCount" = "usedCount" + 1
      WHERE "id" = ${applied.discountId} AND ("usageLimit" IS NULL OR "usedCount" < "usageLimit")`;
    if (updated === 0) throw new BillingError(`Discount "${applied.name}" ran out while billing — retry.`);
    await tx.discountUsage.create({ data: { discountId: applied.discountId, invoiceId: invoice.id, amount: applied.amount } });
  }

  return { invoice, pricing };
}

export type BillingOutcome = {
  subscriptionId: string;
  number: string;
  customer: string;
  status: "created" | "skipped" | "failed";
  invoices: number;
  amount: number;
  message?: string;
};

/**
 * Bills one subscription for every period that is due on or before `asOf`.
 * - Catches up periods missed while billing was not run (nothing is skipped).
 * - A partial unique index on (subscriptionId, periodStart) makes double billing impossible,
 *   even if two runs overlap; such periods are reported as "skipped".
 */
export async function billSubscription(subscriptionId: string, asOf: Date, opts: { autoConfirm?: boolean; dryRun?: boolean } = {}): Promise<BillingOutcome> {
  const sub = await db.subscription.findUniqueOrThrow({ where: { id: subscriptionId }, include: billingInclude });
  const outcome: BillingOutcome = { subscriptionId, number: sub.number, customer: sub.customer.name, status: "skipped", invoices: 0, amount: 0 };

  if (sub.state !== "ACTIVE" || sub.isPaused || !sub.nextInvoiceDate || sub.nextInvoiceDate > asOf) {
    outcome.message = sub.isPaused ? "paused" : "not due";
    return outcome;
  }

  try {
    await db.$transaction(async (tx) => {
      let cursor: Date | null = sub.nextInvoiceDate;
      while (cursor && cursor <= asOf && (!sub.endDate || cursor <= sub.endDate)) {
        const { periodStart, periodEnd, nextStart } = periodFor(sub, cursor);
        const exists = await tx.invoice.findFirst({ where: { subscriptionId: sub.id, periodStart, state: { not: "CANCELLED" } }, select: { id: true } });
        if (!exists) {
          if (opts.dryRun) {
            outcome.amount += priceSubscription(sub, periodStart).total;
          } else {
            const { invoice, pricing } = await createInvoiceForPeriod(tx, sub, periodStart, periodEnd);
            if (opts.autoConfirm) await confirmInvoiceTx(tx, invoice.id, invoice.invoiceDate);
            outcome.amount += pricing.total;
          }
          outcome.invoices += 1;
        }
        cursor = nextStart;
      }
      if (opts.dryRun) return;
      const finished = sub.endDate && cursor && cursor > sub.endDate;
      await tx.subscription.update({ where: { id: sub.id }, data: { nextInvoiceDate: finished ? null : cursor } });
    });
    outcome.status = outcome.invoices > 0 ? "created" : "skipped";
    if (outcome.invoices === 0) outcome.message = "already billed";
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      outcome.status = "skipped";
      outcome.message = "already billed (concurrent run)";
    } else {
      outcome.status = "failed";
      outcome.message = error instanceof Error ? error.message : "Unknown error";
    }
  }
  return outcome;
}

/** Billing day: invoices every due subscription. Records an auditable BillingRun. */
export async function runBilling({ trigger, asOf = today(), autoConfirm = false, dryRun = false }: { trigger: string; asOf?: Date; autoConfirm?: boolean; dryRun?: boolean }) {
  const due = await db.subscription.findMany({
    where: { state: "ACTIVE", isPaused: false, nextInvoiceDate: { lte: asOf } },
    select: { id: true },
    orderBy: { nextInvoiceDate: "asc" },
  });

  const outcomes: BillingOutcome[] = [];
  const BATCH = 10;
  for (let i = 0; i < due.length; i += BATCH) {
    const batch = due.slice(i, i + BATCH);
    outcomes.push(...(await Promise.all(batch.map((s) => billSubscription(s.id, asOf, { autoConfirm, dryRun })))));
  }

  const summary = {
    created: outcomes.filter((o) => o.status === "created"),
    skipped: outcomes.filter((o) => o.status === "skipped"),
    failed: outcomes.filter((o) => o.status === "failed"),
  };
  const invoiceCount = summary.created.reduce((a, o) => a + o.invoices, 0);
  const totalAmount = summary.created.reduce((a, o) => a + o.amount, 0);

  if (dryRun) return { runId: null, invoiceCount, totalAmount, outcomes, ...counts(summary) };

  const run = await db.billingRun.create({
    data: {
      trigger,
      runDate: asOf,
      createdCount: invoiceCount,
      skippedCount: summary.skipped.length,
      failedCount: summary.failed.length,
      totalAmount,
      finishedAt: new Date(),
      details: outcomes.filter((o) => o.status !== "skipped" || o.message !== "not due") as unknown as Prisma.InputJsonValue,
    },
  });
  await logActivity({ entityType: "billing", entityId: run.id, action: "billing_run", message: `Billing run (${trigger}): ${invoiceCount} invoices, ${summary.skipped.length} skipped, ${summary.failed.length} failed`, actorName: trigger });
  return { runId: run.id, invoiceCount, totalAmount, outcomes, ...counts(summary) };
}

const counts = (s: Record<"created" | "skipped" | "failed", BillingOutcome[]>) => ({ created: s.created.length, skipped: s.skipped.length, failed: s.failed.length });

// ───────────────────────────── Invoice actions ─────────────────────────────

async function confirmInvoiceTx(tx: Tx, invoiceId: string, invoiceDate: Date) {
  const number = await nextNumber(tx, "INV", invoiceDate);
  const updated = await tx.invoice.updateMany({ where: { id: invoiceId, state: "DRAFT" }, data: { state: "CONFIRMED", number, confirmedAt: new Date() } });
  if (updated.count === 0) throw new BillingError("Only draft invoices can be confirmed.");
  return number;
}

export async function confirmInvoice(invoiceId: string, actorName: string) {
  const invoice = await db.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  const number = await db.$transaction((tx) => confirmInvoiceTx(tx, invoiceId, invoice.invoiceDate));
  await logActivity({ entityType: "invoice", entityId: invoiceId, action: "confirmed", message: `Invoice confirmed as ${number}`, actorName });
}

/** Cancels an unpaid invoice. Its period becomes billable again, so nothing is lost. */
export async function cancelInvoice(invoiceId: string, actorName: string) {
  const updated = await db.invoice.updateMany({
    where: { id: invoiceId, state: { in: ["DRAFT", "CONFIRMED"] }, amountPaid: 0 },
    data: { state: "CANCELLED", cancelledAt: new Date() },
  });
  if (updated.count === 0) throw new BillingError("Only unpaid draft or confirmed invoices can be cancelled.");
  await db.$executeRaw`
    UPDATE "Discount" d SET "usedCount" = GREATEST(d."usedCount" - 1, 0)
    FROM "DiscountUsage" u WHERE u."discountId" = d."id" AND u."invoiceId" = ${invoiceId}`;
  await db.discountUsage.deleteMany({ where: { invoiceId } });
  await logActivity({ entityType: "invoice", entityId: invoiceId, action: "cancelled", message: "Invoice cancelled; discount usage released", actorName });
}

export async function sendInvoice(invoiceId: string, actorName: string) {
  const invoice = await db.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { lines: true } });
  if (invoice.state === "DRAFT") await confirmInvoice(invoiceId, actorName);
  else if (invoice.state === "CANCELLED") throw new BillingError("Cancelled invoices cannot be sent.");

  const fresh = await db.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { lines: true } });
  const mail = invoiceEmail({ ...fresh, number: fresh.number! }, `${env().NEXT_PUBLIC_SITE_URL}/portal/invoices/${invoiceId}`);
  const result = await sendMail({ to: fresh.customerEmail, ...mail });
  if (!result.ok) throw new BillingError(`Invoice confirmed but the email could not be sent: ${result.error}`);
  await db.invoice.update({ where: { id: invoiceId }, data: { sentAt: new Date() } });
  await logActivity({ entityType: "invoice", entityId: invoiceId, action: "sent", message: `Emailed to ${fresh.customerEmail}`, actorName });
}

// ───────────────────────────── Payments ─────────────────────────────

/**
 * Records a payment against a confirmed invoice. A single SQL statement checks the
 * outstanding amount and updates it, so concurrent payments cannot overpay an invoice.
 * The invoice flips to PAID automatically when fully settled.
 */
export async function recordPayment(input: { invoiceId: string; method: PaymentMethod; amount: number; paymentDate: Date; note?: string; recordedById?: string; actorName: string }) {
  if (!(input.amount > 0)) throw new BillingError("Amount must be greater than zero.");
  if (input.paymentDate > today()) throw new BillingError("Payment date cannot be in the future.");

  const state = await db.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ state: string; amountPaid: number; total: number }[]>`
      UPDATE "Invoice"
      SET "amountPaid" = "amountPaid" + ${input.amount},
          "state" = CASE WHEN "amountPaid" + ${input.amount} >= "total" THEN 'PAID'::"InvoiceState" ELSE "state" END,
          "updatedAt" = NOW()
      WHERE "id" = ${input.invoiceId} AND "state" = 'CONFIRMED' AND "amountPaid" + ${input.amount} <= "total"
      RETURNING "state", "amountPaid", "total"`;
    if (rows.length === 0) {
      const invoice = await tx.invoice.findUnique({ where: { id: input.invoiceId } });
      if (!invoice) throw new BillingError("Invoice not found.");
      if (invoice.state !== "CONFIRMED") throw new BillingError(`Payments can only be recorded on confirmed invoices (this one is ${invoice.state.toLowerCase()}).`);
      throw new BillingError(`Amount exceeds the outstanding balance of ₹${((invoice.total - invoice.amountPaid) / 100).toFixed(2)}.`);
    }
    await tx.payment.create({
      data: { invoiceId: input.invoiceId, method: input.method, amount: input.amount, paymentDate: input.paymentDate, note: input.note || null, recordedById: input.recordedById },
    });
    return rows[0].state;
  });

  await logActivity({
    entityType: "invoice",
    entityId: input.invoiceId,
    action: "payment",
    message: `Payment of ₹${(input.amount / 100).toFixed(2)} via ${input.method.replace("_", " ").toLowerCase()} on ${toISODate(input.paymentDate)}${state === "PAID" ? " — invoice fully paid" : ""}`,
    actorName: input.actorName,
  });
  return state;
}

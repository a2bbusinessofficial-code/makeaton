import "server-only";
import type { Prisma, SubscriptionState } from "@prisma/client";
import { logActivity } from "@/lib/activity";
import { addDays, addPeriods, diffDays, today } from "@/lib/dates";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendMail } from "@/lib/mail/mailer";
import { quotationEmail } from "@/lib/mail/templates";
import { priceSubscription } from "./billing";

/** Allowed moves of the lifecycle Draft → Quotation → Confirmed → Active → Closed. */
const TRANSITIONS: Record<SubscriptionState, SubscriptionState[]> = {
  DRAFT: ["QUOTATION", "CONFIRMED"],
  QUOTATION: ["DRAFT", "CONFIRMED"],
  CONFIRMED: ["ACTIVE", "CLOSED"],
  ACTIVE: ["CLOSED"],
  CLOSED: [],
};

export class DomainError extends Error {}

export function canTransition(from: SubscriptionState, to: SubscriptionState) {
  return TRANSITIONS[from].includes(to);
}

function assertTransition(from: SubscriptionState, to: SubscriptionState) {
  if (!canTransition(from, to)) throw new DomainError(`A ${from.toLowerCase()} subscription cannot move to ${to.toLowerCase()}.`);
}

export const subscriptionInclude = {
  customer: true,
  plan: { include: { product: true } },
  paymentTerm: true,
  template: true,
  lines: { include: { taxes: true, product: true, variant: true }, orderBy: { id: "asc" } },
  discounts: { include: { products: { select: { id: true } } } },
} satisfies Prisma.SubscriptionInclude;

export type SubscriptionWithRelations = Prisma.SubscriptionGetPayload<{ include: typeof subscriptionInclude }>;

async function load(id: string) {
  const sub = await db.subscription.findUnique({ where: { id }, include: subscriptionInclude });
  if (!sub) throw new DomainError("Subscription not found.");
  return sub;
}

/** Checks the plan rules (availability window, minimum quantity) before a subscription is confirmed. */
export function validateAgainstPlan(sub: SubscriptionWithRelations) {
  const { plan } = sub;
  if (!plan.isActive) throw new DomainError(`Plan "${plan.name}" is archived.`);
  if (plan.availableFrom && sub.startDate < plan.availableFrom) throw new DomainError(`Plan "${plan.name}" is only available from ${plan.availableFrom.toISOString().slice(0, 10)}.`);
  if (plan.availableTo && sub.startDate > plan.availableTo) throw new DomainError(`Plan "${plan.name}" was only available until ${plan.availableTo.toISOString().slice(0, 10)}.`);
  const planLine = sub.lines.find((l) => l.productId === plan.productId);
  if (planLine && planLine.quantity < plan.minQuantity) throw new DomainError(`Plan "${plan.name}" requires a minimum quantity of ${plan.minQuantity}.`);
  if (sub.lines.filter((l) => l.isActive).length === 0) throw new DomainError("Add at least one product line.");
  if (sub.endDate && sub.endDate <= sub.startDate) throw new DomainError("Expiry date must be after the start date.");
}

export async function sendQuotation(id: string, actorName: string) {
  const sub = await load(id);
  assertTransition(sub.state, "QUOTATION");
  validateAgainstPlan(sub);
  const validUntil = addDays(today(), sub.template?.validityDays ?? 30);
  await db.subscription.update({ where: { id }, data: { state: "QUOTATION", validUntil } });
  await logActivity({ entityType: "subscription", entityId: id, action: "quotation_sent", message: `Quotation sent to ${sub.customer.email}, valid until ${validUntil.toISOString().slice(0, 10)}`, actorName });

  const { total } = priceSubscription(sub, today());
  const mail = quotationEmail({ number: sub.number, customerName: sub.customer.name, validUntil, total, planName: sub.plan.name }, `${env().NEXT_PUBLIC_SITE_URL}/portal/subscriptions/${id}`);
  return sendMail({ to: sub.customer.email, ...mail });
}

export async function backToDraft(id: string, actorName: string) {
  const sub = await load(id);
  assertTransition(sub.state, "DRAFT");
  await db.subscription.update({ where: { id }, data: { state: "DRAFT", validUntil: null } });
  await logActivity({ entityType: "subscription", entityId: id, action: "draft", message: "Moved back to draft for editing", actorName });
}

/** Confirms a subscription; activates it immediately when its start date has arrived. */
export async function confirmSubscription(id: string, actorName: string) {
  const sub = await load(id);
  assertTransition(sub.state, "CONFIRMED");
  if (sub.state === "QUOTATION" && sub.validUntil && sub.validUntil < today()) {
    throw new DomainError("This quotation has expired. Move it back to draft and send a new one.");
  }
  validateAgainstPlan(sub);
  await db.subscription.update({ where: { id }, data: { state: "CONFIRMED" } });
  await logActivity({ entityType: "subscription", entityId: id, action: "confirmed", message: "Subscription confirmed", actorName });
  if (sub.startDate <= today()) await activateSubscription(id, "System");
}

export async function activateSubscription(id: string, actorName: string) {
  const sub = await load(id);
  assertTransition(sub.state, "ACTIVE");
  await db.subscription.update({ where: { id }, data: { state: "ACTIVE", nextInvoiceDate: sub.nextInvoiceDate ?? sub.startDate } });
  await logActivity({ entityType: "subscription", entityId: id, action: "activated", message: "Subscription is now active and will be billed automatically", actorName });
}

export async function closeSubscription(id: string, reason: string, actorName: string, { bySystem = false } = {}) {
  const sub = await load(id);
  assertTransition(sub.state, "CLOSED");
  if (!bySystem && sub.state === "ACTIVE" && !sub.plan.closable) throw new DomainError(`Plan "${sub.plan.name}" does not allow closing early.`);
  await db.subscription.update({ where: { id }, data: { state: "CLOSED", closedAt: new Date(), closeReason: reason, nextInvoiceDate: null, isPaused: false } });
  await logActivity({ entityType: "subscription", entityId: id, action: "closed", message: `Closed: ${reason}`, actorName });
}

export async function pauseSubscription(id: string, actorName: string) {
  const sub = await load(id);
  if (sub.state !== "ACTIVE" || sub.isPaused) throw new DomainError("Only running active subscriptions can be paused.");
  if (!sub.plan.pausable) throw new DomainError(`Plan "${sub.plan.name}" cannot be paused.`);
  await db.subscription.update({ where: { id }, data: { isPaused: true, pausedAt: today() } });
  await logActivity({ entityType: "subscription", entityId: id, action: "paused", message: "Paused — no invoices until resumed", actorName });
}

/** Resumes billing and pushes the next invoice date out by the time spent paused. */
export async function resumeSubscription(id: string, actorName: string) {
  const sub = await load(id);
  if (!sub.isPaused) throw new DomainError("Subscription is not paused.");
  const pausedDays = sub.pausedAt ? Math.max(0, diffDays(today(), sub.pausedAt)) : 0;
  const nextInvoiceDate = sub.nextInvoiceDate ? addDays(sub.nextInvoiceDate, pausedDays) : null;
  const endDate = sub.endDate ? addDays(sub.endDate, pausedDays) : null;
  await db.subscription.update({ where: { id }, data: { isPaused: false, pausedAt: null, nextInvoiceDate, endDate } });
  await logActivity({ entityType: "subscription", entityId: id, action: "resumed", message: `Resumed after ${pausedDays} day(s); billing dates moved accordingly`, actorName });
}

/** Extends a fixed-term subscription by one billing period. */
export async function renewSubscription(id: string, actorName: string) {
  const sub = await load(id);
  if (!sub.plan.renewable) throw new DomainError(`Plan "${sub.plan.name}" is not renewable.`);
  if (sub.state !== "ACTIVE" && sub.state !== "CONFIRMED") throw new DomainError("Only confirmed or active subscriptions can be renewed.");
  if (!sub.endDate) throw new DomainError("This subscription has no expiry date — it already renews automatically.");
  const endDate = addPeriods(sub.endDate, sub.plan.billingPeriod, 1);
  await db.subscription.update({ where: { id }, data: { endDate } });
  await logActivity({ entityType: "subscription", entityId: id, action: "renewed", message: `Renewed until ${endDate.toISOString().slice(0, 10)}`, actorName });
}

/** Switches an add-on line on or off. Takes effect from the next invoice. */
export async function toggleLine(subscriptionId: string, lineId: string, actorName: string) {
  const sub = await load(subscriptionId);
  if (sub.state === "CLOSED") throw new DomainError("Closed subscriptions cannot be changed.");
  const line = sub.lines.find((l) => l.id === lineId);
  if (!line) throw new DomainError("Line not found.");
  if (line.product.type !== "ADDON") throw new DomainError("Only add-ons can be switched on and off.");
  await db.subscriptionLine.update({ where: { id: lineId }, data: { isActive: !line.isActive } });
  await logActivity({ entityType: "subscription", entityId: subscriptionId, action: "addon_toggled", message: `Add-on "${line.description}" switched ${line.isActive ? "off" : "on"}`, actorName });
}

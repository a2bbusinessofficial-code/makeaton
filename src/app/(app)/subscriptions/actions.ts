"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/components/ui/action-form";
import { billSubscription } from "@/domain/billing";
import { buildLine, createLine } from "@/domain/lines";
import * as lifecycle from "@/domain/subscriptions";
import { logActivity } from "@/lib/activity";
import { runAction } from "@/lib/actions";
import { requireBackOffice } from "@/lib/auth";
import { addPeriods, today } from "@/lib/dates";
import { db } from "@/lib/db";
import { f, formValues } from "@/lib/forms";
import { nextNumber } from "@/lib/sequence";

const path = (form: FormData) => `/subscriptions/${form.get("id")}`;

const createSchema = z
  .object({
    customerEmail: z.string().trim().toLowerCase().min(1, "Choose a customer"),
    planId: f.id("plan"),
    templateId: f.optionalId(),
    paymentTermId: f.optionalId(),
    startDate: f.date("Start date"),
    endDate: f.optionalDate(),
    terms: f.optionalInt("Number of periods", 1),
    notes: f.optionalText(),
  })
  .refine((v) => !v.endDate || v.endDate > v.startDate, { message: "Expiry date must be after the start date" });

/** Creates a draft subscription, copying plan, lines, terms and validity from a template if chosen. */
export async function createSubscription(_: ActionState, form: FormData): Promise<ActionState> {
  let id = "";
  const result = await runAction(async () => {
    const user = await requireBackOffice();
    const input = createSchema.parse(formValues(form));
    const customer = await db.customer.findUnique({ where: { email: input.customerEmail } });
    if (!customer) throw new lifecycle.DomainError("No customer with that email. Create the customer first.");
    const template = input.templateId ? await db.quotationTemplate.findUnique({ where: { id: input.templateId }, include: { lines: true } }) : null;
    const plan = await db.plan.findUniqueOrThrow({ where: { id: template?.planId ?? input.planId } });
    const paymentTermId = input.paymentTermId ?? template?.paymentTermId ?? (await db.paymentTerm.findFirst({ orderBy: [{ isDefault: "desc" }, { dueDays: "asc" }] }))?.id;
    if (!paymentTermId) throw new lifecycle.DomainError("Create a payment term first (Taxes & terms).");
    const endDate = input.endDate ?? (input.terms ? addPeriods(input.startDate, plan.billingPeriod, input.terms) : null);

    const sourceLines = template?.lines.length ? template.lines : [{ productId: plan.productId, variantId: null, quantity: plan.minQuantity }];
    id = await db.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
        data: {
          number: await nextNumber(tx, "SUB", today()),
          customerId: customer.id,
          planId: plan.id,
          templateId: template?.id,
          paymentTermId,
          startDate: input.startDate,
          endDate,
          notes: input.notes ?? template?.notes,
          createdById: user.id,
        },
      });
      for (const line of sourceLines) await createLine(sub.id, await buildLine(plan, line, tx), tx);
      return sub.id;
    });
    await logActivity({ entityType: "subscription", entityId: id, action: "created", message: template ? `Created from template "${template.name}"` : "Created", actorName: user.fullName });
  });
  if (result?.error) return result;
  redirect(`/subscriptions/${id}`);
}

const lineSchema = z.object({ id: f.id("subscription"), productId: f.id("product"), variantId: f.optionalId(), quantity: f.int("Quantity", 1) });

export async function addLine(_: ActionState, form: FormData) {
  return runAction(async () => {
    const user = await requireBackOffice();
    const input = lineSchema.parse(formValues(form));
    const sub = await db.subscription.findUniqueOrThrow({ where: { id: input.id }, include: { plan: true } });
    const product = await db.product.findUniqueOrThrow({ where: { id: input.productId } });
    if (sub.state === "CLOSED") throw new lifecycle.DomainError("Closed subscriptions cannot be changed.");
    if (sub.state !== "DRAFT" && product.type !== "ADDON") throw new lifecycle.DomainError("After confirmation only add-ons can be added. Move a quotation back to draft to change it.");
    await createLine(sub.id, await buildLine(sub.plan, input));
    await logActivity({ entityType: "subscription", entityId: sub.id, action: "line_added", message: `Added ${input.quantity} × ${product.name}`, actorName: user.fullName });
    return "Line added";
  }, path(form));
}

export async function updateLineQuantity(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireBackOffice();
    const { id, lineId, quantity } = z.object({ id: f.id("subscription"), lineId: f.id("line"), quantity: f.int("Quantity", 1) }).parse(formValues(form));
    const sub = await db.subscription.findUniqueOrThrow({ where: { id } });
    if (sub.state !== "DRAFT") throw new lifecycle.DomainError("Quantities can only be changed while the subscription is a draft.");
    await db.subscriptionLine.update({ where: { id: lineId, subscriptionId: id }, data: { quantity } });
    return "Quantity updated";
  }, path(form));
}

export async function removeLine(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireBackOffice();
    const sub = await db.subscription.findUniqueOrThrow({ where: { id: String(form.get("id")) } });
    if (sub.state !== "DRAFT") throw new lifecycle.DomainError("Lines can only be removed while the subscription is a draft.");
    await db.subscriptionLine.delete({ where: { id: String(form.get("lineId")), subscriptionId: sub.id } });
  }, path(form));
}

export async function attachDiscount(_: ActionState, form: FormData) {
  return runAction(async () => {
    const user = await requireBackOffice();
    const { id, discountId } = z.object({ id: f.id("subscription"), discountId: f.id("discount") }).parse(formValues(form));
    const discount = await db.discount.findUniqueOrThrow({ where: { id: discountId } });
    if (!discount.isActive || discount.endDate < today()) throw new lifecycle.DomainError("That discount is no longer available.");
    await db.subscription.update({ where: { id }, data: { discounts: { connect: { id: discountId } } } });
    await logActivity({ entityType: "subscription", entityId: id, action: "discount_attached", message: `Discount "${discount.name}" attached — applies automatically on the next invoices`, actorName: user.fullName });
    return "Discount attached";
  }, path(form));
}

export async function detachDiscount(_: ActionState, form: FormData) {
  return runAction(async () => {
    const user = await requireBackOffice();
    const id = String(form.get("id"));
    const discountId = String(form.get("discountId"));
    await db.subscription.update({ where: { id }, data: { discounts: { disconnect: { id: discountId } } } });
    await logActivity({ entityType: "subscription", entityId: id, action: "discount_removed", message: "Discount removed", actorName: user.fullName });
  }, path(form));
}

/** One handler for every lifecycle button; the domain layer enforces what is allowed. */
export async function transition(_: ActionState, form: FormData) {
  return runAction(async () => {
    const user = await requireBackOffice();
    const id = String(form.get("id"));
    const actor = user.fullName;
    switch (form.get("to")) {
      case "send": {
        const mail = await lifecycle.sendQuotation(id, actor);
        return mail.ok ? "Quotation sent to the customer" : `Quotation marked as sent, but the email failed: ${mail.error}`;
      }
      case "draft":
        return void (await lifecycle.backToDraft(id, actor));
      case "confirm":
        return void (await lifecycle.confirmSubscription(id, actor));
      case "activate":
        return void (await lifecycle.activateSubscription(id, actor));
      case "pause":
        return void (await lifecycle.pauseSubscription(id, actor));
      case "resume":
        return void (await lifecycle.resumeSubscription(id, actor));
      case "renew":
        return void (await lifecycle.renewSubscription(id, actor));
      case "close":
        return void (await lifecycle.closeSubscription(id, String(form.get("reason") || "Closed by staff"), actor));
      case "toggle-line":
        return void (await lifecycle.toggleLine(id, String(form.get("lineId")), actor));
      default:
        throw new lifecycle.DomainError("Unknown action.");
    }
  }, [path(form), "/subscriptions"]);
}

export async function billNow(_: ActionState, form: FormData) {
  return runAction(async () => {
    const user = await requireBackOffice();
    const outcome = await billSubscription(String(form.get("id")), today());
    if (outcome.status === "failed") throw new lifecycle.DomainError(outcome.message ?? "Billing failed");
    if (outcome.invoices > 0) await logActivity({ entityType: "subscription", entityId: outcome.subscriptionId, action: "billed", message: `${outcome.invoices} invoice(s) generated manually`, actorName: user.fullName });
    return outcome.invoices > 0 ? `${outcome.invoices} draft invoice(s) generated` : `Nothing to bill (${outcome.message})`;
  }, path(form));
}

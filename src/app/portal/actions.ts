"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/components/ui/action-form";
import { buildLine, createLine } from "@/domain/lines";
import * as lifecycle from "@/domain/subscriptions";
import { logActivity } from "@/lib/activity";
import { runAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { today } from "@/lib/dates";
import { db } from "@/lib/db";
import { f, formValues } from "@/lib/forms";
import { nextNumber } from "@/lib/sequence";

/** Loads a subscription only if it belongs to the signed-in customer. */
async function ownSubscription(id: string) {
  const user = await requireRole("CUSTOMER");
  const sub = await db.subscription.findFirst({ where: { id, customerId: user.customerId ?? "__none__" }, select: { id: true } });
  if (!sub) throw new lifecycle.DomainError("Subscription not found.");
  return { user, id: sub.id };
}

const ALLOWED = ["confirm", "pause", "resume", "renew", "close", "toggle-line"] as const;

export async function customerTransition(_: ActionState, form: FormData) {
  return runAction(async () => {
    const { user, id } = await ownSubscription(String(form.get("id")));
    const op = z.enum(ALLOWED).parse(form.get("op"));
    const actor = `${user.fullName} (customer)`;
    switch (op) {
      case "confirm":
        await lifecycle.confirmSubscription(id, actor);
        return "Quotation accepted — thank you!";
      case "pause":
        await lifecycle.pauseSubscription(id, actor);
        return "Subscription paused";
      case "resume":
        await lifecycle.resumeSubscription(id, actor);
        return "Subscription resumed";
      case "renew":
        await lifecycle.renewSubscription(id, actor);
        return "Subscription renewed";
      case "close":
        await lifecycle.closeSubscription(id, "Cancelled by customer from the portal", actor);
        return "Subscription closed";
      case "toggle-line":
        await lifecycle.toggleLine(id, String(form.get("lineId")), actor);
        return "Add-on updated — applies from your next invoice";
    }
  }, [`/portal/subscriptions/${form.get("id")}`, "/portal"]);
}

const subscribeSchema = z.object({ planId: f.id("plan"), variantId: f.optionalId(), quantity: f.int("Quantity", 1) });

/** Self-service sign-up to a plan: creates a confirmed subscription that starts today. */
export async function subscribeToPlan(_: ActionState, form: FormData): Promise<ActionState> {
  let id = "";
  const result = await runAction(async () => {
    const user = await requireRole("CUSTOMER");
    if (!user.customerId) throw new lifecycle.DomainError("Your customer profile is missing. Please contact support.");
    const input = subscribeSchema.parse(formValues(form));
    const plan = await db.plan.findUniqueOrThrow({ where: { id: input.planId } });
    if (input.quantity < plan.minQuantity) throw new lifecycle.DomainError(`This plan needs at least ${plan.minQuantity} seat(s).`);
    const term = await db.paymentTerm.findFirst({ orderBy: [{ isDefault: "desc" }, { dueDays: "asc" }] });
    if (!term) throw new lifecycle.DomainError("Online sign-up is not available yet.");

    id = await db.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
        data: { number: await nextNumber(tx, "SUB", today()), customerId: user.customerId!, planId: plan.id, paymentTermId: term.id, startDate: today(), createdById: user.id },
      });
      await createLine(sub.id, await buildLine(plan, { productId: plan.productId, variantId: input.variantId, quantity: input.quantity }, tx), tx);
      return sub.id;
    });
    await logActivity({ entityType: "subscription", entityId: id, action: "created", message: "Subscribed online from the customer portal", actorName: `${user.fullName} (customer)` });
    await lifecycle.confirmSubscription(id, `${user.fullName} (customer)`);
  });
  if (result?.error) return result;
  redirect(`/portal/subscriptions/${id}`);
}

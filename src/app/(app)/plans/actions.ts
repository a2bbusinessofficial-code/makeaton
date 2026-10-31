"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/components/ui/action-form";
import { runAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { f, formValues } from "@/lib/forms";

const planSchema = z
  .object({
    name: f.text("Plan name", 120),
    productId: f.id("product"),
    price: f.rupees("Price"),
    billingPeriod: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
    minQuantity: f.int("Minimum quantity", 1),
    availableFrom: f.optionalDate(),
    availableTo: f.optionalDate(),
    autoClose: f.checkbox(),
    closable: f.checkbox(),
    pausable: f.checkbox(),
    renewable: f.checkbox(),
  })
  .refine((p) => !p.availableFrom || !p.availableTo || p.availableTo >= p.availableFrom, {
    message: "'Available until' must be on or after 'Available from'",
  });

export async function createPlan(_: ActionState, form: FormData): Promise<ActionState> {
  let id = "";
  const result = await runAction(async () => {
    await requireAdmin();
    id = (await db.plan.create({ data: planSchema.parse(formValues(form)) })).id;
  });
  if (result?.error) return result;
  redirect(`/plans/${id}`);
}

export async function updatePlan(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    await db.plan.update({ where: { id: String(form.get("id")) }, data: planSchema.parse(formValues(form)) });
    return "Plan saved";
  }, "/plans");
}

export async function togglePlan(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    const plan = await db.plan.findUniqueOrThrow({ where: { id: String(form.get("id")) } });
    await db.plan.update({ where: { id: plan.id }, data: { isActive: !plan.isActive } });
    return plan.isActive ? "Plan archived" : "Plan restored";
  }, "/plans");
}

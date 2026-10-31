"use server";

import { z } from "zod";
import type { ActionState } from "@/components/ui/action-form";
import { runAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { f, formValues } from "@/lib/forms";

const taxSchema = z.object({ name: f.text("Tax name", 60), rate: f.percentBps("Rate") });
const termSchema = z.object({ name: f.text("Name", 60), dueDays: f.int("Due days", 0), isDefault: f.checkbox() });

export async function createTax(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    const { name, rate } = taxSchema.parse(formValues(form));
    await db.tax.create({ data: { name, rateBps: rate } });
    return `Tax "${name}" created`;
  }, "/taxes");
}

export async function toggleTax(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    const tax = await db.tax.findUniqueOrThrow({ where: { id: String(form.get("id")) } });
    await db.tax.update({ where: { id: tax.id }, data: { isActive: !tax.isActive } });
  }, "/taxes");
}

export async function createPaymentTerm(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    const data = termSchema.parse(formValues(form));
    await db.$transaction(async (tx) => {
      if (data.isDefault) await tx.paymentTerm.updateMany({ data: { isDefault: false } });
      await tx.paymentTerm.create({ data });
    });
    return `Payment term "${data.name}" created`;
  }, "/taxes");
}

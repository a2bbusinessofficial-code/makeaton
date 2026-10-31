"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/components/ui/action-form";
import { runAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { f, formValues } from "@/lib/forms";

const templateSchema = z.object({
  name: f.text("Template name", 120),
  planId: f.id("plan"),
  validityDays: f.int("Validity", 1),
  paymentTermId: f.optionalId(),
  notes: f.optionalText(),
});

const lineSchema = z.object({ templateId: f.id("template"), productId: f.id("product"), variantId: f.optionalId(), quantity: f.int("Quantity", 1) });

/** New templates start with the plan's own product as the first line. */
export async function createTemplate(_: ActionState, form: FormData): Promise<ActionState> {
  let id = "";
  const result = await runAction(async () => {
    await requireAdmin();
    const data = templateSchema.parse(formValues(form));
    const plan = await db.plan.findUniqueOrThrow({ where: { id: data.planId } });
    id = (await db.quotationTemplate.create({ data: { ...data, lines: { create: [{ productId: plan.productId, quantity: plan.minQuantity }] } } })).id;
  });
  if (result?.error) return result;
  redirect(`/templates/${id}`);
}

export async function updateTemplate(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    await db.quotationTemplate.update({ where: { id: String(form.get("id")) }, data: templateSchema.parse(formValues(form)) });
    return "Template saved";
  }, "/templates");
}

export async function addTemplateLine(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    const data = lineSchema.parse(formValues(form));
    if (data.variantId) {
      const variant = await db.productVariant.findUnique({ where: { id: data.variantId } });
      if (variant?.productId !== data.productId) throw new z.ZodError([{ code: "custom", path: ["variantId"], message: "That variant belongs to another product" }]);
    }
    await db.quotationTemplateLine.create({ data });
    return "Line added";
  }, `/templates/${form.get("templateId")}`);
}

export async function removeTemplateLine(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    await db.quotationTemplateLine.delete({ where: { id: String(form.get("id")) } });
  }, `/templates/${form.get("templateId")}`);
}

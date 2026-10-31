"use server";

import { z } from "zod";
import type { ActionState } from "@/components/ui/action-form";
import { runAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { f, formList, formValues } from "@/lib/forms";
import { rupeesToPaise } from "@/lib/money";

const discountSchema = z
  .object({
    name: f.text("Discount name", 80),
    type: z.enum(["FIXED", "PERCENTAGE"]),
    value: z.string().min(1, "Value is required"),
    scope: z.enum(["SUBSCRIPTION", "PRODUCTS"]),
    minPurchase: f.optionalRupees("Minimum purchase"),
    minQuantity: f.optionalInt("Minimum quantity", 1),
    startDate: f.date("Start date"),
    endDate: f.date("End date"),
    usageLimit: f.optionalInt("Usage limit", 1),
  })
  .refine((d) => d.endDate >= d.startDate, { message: "End date must be on or after the start date" })
  .transform((d, ctx) => {
    const n = Number(d.value);
    const value = d.type === "PERCENTAGE" ? Math.round(n * 100) : rupeesToPaise(d.value);
    if (!Number.isFinite(n) || n <= 0 || (d.type === "PERCENTAGE" && n > 100)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: d.type === "PERCENTAGE" ? "Percentage must be between 0 and 100" : "Amount must be greater than zero" });
      return z.NEVER;
    }
    return { ...d, value };
  });

function parse(form: FormData) {
  const data = discountSchema.parse(formValues(form));
  const productIds = formList(form, "productIds");
  if (data.scope === "PRODUCTS" && productIds.length === 0) throw new z.ZodError([{ code: "custom", path: ["productIds"], message: "Choose at least one product for a product discount" }]);
  return { data, productIds: data.scope === "PRODUCTS" ? productIds : [] };
}

/** Only admins can create or change discount rules (staff may only attach them). */
export async function createDiscount(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    const { data, productIds } = parse(form);
    await db.discount.create({ data: { ...data, products: { connect: productIds.map((id) => ({ id })) } } });
    return `Discount "${data.name}" created`;
  }, "/discounts");
}

export async function updateDiscount(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    const { data, productIds } = parse(form);
    await db.discount.update({ where: { id: String(form.get("id")) }, data: { ...data, products: { set: productIds.map((id) => ({ id })) } } });
    return "Discount saved";
  }, "/discounts");
}

export async function toggleDiscount(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    const discount = await db.discount.findUniqueOrThrow({ where: { id: String(form.get("id")) } });
    await db.discount.update({ where: { id: discount.id }, data: { isActive: !discount.isActive } });
    return discount.isActive ? "Discount archived" : "Discount restored";
  }, "/discounts");
}

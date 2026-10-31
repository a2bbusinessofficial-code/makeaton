"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/components/ui/action-form";
import { runAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { f, formList, formValues } from "@/lib/forms";

const productSchema = z.object({
  name: f.text("Product name", 120),
  type: z.enum(["SERVICE", "ADDON", "GOODS"]),
  salesPrice: f.rupees("Sales price"),
  costPrice: f.rupees("Cost price"),
  notes: f.optionalText(),
});

const variantSchema = z.object({
  productId: f.id("product"),
  attribute: f.text("Attribute", 40),
  value: f.text("Value", 60),
  priceExtra: f.rupees("Extra price"),
});

export async function createProduct(_: ActionState, form: FormData): Promise<ActionState> {
  let id = "";
  const result = await runAction(async () => {
    await requireAdmin();
    const data = productSchema.parse(formValues(form));
    const product = await db.product.create({ data: { ...data, taxes: { connect: formList(form, "taxIds").map((tid) => ({ id: tid })) } } });
    id = product.id;
  });
  if (result?.error) return result;
  redirect(`/products/${id}`);
}

export async function updateProduct(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    const id = String(form.get("id"));
    const data = productSchema.parse(formValues(form));
    await db.product.update({ where: { id }, data: { ...data, taxes: { set: formList(form, "taxIds").map((tid) => ({ id: tid })) } } });
    return "Product saved";
  }, ["/products"]);
}

export async function toggleProduct(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    const product = await db.product.findUniqueOrThrow({ where: { id: String(form.get("id")) } });
    await db.product.update({ where: { id: product.id }, data: { isActive: !product.isActive } });
    return product.isActive ? "Product archived" : "Product restored";
  }, "/products");
}

export async function addVariant(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    const data = variantSchema.parse(formValues(form));
    await db.productVariant.create({ data });
    return `Variant ${data.attribute}: ${data.value} added`;
  }, `/products/${form.get("productId")}`);
}

export async function toggleVariant(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireAdmin();
    const variant = await db.productVariant.findUniqueOrThrow({ where: { id: String(form.get("id")) } });
    await db.productVariant.update({ where: { id: variant.id }, data: { isActive: !variant.isActive } });
  }, `/products/${form.get("productId")}`);
}

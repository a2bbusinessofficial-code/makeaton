"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/components/ui/action-form";
import { runAction } from "@/lib/actions";
import { requireBackOffice } from "@/lib/auth";
import { db } from "@/lib/db";
import { f, formValues } from "@/lib/forms";
import { emailSchema } from "@/lib/validation";

const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const customerSchema = z.object({
  name: f.text("Name", 120),
  email: emailSchema,
  company: f.optionalText(120),
  phone: f.optionalText(20),
  address: f.optionalText(300),
  state: f.optionalText(60),
  gstin: f
    .optionalText(15)
    .transform((v) => v?.toUpperCase() ?? null)
    .refine((v) => !v || GSTIN.test(v), "GSTIN must be a valid 15-character GST number"),
});

export async function createCustomer(_: ActionState, form: FormData): Promise<ActionState> {
  let id = "";
  const result = await runAction(async () => {
    await requireBackOffice();
    id = (await db.customer.create({ data: customerSchema.parse(formValues(form)) })).id;
  });
  if (result?.error) return result;
  redirect(`/customers/${id}`);
}

export async function updateCustomer(_: ActionState, form: FormData) {
  return runAction(async () => {
    await requireBackOffice();
    const id = String(form.get("id"));
    const existing = await db.customer.findUniqueOrThrow({ where: { id } });
    const data = customerSchema.parse(formValues(form));
    // A portal user's email is their login and is changed from their own account page.
    await db.customer.update({ where: { id }, data: existing.profileId ? { ...data, email: existing.email } : data });
    return "Customer saved";
  }, "/customers");
}

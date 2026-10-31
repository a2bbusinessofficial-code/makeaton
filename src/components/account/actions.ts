"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/components/ui/action-form";
import { DomainError } from "@/domain/subscriptions";
import { runAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { f, formValues } from "@/lib/forms";
import { sendMail } from "@/lib/mail/mailer";
import { passwordChangedEmail } from "@/lib/mail/templates";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { emailSchema, newPasswordSchema } from "@/lib/validation";

export async function updateName(_: ActionState, form: FormData) {
  return runAction(async () => {
    const user = await requireUser();
    const { fullName } = z.object({ fullName: f.text("Name", 80) }).parse(formValues(form));
    await db.profile.update({ where: { id: user.id }, data: { fullName } });
    if (user.customerId) await db.customer.update({ where: { id: user.customerId }, data: { name: fullName } });
    revalidatePath("/", "layout");
    return "Name updated";
  });
}

/** Supabase emails a confirmation link to the new address; the change applies once it is opened. */
export async function changeEmail(_: ActionState, form: FormData) {
  return runAction(async () => {
    const user = await requireUser();
    const email = emailSchema.parse(form.get("email"));
    if (email === user.email) throw new DomainError("That is already your email.");
    if (await db.profile.findUnique({ where: { email } })) throw new DomainError("Another account already uses this email.");
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: `${env().NEXT_PUBLIC_SITE_URL}/auth/confirm?next=${user.role === "CUSTOMER" ? "/portal/account" : "/account"}` });
    if (error) throw new DomainError(error.message);
    return `Confirmation link sent to ${email}. Your email changes once you open it.`;
  });
}

export async function changePassword(_: ActionState, form: FormData) {
  return runAction(async () => {
    const user = await requireUser();
    const values = formValues(form);
    const { password } = newPasswordSchema.parse(values);
    const supabase = await createSupabaseServerClient();

    const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email, password: values.currentPassword ?? "" });
    if (authError) throw new DomainError("Your current password is incorrect.");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new DomainError(error.code === "same_password" ? "Choose a password different from your current one." : error.message);

    await sendMail({ to: user.email, ...passwordChangedEmail(user.fullName, `${env().NEXT_PUBLIC_SITE_URL}/login`) });
    return "Password changed. We've emailed you a confirmation.";
  });
}

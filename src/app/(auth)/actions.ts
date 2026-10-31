"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/components/ui/action-form";
import { ensureProfile, homeFor } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendMail } from "@/lib/mail/mailer";
import { passwordChangedEmail } from "@/lib/mail/templates";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { emailSchema, firstError, formToObject, newPasswordSchema, signUpSchema } from "@/lib/validation";

const callbackUrl = (next: string) => `${env().NEXT_PUBLIC_SITE_URL}/auth/confirm?next=${encodeURIComponent(next)}`;

export async function signUpAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = signUpSchema.safeParse(formToObject(form));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { email, password, fullName } = parsed.data;

  // One account per email. Checked here because Supabase deliberately hides duplicates.
  if (await db.profile.findUnique({ where: { email } })) {
    return { error: "An account with this email already exists. Try logging in or resetting your password." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName }, emailRedirectTo: callbackUrl("/portal") },
  });
  if (error) return { error: error.message };
  if (!data.user || data.user.identities?.length === 0) {
    return { error: "An account with this email already exists. Try logging in or resetting your password." };
  }

  await ensureProfile(data.user);
  if (data.session) redirect("/portal");
  return {
    success: `Almost there! We sent a confirmation link to ${email}.`,
    data: { pendingUserId: data.user.id, email },
  };
}

/**
 * Polled by the sign-up screen so that confirming the email on ANY device lets the
 * original device continue automatically. Only reveals whether this (unguessable) user id
 * has been confirmed.
 */
export async function confirmationStatus(userId: string): Promise<{ confirmed: boolean }> {
  if (!z.string().uuid().safeParse(userId).success) return { confirmed: false };
  const { data } = await createSupabaseAdminClient().auth.admin.getUserById(userId);
  return { confirmed: Boolean(data.user?.email_confirmed_at) };
}

export async function resendConfirmation(email: string): Promise<ActionState> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { error: firstError(parsed.error) };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resend({ type: "signup", email: parsed.data, options: { emailRedirectTo: callbackUrl("/portal") } });
  if (error) return { error: error.status === 429 ? "Please wait a minute before requesting another email." : error.message };
  return { success: "A new confirmation email is on its way." };
}

export async function signInAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password"), next: z.string().optional() }).safeParse(formToObject(form));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) {
    if (error.code === "email_not_confirmed") return { error: "Please confirm your email first — check your inbox for the link." };
    return { error: "Invalid email or password." };
  }

  const profile = await ensureProfile(data.user);
  if (!profile.isActive) {
    await supabase.auth.signOut();
    return { error: "This account has been deactivated. Contact your administrator." };
  }

  const next = parsed.data.next;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  redirect(safeNext ?? homeFor(profile.role));
}

export async function forgotPasswordAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = emailSchema.safeParse(form.get("email"));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo: callbackUrl("/reset-password") });
  if (error && error.status === 429) return { error: "Too many requests. Please wait a minute and try again." };

  // Same answer whether or not the account exists, so emails cannot be enumerated.
  return { success: "If an account exists for that email, a password reset link is on its way." };
}

export async function resetPasswordAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = newPasswordSchema.safeParse(formToObject(form));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { error: "Choose a password different from your current one." };
    return { error: error.message };
  }

  const profile = await ensureProfile(data.user);
  const mail = passwordChangedEmail(profile.fullName, `${env().NEXT_PUBLIC_SITE_URL}/login`);
  await sendMail({ to: profile.email, ...mail });
  redirect(`${homeFor(profile.role)}?notice=password-updated`);
}

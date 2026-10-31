"use server";

import { z } from "zod";
import type { ActionState } from "@/components/ui/action-form";
import { DomainError } from "@/domain/subscriptions";
import { logActivity } from "@/lib/activity";
import { runAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { f, formValues } from "@/lib/forms";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { emailSchema } from "@/lib/validation";

/**
 * Only an admin can add staff. Supabase emails the invitee a secure link; opening it signs
 * them in and takes them to "set your password".
 */
export async function inviteStaff(_: ActionState, form: FormData) {
  return runAction(async () => {
    const admin = await requireAdmin();
    const { fullName, email } = z.object({ fullName: f.text("Name", 80), email: emailSchema }).parse(formValues(form));
    if (await db.profile.findUnique({ where: { email } })) throw new DomainError("Someone with this email already has an account.");

    const { data, error } = await createSupabaseAdminClient().auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: `${env().NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/reset-password`,
    });
    if (error) throw new DomainError(`Could not send the invitation: ${error.message}`);

    await db.profile.create({ data: { id: data.user.id, email, fullName, role: "STAFF" } });
    await logActivity({ entityType: "user", entityId: data.user.id, action: "invited", message: `${fullName} invited as staff`, actorName: admin.fullName });
    return `Invitation sent to ${email}`;
  }, "/users");
}

export async function toggleUserActive(_: ActionState, form: FormData) {
  return runAction(async () => {
    const admin = await requireAdmin();
    const id = String(form.get("id"));
    if (id === admin.id) throw new DomainError("You cannot deactivate your own account.");
    const profile = await db.profile.findUniqueOrThrow({ where: { id } });
    const isActive = !profile.isActive;
    const { error } = await createSupabaseAdminClient().auth.admin.updateUserById(id, { ban_duration: isActive ? "none" : "876000h" });
    if (error) throw new DomainError(error.message);
    await db.profile.update({ where: { id }, data: { isActive } });
    return isActive ? "User reactivated" : "User deactivated — they can no longer sign in";
  }, "/users");
}

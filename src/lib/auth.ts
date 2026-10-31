import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Profile, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { adminEmails } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentUser = Profile & { customerId: string | null };

/**
 * Makes sure a Profile (and, for customers, a Customer record) exists for a Supabase user.
 * Also keeps the stored email in sync after a confirmed email change.
 */
export async function ensureProfile(authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const email = (authUser.email ?? "").toLowerCase();
  const fullName = String(authUser.user_metadata?.full_name ?? email.split("@")[0]);
  const existing = await db.profile.findUnique({ where: { id: authUser.id }, include: { customer: true } });

  if (existing) {
    if (email && existing.email !== email) {
      await db.profile.update({ where: { id: existing.id }, data: { email } });
      if (existing.customer) await db.customer.update({ where: { id: existing.customer.id }, data: { email } });
      return db.profile.findUniqueOrThrow({ where: { id: authUser.id }, include: { customer: true } });
    }
    return existing;
  }

  const role: Role = adminEmails().includes(email) ? "ADMIN" : "CUSTOMER";
  return db.$transaction(async (tx) => {
    const profile = await tx.profile.create({ data: { id: authUser.id, email, fullName, role } });
    if (role === "CUSTOMER") {
      // Link to a customer record staff may already have created for this email.
      await tx.customer.upsert({
        where: { email },
        update: { profileId: profile.id },
        create: { email, name: fullName, profileId: profile.id },
      });
    }
    return tx.profile.findUniqueOrThrow({ where: { id: profile.id }, include: { customer: true } });
  });
}

/** The signed-in user with their role, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await ensureProfile(user);
  if (!profile.isActive) return null;
  const { customer, ...rest } = profile;
  return { ...rest, customerId: customer?.id ?? null };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Guards a page or server action. Unauthorised roles are sent to their own home page. */
export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect(homeFor(user.role));
  return user;
}

export const requireBackOffice = () => requireRole("ADMIN", "STAFF");
export const requireAdmin = () => requireRole("ADMIN");

export function homeFor(role: Role) {
  return role === "CUSTOMER" ? "/portal" : "/dashboard";
}

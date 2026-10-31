/**
 * The middleware verifies the Supabase session once per request and forwards the result
 * to server components in this header (removing any client-supplied copy first).
 */
export const AUTH_USER_HEADER = "x-brightloop-auth-user";

export type AuthUser = { id: string; email?: string; user_metadata?: Record<string, unknown> };

export function encodeAuthUser(user: AuthUser): string {
  const payload = { id: user.id, email: user.email, full_name: user.user_metadata?.full_name };
  // Header values must be ASCII; names may not be.
  return encodeURIComponent(JSON.stringify(payload));
}

export function decodeAuthUser(value: string | null): AuthUser | null {
  if (!value) return null;
  try {
    const { id, email, full_name } = JSON.parse(decodeURIComponent(value));
    return typeof id === "string" ? { id, email, user_metadata: { full_name } } : null;
  } catch {
    return null;
  }
}

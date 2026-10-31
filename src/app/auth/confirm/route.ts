import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Landing point for every Supabase email link (sign-up confirmation, password recovery,
 * email change, staff invite). Supports both link styles Supabase can send:
 *  - PKCE `?code=` links (default templates)
 *  - `?token_hash=&type=` links (custom templates; work across devices)
 * Invite links carry tokens in the URL fragment, which only the browser can read, so those
 * are handed to /auth/complete.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safePath(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(new URL(error ? "/login?notice=link" : next, origin));
  }
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    return NextResponse.redirect(new URL(error ? "/login?notice=link" : next, origin));
  }
  if (searchParams.get("error")) {
    return NextResponse.redirect(new URL("/login?notice=link", origin));
  }
  return NextResponse.redirect(new URL(`/auth/complete?next=${encodeURIComponent(next)}`, origin));
}

function safePath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/portal";
}

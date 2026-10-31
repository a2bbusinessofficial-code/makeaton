import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/** Service-role client. Server only — used for admin tasks such as inviting staff. */
export function createSupabaseAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = env();
  return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

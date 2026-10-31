"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/** Finishes sign-in for links that put the session in the URL fragment (e.g. staff invites). */
export default function CompleteAuthPage() {
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const next = new URLSearchParams(window.location.search).get("next") ?? "/portal";
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    if (!access_token || !refresh_token) {
      setMessage("This link is invalid or has expired.");
      window.location.replace("/login?notice=link");
      return;
    }
    createSupabaseBrowserClient()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error }) => window.location.replace(error ? "/login?notice=link" : next.startsWith("/") ? next : "/portal"));
  }, []);

  return <main className="flex min-h-screen items-center justify-center text-ink-3">{message}</main>;
}

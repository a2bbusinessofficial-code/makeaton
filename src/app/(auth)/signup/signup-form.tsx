"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { PasswordInput } from "@/components/auth/password-input";
import { FormMessage, SubmitButton, type ActionState } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { confirmationStatus, resendConfirmation, signInAction, signUpAction } from "../actions";

const POLL_MS = 3000;
const GIVE_UP_MS = 30 * 60 * 1000;

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, undefined);
  // Kept in memory only, so this device can sign in once the email is confirmed elsewhere.
  const credentials = useRef<{ email: string; password: string } | null>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;
    const formData = new FormData(event.currentTarget);
    credentials.current = { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") };
    startTransition(() => formAction(formData));
  };

  if (state?.data?.pendingUserId) {
    return <WaitingForConfirmation userId={state.data.pendingUserId} email={state.data.email} credentials={credentials.current} />;
  }

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-3">
      <Field label="Full name">
        <Input name="fullName" required autoComplete="name" />
      </Field>
      <Field label="Work email">
        <Input name="email" type="email" required autoComplete="email" />
      </Field>
      <PasswordInput />
      <Field label="Confirm password">
        <Input name="confirmPassword" type="password" required autoComplete="new-password" />
      </Field>
      <SubmitButton className="w-full" pendingLabel="Creating account…">
        Create account
      </SubmitButton>
      <FormMessage state={state} />
    </form>
  );
}

/**
 * Shown after sign-up. Polls the server (and re-checks whenever the tab regains focus), so
 * confirming the email on a phone or another browser lets this device continue by itself.
 */
function WaitingForConfirmation({ userId, email, credentials }: { userId: string; email: string; credentials: { email: string; password: string } | null }) {
  const [status, setStatus] = useState<"waiting" | "signing-in" | "confirmed-no-session">("waiting");
  const [resendState, setResendState] = useState<ActionState>(undefined);
  const done = useRef(false);

  useEffect(() => {
    const started = Date.now();

    const check = async () => {
      if (done.current || Date.now() - started > GIVE_UP_MS) return;
      const { confirmed } = await confirmationStatus(userId);
      if (!confirmed || done.current) return;
      done.current = true;
      if (!credentials) return setStatus("confirmed-no-session");
      setStatus("signing-in");
      const form = new FormData();
      form.set("email", credentials.email);
      form.set("password", credentials.password);
      form.set("next", "/portal");
      const result = await signInAction(undefined, form); // redirects on success
      if (result?.error) setStatus("confirmed-no-session");
    };

    const timer = setInterval(check, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [userId, credentials]);

  if (status === "confirmed-no-session") {
    return (
      <div className="space-y-3 text-center">
        <p className="font-medium">Email confirmed ✓</p>
        <Link href="/login?notice=confirmed" className="text-accent">
          Continue to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <div className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-lg">✉️</div>
      <div>
        <p className="font-medium">Check your inbox</p>
        <p className="mt-1 text-ink-2">
          We sent a confirmation link to <b className="text-ink">{email}</b>. Open it on <b className="text-ink">any device</b>; this page continues automatically.
        </p>
      </div>
      <p className="flex items-center gap-2 text-ink-3">
        <span className="size-3 animate-spin rounded-full border-2 border-line border-t-accent" />
        {status === "signing-in" ? "Confirmed! Signing you in…" : "Waiting for confirmation…"}
      </p>
      <div className="flex items-center gap-3 border-t border-line pt-3">
        <Button type="button" variant="secondary" onClick={async () => setResendState(await resendConfirmation(email))}>
          Resend email
        </Button>
        <Link href="/login" className="text-accent">
          Already confirmed? Log in
        </Link>
      </div>
      <FormMessage state={resendState} />
    </div>
  );
}

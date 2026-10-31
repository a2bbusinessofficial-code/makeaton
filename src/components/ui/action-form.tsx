"use client";

import clsx from "clsx";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { buttonClass } from "./button";

export type ActionState = { error?: string; success?: string } | undefined;
export type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

/** Form bound to a server action, with inline error/success feedback. */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess,
}: {
  action: FormAction;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state?.success) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={clsx("space-y-3", className)}>
      {children}
      <FormMessage state={state} />
    </form>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state?.error && !state?.success) return null;
  return (
    <p
      role={state.error ? "alert" : "status"}
      className={clsx("rounded-md px-3 py-2 text-ui", state.error ? "bg-[#ffe9e9] text-danger" : "bg-[#e3f5ea] text-[#18794e]")}
    >
      {state.error ?? state.success}
    </p>
  );
}

export function SubmitButton({ children, variant = "primary", className, pendingLabel }: { children: React.ReactNode; variant?: "primary" | "secondary" | "danger" | "ghost"; className?: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass(variant, className)}>
      {pending ? (pendingLabel ?? "Saving…") : children}
    </button>
  );
}

/** A single-button form for state transitions (Confirm, Pause, Cancel invoice…). */
export function ActionButton({
  action,
  children,
  variant = "secondary",
  confirm,
  fields,
}: {
  action: FormAction;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  confirm?: string;
  fields?: Record<string, string>;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className="inline-flex flex-col items-start gap-1"
    >
      {fields && Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <SubmitButton variant={variant} pendingLabel="Working…">
        {children}
      </SubmitButton>
      {state?.error && <span className="max-w-64 text-xs text-danger">{state.error}</span>}
    </form>
  );
}

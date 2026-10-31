import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Field, Input } from "@/components/ui/form";
import { forgotPasswordAction } from "../actions";

export const metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-1 text-base font-semibold">Forgot your password?</h1>
      <p className="mb-5 text-ink-3">Enter your registered email and we&apos;ll send you a reset link.</p>
      <ActionForm action={forgotPasswordAction}>
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" />
        </Field>
        <SubmitButton className="w-full" pendingLabel="Sending…">
          Send reset link
        </SubmitButton>
      </ActionForm>
      <p className="mt-4 text-center text-ink-3">
        <Link href="/login" className="text-accent">
          Back to log in
        </Link>
      </p>
    </>
  );
}

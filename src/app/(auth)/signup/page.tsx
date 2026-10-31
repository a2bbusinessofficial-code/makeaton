import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Field, Input } from "@/components/ui/form";
import { PasswordInput } from "@/components/auth/password-input";
import { signUpAction } from "../actions";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="mb-1 text-base font-semibold">Create your account</h1>
      <p className="mb-5 text-ink-3">Manage your Brightloop subscriptions and invoices in one place.</p>
      <ActionForm action={signUpAction}>
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
      </ActionForm>
      <p className="mt-4 text-center text-ink-3">
        Already have an account?{" "}
        <Link href="/login" className="text-accent">
          Log in
        </Link>
      </p>
    </>
  );
}

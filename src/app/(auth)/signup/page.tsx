import Link from "next/link";
import { SignUpForm } from "./signup-form";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <>
      <h1 className="mb-1 text-base font-semibold">Create your account</h1>
      <p className="mb-5 text-ink-3">Manage your Brightloop subscriptions and invoices in one place.</p>
      <SignUpForm />
      <p className="mt-4 text-center text-ink-3">
        Already have an account?{" "}
        <Link href="/login" className="text-accent">
          Log in
        </Link>
      </p>
    </>
  );
}

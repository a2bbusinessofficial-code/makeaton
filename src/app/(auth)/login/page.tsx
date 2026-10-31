import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Field, Input } from "@/components/ui/form";
import { signInAction } from "../actions";

export const metadata = { title: "Log in" };

const NOTICES: Record<string, string> = {
  link: "That link is invalid or has expired. If you just confirmed your email you can log in now; otherwise request a new link.",
  confirmed: "Email confirmed — you can log in now.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; notice?: string }> }) {
  const { next, notice } = await searchParams;
  return (
    <>
      <h1 className="mb-1 text-base font-semibold">Welcome back</h1>
      <p className="mb-5 text-ink-3">Log in to your Brightloop account.</p>
      {notice && NOTICES[notice] && <p className="mb-4 rounded-md bg-accent-soft px-3 py-2 text-accent">{NOTICES[notice]}</p>}
      <ActionForm action={signInAction}>
        <input type="hidden" name="next" value={next ?? ""} />
        <Field label="Email">
          <Input name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Password">
          <Input name="password" type="password" required autoComplete="current-password" />
        </Field>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-accent">
            Forgot password?
          </Link>
        </div>
        <SubmitButton className="w-full" pendingLabel="Logging in…">
          Log in
        </SubmitButton>
      </ActionForm>
      <p className="mt-4 text-center text-ink-3">
        New to Brightloop?{" "}
        <Link href="/signup" className="text-accent">
          Create an account
        </Link>
      </p>
    </>
  );
}

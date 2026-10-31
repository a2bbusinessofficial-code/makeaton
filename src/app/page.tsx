import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonClass } from "@/components/ui/button";
import { getCurrentUser, homeFor } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded bg-ink text-sm font-semibold text-white">B</span>
        <span className="text-base font-medium">Brightloop</span>
      </div>
      <h1 className="max-w-xl text-3xl font-semibold tracking-tight">Plans, subscriptions and recurring billing in one place.</h1>
      <p className="mt-3 max-w-lg text-ink-2">
        Quotes become subscriptions, invoices create themselves on billing day, GST is calculated for you, and every payment lands against the right invoice.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/signup" className={buttonClass("primary")}>
          Create an account
        </Link>
        <Link href="/login" className={buttonClass("secondary")}>
          Log in
        </Link>
      </div>
    </main>
  );
}

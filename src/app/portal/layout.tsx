import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { PortalNav } from "./portal-nav";

/** Customer self-service portal: customers only ever see their own records. */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("CUSTOMER");
  return (
    <div className="min-h-screen bg-white">
      <header className="no-print border-b border-line">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5">
          <Link href="/portal" className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded bg-ink text-[11px] font-semibold text-white">B</span>
            <span className="font-medium">Brightloop</span>
            <span className="text-ink-3">· My account</span>
          </Link>
          <PortalNav />
          <div className="ml-auto flex items-center gap-3 text-ink-2">
            <span className="hidden sm:inline">{user.fullName}</span>
            <form action="/auth/signout" method="post">
              <button className="text-ink-3 hover:text-ink">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">{children}</main>
    </div>
  );
}

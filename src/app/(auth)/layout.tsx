import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded bg-ink text-xs font-semibold text-white">B</span>
        <span className="font-medium">Brightloop</span>
      </Link>
      <div className="card w-full max-w-sm p-6">{children}</div>
    </main>
  );
}

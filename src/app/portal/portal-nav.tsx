"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/plans", label: "Plans" },
  { href: "/portal/account", label: "Account" },
];

export function PortalNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={clsx("rounded px-2 py-1", pathname === l.href ? "bg-[rgba(0,0,0,0.06)] text-ink" : "text-ink-2 hover:bg-hover")}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

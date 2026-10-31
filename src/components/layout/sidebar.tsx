"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBox,
  IconCalendarRepeat,
  IconChartBar,
  IconCreditCard,
  IconDiscount,
  IconFileInvoice,
  IconFileText,
  IconLayoutDashboard,
  IconLogout,
  IconPlayerPlay,
  IconReceiptTax,
  IconUserCircle,
  IconUsers,
  IconUsersGroup,
  type Icon,
} from "@tabler/icons-react";

type Item = { href: string; label: string; icon: Icon; adminOnly?: boolean };

const SECTIONS: { title?: string; items: Item[] }[] = [
  {
    items: [
      { href: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
      { href: "/action-center", label: "Action center", icon: IconChartBar },
    ],
  },
  {
    title: "Workspace",
    items: [
      { href: "/subscriptions", label: "Subscriptions", icon: IconCalendarRepeat },
      { href: "/invoices", label: "Invoices", icon: IconFileInvoice },
      { href: "/payments", label: "Payments", icon: IconCreditCard },
      { href: "/customers", label: "Customers", icon: IconUsersGroup },
      { href: "/billing", label: "Billing runs", icon: IconPlayerPlay },
    ],
  },
  {
    title: "Configuration",
    items: [
      { href: "/products", label: "Products", icon: IconBox },
      { href: "/plans", label: "Plans", icon: IconCalendarRepeat },
      { href: "/templates", label: "Quotation templates", icon: IconFileText },
      { href: "/discounts", label: "Discounts", icon: IconDiscount },
      { href: "/taxes", label: "Taxes & terms", icon: IconReceiptTax },
      { href: "/users", label: "Team", icon: IconUsers, adminOnly: true },
    ],
  },
];

export function Sidebar({ name, role }: { name: string; role: "ADMIN" | "STAFF" }) {
  const pathname = usePathname();
  return (
    <aside className="no-print flex w-full shrink-0 flex-col gap-4 px-2 py-3 md:sticky md:top-0 md:h-screen md:w-56">
      <Link href="/dashboard" className="flex items-center gap-2 px-2">
        <span className="flex size-5 items-center justify-center rounded bg-ink text-[11px] font-semibold text-white">B</span>
        <span className="font-medium">Brightloop</span>
      </Link>
      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {SECTIONS.map((section, i) => (
          <div key={i} className="flex flex-col gap-px">
            {section.title && <div className="px-2 pb-1 text-xs text-ink-3">{section.title}</div>}
            {section.items
              .filter((item) => !item.adminOnly || role === "ADMIN")
              .map(({ href, label, icon: IconCmp }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={clsx("flex h-7 items-center gap-2 rounded px-2 transition", active ? "bg-[rgba(0,0,0,0.06)] text-ink" : "text-ink-2 hover:bg-hover")}
                  >
                    <IconCmp size={16} stroke={1.6} />
                    {label}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>
      <div className="flex flex-col gap-px border-t border-line pt-2">
        <Link href="/account" className="flex h-7 items-center gap-2 rounded px-2 text-ink-2 hover:bg-hover">
          <IconUserCircle size={16} stroke={1.6} />
          <span className="truncate">{name}</span>
          <span className="ml-auto text-xs text-ink-3">{role === "ADMIN" ? "Admin" : "Staff"}</span>
        </Link>
        <form action="/auth/signout" method="post">
          <button className="flex h-7 w-full items-center gap-2 rounded px-2 text-ink-2 hover:bg-hover">
            <IconLogout size={16} stroke={1.6} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

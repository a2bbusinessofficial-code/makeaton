import clsx from "clsx";
import Link from "next/link";
import type { Icon } from "@tabler/icons-react";

export function PageHeader({
  icon: IconCmp,
  title,
  crumbs,
  actions,
}: {
  icon?: Icon;
  title: string;
  crumbs?: { label: string; href: string }[];
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex min-h-12 flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2">
      <div className="flex min-w-0 items-center gap-1.5 text-ui">
        {IconCmp && <IconCmp size={16} stroke={1.6} className="shrink-0 text-ink-2" />}
        {crumbs?.map((c) => (
          <span key={c.href} className="flex items-center gap-1.5 text-ink-3">
            <Link href={c.href} className="hover:text-ink">
              {c.label}
            </Link>
            <span>/</span>
          </span>
        ))}
        <h1 className="truncate font-medium text-ink">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function PageBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("space-y-4 p-4", className)}>{children}</div>;
}

export function Section({ title, actions, children, className }: { title?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={clsx("card", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
          {title && <h2 className="text-ui font-medium">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="max-w-sm text-ink-3">{description}</p>}
      {action}
    </div>
  );
}

/** Label/value pairs, used on record detail pages. */
export function Fields({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label} className="flex min-w-0 items-baseline gap-3">
          <dt className="w-32 shrink-0 text-ink-3">{label}</dt>
          <dd className="min-w-0 truncate text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Stat({ label, value, hint, tone }: { label: string; value: React.ReactNode; hint?: React.ReactNode; tone?: "danger" | "success" }) {
  return (
    <div className="card px-4 py-3">
      <div className="text-xs text-ink-3">{label}</div>
      <div className={clsx("mt-1 text-xl font-semibold tracking-tight", tone === "danger" && "text-danger", tone === "success" && "text-[#18794e]")}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-ink-3">{hint}</div>}
    </div>
  );
}

import clsx from "clsx";
import type { ComponentProps } from "react";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={clsx("block", className)}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-3">{hint}</span>}
    </label>
  );
}

export const Input = ({ className, ...p }: ComponentProps<"input">) => <input className={clsx("input", className)} {...p} />;

export const Textarea = ({ className, ...p }: ComponentProps<"textarea">) => <textarea className={clsx("input", className)} {...p} />;

export function Select({ className, options, placeholder, ...p }: ComponentProps<"select"> & { options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <select className={clsx("input", className)} {...p}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({ label, hint, ...p }: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className="flex items-start gap-2 py-1">
      <input type="checkbox" className="mt-0.5 size-3.5 accent-[#1961ed]" {...p} />
      <span>
        <span className="text-ui text-ink">{label}</span>
        {hint && <span className="block text-xs text-ink-3">{hint}</span>}
      </span>
    </label>
  );
}

export function FormGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 | 4 }) {
  const grid = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" }[cols];
  return <div className={clsx("grid grid-cols-1 gap-3", grid)}>{children}</div>;
}

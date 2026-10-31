import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-[#1453cc] border-transparent",
  secondary: "bg-white text-ink border-line hover:bg-app",
  ghost: "bg-transparent text-ink-2 border-transparent hover:bg-hover",
  danger: "bg-white text-danger border-line hover:bg-[#fff1f1]",
};

export function buttonClass(variant: Variant = "secondary", className?: string) {
  return clsx(
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-3 text-ui font-medium whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    className,
  );
}

export function Button({ variant, className, ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function LinkButton({ variant, className, ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

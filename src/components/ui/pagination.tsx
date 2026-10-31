import Link from "next/link";
import { buttonClass } from "./button";

export const PAGE_SIZE = 25;

export function pageFrom(value: string | undefined) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** Server-side pagination footer; preserves the current filters in the URL. */
export function Pagination({ page, total, params, basePath }: { page: number; total: number; params: Record<string, string | undefined>; basePath: string }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number) => {
    const qs = new URLSearchParams(Object.entries({ ...params, page: String(p) }).filter((e): e is [string, string] => Boolean(e[1])));
    return `${basePath}?${qs}`;
  };
  return (
    <div className="flex items-center justify-between px-3 py-2 text-xs text-ink-3">
      <span>
        {total.toLocaleString("en-IN")} record{total === 1 ? "" : "s"} · page {page} of {pages}
      </span>
      <div className="flex gap-1">
        {page > 1 && (
          <Link className={buttonClass("secondary", "h-7")} href={href(page - 1)}>
            Previous
          </Link>
        )}
        {page < pages && (
          <Link className={buttonClass("secondary", "h-7")} href={href(page + 1)}>
            Next
          </Link>
        )}
      </div>
    </div>
  );
}

import { buttonClass } from "./button";

/** GET form for list filters — keeps filters in the URL so views are shareable. */
export function FilterBar({ children, resetHref }: { children: React.ReactNode; resetHref: string }) {
  return (
    <form method="get" className="flex flex-wrap items-end gap-2 border-b border-line px-3 py-2">
      {children}
      <button className={buttonClass("secondary", "h-8")}>Apply</button>
      <a href={resetHref} className={buttonClass("ghost", "h-8")}>
        Reset
      </a>
    </form>
  );
}

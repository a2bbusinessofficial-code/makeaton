/** Link to the CSV export of a list, carrying the list's current filters. */
export function exportHref(entity: "invoices" | "subscriptions" | "payments" | "customers", params: Record<string, string | undefined>) {
  const qs = new URLSearchParams(Object.entries(params).filter((e): e is [string, string] => Boolean(e[1]) && e[0] !== "page"));
  return `/api/export/${entity}${qs.size ? `?${qs}` : ""}`;
}

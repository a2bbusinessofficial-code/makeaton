import type { Tx } from "@/lib/db";

/**
 * Returns the next document number for a prefix, e.g. "INV/2026/00042".
 * The counter is incremented atomically inside the caller's transaction, so numbers
 * are unique and gap-free (a rolled-back transaction also rolls back the counter).
 */
export async function nextNumber(tx: Tx, prefix: "SUB" | "INV", date: Date): Promise<string> {
  const year = date.getUTCFullYear();
  const key = `${prefix}/${year}`;
  const rows = await tx.$queryRaw<{ value: number }[]>`
    INSERT INTO "Sequence" ("key", "next") VALUES (${key}, 2)
    ON CONFLICT ("key") DO UPDATE SET "next" = "Sequence"."next" + 1
    RETURNING "next" - 1 AS value`;
  return `${key}/${String(rows[0].value).padStart(5, "0")}`;
}

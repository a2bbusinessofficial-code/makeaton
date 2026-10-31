import { db, type Tx } from "@/lib/db";

export type EntityType = "subscription" | "invoice" | "customer" | "user" | "billing";

/** Appends an entry to the audit timeline shown on record pages. */
export async function logActivity(
  entry: { entityType: EntityType; entityId: string; action: string; message: string; actorName?: string | null },
  tx: Tx | typeof db = db,
) {
  await tx.activity.create({ data: { ...entry, actorName: entry.actorName ?? "System" } });
}

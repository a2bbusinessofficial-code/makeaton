import { db } from "@/lib/db";
import type { EntityType } from "@/lib/activity";

const fmt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

/** Audit trail for a record: who did what, when. */
export async function Timeline({ entityType, entityId }: { entityType: EntityType; entityId: string }) {
  const items = await db.activity.findMany({ where: { entityType, entityId }, orderBy: { createdAt: "desc" }, take: 50 });
  if (items.length === 0) return <p className="text-ink-3">No activity yet.</p>;
  return (
    <ol className="space-y-3">
      {items.map((a) => (
        <li key={a.id} className="flex gap-3">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink-3" />
          <div>
            <p className="text-ink">{a.message}</p>
            <p className="text-xs text-ink-3">
              {a.actorName} · {fmt.format(a.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

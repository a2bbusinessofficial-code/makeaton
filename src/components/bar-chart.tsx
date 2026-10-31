import { formatINRCompact } from "@/lib/money";

type Point = { label: string; values: { name: string; value: number; color: string }[] };

/** Small dependency-free grouped bar chart (server rendered). */
export function BarChart({ data }: { data: Point[] }) {
  const max = Math.max(1, ...data.flatMap((d) => d.values.map((v) => v.value)));
  const legend = data[0]?.values ?? [];
  return (
    <div>
      <div className="mb-3 flex gap-4 text-xs text-ink-3">
        {legend.map((l) => (
          <span key={l.name} className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm" style={{ background: l.color }} />
            {l.name}
          </span>
        ))}
      </div>
      <div className="flex h-44 items-end gap-3">
        {data.map((d) => (
          <div key={d.label} className="flex h-full flex-1 flex-col justify-end gap-1">
            <div className="flex flex-1 items-end justify-center gap-1">
              {d.values.map((v) => (
                <div
                  key={v.name}
                  title={`${v.name}: ${formatINRCompact(v.value)}`}
                  className="w-full max-w-5 rounded-t-sm"
                  style={{ height: `${Math.max(2, (v.value / max) * 100)}%`, background: v.color }}
                />
              ))}
            </div>
            <div className="text-center text-xs text-ink-3">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

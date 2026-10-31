"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { SubmitButton } from "@/components/ui/action-form";
import { Chip } from "@/components/ui/chip";
import { formatINR } from "@/lib/money";
import { analyzeStatement, recordMatches, type AnalyzeState, type RecordState } from "./actions";

const CONFIDENCE = { exact: ["Invoice no.", "green"], high: ["Name + amount", "blue"], check: ["Amount only", "orange"] } as const;

export function ReconcileClient() {
  const [analysis, analyze] = useActionState<AnalyzeState, FormData>(analyzeStatement, undefined);
  const [recordState, record] = useActionState<RecordState, FormData>(recordMatches, undefined);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const matches = useMemo(() => analysis?.matches ?? [], [analysis]);

  // Reliable matches are pre-selected; "amount only" ones need a human tick.
  useEffect(() => {
    setSelected(new Set(matches.filter((m) => m.confidence === "exact" || m.confidence === "high").map((m) => m.row)));
  }, [matches]);

  const toggle = (row: number) => setSelected((s) => (s.has(row) ? new Set([...s].filter((r) => r !== row)) : new Set([...s, row])));
  const selection = matches.filter((m) => m.invoice && selected.has(m.row)).map((m) => ({ row: m.row, invoiceId: m.invoice!.id, amount: m.amount, date: m.date, narration: m.narration }));
  const total = selection.reduce((a, s) => a + s.amount, 0);
  const matchedCount = matches.filter((m) => m.invoice).length;

  return (
    <div className="space-y-4">
      <form action={analyze} className="card flex flex-wrap items-end gap-3 p-4">
        <label className="block">
          <span className="label">Bank statement (CSV)</span>
          <input name="statement" type="file" accept=".csv,text/csv" required className="block text-ui file:mr-3 file:h-8 file:rounded-md file:border file:border-line file:bg-white file:px-3 file:text-ui" />
        </label>
        <SubmitButton pendingLabel="Matching…">Match payments</SubmitButton>
        <a href="/api/reconcile/sample" className="text-accent">
          Download a sample statement
        </a>
        {analysis?.error && <p className="w-full text-danger">{analysis.error}</p>}
      </form>

      {recordState?.recorded !== undefined && (
        <p role="status" className="rounded-md bg-[#e3f5ea] px-3 py-2 text-[#18794e]">
          {recordState.recorded} payment(s) recorded.{" "}
          {recordState.failed?.length ? `${recordState.failed.length} skipped: ${recordState.failed.map((f) => `row ${f.row} (${f.reason})`).join("; ")}` : ""}
          <Link href="/payments" className="ml-2 underline">
            View payments
          </Link>
        </p>
      )}
      {recordState?.error && <p className="rounded-md bg-[#ffe9e9] px-3 py-2 text-danger">{recordState.error}</p>}

      {matches.length > 0 && (
        <section className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
            <span className="font-medium">
              {analysis?.fileName} · {matchedCount} of {matches.length} lines matched
            </span>
            <form action={record}>
              <input type="hidden" name="selection" value={JSON.stringify(selection)} />
              <SubmitButton pendingLabel="Recording…">
                Record {selection.length} payment(s) · {formatINR(total)}
              </SubmitButton>
            </form>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th />
                  <th>Date</th>
                  <th>Narration</th>
                  <th className="text-right">Amount</th>
                  <th>Suggested invoice</th>
                  <th>Match</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.row} className={m.invoice ? "" : "text-ink-3"}>
                    <td>{m.invoice && <input type="checkbox" aria-label={`Select row ${m.row}`} checked={selected.has(m.row)} onChange={() => toggle(m.row)} className="size-3.5 accent-[#1961ed]" />}</td>
                    <td>{m.date}</td>
                    <td className="max-w-72 truncate" title={m.narration}>
                      {m.narration}
                    </td>
                    <td className="text-right tabular-nums">{formatINR(m.amount)}</td>
                    <td>
                      {m.invoice ? (
                        <span>
                          <Link href={`/invoices/${m.invoice.id}`} className="text-accent" target="_blank">
                            {m.invoice.number}
                          </Link>{" "}
                          <span className="text-ink-3">
                            · {m.invoice.customerName} · due {formatINR(m.invoice.due)}
                          </span>
                        </span>
                      ) : (
                        m.reason
                      )}
                    </td>
                    <td>{m.confidence ? <Chip color={CONFIDENCE[m.confidence][1]}>{CONFIDENCE[m.confidence][0]}</Chip> : <Chip>Unmatched</Chip>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

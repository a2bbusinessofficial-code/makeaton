"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { recordPayment } from "@/domain/billing";
import { matchStatement, parseStatementDate, readStatement, type Match } from "@/domain/reconcile";
import { requireBackOffice } from "@/lib/auth";
import { parseDate, today, toISODate } from "@/lib/dates";
import { db } from "@/lib/db";

export type AnalyzeState = { matches?: Match[]; error?: string; fileName?: string } | undefined;
export type RecordState = { recorded?: number; failed?: { row: number; reason: string }[]; error?: string } | undefined;

const MAX_BYTES = 2 * 1024 * 1024;

/** Step 1: read the uploaded statement and suggest an invoice for every credit line. */
export async function analyzeStatement(_: AnalyzeState, form: FormData): Promise<AnalyzeState> {
  await requireBackOffice();
  const file = form.get("statement");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a CSV bank statement to upload." };
  if (file.size > MAX_BYTES) return { error: "The file is larger than 2 MB." };

  const { lines, error } = readStatement(await file.text());
  if (error) return { error };
  if (lines.length === 0) return { error: "No transactions found in the file." };

  const open = await db.invoice.findMany({
    where: { state: "CONFIRMED", number: { not: null } },
    select: { id: true, number: true, customerName: true, total: true, amountPaid: true },
  });
  const matches = matchStatement(
    lines,
    open.map((i) => ({ ...i, number: i.number! })),
  );
  return { matches, fileName: file.name };
}

const selectionSchema = z.array(z.object({ row: z.number(), invoiceId: z.string().min(1), amount: z.number().int().positive(), date: z.string(), narration: z.string() })).min(1, "Select at least one match.");

/** Step 2: record a bank-transfer payment for every match the user ticked. */
export async function recordMatches(_: RecordState, form: FormData): Promise<RecordState> {
  const user = await requireBackOffice();
  const parsed = selectionSchema.safeParse(JSON.parse(String(form.get("selection") ?? "[]")));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const now = today();
  const failed: { row: number; reason: string }[] = [];
  let recorded = 0;
  for (const s of parsed.data) {
    const iso = parseStatementDate(s.date);
    const paymentDate = iso && parseDate(iso) <= now ? parseDate(iso) : now;
    try {
      await recordPayment({
        invoiceId: s.invoiceId,
        method: "BANK_TRANSFER",
        amount: s.amount,
        paymentDate,
        note: `Bank statement ${toISODate(paymentDate)}: ${s.narration}`.slice(0, 300),
        recordedById: user.id,
        actorName: `${user.fullName} (bank reconciliation)`,
      });
      recorded += 1;
    } catch (error) {
      failed.push({ row: s.row, reason: error instanceof Error ? error.message : "Could not record" });
    }
  }
  revalidatePath("/payments");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { recorded, failed };
}

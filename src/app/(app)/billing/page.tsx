import { IconPlayerPlay } from "@tabler/icons-react";
import { ActionButton, ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Chip } from "@/components/ui/chip";
import { Checkbox } from "@/components/ui/form";
import { PageBody, PageHeader, Section, Stat } from "@/components/ui/page";
import { runBilling, type BillingOutcome } from "@/domain/billing";
import { requireBackOffice } from "@/lib/auth";
import { formatDate, today } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { runBillingNow, runDailyJobsNow } from "./actions";

export const metadata = { title: "Billing runs" };
export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });

export default async function BillingPage() {
  await requireBackOffice();
  // Preview (dry run): exactly what billing day will produce, without writing anything.
  const [preview, runs] = await Promise.all([runBilling({ trigger: "preview", dryRun: true }), db.billingRun.findMany({ orderBy: { startedAt: "desc" }, take: 15 })]);

  return (
    <>
      <PageHeader icon={IconPlayerPlay} title="Billing runs" />
      <PageBody>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label={`Due as of ${formatDate(today())}`} value={preview.created.toLocaleString("en-IN")} hint="subscriptions to invoice" />
          <Stat label="Invoices that will be created" value={preview.invoiceCount.toLocaleString("en-IN")} hint="includes missed periods" />
          <Stat label="Amount to bill (incl. GST)" value={formatINR(preview.totalAmount)} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Run billing now">
            <p className="mb-3 text-ink-2">
              Creates one invoice per due period for every active, un-paused subscription. Running it again is safe: periods already billed are skipped, so nothing is billed twice or
              missed.
            </p>
            <ActionForm action={runBillingNow}>
              <Checkbox name="autoConfirm" label="Confirm invoices immediately" hint="Otherwise they are created as drafts for review" />
              <SubmitButton pendingLabel="Billing…">Run billing</SubmitButton>
            </ActionForm>
          </Section>
          <Section title="Daily automation">
            <p className="mb-3 text-ink-2">Runs every day automatically: activates subscriptions that start today, auto-closes expired ones, bills due periods, and sends overdue and renewal reminders.</p>
            <ActionButton action={runDailyJobsNow}>Run daily jobs now</ActionButton>
          </Section>
        </div>

        {preview.outcomes.length > 0 && (
          <Section title="Preview — next billing run">
            <PreviewTable outcomes={preview.outcomes.filter((o) => o.status === "created").slice(0, 15)} />
            {preview.created > 15 && <p className="mt-2 text-xs text-ink-3">…and {preview.created - 15} more</p>}
          </Section>
        )}

        <section className="card overflow-hidden">
          <div className="border-b border-line px-4 py-2.5 font-medium">History</div>
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Triggered by</th>
                <th className="text-right">Invoices</th>
                <th className="text-right">Amount</th>
                <th>Skipped</th>
                <th>Failed</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id}>
                  <td className="text-ink-2">{fmt.format(r.startedAt)}</td>
                  <td>{r.trigger}</td>
                  <td className="text-right">{r.createdCount}</td>
                  <td className="text-right tabular-nums">{formatINR(r.totalAmount)}</td>
                  <td>{r.skippedCount > 0 ? <Chip>{r.skippedCount} already billed</Chip> : "—"}</td>
                  <td>{r.failedCount > 0 ? <Chip color="red">{r.failedCount}</Chip> : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </PageBody>
    </>
  );
}

function PreviewTable({ outcomes }: { outcomes: BillingOutcome[] }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Subscription</th>
          <th>Customer</th>
          <th className="text-right">Invoices</th>
          <th className="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {outcomes.map((o) => (
          <tr key={o.subscriptionId}>
            <td>{o.number}</td>
            <td>{o.customer}</td>
            <td className="text-right">{o.invoices}</td>
            <td className="text-right tabular-nums">{formatINR(o.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

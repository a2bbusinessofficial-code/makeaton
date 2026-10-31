"use server";

import type { ActionState } from "@/components/ui/action-form";
import { runBilling } from "@/domain/billing";
import { runDailyJobs } from "@/domain/jobs";
import { runAction } from "@/lib/actions";
import { requireBackOffice } from "@/lib/auth";
import { formatINR } from "@/lib/money";

export async function runBillingNow(_: ActionState, form: FormData) {
  return runAction(async () => {
    const user = await requireBackOffice();
    const result = await runBilling({ trigger: user.fullName, autoConfirm: form.get("autoConfirm") === "on" });
    return `${result.invoiceCount} invoice(s) created for ${formatINR(result.totalAmount)} · ${result.skipped} already billed · ${result.failed} failed`;
  }, ["/billing", "/invoices", "/dashboard"]);
}

export async function runDailyJobsNow() {
  return runAction(async () => {
    const user = await requireBackOffice();
    const r = await runDailyJobs(user.fullName);
    return `Activated ${r.activated}, auto-closed ${r.closed}, invoiced ${r.invoices}, reminders sent ${r.reminders}`;
  }, ["/billing", "/invoices", "/subscriptions", "/dashboard"]);
}

import "server-only";
import { addDays, diffDays, today } from "@/lib/dates";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { sendMail } from "@/lib/mail/mailer";
import { overdueReminderEmail, renewalReminderEmail } from "@/lib/mail/templates";
import { runBilling } from "./billing";
import { activateSubscription, closeSubscription } from "./subscriptions";

const OVERDUE_STEPS = [15, 7, 1]; // days overdue at which a reminder goes out (largest first)
const RENEWAL_NOTICE_DAYS = 7;
const MAX_EMAILS_PER_RUN = 50;

/** Confirmed subscriptions whose start date has arrived become active. */
export async function activateDueSubscriptions() {
  const due = await db.subscription.findMany({ where: { state: "CONFIRMED", startDate: { lte: today() } }, select: { id: true } });
  for (const { id } of due) await activateSubscription(id, "Scheduler");
  return due.length;
}

/** Plans marked "close automatically" close their subscriptions once the expiry date passes. */
export async function closeExpiredSubscriptions() {
  const expired = await db.subscription.findMany({
    where: { state: "ACTIVE", endDate: { lt: today() }, plan: { autoClose: true } },
    select: { id: true },
  });
  for (const { id } of expired) await closeSubscription(id, "Expired (plan closes automatically)", "Scheduler", { bySystem: true });
  return expired.length;
}

/** Sends each overdue/renewal reminder at most once (tracked in ReminderLog). */
export async function sendReminders() {
  const now = today();
  const site = env().NEXT_PUBLIC_SITE_URL;
  let sent = 0;

  const overdue = await db.invoice.findMany({
    where: { state: "CONFIRMED", dueDate: { lt: now, gte: addDays(now, -30) } },
    select: { id: true, number: true, customerName: true, customerEmail: true, total: true, amountPaid: true, dueDate: true },
    orderBy: { dueDate: "asc" },
  });
  for (const inv of overdue) {
    if (sent >= MAX_EMAILS_PER_RUN) break;
    const daysOverdue = diffDays(now, inv.dueDate);
    const step = OVERDUE_STEPS.find((s) => daysOverdue >= s);
    if (!step || !inv.number) continue;
    const created = await db.reminderLog.createMany({ data: [{ kind: `overdue-${step}`, refId: inv.id }], skipDuplicates: true });
    if (created.count === 0) continue;
    const mail = overdueReminderEmail({ number: inv.number, customerName: inv.customerName, amountDue: inv.total - inv.amountPaid, dueDate: inv.dueDate, daysOverdue }, `${site}/portal/invoices/${inv.id}`);
    await sendMail({ to: inv.customerEmail, ...mail });
    sent += 1;
  }

  const renewals = await db.subscription.findMany({
    where: { state: "ACTIVE", endDate: { gte: now, lte: addDays(now, RENEWAL_NOTICE_DAYS) } },
    include: { customer: true, plan: true },
  });
  for (const sub of renewals) {
    if (sent >= MAX_EMAILS_PER_RUN) break;
    const created = await db.reminderLog.createMany({ data: [{ kind: "renewal", refId: `${sub.id}:${sub.endDate!.toISOString().slice(0, 10)}` }], skipDuplicates: true });
    if (created.count === 0) continue;
    const mail = renewalReminderEmail({ number: sub.number, customerName: sub.customer.name, planName: sub.plan.name, endDate: sub.endDate! }, `${site}/portal/subscriptions/${sub.id}`);
    await sendMail({ to: sub.customer.email, ...mail });
    sent += 1;
  }
  return sent;
}

/** The daily job: everything that used to depend on "whoever notices first". */
export async function runDailyJobs(trigger: string) {
  const activated = await activateDueSubscriptions();
  const closed = await closeExpiredSubscriptions();
  const billing = await runBilling({ trigger });
  const reminders = await sendReminders();
  return { activated, closed, invoices: billing.invoiceCount, billingFailed: billing.failed, reminders };
}

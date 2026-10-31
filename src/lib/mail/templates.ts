import { formatDate } from "@/lib/dates";
import { formatINR } from "@/lib/money";

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, body: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html><body style="margin:0;background:#f7f7f7;font-family:Inter,Segoe UI,Arial,sans-serif;color:#333">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #ebebeb;border-radius:8px;padding:28px">
    <tr><td style="font-size:13px;color:#999;padding-bottom:16px">Brightloop Software</td></tr>
    <tr><td style="font-size:18px;font-weight:600;padding-bottom:12px">${escape(title)}</td></tr>
    <tr><td style="font-size:14px;line-height:1.6">${body}</td></tr>
    ${cta ? `<tr><td style="padding-top:20px"><a href="${cta.url}" style="background:#333;color:#fff;text-decoration:none;padding:9px 16px;border-radius:6px;font-size:13px">${escape(cta.label)}</a></td></tr>` : ""}
  </table>
  <div style="font-size:12px;color:#999;padding-top:12px">You are receiving this because you have an account with Brightloop.</div>
  </td></tr></table></body></html>`;
}

export function passwordChangedEmail(name: string, loginUrl: string) {
  return {
    subject: "Your Brightloop password was changed",
    html: layout(
      "Password changed",
      `Hi ${escape(name)},<br/>The password for your Brightloop account was just changed. If this was you, no action is needed.<br/><br/>If you did not change it, reset your password immediately and contact our team.`,
      { label: "Go to Brightloop", url: loginUrl },
    ),
  };
}

type InvoiceSummary = {
  number: string;
  customerName: string;
  invoiceDate: Date;
  dueDate: Date;
  periodStart: Date;
  periodEnd: Date;
  total: number;
  amountPaid: number;
  lines: { description: string; quantity: number; total: number }[];
};

export function invoiceEmail(invoice: InvoiceSummary, viewUrl: string) {
  const rows = invoice.lines
    .map((l) => `<tr><td style="padding:6px 0;border-bottom:1px solid #f1f1f1">${escape(l.description)} × ${l.quantity}</td><td align="right" style="border-bottom:1px solid #f1f1f1">${formatINR(l.total)}</td></tr>`)
    .join("");
  return {
    subject: `Invoice ${invoice.number} from Brightloop — ${formatINR(invoice.total - invoice.amountPaid)} due ${formatDate(invoice.dueDate)}`,
    html: layout(
      `Invoice ${invoice.number}`,
      `Hi ${escape(invoice.customerName)},<br/>Here is your invoice for ${formatDate(invoice.periodStart)} – ${formatDate(invoice.periodEnd)}.<br/><br/>
       <table width="100%" style="font-size:13px">${rows}
       <tr><td style="padding-top:8px;font-weight:600">Total (incl. GST)</td><td align="right" style="padding-top:8px;font-weight:600">${formatINR(invoice.total)}</td></tr>
       <tr><td style="color:#999">Due date</td><td align="right" style="color:#999">${formatDate(invoice.dueDate)}</td></tr></table>`,
      { label: "View & download invoice", url: viewUrl },
    ),
  };
}

export function quotationEmail(q: { number: string; customerName: string; validUntil: Date; total: number; planName: string }, url: string) {
  return {
    subject: `Your Brightloop quotation ${q.number}`,
    html: layout(
      `Quotation ${q.number}`,
      `Hi ${escape(q.customerName)},<br/>Thanks for your interest in <b>${escape(q.planName)}</b>. Your quotation totals <b>${formatINR(q.total)}</b> per billing period (incl. GST) and is valid until <b>${formatDate(q.validUntil)}</b>.`,
      { label: "Review quotation", url },
    ),
  };
}

export function overdueReminderEmail(r: { number: string; customerName: string; amountDue: number; dueDate: Date; daysOverdue: number }, url: string) {
  return {
    subject: `Reminder: invoice ${r.number} is ${r.daysOverdue} day${r.daysOverdue === 1 ? "" : "s"} overdue`,
    html: layout(
      "Payment reminder",
      `Hi ${escape(r.customerName)},<br/>Invoice <b>${escape(r.number)}</b> for <b>${formatINR(r.amountDue)}</b> was due on ${formatDate(r.dueDate)}. Please arrange payment at your earliest convenience. If you have already paid, thank you, and please ignore this email.`,
      { label: "View invoice", url },
    ),
  };
}

export function renewalReminderEmail(r: { number: string; customerName: string; planName: string; endDate: Date }, url: string) {
  return {
    subject: `Your ${r.planName} subscription ends on ${formatDate(r.endDate)}`,
    html: layout(
      "Renewal coming up",
      `Hi ${escape(r.customerName)},<br/>Your subscription <b>${escape(r.number)}</b> (${escape(r.planName)}) ends on <b>${formatDate(r.endDate)}</b>. Renew from your portal in one click to keep everything running.`,
      { label: "Manage subscription", url },
    ),
  };
}


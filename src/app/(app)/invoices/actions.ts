"use server";

import { z } from "zod";
import type { ActionState } from "@/components/ui/action-form";
import { cancelInvoice, confirmInvoice, recordPayment, sendInvoice } from "@/domain/billing";
import { runAction } from "@/lib/actions";
import { requireBackOffice } from "@/lib/auth";
import { db } from "@/lib/db";
import { f, formList, formValues } from "@/lib/forms";

const path = (form: FormData) => [`/invoices/${form.get("id")}`, "/invoices"];

export async function invoiceAction(_: ActionState, form: FormData) {
  return runAction(async () => {
    const user = await requireBackOffice();
    const id = String(form.get("id"));
    switch (form.get("op")) {
      case "confirm":
        await confirmInvoice(id, user.fullName);
        return "Invoice confirmed";
      case "cancel":
        await cancelInvoice(id, user.fullName);
        return "Invoice cancelled";
      case "send":
        await sendInvoice(id, user.fullName);
        return "Invoice emailed to the customer";
    }
  }, path(form));
}

/** Bulk confirm from the list view (billing day: review drafts, confirm them all). */
export async function confirmSelected(_: ActionState, form: FormData) {
  return runAction(async () => {
    const user = await requireBackOffice();
    const ids = formList(form, "ids");
    const targets = ids.length ? ids : (await db.invoice.findMany({ where: { state: "DRAFT" }, select: { id: true }, take: 500 })).map((i) => i.id);
    for (const id of targets) await confirmInvoice(id, user.fullName);
    return `${targets.length} invoice(s) confirmed`;
  }, "/invoices");
}

const paymentSchema = z.object({
  id: f.id("invoice"),
  method: z.enum(["CASH", "BANK_TRANSFER", "UPI", "CARD", "CHEQUE"], { message: "Choose a payment method" }),
  amount: f.rupees("Amount"),
  paymentDate: f.date("Payment date"),
  note: f.optionalText(300),
});

export async function addPayment(_: ActionState, form: FormData) {
  return runAction(async () => {
    const user = await requireBackOffice();
    const input = paymentSchema.parse(formValues(form));
    const state = await recordPayment({ invoiceId: input.id, method: input.method, amount: input.amount, paymentDate: input.paymentDate, note: input.note ?? undefined, recordedById: user.id, actorName: user.fullName });
    return state === "PAID" ? "Payment recorded — invoice is fully paid" : "Partial payment recorded";
  }, [...path(form), "/payments"]);
}

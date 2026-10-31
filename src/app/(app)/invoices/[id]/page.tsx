import Link from "next/link";
import { notFound } from "next/navigation";
import { IconFileInvoice } from "@tabler/icons-react";
import { InvoiceDocument } from "@/components/invoice-document";
import { Timeline } from "@/components/timeline";
import { ActionButton, ActionForm, SubmitButton } from "@/components/ui/action-form";
import { LinkButton } from "@/components/ui/button";
import { Field, FormGrid, Input, Select } from "@/components/ui/form";
import { PageBody, PageHeader, Section } from "@/components/ui/page";
import { requireBackOffice } from "@/lib/auth";
import { toISODate, today } from "@/lib/dates";
import { db } from "@/lib/db";
import { paiseToRupees } from "@/lib/money";
import { addPayment, invoiceAction } from "../actions";
import { PAYMENT_METHODS } from "../payment-methods";


export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireBackOffice();
  const { id } = await params;
  const invoice = await db.invoice.findUnique({ where: { id }, include: { lines: true, payments: { orderBy: { paymentDate: "asc" } }, customer: true, subscription: true } });
  if (!invoice) notFound();
  const due = invoice.total - invoice.amountPaid;
  const op = (name: string, label: string, variant: "primary" | "secondary" | "danger" = "secondary", confirm?: string) => (
    <ActionButton action={invoiceAction} fields={{ id: invoice.id, op: name }} variant={variant} confirm={confirm}>
      {label}
    </ActionButton>
  );

  return (
    <>
      <PageHeader
        icon={IconFileInvoice}
        crumbs={[{ label: "Invoices", href: "/invoices" }]}
        title={invoice.number ?? "Draft invoice"}
        actions={
          <>
            {invoice.state === "DRAFT" && op("confirm", "Confirm", "primary")}
            {(invoice.state === "DRAFT" || invoice.state === "CONFIRMED" || invoice.state === "PAID") && op("send", invoice.sentAt ? "Send again" : "Send by email")}
            <LinkButton href={`/print/invoices/${invoice.id}`} target="_blank">
              Print / PDF
            </LinkButton>
            {(invoice.state === "DRAFT" || invoice.state === "CONFIRMED") && invoice.amountPaid === 0 && op("cancel", "Cancel", "danger", "Cancel this invoice? Its period can be billed again.")}
          </>
        }
      />
      <PageBody className="grid gap-4 xl:grid-cols-[1fr_340px] xl:space-y-0">
        <div className="space-y-2">
          <p className="text-ink-3">
            From subscription{" "}
            <Link className="text-accent" href={`/subscriptions/${invoice.subscriptionId}`}>
              {invoice.subscription.number}
            </Link>
          </p>
          <InvoiceDocument invoice={invoice} customerState={invoice.customer.state} />
        </div>
        <div className="space-y-4">
          {invoice.state === "CONFIRMED" && (
            <Section title="Record a payment">
              <ActionForm action={addPayment} resetOnSuccess>
                <input type="hidden" name="id" value={invoice.id} />
                <FormGrid>
                  <Field label="Amount (₹)">
                    <Input name="amount" type="number" step="0.01" min="0.01" max={paiseToRupees(due)} defaultValue={paiseToRupees(due)} required />
                  </Field>
                  <Field label="Date">
                    <Input name="paymentDate" type="date" max={toISODate(today())} defaultValue={toISODate(today())} required />
                  </Field>
                </FormGrid>
                <Field label="Method">
                  <Select name="method" options={PAYMENT_METHODS} />
                </Field>
                <Field label="Note">
                  <Input name="note" placeholder="UTR / cheque number / reference" />
                </Field>
                <SubmitButton>Record payment</SubmitButton>
              </ActionForm>
            </Section>
          )}
          {invoice.state === "DRAFT" && <p className="rounded-md bg-app px-3 py-2 text-ink-2">Confirm the invoice to assign its number and accept payments.</p>}
          <Section title="Activity">
            <Timeline entityType="invoice" entityId={invoice.id} />
          </Section>
        </div>
      </PageBody>
    </>
  );
}

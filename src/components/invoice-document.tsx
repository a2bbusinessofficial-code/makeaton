import type { Invoice, InvoiceLine, Payment } from "@prisma/client";
import { splitGst } from "@/domain/pricing";
import { formatDate } from "@/lib/dates";
import { env } from "@/lib/env";
import { formatINR, formatRate } from "@/lib/money";
import { InvoiceStatus } from "./status";

type Props = { invoice: Invoice & { lines: InvoiceLine[]; payments: Payment[] }; customerState?: string | null };

/** GST tax invoice layout shared by the back office, the customer portal and the print view. */
export function InvoiceDocument({ invoice, customerState }: Props) {
  const gst = splitGst(invoice.taxTotal, env().COMPANY_STATE, customerState);
  const due = invoice.total - invoice.amountPaid;

  return (
    <article className="card mx-auto max-w-3xl p-6 sm:p-8 print:border-0 print:p-0">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded bg-ink text-xs font-semibold text-white">B</span>
            <span className="font-semibold">Brightloop Software Pvt. Ltd.</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-ink-3">
            Infocity, Gandhinagar, {env().COMPANY_STATE}
            <br />
            GSTIN 24AABCB1234C1Z5 · billing@brightloop.app
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs tracking-wide text-ink-3 uppercase">Tax invoice</div>
          <div className="text-lg font-semibold">{invoice.number ?? "Draft"}</div>
          <div className="mt-1">
            <InvoiceStatus {...invoice} />
          </div>
        </div>
      </header>

      <section className="grid gap-4 border-b border-line py-5 sm:grid-cols-2">
        <div>
          <div className="text-xs text-ink-3">Bill to</div>
          <div className="font-medium">{invoice.customerName}</div>
          <div className="text-ink-2">{invoice.customerEmail}</div>
          {invoice.customerAddress && <div className="text-ink-2">{invoice.customerAddress}</div>}
          {invoice.customerGstin && <div className="text-ink-2">GSTIN {invoice.customerGstin}</div>}
        </div>
        <dl className="grid grid-cols-2 gap-y-1 sm:text-right">
          <dt className="text-ink-3">Invoice date</dt>
          <dd>{formatDate(invoice.invoiceDate)}</dd>
          <dt className="text-ink-3">Due date</dt>
          <dd>{formatDate(invoice.dueDate)}</dd>
          <dt className="text-ink-3">Service period</dt>
          <dd>
            {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}
          </dd>
        </dl>
      </section>

      <div className="overflow-x-auto">
        <table className="table my-4">
          <thead>
            <tr>
              <th className="!px-0">Description</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Unit price</th>
              <th className="text-right">Discount</th>
              <th className="text-right">GST</th>
              <th className="!pr-0 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((l) => (
              <tr key={l.id}>
                <td className="!px-0">{l.description}</td>
                <td className="text-right">{l.quantity}</td>
                <td className="text-right tabular-nums">{formatINR(l.unitPrice)}</td>
                <td className="text-right tabular-nums">{l.discountAmount ? `− ${formatINR(l.discountAmount)}` : "—"}</td>
                <td className="text-right text-ink-3">{formatRate(l.taxRateBps)}</td>
                <td className="!pr-0 text-right tabular-nums">{formatINR(l.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <dl className="grid w-72 grid-cols-2 gap-y-1 text-right">
          <dt className="text-ink-3">Subtotal</dt>
          <dd className="tabular-nums">{formatINR(invoice.subtotal)}</dd>
          {invoice.discountTotal > 0 && (
            <>
              <dt className="text-ink-3">Discount</dt>
              <dd className="tabular-nums">− {formatINR(invoice.discountTotal)}</dd>
            </>
          )}
          {gst.interState ? (
            <>
              <dt className="text-ink-3">IGST</dt>
              <dd className="tabular-nums">{formatINR(gst.igst)}</dd>
            </>
          ) : (
            <>
              <dt className="text-ink-3">CGST</dt>
              <dd className="tabular-nums">{formatINR(gst.cgst)}</dd>
              <dt className="text-ink-3">SGST</dt>
              <dd className="tabular-nums">{formatINR(gst.sgst)}</dd>
            </>
          )}
          <dt className="border-t border-line pt-1 font-medium">Total</dt>
          <dd className="border-t border-line pt-1 font-semibold tabular-nums">{formatINR(invoice.total)}</dd>
          <dt className="text-ink-3">Paid</dt>
          <dd className="tabular-nums">{formatINR(invoice.amountPaid)}</dd>
          <dt className="font-medium">Amount due</dt>
          <dd className="font-semibold tabular-nums">{formatINR(due)}</dd>
        </dl>
      </div>

      {invoice.payments.length > 0 && (
        <section className="mt-6 border-t border-line pt-4">
          <div className="mb-2 text-xs text-ink-3">Payments received</div>
          <ul className="space-y-1">
            {invoice.payments.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>
                  {formatDate(p.paymentDate)} · {p.method.replace("_", " ").toLowerCase()}
                  {p.note && <span className="text-ink-3"> · {p.note}</span>}
                </span>
                <span className="tabular-nums">{formatINR(p.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="mt-8 text-xs text-ink-3">Thank you for your business. This is a computer-generated invoice.</p>
    </article>
  );
}

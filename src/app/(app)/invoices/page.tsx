import Link from "next/link";
import { IconFileInvoice } from "@tabler/icons-react";
import { InvoiceStatus } from "@/components/status";
import { ActionButton } from "@/components/ui/action-form";
import { LinkButton } from "@/components/ui/button";
import { exportHref } from "@/components/ui/export";
import { FilterBar } from "@/components/ui/filter-bar";
import { Field, Input, Select } from "@/components/ui/form";
import { EmptyState, PageBody, PageHeader } from "@/components/ui/page";
import { PAGE_SIZE, Pagination, pageFrom } from "@/components/ui/pagination";
import { requireBackOffice } from "@/lib/auth";
import { invoiceWhere } from "@/domain/filters";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { confirmSelected } from "./actions";

export const metadata = { title: "Invoices" };

type Search = { q?: string; status?: string; from?: string; to?: string; page?: string };

const STATUS_FILTERS = [
  { value: "outstanding", label: "Outstanding" },
  { value: "overdue", label: "Overdue" },
  { value: "paid", label: "Paid" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" },
];


export default async function InvoicesPage({ searchParams }: { searchParams: Promise<Search> }) {
  await requireBackOffice();
  const params = await searchParams;
  const page = pageFrom(params.page);
  const q = params.q?.trim();
  const where = invoiceWhere(params);

  const [invoices, total, totals, drafts] = await Promise.all([
    db.invoice.findMany({ where, orderBy: [{ invoiceDate: "desc" }, { createdAt: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.invoice.count({ where }),
    db.invoice.aggregate({ where, _sum: { total: true, amountPaid: true } }),
    db.invoice.count({ where: { state: "DRAFT" } }),
  ]);

  return (
    <>
      <PageHeader
        icon={IconFileInvoice}
        title="Invoices"
        actions={
          <>
          <LinkButton href={exportHref("invoices", params)}>Export CSV</LinkButton>
          {drafts > 0 && (
            <ActionButton action={confirmSelected} variant="primary" confirm={`Confirm all ${drafts} draft invoice(s)?`}>
              Confirm all drafts ({drafts})
            </ActionButton>
          )}
          </>
        }
      />
      <PageBody>
        <div className="card overflow-hidden">
          <FilterBar resetHref="/invoices">
            <Field label="Search" className="w-56">
              <Input name="q" defaultValue={q} placeholder="Number or customer" />
            </Field>
            <Field label="Status" className="w-36">
              <Select name="status" defaultValue={params.status ?? ""} placeholder="All" options={STATUS_FILTERS} />
            </Field>
            <Field label="From" className="w-36">
              <Input name="from" type="date" defaultValue={params.from} />
            </Field>
            <Field label="To" className="w-36">
              <Input name="to" type="date" defaultValue={params.to} />
            </Field>
          </FilterBar>
          <div className="flex flex-wrap gap-6 border-b border-line px-3 py-2 text-xs text-ink-3">
            <span>
              Invoiced <b className="text-ink">{formatINR(totals._sum.total ?? 0)}</b>
            </span>
            <span>
              Paid <b className="text-ink">{formatINR(totals._sum.amountPaid ?? 0)}</b>
            </span>
            <span>
              Balance <b className="text-ink">{formatINR((totals._sum.total ?? 0) - (totals._sum.amountPaid ?? 0))}</b>
            </span>
          </div>
          {invoices.length === 0 ? (
            <EmptyState title="No invoices match" />
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Customer</th>
                    <th>Invoice date</th>
                    <th>Due date</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <Link href={`/invoices/${inv.id}`} className="font-medium hover:text-accent">
                          {inv.number ?? "Draft"}
                        </Link>
                      </td>
                      <td className="max-w-60 truncate">{inv.customerName}</td>
                      <td className="text-ink-2">{formatDate(inv.invoiceDate)}</td>
                      <td className="text-ink-2">{formatDate(inv.dueDate)}</td>
                      <td className="text-right tabular-nums">{formatINR(inv.total)}</td>
                      <td className="text-right tabular-nums">{inv.state === "CONFIRMED" ? formatINR(inv.total - inv.amountPaid) : "—"}</td>
                      <td>
                        <InvoiceStatus {...inv} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} total={total} params={{ q, status: params.status, from: params.from, to: params.to }} basePath="/invoices" />
        </div>
      </PageBody>
    </>
  );
}

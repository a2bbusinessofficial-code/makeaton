import Link from "next/link";
import type { PaymentMethod, Prisma } from "@prisma/client";
import { IconCreditCard } from "@tabler/icons-react";
import { FilterBar } from "@/components/ui/filter-bar";
import { Field, Input, Select } from "@/components/ui/form";
import { EmptyState, PageBody, PageHeader } from "@/components/ui/page";
import { PAGE_SIZE, Pagination, pageFrom } from "@/components/ui/pagination";
import { requireBackOffice } from "@/lib/auth";
import { formatDate, parseDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { PAYMENT_METHODS } from "../invoices/payment-methods";

export const metadata = { title: "Payments" };

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ method?: string; from?: string; to?: string; page?: string }> }) {
  await requireBackOffice();
  const params = await searchParams;
  const page = pageFrom(params.page);
  const method = PAYMENT_METHODS.some((m) => m.value === params.method) ? (params.method as PaymentMethod) : undefined;
  const where: Prisma.PaymentWhereInput = {
    method,
    ...(params.from || params.to ? { paymentDate: { gte: params.from ? parseDate(params.from) : undefined, lte: params.to ? parseDate(params.to) : undefined } } : {}),
  };
  const [payments, total, sum] = await Promise.all([
    db.payment.findMany({ where, include: { invoice: { select: { id: true, number: true, customerName: true } } }, orderBy: [{ paymentDate: "desc" }, { createdAt: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    db.payment.count({ where }),
    db.payment.aggregate({ where, _sum: { amount: true } }),
  ]);

  return (
    <>
      <PageHeader icon={IconCreditCard} title="Payments" />
      <PageBody>
        <div className="card overflow-hidden">
          <FilterBar resetHref="/payments">
            <Field label="Method" className="w-52">
              <Select name="method" defaultValue={method ?? ""} placeholder="All methods" options={PAYMENT_METHODS} />
            </Field>
            <Field label="From" className="w-36">
              <Input name="from" type="date" defaultValue={params.from} />
            </Field>
            <Field label="To" className="w-36">
              <Input name="to" type="date" defaultValue={params.to} />
            </Field>
          </FilterBar>
          <div className="border-b border-line px-3 py-2 text-xs text-ink-3">
            Total received <b className="text-ink">{formatINR(sum._sum.amount ?? 0)}</b>
          </div>
          {payments.length === 0 ? (
            <EmptyState title="No payments recorded" description="Record payments from an invoice page." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Method</th>
                    <th>Note</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="text-ink-2">{formatDate(p.paymentDate)}</td>
                      <td>
                        <Link href={`/invoices/${p.invoice.id}`} className="hover:text-accent">
                          {p.invoice.number}
                        </Link>
                      </td>
                      <td className="max-w-56 truncate">{p.invoice.customerName}</td>
                      <td>{PAYMENT_METHODS.find((m) => m.value === p.method)?.label.split(" (")[0]}</td>
                      <td className="max-w-48 truncate text-ink-3">{p.note ?? "—"}</td>
                      <td className="text-right tabular-nums">{formatINR(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={page} total={total} params={{ method, from: params.from, to: params.to }} basePath="/payments" />
        </div>
      </PageBody>
    </>
  );
}

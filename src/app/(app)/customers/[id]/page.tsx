import Link from "next/link";
import { notFound } from "next/navigation";
import { IconUsersGroup } from "@tabler/icons-react";
import { InvoiceStatus, SubscriptionStatus } from "@/components/status";
import { LinkButton } from "@/components/ui/button";
import { PageBody, PageHeader, Section } from "@/components/ui/page";
import { requireBackOffice } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { updateCustomer } from "../actions";
import { CustomerForm } from "../customer-form";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireBackOffice();
  const { id } = await params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      subscriptions: { include: { plan: true }, orderBy: { createdAt: "desc" } },
      invoices: { where: { state: { not: "CANCELLED" } }, orderBy: { invoiceDate: "desc" }, take: 20 },
    },
  });
  if (!customer) notFound();
  const outstanding = customer.invoices.filter((i) => i.state === "CONFIRMED").reduce((a, i) => a + i.total - i.amountPaid, 0);

  return (
    <>
      <PageHeader
        icon={IconUsersGroup}
        crumbs={[{ label: "Customers", href: "/customers" }]}
        title={customer.company ? `${customer.name} · ${customer.company}` : customer.name}
        actions={
          <LinkButton href={`/subscriptions/new?customerId=${customer.id}`} variant="primary">
            New quotation
          </LinkButton>
        }
      />
      <PageBody className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:space-y-0">
        <Section title="Details">
          <CustomerForm action={updateCustomer} customer={customer} />
        </Section>
        <div className="space-y-4">
          <Section title={`Subscriptions (${customer.subscriptions.length})`}>
            <table className="table">
              <tbody>
                {customer.subscriptions.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link href={`/subscriptions/${s.id}`} className="hover:text-accent">
                        {s.number}
                      </Link>
                    </td>
                    <td>{s.plan.name}</td>
                    <td>
                      <SubscriptionStatus state={s.state} isPaused={s.isPaused} validUntil={s.validUntil} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
          <Section title={`Recent invoices · ${formatINR(outstanding)} outstanding`}>
            <table className="table">
              <tbody>
                {customer.invoices.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <Link href={`/invoices/${i.id}`} className="hover:text-accent">
                        {i.number ?? "Draft"}
                      </Link>
                    </td>
                    <td className="text-ink-3">{formatDate(i.invoiceDate)}</td>
                    <td className="text-right tabular-nums">{formatINR(i.total)}</td>
                    <td>
                      <InvoiceStatus {...i} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>
      </PageBody>
    </>
  );
}

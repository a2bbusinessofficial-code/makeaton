import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceDocument } from "@/components/invoice-document";
import { LinkButton } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function PortalInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("CUSTOMER");
  const { id } = await params;
  // Scoped to the signed-in customer: other customers' invoice ids return 404.
  const invoice = await db.invoice.findFirst({
    where: { id, customerId: user.customerId ?? "__none__", state: { in: ["CONFIRMED", "PAID"] } },
    include: { lines: true, payments: { orderBy: { paymentDate: "asc" } }, customer: true },
  });
  if (!invoice) notFound();

  return (
    <>
      <div className="flex items-center justify-between">
        <Link href="/portal" className="text-ink-3 hover:text-ink">
          ← My account
        </Link>
        <LinkButton href={`/print/invoices/${invoice.id}`} target="_blank" variant="primary">
          Download PDF
        </LinkButton>
      </div>
      <InvoiceDocument invoice={invoice} customerState={invoice.customer.state} />
    </>
  );
}

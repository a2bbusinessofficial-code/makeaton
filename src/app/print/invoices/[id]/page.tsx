import { notFound } from "next/navigation";
import { InvoiceDocument } from "@/components/invoice-document";
import { PrintButton } from "@/components/print-button";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Invoice" };

/** Print-friendly invoice (use the browser's "Save as PDF"). Staff, or the invoice's own customer. */
export default async function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const invoice = await db.invoice.findUnique({ where: { id }, include: { lines: true, payments: { orderBy: { paymentDate: "asc" } }, customer: true } });
  const allowed = invoice && (user.role !== "CUSTOMER" || invoice.customerId === user.customerId);
  if (!invoice || !allowed || (invoice.state === "DRAFT" && user.role === "CUSTOMER")) notFound();

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="no-print mx-auto mb-4 flex max-w-3xl justify-end">
        <PrintButton />
      </div>
      <InvoiceDocument invoice={invoice} customerState={invoice.customer.state} />
    </main>
  );
}

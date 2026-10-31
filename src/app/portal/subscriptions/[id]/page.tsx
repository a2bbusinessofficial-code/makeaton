import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceStatus, SubscriptionStatus, SubscriptionStepper } from "@/components/status";
import { ActionButton } from "@/components/ui/action-form";
import { Chip } from "@/components/ui/chip";
import { Fields, Section } from "@/components/ui/page";
import { priceSubscription } from "@/domain/billing";
import { subscriptionInclude } from "@/domain/subscriptions";
import { requireRole } from "@/lib/auth";
import { formatDate, PERIOD_LABEL, PERIOD_UNIT, today } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { customerTransition } from "../../actions";

export default async function PortalSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("CUSTOMER");
  const { id } = await params;
  const sub = await db.subscription.findFirst({
    where: { id, customerId: user.customerId ?? "__none__", state: { not: "DRAFT" } },
    include: { ...subscriptionInclude, invoices: { where: { state: { in: ["CONFIRMED", "PAID"] } }, orderBy: { invoiceDate: "desc" } } },
  });
  if (!sub) notFound();

  const now = today();
  const pricing = priceSubscription(sub, sub.nextInvoiceDate ?? now);
  const priced = new Map(pricing.lines.map((l) => [l.key, l]));
  const { plan } = sub;
  const op = (name: string, label: string, variant: "primary" | "secondary" | "danger" = "secondary", confirm?: string, extra: Record<string, string> = {}) => (
    <ActionButton action={customerTransition} fields={{ id: sub.id, op: name, ...extra }} variant={variant} confirm={confirm}>
      {label}
    </ActionButton>
  );
  const quoteExpired = sub.state === "QUOTATION" && sub.validUntil !== null && sub.validUntil < now;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/portal" className="text-ink-3 hover:text-ink">
            ← My account
          </Link>
          <h1 className="mt-1 text-lg font-semibold">
            {plan.name} <span className="font-normal text-ink-3">· {sub.number}</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {sub.state === "QUOTATION" && !quoteExpired && op("confirm", "Accept quotation", "primary")}
          {sub.state === "ACTIVE" && !sub.isPaused && plan.pausable && op("pause", "Pause")}
          {sub.isPaused && op("resume", "Resume", "primary")}
          {(sub.state === "ACTIVE" || sub.state === "CONFIRMED") && plan.renewable && sub.endDate && op("renew", "Renew")}
          {sub.state === "ACTIVE" && plan.closable && op("close", "Cancel subscription", "danger", "Cancel this subscription? You will not be billed again.")}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SubscriptionStepper state={sub.state} />
        <SubscriptionStatus state={sub.state} isPaused={sub.isPaused} validUntil={sub.validUntil} />
      </div>
      {quoteExpired && <p className="rounded-md bg-[#ffe9e9] px-3 py-2 text-danger">This quotation expired on {formatDate(sub.validUntil)}. Please contact us for a new one.</p>}

      <Section title="Details">
        <Fields
          items={[
            ["Billing", PERIOD_LABEL[plan.billingPeriod]],
            ["Payment terms", sub.paymentTerm.name],
            ["Started", formatDate(sub.startDate)],
            ["Ends", sub.endDate ? formatDate(sub.endDate) : "Renews automatically"],
            ["Next invoice", sub.isPaused ? "Paused" : formatDate(sub.nextInvoiceDate)],
            ["Quotation valid until", formatDate(sub.validUntil)],
          ]}
        />
      </Section>

      <section className="card overflow-hidden">
        <div className="border-b border-line px-4 py-2.5 font-medium">What you get</div>
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th className="text-right">Unit price</th>
              <th className="text-right">Amount incl. GST</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sub.lines.map((l) => (
              <tr key={l.id} className={l.isActive ? "" : "text-ink-3"}>
                <td>
                  {l.description}
                  {l.product.type === "ADDON" && <Chip className="ml-1.5" color={l.isActive ? "purple" : "gray"}>{l.isActive ? "On" : "Off"}</Chip>}
                </td>
                <td>{l.quantity}</td>
                <td className="text-right tabular-nums">{formatINR(l.unitPrice)}</td>
                <td className="text-right tabular-nums">{priced.get(l.id) ? formatINR(priced.get(l.id)!.total) : "—"}</td>
                <td className="text-right">{l.product.type === "ADDON" && sub.state !== "CLOSED" && op("toggle-line", l.isActive ? "Switch off" : "Switch on", "secondary", undefined, { lineId: l.id })}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end border-t border-line px-4 py-3 font-medium">
          Total per {PERIOD_UNIT[plan.billingPeriod]}: <span className="ml-2 tabular-nums">{formatINR(pricing.total)}</span>
          {pricing.discountTotal > 0 && <span className="ml-2 text-[#18794e]">(you save {formatINR(pricing.discountTotal)})</span>}
        </div>
      </section>

      <Section title="Invoices">
        {sub.invoices.length === 0 ? (
          <p className="text-ink-3">No invoices yet.</p>
        ) : (
          <table className="table">
            <tbody>
              {sub.invoices.map((i) => (
                <tr key={i.id}>
                  <td>
                    <Link href={`/portal/invoices/${i.id}`} className="hover:text-accent">
                      {i.number}
                    </Link>
                  </td>
                  <td className="text-ink-2">{formatDate(i.invoiceDate)}</td>
                  <td className="text-right tabular-nums">{formatINR(i.total)}</td>
                  <td>
                    <InvoiceStatus {...i} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </>
  );
}

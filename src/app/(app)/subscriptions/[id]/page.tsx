import Link from "next/link";
import { notFound } from "next/navigation";
import { IconCalendarRepeat } from "@tabler/icons-react";
import { InvoiceStatus, SubscriptionStatus, SubscriptionStepper } from "@/components/status";
import { Timeline } from "@/components/timeline";
import { ActionButton, ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Chip } from "@/components/ui/chip";
import { Field, FormGrid, Input, Select } from "@/components/ui/form";
import { Fields, PageBody, PageHeader, Section } from "@/components/ui/page";
import { priceSubscription } from "@/domain/billing";
import { subscriptionInclude } from "@/domain/subscriptions";
import { requireBackOffice } from "@/lib/auth";
import { formatDate, PERIOD_LABEL, PERIOD_UNIT, today } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatINR, formatRate } from "@/lib/money";
import { addLine, attachDiscount, billNow, detachDiscount, removeLine, transition, updateLineQuantity } from "../actions";

export default async function SubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireBackOffice();
  const { id } = await params;
  const sub = await db.subscription.findUnique({ where: { id }, include: { ...subscriptionInclude, invoices: { orderBy: { periodStart: "desc" }, take: 24 } } });
  if (!sub) notFound();

  const now = today();
  const [products, discounts] = await Promise.all([
    db.product.findMany({ where: { isActive: true, ...(sub.state === "DRAFT" ? {} : { type: "ADDON" }) }, include: { variants: { where: { isActive: true } } }, orderBy: { name: "asc" } }),
    db.discount.findMany({ where: { isActive: true, endDate: { gte: now }, id: { notIn: sub.discounts.map((d) => d.id) } }, orderBy: { name: "asc" } }),
  ]);

  const pricing = priceSubscription(sub, sub.nextInvoiceDate ?? now);
  const priced = new Map(pricing.lines.map((l) => [l.key, l]));
  const isDraft = sub.state === "DRAFT";
  const isClosed = sub.state === "CLOSED";
  const { plan } = sub;
  const act = (to: string, label: string, variant: "primary" | "secondary" | "danger" = "secondary", confirm?: string) => (
    <ActionButton action={transition} fields={{ id: sub.id, to }} variant={variant} confirm={confirm}>
      {label}
    </ActionButton>
  );

  return (
    <>
      <PageHeader
        icon={IconCalendarRepeat}
        crumbs={[{ label: "Subscriptions", href: "/subscriptions" }]}
        title={sub.number}
        actions={
          <>
            {sub.state === "DRAFT" && act("send", "Send quotation")}
            {(sub.state === "DRAFT" || sub.state === "QUOTATION") && act("confirm", "Confirm", "primary")}
            {sub.state === "QUOTATION" && act("draft", "Back to draft")}
            {sub.state === "CONFIRMED" && sub.startDate <= now && act("activate", "Activate", "primary")}
            {sub.state === "ACTIVE" && !sub.isPaused && plan.pausable && act("pause", "Pause")}
            {sub.isPaused && act("resume", "Resume", "primary")}
            {(sub.state === "ACTIVE" || sub.state === "CONFIRMED") && plan.renewable && sub.endDate && act("renew", "Renew")}
            {sub.state === "ACTIVE" && !sub.isPaused && (
              <ActionButton action={billNow} fields={{ id: sub.id }}>
                Bill due periods
              </ActionButton>
            )}
            {(sub.state === "CONFIRMED" || (sub.state === "ACTIVE" && plan.closable)) && act("close", "Close", "danger", "Close this subscription? No further invoices will be generated.")}
          </>
        }
      />
      <PageBody>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SubscriptionStepper state={sub.state} />
          <SubscriptionStatus state={sub.state} isPaused={sub.isPaused} validUntil={sub.validUntil} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <Section title="Details">
              <Fields
                items={[
                  ["Customer", <Link key="c" href={`/customers/${sub.customerId}`} className="text-accent">{sub.customer.company ?? sub.customer.name}</Link>],
                  ["Plan", <Link key="p" href={`/plans/${plan.id}`} className="text-accent">{plan.name}</Link>],
                  ["Billing", `${PERIOD_LABEL[plan.billingPeriod]} · min qty ${plan.minQuantity}`],
                  ["Payment terms", sub.paymentTerm.name],
                  ["Start date", formatDate(sub.startDate)],
                  ["Expiry date", sub.endDate ? formatDate(sub.endDate) : "Open-ended"],
                  ["Next invoice", sub.isPaused ? "Paused" : formatDate(sub.nextInvoiceDate)],
                  ["Quotation valid until", formatDate(sub.validUntil)],
                  ["Template", sub.template?.name ?? "—"],
                  ["Closed", sub.closedAt ? `${formatDate(sub.closedAt)} · ${sub.closeReason}` : "—"],
                ]}
              />
              <div className="mt-3 flex flex-wrap gap-1">
                {plan.autoClose && <Chip color="orange">Closes automatically at expiry</Chip>}
                {plan.closable && <Chip>Can close early</Chip>}
                {plan.pausable && <Chip>Can pause</Chip>}
                {plan.renewable && <Chip>Can renew</Chip>}
              </div>
            </Section>

            <section className="card overflow-hidden">
              <div className="border-b border-line px-4 py-2.5 font-medium">Order lines</div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th className="text-right">Unit price</th>
                      <th className="text-right">Discount</th>
                      <th>Taxes</th>
                      <th className="text-right">Amount</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {sub.lines.map((line) => {
                      const p = priced.get(line.id);
                      return (
                        <tr key={line.id} className={line.isActive ? "" : "text-ink-3"}>
                          <td>
                            {line.description}
                            {line.product.type === "ADDON" && <Chip className="ml-1.5" color={line.isActive ? "purple" : "gray"}>{line.isActive ? "Add-on on" : "Add-on off"}</Chip>}
                          </td>
                          <td>
                            {isDraft ? (
                              <ActionForm action={updateLineQuantity} className="flex items-center gap-1 space-y-0">
                                <input type="hidden" name="id" value={sub.id} />
                                <input type="hidden" name="lineId" value={line.id} />
                                <input name="quantity" type="number" min={1} defaultValue={line.quantity} className="input h-7 w-16" />
                                <SubmitButton variant="ghost" className="h-7 px-2">✓</SubmitButton>
                              </ActionForm>
                            ) : (
                              line.quantity
                            )}
                          </td>
                          <td className="text-right tabular-nums">{formatINR(line.unitPrice)}</td>
                          <td className="text-right tabular-nums">{p?.discountAmount ? `− ${formatINR(p.discountAmount)}` : "—"}</td>
                          <td className="text-ink-3">{line.taxes.map((t) => formatRate(t.rateBps)).join(" + ") || "—"}</td>
                          <td className="text-right tabular-nums">{p ? formatINR(p.total) : "—"}</td>
                          <td className="text-right">
                            {line.product.type === "ADDON" && !isClosed && (
                              <ActionButton action={transition} fields={{ id: sub.id, to: "toggle-line", lineId: line.id }} variant="ghost">
                                {line.isActive ? "Switch off" : "Switch on"}
                              </ActionButton>
                            )}
                            {isDraft && (
                              <ActionButton action={removeLine} fields={{ id: sub.id, lineId: line.id }} variant="ghost">
                                Remove
                              </ActionButton>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end border-t border-line px-4 py-3">
                <dl className="grid w-64 grid-cols-2 gap-y-1 text-right">
                  <dt className="text-ink-3">Untaxed</dt>
                  <dd className="tabular-nums">{formatINR(pricing.subtotal)}</dd>
                  <dt className="text-ink-3">Discount</dt>
                  <dd className="tabular-nums">− {formatINR(pricing.discountTotal)}</dd>
                  <dt className="text-ink-3">GST</dt>
                  <dd className="tabular-nums">{formatINR(pricing.taxTotal)}</dd>
                  <dt className="font-medium">Per {PERIOD_UNIT[plan.billingPeriod]}</dt>
                  <dd className="font-semibold tabular-nums">{formatINR(pricing.total)}</dd>
                </dl>
              </div>
              {!isClosed && (
                <div className="border-t border-line px-4 py-3">
                  <ActionForm action={addLine} resetOnSuccess>
                    <input type="hidden" name="id" value={sub.id} />
                    <FormGrid cols={4}>
                      <Field label={isDraft ? "Add product" : "Add an add-on"}>
                        <Select name="productId" placeholder="Choose" options={products.map((p) => ({ value: p.id, label: p.name }))} required />
                      </Field>
                      <Field label="Variant">
                        <Select name="variantId" placeholder="None" options={products.flatMap((p) => p.variants.map((v) => ({ value: v.id, label: `${p.name} · ${v.value} (+₹${v.priceExtra / 100})` })))} />
                      </Field>
                      <Field label="Quantity">
                        <Input name="quantity" type="number" min="1" defaultValue="1" required />
                      </Field>
                      <div className="flex items-end">
                        <SubmitButton variant="secondary">Add line</SubmitButton>
                      </div>
                    </FormGrid>
                  </ActionForm>
                </div>
              )}
            </section>

            <section className="card overflow-hidden">
              <div className="border-b border-line px-4 py-2.5 font-medium">Invoices</div>
              {sub.invoices.length === 0 ? (
                <p className="px-4 py-6 text-ink-3">No invoices yet. They are generated automatically on each billing date.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Number</th>
                      <th>Period</th>
                      <th>Due</th>
                      <th className="text-right">Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sub.invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <Link href={`/invoices/${inv.id}`} className="hover:text-accent">
                            {inv.number ?? "Draft"}
                          </Link>
                        </td>
                        <td className="text-ink-2">
                          {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
                        </td>
                        <td className="text-ink-2">{formatDate(inv.dueDate)}</td>
                        <td className="text-right tabular-nums">{formatINR(inv.total)}</td>
                        <td>
                          <InvoiceStatus {...inv} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>

          <div className="space-y-4">
            <Section title="Discounts">
              {sub.discounts.length === 0 && <p className="mb-3 text-ink-3">No discounts attached.</p>}
              <ul className="mb-3 space-y-2">
                {sub.discounts.map((d) => {
                  const applied = pricing.appliedDiscounts.find((a) => a.discountId === d.id);
                  const skipped = pricing.skippedDiscounts.find((s) => s.discountId === d.id);
                  return (
                    <li key={d.id} className="flex items-start justify-between gap-2">
                      <div>
                        <div>{d.name}</div>
                        <div className="text-xs text-ink-3">
                          {applied ? `− ${formatINR(applied.amount)} on next invoice` : `Not applied: ${skipped?.reason ?? "no matching lines"}`}
                          {d.usageLimit !== null && ` · ${d.usedCount}/${d.usageLimit} used`}
                        </div>
                      </div>
                      {!isClosed && (
                        <ActionButton action={detachDiscount} fields={{ id: sub.id, discountId: d.id }} variant="ghost">
                          Remove
                        </ActionButton>
                      )}
                    </li>
                  );
                })}
              </ul>
              {!isClosed && discounts.length > 0 && (
                <ActionForm action={attachDiscount}>
                  <input type="hidden" name="id" value={sub.id} />
                  <Select name="discountId" placeholder="Choose a discount rule" options={discounts.map((d) => ({ value: d.id, label: d.name }))} required />
                  <SubmitButton variant="secondary">Attach discount</SubmitButton>
                </ActionForm>
              )}
            </Section>
            {(sub.state === "ACTIVE" || sub.state === "CONFIRMED") && (plan.closable || sub.state === "CONFIRMED") && (
              <Section title="Close with a reason">
                <ActionForm action={transition}>
                  <input type="hidden" name="id" value={sub.id} />
                  <input type="hidden" name="to" value="close" />
                  <Input name="reason" placeholder="e.g. Customer moved to another product" required />
                  <SubmitButton variant="danger">Close subscription</SubmitButton>
                </ActionForm>
              </Section>
            )}
            <Section title="Activity">
              <Timeline entityType="subscription" entityId={sub.id} />
            </Section>
          </div>
        </div>
      </PageBody>
    </>
  );
}

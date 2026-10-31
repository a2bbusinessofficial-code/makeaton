import { IconCalendarRepeat } from "@tabler/icons-react";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Field, FormGrid, Input, Select, Textarea } from "@/components/ui/form";
import { PageBody, PageHeader, Section } from "@/components/ui/page";
import { requireBackOffice } from "@/lib/auth";
import { today, toISODate } from "@/lib/dates";
import { db } from "@/lib/db";
import { createSubscription } from "../actions";

export const metadata = { title: "New quotation" };

export default async function NewSubscriptionPage({ searchParams }: { searchParams: Promise<{ templateId?: string; customerId?: string }> }) {
  await requireBackOffice();
  const { templateId, customerId } = await searchParams;
  const now = today();
  const [templates, plans, terms, customers, preselected] = await Promise.all([
    db.quotationTemplate.findMany({ orderBy: { name: "asc" } }),
    db.plan.findMany({
      where: { isActive: true, AND: [{ OR: [{ availableFrom: null }, { availableFrom: { lte: now } }] }, { OR: [{ availableTo: null }, { availableTo: { gte: now } }] }] },
      orderBy: { name: "asc" },
    }),
    db.paymentTerm.findMany({ orderBy: { dueDays: "asc" } }),
    db.customer.findMany({ select: { email: true, name: true, company: true }, orderBy: { name: "asc" }, take: 5000 }),
    customerId ? db.customer.findUnique({ where: { id: customerId } }) : null,
  ]);
  const template = templates.find((t) => t.id === templateId);

  return (
    <>
      <PageHeader icon={IconCalendarRepeat} crumbs={[{ label: "Subscriptions", href: "/subscriptions" }]} title="New quotation" />
      <PageBody>
        <Section title="Quotation details" className="max-w-2xl">
          <ActionForm action={createSubscription}>
            <FormGrid>
              <Field label="Start from template" hint="Copies plan, product lines, payment terms and validity">
                <Select name="templateId" defaultValue={template?.id ?? ""} placeholder="No template" options={templates.map((t) => ({ value: t.id, label: t.name }))} />
              </Field>
              <Field label="Customer (email)">
                <Input name="customerEmail" list="customers" defaultValue={preselected?.email} placeholder="Start typing…" required autoComplete="off" />
                <datalist id="customers">
                  {customers.map((c) => (
                    <option key={c.email} value={c.email}>
                      {c.company ? `${c.name} · ${c.company}` : c.name}
                    </option>
                  ))}
                </datalist>
              </Field>
              <Field label="Plan" hint="Ignored when a template is chosen">
                <Select name="planId" defaultValue={template?.planId ?? plans[0]?.id} options={plans.map((p) => ({ value: p.id, label: p.name }))} required />
              </Field>
              <Field label="Payment terms">
                <Select name="paymentTermId" defaultValue={template?.paymentTermId ?? ""} placeholder="Template / default" options={terms.map((t) => ({ value: t.id, label: t.name }))} />
              </Field>
              <Field label="Start date">
                <Input name="startDate" type="date" defaultValue={toISODate(now)} required />
              </Field>
              <Field label="Expiry date" hint="Leave empty for an open-ended subscription">
                <Input name="endDate" type="date" />
              </Field>
              <Field label="…or contract length (periods)" hint="E.g. 12 for a one-year monthly contract">
                <Input name="terms" type="number" min="1" />
              </Field>
            </FormGrid>
            <Field label="Notes">
              <Textarea name="notes" rows={2} />
            </Field>
            <SubmitButton>Create draft</SubmitButton>
          </ActionForm>
        </Section>
      </PageBody>
    </>
  );
}

import { IconReceiptTax } from "@tabler/icons-react";
import { ActionButton, ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Chip } from "@/components/ui/chip";
import { Checkbox, Field, FormGrid, Input } from "@/components/ui/form";
import { PageBody, PageHeader, Section } from "@/components/ui/page";
import { requireBackOffice } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatRate } from "@/lib/money";
import { createPaymentTerm, createTax, toggleTax } from "./actions";

export const metadata = { title: "Taxes & payment terms" };

export default async function TaxesPage() {
  const user = await requireBackOffice();
  const isAdmin = user.role === "ADMIN";
  const [taxes, terms] = await Promise.all([db.tax.findMany({ orderBy: { rateBps: "asc" } }), db.paymentTerm.findMany({ orderBy: { dueDays: "asc" } })]);

  return (
    <>
      <PageHeader icon={IconReceiptTax} title="Taxes & payment terms" />
      <PageBody className="grid gap-4 lg:grid-cols-2 lg:space-y-0">
        <Section title="GST rates">
          <table className="table mb-4">
            <thead>
              <tr>
                <th>Name</th>
                <th>Rate</th>
                <th>Status</th>
                {isAdmin && <th />}
              </tr>
            </thead>
            <tbody>
              {taxes.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{formatRate(t.rateBps)}</td>
                  <td>{t.isActive ? <Chip color="green">Active</Chip> : <Chip>Archived</Chip>}</td>
                  {isAdmin && (
                    <td className="text-right">
                      <ActionButton action={toggleTax} fields={{ id: t.id }} variant="ghost">
                        {t.isActive ? "Archive" : "Restore"}
                      </ActionButton>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {isAdmin && (
            <ActionForm action={createTax} resetOnSuccess>
              <FormGrid>
                <Field label="Name">
                  <Input name="name" placeholder="GST 18%" required />
                </Field>
                <Field label="Rate (%)">
                  <Input name="rate" type="number" step="0.01" min="0" max="100" required />
                </Field>
              </FormGrid>
              <SubmitButton>Add tax</SubmitButton>
            </ActionForm>
          )}
        </Section>

        <Section title="Payment terms">
          <table className="table mb-4">
            <thead>
              <tr>
                <th>Name</th>
                <th>Due after</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {terms.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.dueDays === 0 ? "Immediately" : `${t.dueDays} days`}</td>
                  <td>{t.isDefault && <Chip color="blue">Default</Chip>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {isAdmin && (
            <ActionForm action={createPaymentTerm} resetOnSuccess>
              <FormGrid>
                <Field label="Name">
                  <Input name="name" placeholder="Net 15" required />
                </Field>
                <Field label="Due after (days)">
                  <Input name="dueDays" type="number" min="0" required />
                </Field>
              </FormGrid>
              <Checkbox name="isDefault" label="Use as default for new subscriptions" />
              <SubmitButton>Add payment term</SubmitButton>
            </ActionForm>
          )}
        </Section>
      </PageBody>
    </>
  );
}

import { notFound } from "next/navigation";
import { IconFileText } from "@tabler/icons-react";
import { ActionButton, ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Field, FormGrid, Input, Select } from "@/components/ui/form";
import { LinkButton } from "@/components/ui/button";
import { PageBody, PageHeader, Section } from "@/components/ui/page";
import { requireBackOffice } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { addTemplateLine, removeTemplateLine, updateTemplate } from "../actions";
import { TemplateForm } from "../template-form";

export default async function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireBackOffice();
  const isAdmin = user.role === "ADMIN";
  const [template, plans, terms, products] = await Promise.all([
    db.quotationTemplate.findUnique({ where: { id }, include: { lines: { include: { product: true, variant: true } }, plan: true } }),
    db.plan.findMany({ orderBy: { name: "asc" } }),
    db.paymentTerm.findMany({ orderBy: { dueDays: "asc" } }),
    db.product.findMany({ where: { isActive: true }, include: { variants: { where: { isActive: true } } }, orderBy: { name: "asc" } }),
  ]);
  if (!template) notFound();

  return (
    <>
      <PageHeader
        icon={IconFileText}
        crumbs={[{ label: "Quotation templates", href: "/templates" }]}
        title={template.name}
        actions={
          <LinkButton href={`/subscriptions/new?templateId=${template.id}`} variant="primary">
            New quotation from template
          </LinkButton>
        }
      />
      <PageBody className="grid gap-4 lg:grid-cols-2 lg:space-y-0">
        <Section title="Template">
          <TemplateForm action={updateTemplate} plans={plans} terms={terms} template={template} disabled={!isAdmin} />
        </Section>
        <Section title="Product lines">
          <table className="table mb-4">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th className="text-right">Unit price</th>
                {isAdmin && <th />}
              </tr>
            </thead>
            <tbody>
              {template.lines.map((l) => {
                const base = l.productId === template.plan.productId ? template.plan.price : l.product.salesPrice;
                return (
                  <tr key={l.id}>
                    <td>
                      {l.product.name}
                      {l.variant && <span className="text-ink-3"> · {l.variant.value}</span>}
                    </td>
                    <td>{l.quantity}</td>
                    <td className="text-right tabular-nums">{formatINR(base + (l.variant?.priceExtra ?? 0))}</td>
                    {isAdmin && (
                      <td className="text-right">
                        <ActionButton action={removeTemplateLine} fields={{ id: l.id, templateId: template.id }} variant="ghost">
                          Remove
                        </ActionButton>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {isAdmin && (
            <ActionForm action={addTemplateLine} resetOnSuccess>
              <input type="hidden" name="templateId" value={template.id} />
              <FormGrid cols={3}>
                <Field label="Product">
                  <Select name="productId" placeholder="Choose" options={products.map((p) => ({ value: p.id, label: p.name }))} required />
                </Field>
                <Field label="Variant">
                  <Select name="variantId" placeholder="None" options={products.flatMap((p) => p.variants.map((v) => ({ value: v.id, label: `${p.name} · ${v.value}` })))} />
                </Field>
                <Field label="Quantity">
                  <Input name="quantity" type="number" min="1" defaultValue="1" required />
                </Field>
              </FormGrid>
              <SubmitButton variant="secondary">Add line</SubmitButton>
            </ActionForm>
          )}
        </Section>
      </PageBody>
    </>
  );
}

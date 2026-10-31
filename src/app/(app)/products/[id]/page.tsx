import Link from "next/link";
import { notFound } from "next/navigation";
import { IconBox } from "@tabler/icons-react";
import { ActionButton, ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Chip } from "@/components/ui/chip";
import { Field, FormGrid, Input } from "@/components/ui/form";
import { PageBody, PageHeader, Section } from "@/components/ui/page";
import { PERIOD_LABEL } from "@/lib/dates";
import { requireBackOffice } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { addVariant, toggleProduct, toggleVariant, updateProduct } from "../actions";
import { ProductForm } from "../product-form";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireBackOffice();
  const isAdmin = user.role === "ADMIN";
  const [product, taxes] = await Promise.all([
    db.product.findUnique({ where: { id }, include: { taxes: true, variants: { orderBy: [{ attribute: "asc" }, { value: "asc" }] }, plans: { orderBy: { price: "asc" } } } }),
    db.tax.findMany({ orderBy: { rateBps: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <PageHeader
        icon={IconBox}
        crumbs={[{ label: "Products", href: "/products" }]}
        title={product.name}
        actions={
          isAdmin && (
            <ActionButton action={toggleProduct} fields={{ id: product.id }} variant={product.isActive ? "danger" : "secondary"}>
              {product.isActive ? "Archive" : "Restore"}
            </ActionButton>
          )
        }
      />
      <PageBody className="grid gap-4 lg:grid-cols-[1fr_380px] lg:space-y-0">
        <Section title="Details">
          <ProductForm action={updateProduct} taxes={taxes} product={product} disabled={!isAdmin} />
        </Section>
        <div className="space-y-4">
          <Section title="Variants">
            <p className="mb-3 text-xs text-ink-3">Each variant adds its extra price to the unit price, e.g. Brand: Odoo +₹560.</p>
            {product.variants.length > 0 && (
              <table className="table mb-4">
                <tbody>
                  {product.variants.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <span className="text-ink-3">{v.attribute}:</span> {v.value}
                      </td>
                      <td className="text-right tabular-nums">+{formatINR(v.priceExtra)}</td>
                      <td className="text-right">
                        {isAdmin ? (
                          <ActionButton action={toggleVariant} fields={{ id: v.id, productId: product.id }} variant="ghost">
                            {v.isActive ? "Archive" : "Restore"}
                          </ActionButton>
                        ) : (
                          !v.isActive && <Chip>Archived</Chip>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {isAdmin && (
              <ActionForm action={addVariant} resetOnSuccess>
                <input type="hidden" name="productId" value={product.id} />
                <FormGrid cols={3}>
                  <Field label="Attribute">
                    <Input name="attribute" placeholder="Brand" required />
                  </Field>
                  <Field label="Value">
                    <Input name="value" placeholder="Odoo" required />
                  </Field>
                  <Field label="Extra (₹)">
                    <Input name="priceExtra" type="number" step="0.01" min="0" placeholder="560" required />
                  </Field>
                </FormGrid>
                <SubmitButton variant="secondary">Add variant</SubmitButton>
              </ActionForm>
            )}
          </Section>
          <Section title="Plans">
            {product.plans.length === 0 ? (
              <p className="text-ink-3">No plans yet.</p>
            ) : (
              <ul className="space-y-1">
                {product.plans.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <Link href={`/plans/${p.id}`} className="hover:text-accent">
                      {p.name}
                    </Link>
                    <span className="text-ink-3">
                      {formatINR(p.price)} / {PERIOD_LABEL[p.billingPeriod].toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {isAdmin && (
              <Link href={`/plans?productId=${product.id}`} className="mt-3 inline-block text-accent">
                + New plan for this product
              </Link>
            )}
          </Section>
        </div>
      </PageBody>
    </>
  );
}

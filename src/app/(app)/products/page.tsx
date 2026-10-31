import Link from "next/link";
import { IconBox } from "@tabler/icons-react";
import { Chip } from "@/components/ui/chip";
import { PageBody, PageHeader, Section } from "@/components/ui/page";
import { requireBackOffice } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { createProduct } from "./actions";
import { PRODUCT_TYPES, ProductForm } from "./product-form";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const user = await requireBackOffice();
  const [products, taxes] = await Promise.all([
    db.product.findMany({ include: { _count: { select: { variants: true, plans: true } } }, orderBy: [{ isActive: "desc" }, { name: "asc" }] }),
    db.tax.findMany({ orderBy: { rateBps: "asc" } }),
  ]);

  return (
    <>
      <PageHeader icon={IconBox} title="Products" />
      <PageBody>
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th className="text-right">Sales price</th>
                <th className="text-right">Cost price</th>
                <th>Variants</th>
                <th>Plans</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/products/${p.id}`} className="font-medium hover:text-accent">
                      {p.name}
                    </Link>
                  </td>
                  <td>{PRODUCT_TYPES.find((t) => t.value === p.type)?.label.split(" (")[0]}</td>
                  <td className="text-right tabular-nums">{formatINR(p.salesPrice)}</td>
                  <td className="text-right text-ink-3 tabular-nums">{formatINR(p.costPrice)}</td>
                  <td>{p._count.variants}</td>
                  <td>{p._count.plans}</td>
                  <td className="space-x-1">
                    {p.isActive ? <Chip color="green">Active</Chip> : <Chip>Archived</Chip>}
                    {p.salesPrice < p.costPrice && <Chip color="red">Below cost</Chip>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {user.role === "ADMIN" && (
          <Section title="New product" className="max-w-2xl">
            <ProductForm action={createProduct} taxes={taxes} />
          </Section>
        )}
      </PageBody>
    </>
  );
}

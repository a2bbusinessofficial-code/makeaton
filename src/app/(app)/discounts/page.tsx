import Link from "next/link";
import { IconDiscount } from "@tabler/icons-react";
import { PageBody, PageHeader, Section } from "@/components/ui/page";
import { requireBackOffice } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatINR, formatRate } from "@/lib/money";
import { createDiscount } from "./actions";
import { DiscountForm } from "./discount-form";
import { DiscountStatus } from "./status";

export const metadata = { title: "Discounts" };

export default async function DiscountsPage() {
  const user = await requireBackOffice();
  const [discounts, products] = await Promise.all([
    db.discount.findMany({ include: { products: { select: { id: true, name: true } } }, orderBy: [{ isActive: "desc" }, { endDate: "desc" }] }),
    db.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader icon={IconDiscount} title="Discounts" />
      <PageBody>
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
                <th>Applies to</th>
                <th>Conditions</th>
                <th>Valid</th>
                <th>Used</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d) => (
                <tr key={d.id}>
                  <td>
                    <Link href={`/discounts/${d.id}`} className="font-medium hover:text-accent">
                      {d.name}
                    </Link>
                  </td>
                  <td>{d.type === "PERCENTAGE" ? formatRate(d.value) : formatINR(d.value)}</td>
                  <td className="max-w-48 truncate">{d.scope === "SUBSCRIPTION" ? "Whole subscription" : d.products.map((p) => p.name).join(", ")}</td>
                  <td className="text-ink-3">
                    {[d.minPurchase != null && `≥ ${formatINR(d.minPurchase)}`, d.minQuantity != null && `≥ ${d.minQuantity} qty`].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="text-ink-3">
                    {formatDate(d.startDate)} → {formatDate(d.endDate)}
                  </td>
                  <td>
                    {d.usedCount}
                    {d.usageLimit !== null && ` / ${d.usageLimit}`}
                  </td>
                  <td>
                    <DiscountStatus discount={d} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {user.role === "ADMIN" ? (
          <Section title="New discount rule" className="max-w-2xl">
            <DiscountForm action={createDiscount} products={products} />
          </Section>
        ) : (
          <p className="text-ink-3">Only admins can create discount rules. You can attach active discounts to a subscription from its page.</p>
        )}
      </PageBody>
    </>
  );
}

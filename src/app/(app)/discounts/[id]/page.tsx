import { notFound } from "next/navigation";
import { IconDiscount } from "@tabler/icons-react";
import { ActionButton } from "@/components/ui/action-form";
import { PageBody, PageHeader, Section } from "@/components/ui/page";
import { requireBackOffice } from "@/lib/auth";
import { db } from "@/lib/db";
import { toggleDiscount, updateDiscount } from "../actions";
import { DiscountForm } from "../discount-form";
import { DiscountStatus } from "../status";

export default async function DiscountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireBackOffice();
  const [discount, products] = await Promise.all([db.discount.findUnique({ where: { id }, include: { products: { select: { id: true } } } }), db.product.findMany({ orderBy: { name: "asc" } })]);
  if (!discount) notFound();
  const isAdmin = user.role === "ADMIN";

  return (
    <>
      <PageHeader
        icon={IconDiscount}
        crumbs={[{ label: "Discounts", href: "/discounts" }]}
        title={discount.name}
        actions={
          <>
            <DiscountStatus discount={discount} />
            {isAdmin && (
              <ActionButton action={toggleDiscount} fields={{ id: discount.id }} variant={discount.isActive ? "danger" : "secondary"}>
                {discount.isActive ? "Archive" : "Restore"}
              </ActionButton>
            )}
          </>
        }
      />
      <PageBody>
        <Section title={`Used on ${discount.usedCount} invoice(s)`} className="max-w-2xl">
          <DiscountForm action={updateDiscount} products={products} discount={discount} disabled={!isAdmin} />
        </Section>
      </PageBody>
    </>
  );
}

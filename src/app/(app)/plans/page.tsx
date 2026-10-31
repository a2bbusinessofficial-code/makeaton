import Link from "next/link";
import { IconCalendarRepeat } from "@tabler/icons-react";
import { Chip } from "@/components/ui/chip";
import { PageBody, PageHeader, Section } from "@/components/ui/page";
import { requireBackOffice } from "@/lib/auth";
import { formatDate, PERIOD_LABEL } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { createPlan } from "./actions";
import { PlanForm } from "./plan-form";

export const metadata = { title: "Plans" };

export default async function PlansPage({ searchParams }: { searchParams: Promise<{ productId?: string }> }) {
  const { productId } = await searchParams;
  const user = await requireBackOffice();
  const [plans, products] = await Promise.all([
    db.plan.findMany({ include: { product: true, _count: { select: { subscriptions: { where: { state: "ACTIVE" } } } } }, orderBy: [{ isActive: "desc" }, { name: "asc" }] }),
    db.product.findMany({ where: { isActive: true, type: { not: "ADDON" } }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader icon={IconCalendarRepeat} title="Plans" />
      <PageBody>
        <div className="card overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Product</th>
                <th className="text-right">Price</th>
                <th>Billing</th>
                <th>Min qty</th>
                <th>Available</th>
                <th>Options</th>
                <th className="text-right">Active subs</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className={p.isActive ? "" : "opacity-50"}>
                  <td>
                    <Link href={`/plans/${p.id}`} className="font-medium hover:text-accent">
                      {p.name}
                    </Link>
                  </td>
                  <td>{p.product.name}</td>
                  <td className="text-right tabular-nums">{formatINR(p.price)}</td>
                  <td>{PERIOD_LABEL[p.billingPeriod]}</td>
                  <td>{p.minQuantity}</td>
                  <td className="text-ink-3">{p.availableFrom || p.availableTo ? `${formatDate(p.availableFrom)} → ${formatDate(p.availableTo)}` : "Always"}</td>
                  <td className="space-x-1">
                    {p.autoClose && <Chip color="orange">Auto-close</Chip>}
                    {p.pausable && <Chip>Pause</Chip>}
                    {p.renewable && <Chip>Renew</Chip>}
                    {p.closable && <Chip>Close</Chip>}
                  </td>
                  <td className="text-right">{p._count.subscriptions.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {user.role === "ADMIN" && (
          <Section title="New plan" className="max-w-2xl">
            <PlanForm action={createPlan} products={products} defaultProductId={productId} />
          </Section>
        )}
      </PageBody>
    </>
  );
}

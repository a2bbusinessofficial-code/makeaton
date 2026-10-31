import { notFound } from "next/navigation";
import { IconCalendarRepeat } from "@tabler/icons-react";
import { ActionButton } from "@/components/ui/action-form";
import { PageBody, PageHeader, Section } from "@/components/ui/page";
import { requireBackOffice } from "@/lib/auth";
import { db } from "@/lib/db";
import { togglePlan, updatePlan } from "../actions";
import { PlanForm } from "../plan-form";

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireBackOffice();
  const [plan, products] = await Promise.all([db.plan.findUnique({ where: { id } }), db.product.findMany({ where: { type: { not: "ADDON" } }, orderBy: { name: "asc" } })]);
  if (!plan) notFound();
  const isAdmin = user.role === "ADMIN";

  return (
    <>
      <PageHeader
        icon={IconCalendarRepeat}
        crumbs={[{ label: "Plans", href: "/plans" }]}
        title={plan.name}
        actions={
          isAdmin && (
            <ActionButton action={togglePlan} fields={{ id: plan.id }} variant={plan.isActive ? "danger" : "secondary"}>
              {plan.isActive ? "Archive" : "Restore"}
            </ActionButton>
          )
        }
      />
      <PageBody>
        <Section title="Plan settings" className="max-w-2xl">
          <PlanForm action={updatePlan} products={products} plan={plan} disabled={!isAdmin} />
        </Section>
      </PageBody>
    </>
  );
}

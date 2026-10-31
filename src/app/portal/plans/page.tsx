import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Field, Input, Select } from "@/components/ui/form";
import { requireRole } from "@/lib/auth";
import { PERIOD_UNIT, today } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { subscribeToPlan } from "../actions";

export const metadata = { title: "Plans" };

export default async function PortalPlansPage() {
  await requireRole("CUSTOMER");
  const now = today();
  const plans = await db.plan.findMany({
    where: { isActive: true, AND: [{ OR: [{ availableFrom: null }, { availableFrom: { lte: now } }] }, { OR: [{ availableTo: null }, { availableTo: { gte: now } }] }] },
    include: { product: { include: { variants: { where: { isActive: true } } } } },
    orderBy: [{ product: { name: "asc" } }, { price: "asc" }],
  });

  return (
    <>
      <div>
        <h1 className="text-lg font-semibold">Plans</h1>
        <p className="text-ink-3">Prices exclude 18% GST. Start today, cancel or pause anytime if your plan allows it.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="card flex flex-col p-4">
            <div className="text-xs text-ink-3">{plan.product.name}</div>
            <div className="font-semibold">{plan.name}</div>
            <div className="my-2 text-xl font-semibold">
              {formatINR(plan.price)}
              <span className="text-ui font-normal text-ink-3"> / {PERIOD_UNIT[plan.billingPeriod]} per seat</span>
            </div>
            <ul className="mb-3 space-y-0.5 text-xs text-ink-2">
              <li>Minimum {plan.minQuantity} seat(s)</li>
              {plan.pausable && <li>Pause anytime</li>}
              {plan.closable && <li>Cancel anytime</li>}
              {plan.autoClose && <li>Ends automatically at term end</li>}
            </ul>
            <ActionForm action={subscribeToPlan} className="mt-auto">
              <input type="hidden" name="planId" value={plan.id} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Seats">
                  <Input name="quantity" type="number" min={plan.minQuantity} defaultValue={plan.minQuantity} required />
                </Field>
                {plan.product.variants.length > 0 && (
                  <Field label="Variant">
                    <Select name="variantId" placeholder="Standard" options={plan.product.variants.map((v) => ({ value: v.id, label: `${v.value} (+${formatINR(v.priceExtra)})` }))} />
                  </Field>
                )}
              </div>
              <SubmitButton className="w-full" pendingLabel="Subscribing…">
                Subscribe
              </SubmitButton>
            </ActionForm>
          </div>
        ))}
      </div>
    </>
  );
}

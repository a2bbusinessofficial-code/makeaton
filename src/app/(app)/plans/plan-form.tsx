import type { Plan, Product } from "@prisma/client";
import { ActionForm, SubmitButton, type FormAction } from "@/components/ui/action-form";
import { Checkbox, Field, FormGrid, Input, Select } from "@/components/ui/form";
import { PERIOD_LABEL, toISODate } from "@/lib/dates";
import { paiseToRupees } from "@/lib/money";

export function PlanForm({ action, products, plan, defaultProductId, disabled }: { action: FormAction; products: Product[]; plan?: Plan; defaultProductId?: string; disabled?: boolean }) {
  return (
    <ActionForm action={action}>
      {plan && <input type="hidden" name="id" value={plan.id} />}
      <fieldset disabled={disabled} className="space-y-3">
        <FormGrid>
          <Field label="Plan name">
            <Input name="name" defaultValue={plan?.name} placeholder="CRM Monthly" required />
          </Field>
          <Field label="Product">
            <Select name="productId" defaultValue={plan?.productId ?? defaultProductId} placeholder="Choose a product" options={products.map((p) => ({ value: p.id, label: p.name }))} required />
          </Field>
          <Field label="Price per period (₹)" hint="Unit price, before GST">
            <Input name="price" type="number" step="0.01" min="0" defaultValue={plan ? paiseToRupees(plan.price) : ""} required />
          </Field>
          <Field label="Billing period">
            <Select name="billingPeriod" defaultValue={plan?.billingPeriod ?? "MONTHLY"} options={Object.entries(PERIOD_LABEL).map(([value, label]) => ({ value, label }))} />
          </Field>
          <Field label="Minimum quantity">
            <Input name="minQuantity" type="number" min="1" defaultValue={plan?.minQuantity ?? 1} required />
          </Field>
          <div />
          <Field label="Available from" hint="Leave empty for no limit">
            <Input name="availableFrom" type="date" defaultValue={plan?.availableFrom ? toISODate(plan.availableFrom) : ""} />
          </Field>
          <Field label="Available until">
            <Input name="availableTo" type="date" defaultValue={plan?.availableTo ? toISODate(plan.availableTo) : ""} />
          </Field>
        </FormGrid>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Checkbox name="autoClose" defaultChecked={plan?.autoClose ?? false} label="Close automatically at expiry" hint="Subscriptions close on their own when they end" />
          <Checkbox name="closable" defaultChecked={plan?.closable ?? true} label="Can be closed early" />
          <Checkbox name="pausable" defaultChecked={plan?.pausable ?? true} label="Can be paused" hint="No invoices while paused" />
          <Checkbox name="renewable" defaultChecked={plan?.renewable ?? true} label="Can be renewed" />
        </div>
        {!disabled && <SubmitButton>{plan ? "Save plan" : "Create plan"}</SubmitButton>}
      </fieldset>
    </ActionForm>
  );
}

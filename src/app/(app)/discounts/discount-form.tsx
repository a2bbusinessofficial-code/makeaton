import type { Discount, Product } from "@prisma/client";
import { ActionForm, SubmitButton, type FormAction } from "@/components/ui/action-form";
import { Checkbox, Field, FormGrid, Input, Select } from "@/components/ui/form";
import { toISODate, today, addDays } from "@/lib/dates";
import { paiseToRupees } from "@/lib/money";

export function DiscountForm({ action, products, discount, disabled }: { action: FormAction; products: Product[]; discount?: Discount & { products: { id: string }[] }; disabled?: boolean }) {
  const selected = new Set(discount?.products.map((p) => p.id));
  const value = discount ? (discount.type === "PERCENTAGE" ? String(discount.value / 100) : paiseToRupees(discount.value)) : "";
  return (
    <ActionForm action={action} resetOnSuccess={!discount}>
      {discount && <input type="hidden" name="id" value={discount.id} />}
      <fieldset disabled={disabled} className="space-y-3">
        <FormGrid>
          <Field label="Name">
            <Input name="name" defaultValue={discount?.name} placeholder="10% off for 10+ seats" required />
          </Field>
          <Field label="Applies to">
            <Select name="scope" defaultValue={discount?.scope ?? "SUBSCRIPTION"} options={[{ value: "SUBSCRIPTION", label: "Whole subscription" }, { value: "PRODUCTS", label: "Specific products" }]} />
          </Field>
          <Field label="Type">
            <Select name="type" defaultValue={discount?.type ?? "PERCENTAGE"} options={[{ value: "PERCENTAGE", label: "Percentage (%)" }, { value: "FIXED", label: "Fixed amount (₹)" }]} />
          </Field>
          <Field label="Value" hint="Percent or rupees, depending on type">
            <Input name="value" type="number" step="0.01" min="0" defaultValue={value} required />
          </Field>
          <Field label="Minimum purchase (₹)" hint="Optional">
            <Input name="minPurchase" type="number" step="0.01" min="0" defaultValue={discount?.minPurchase != null ? paiseToRupees(discount.minPurchase) : ""} />
          </Field>
          <Field label="Minimum quantity" hint="Optional">
            <Input name="minQuantity" type="number" min="1" defaultValue={discount?.minQuantity ?? ""} />
          </Field>
          <Field label="Start date">
            <Input name="startDate" type="date" defaultValue={toISODate(discount?.startDate ?? today())} required />
          </Field>
          <Field label="End date">
            <Input name="endDate" type="date" defaultValue={toISODate(discount?.endDate ?? addDays(today(), 90))} required />
          </Field>
          <Field label="Usage limit" hint="Number of invoices it can be applied to. Empty = unlimited">
            <Input name="usageLimit" type="number" min="1" defaultValue={discount?.usageLimit ?? ""} />
          </Field>
        </FormGrid>
        <div>
          <span className="label">Products (for product discounts)</span>
          <div className="grid gap-x-4 sm:grid-cols-2">
            {products.map((p) => (
              <Checkbox key={p.id} name="productIds" value={p.id} defaultChecked={selected.has(p.id)} label={p.name} />
            ))}
          </div>
        </div>
        {!disabled && <SubmitButton>{discount ? "Save discount" : "Create discount"}</SubmitButton>}
      </fieldset>
    </ActionForm>
  );
}

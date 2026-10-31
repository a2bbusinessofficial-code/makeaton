import type { Product, Tax } from "@prisma/client";
import { ActionForm, SubmitButton, type FormAction } from "@/components/ui/action-form";
import { Checkbox, Field, FormGrid, Input, Select, Textarea } from "@/components/ui/form";
import { formatRate, paiseToRupees } from "@/lib/money";

export const PRODUCT_TYPES = [
  { value: "SERVICE", label: "Service (software)" },
  { value: "ADDON", label: "Add-on (can be switched on/off)" },
  { value: "GOODS", label: "Goods" },
];

export function ProductForm({ action, taxes, product, disabled }: { action: FormAction; taxes: Tax[]; product?: Product & { taxes: Tax[] }; disabled?: boolean }) {
  const selected = new Set(product?.taxes.map((t) => t.id) ?? taxes.filter((t) => t.rateBps === 1800).map((t) => t.id));
  return (
    <ActionForm action={action}>
      {product && <input type="hidden" name="id" value={product.id} />}
      <fieldset disabled={disabled} className="space-y-3">
        <FormGrid>
          <Field label="Name">
            <Input name="name" defaultValue={product?.name} required />
          </Field>
          <Field label="Type">
            <Select name="type" defaultValue={product?.type ?? "SERVICE"} options={PRODUCT_TYPES} />
          </Field>
          <Field label="Sales price (₹)">
            <Input name="salesPrice" type="number" step="0.01" min="0" defaultValue={product ? paiseToRupees(product.salesPrice) : ""} required />
          </Field>
          <Field label="Cost price (₹)">
            <Input name="costPrice" type="number" step="0.01" min="0" defaultValue={product ? paiseToRupees(product.costPrice) : "0"} required />
          </Field>
        </FormGrid>
        <div>
          <span className="label">Taxes applied by default</span>
          <div className="flex flex-wrap gap-x-4">
            {taxes.filter((t) => t.isActive).map((t) => (
              <Checkbox key={t.id} name="taxIds" value={t.id} defaultChecked={selected.has(t.id)} label={`${t.name} (${formatRate(t.rateBps)})`} />
            ))}
          </div>
        </div>
        <Field label="Notes">
          <Textarea name="notes" defaultValue={product?.notes ?? ""} rows={3} />
        </Field>
        {!disabled && <SubmitButton>{product ? "Save product" : "Create product"}</SubmitButton>}
      </fieldset>
    </ActionForm>
  );
}

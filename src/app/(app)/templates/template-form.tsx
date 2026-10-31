import type { PaymentTerm, Plan, QuotationTemplate } from "@prisma/client";
import { ActionForm, SubmitButton, type FormAction } from "@/components/ui/action-form";
import { Field, FormGrid, Input, Select, Textarea } from "@/components/ui/form";

export function TemplateForm({ action, plans, terms, template, disabled }: { action: FormAction; plans: Plan[]; terms: PaymentTerm[]; template?: QuotationTemplate; disabled?: boolean }) {
  return (
    <ActionForm action={action}>
      {template && <input type="hidden" name="id" value={template.id} />}
      <fieldset disabled={disabled} className="space-y-3">
        <FormGrid>
          <Field label="Template name">
            <Input name="name" defaultValue={template?.name} placeholder="Enterprise yearly offer" required />
          </Field>
          <Field label="Plan">
            <Select name="planId" defaultValue={template?.planId} placeholder="Choose a plan" options={plans.map((p) => ({ value: p.id, label: p.name }))} required />
          </Field>
          <Field label="Quotation valid for (days)">
            <Input name="validityDays" type="number" min="1" defaultValue={template?.validityDays ?? 30} required />
          </Field>
          <Field label="Payment terms">
            <Select name="paymentTermId" defaultValue={template?.paymentTermId ?? terms.find((t) => t.isDefault)?.id} placeholder="Default" options={terms.map((t) => ({ value: t.id, label: t.name }))} />
          </Field>
        </FormGrid>
        <Field label="Notes">
          <Textarea name="notes" defaultValue={template?.notes ?? ""} rows={2} />
        </Field>
        {!disabled && <SubmitButton>{template ? "Save template" : "Create template"}</SubmitButton>}
      </fieldset>
    </ActionForm>
  );
}

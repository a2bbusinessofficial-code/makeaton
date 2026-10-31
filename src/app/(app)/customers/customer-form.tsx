import type { Customer } from "@prisma/client";
import { ActionForm, SubmitButton, type FormAction } from "@/components/ui/action-form";
import { Field, FormGrid, Input, Textarea } from "@/components/ui/form";

export function CustomerForm({ action, customer }: { action: FormAction; customer?: Customer }) {
  return (
    <ActionForm action={action}>
      {customer && <input type="hidden" name="id" value={customer.id} />}
      <FormGrid>
        <Field label="Contact name">
          <Input name="name" defaultValue={customer?.name} required />
        </Field>
        <Field label="Email" hint={customer?.profileId ? "Linked to a portal login — the customer changes it themselves" : undefined}>
          <Input name="email" type="email" defaultValue={customer?.email} required readOnly={Boolean(customer?.profileId)} />
        </Field>
        <Field label="Company">
          <Input name="company" defaultValue={customer?.company ?? ""} />
        </Field>
        <Field label="Phone">
          <Input name="phone" defaultValue={customer?.phone ?? ""} />
        </Field>
        <Field label="State" hint="Same state as Brightloop → CGST + SGST, otherwise IGST">
          <Input name="state" defaultValue={customer?.state ?? ""} placeholder="Gujarat" />
        </Field>
        <Field label="GSTIN">
          <Input name="gstin" defaultValue={customer?.gstin ?? ""} placeholder="24ABCDE1234F1Z5" />
        </Field>
      </FormGrid>
      <Field label="Billing address">
        <Textarea name="address" defaultValue={customer?.address ?? ""} rows={2} />
      </Field>
      <SubmitButton>{customer ? "Save customer" : "Create customer"}</SubmitButton>
    </ActionForm>
  );
}

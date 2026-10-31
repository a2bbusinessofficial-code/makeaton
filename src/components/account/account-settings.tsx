import { PasswordInput } from "@/components/auth/password-input";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Field, Input } from "@/components/ui/form";
import { Section } from "@/components/ui/page";
import type { CurrentUser } from "@/lib/auth";
import { changeEmail, changePassword, updateName } from "./actions";

export function AccountSettings({ user }: { user: CurrentUser }) {
  return (
    <div className="grid max-w-4xl gap-4 lg:grid-cols-2">
      <Section title="Profile">
        <ActionForm action={updateName}>
          <Field label="Full name">
            <Input name="fullName" defaultValue={user.fullName} required />
          </Field>
          <SubmitButton>Save</SubmitButton>
        </ActionForm>
      </Section>
      <Section title="Email address">
        <ActionForm action={changeEmail}>
          <p className="text-ink-3">Current: {user.email}</p>
          <Field label="New email">
            <Input name="email" type="email" required />
          </Field>
          <SubmitButton>Send confirmation link</SubmitButton>
        </ActionForm>
      </Section>
      <Section title="Change password" className="lg:col-span-2">
        <ActionForm action={changePassword} resetOnSuccess className="max-w-sm">
          <Field label="Current password">
            <Input name="currentPassword" type="password" required autoComplete="current-password" />
          </Field>
          <PasswordInput label="New password" />
          <Field label="Confirm new password">
            <Input name="confirmPassword" type="password" required autoComplete="new-password" />
          </Field>
          <SubmitButton>Change password</SubmitButton>
        </ActionForm>
      </Section>
    </div>
  );
}

import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Field, Input } from "@/components/ui/form";
import { PasswordInput } from "@/components/auth/password-input";
import { requireUser } from "@/lib/auth";
import { resetPasswordAction } from "../actions";

export const metadata = { title: "Set a new password" };

export default async function ResetPasswordPage() {
  const user = await requireUser();
  return (
    <>
      <h1 className="mb-1 text-base font-semibold">Set a new password</h1>
      <p className="mb-5 text-ink-3">For {user.email}</p>
      <ActionForm action={resetPasswordAction}>
        <PasswordInput label="New password" />
        <Field label="Confirm new password">
          <Input name="confirmPassword" type="password" required autoComplete="new-password" />
        </Field>
        <SubmitButton className="w-full">Update password</SubmitButton>
      </ActionForm>
    </>
  );
}

import { z } from "zod";

/**
 * Password policy from the brief: MORE than eight characters (so at least 9), with an
 * uppercase letter, a lowercase letter and a special character.
 */
export const PASSWORD_RULES = [
  { id: "length", label: "More than 8 characters", test: (p: string) => p.length > 8 },
  { id: "upper", label: "An uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower", label: "A lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "special", label: "A special character", test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
] as const;

export const passwordSchema = z.string().superRefine((value, ctx) => {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(value)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Password needs: ${rule.label.toLowerCase()}` });
  }
});

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

export const newPasswordSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your name").max(80),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

/** Converts FormData into a plain object for zod parsing. */
export function formToObject(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === "string") out[key] = value;
  });
  return out;
}

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}

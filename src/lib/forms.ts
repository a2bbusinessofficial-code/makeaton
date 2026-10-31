import { z } from "zod";
import { parseDate } from "@/lib/dates";
import { rupeesToPaise } from "@/lib/money";

/** Zod building blocks for parsing HTML form fields (always strings) into domain values. */
export const f = {
  text: (label: string, max = 200) => z.string().trim().min(1, `${label} is required`).max(max),
  optionalText: (max = 2000) =>
    z
      .string()
      .trim()
      .max(max)
      .optional()
      .transform((v) => v || null),
  id: (label: string) => z.string().min(1, `Choose a ${label}`),
  optionalId: () =>
    z
      .string()
      .optional()
      .transform((v) => v || null),
  rupees: (label: string) =>
    z
      .string()
      .transform(rupeesToPaise)
      .refine((n) => Number.isFinite(n) && n >= 0, `${label} must be a valid amount of zero or more`),
  optionalRupees: (label: string) =>
    z
      .string()
      .optional()
      .transform((v) => (v ? rupeesToPaise(v) : null))
      .refine((n) => n === null || (Number.isFinite(n) && n >= 0), `${label} must be a valid amount`),
  int: (label: string, min = 0) => z.coerce.number({ invalid_type_error: `${label} must be a number` }).int(`${label} must be a whole number`).min(min, `${label} must be at least ${min}`),
  optionalInt: (label: string, min = 0) =>
    z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : null))
      .refine((n) => n === null || (Number.isInteger(n) && n >= min), `${label} must be a whole number of at least ${min}`),
  percentBps: (label: string) =>
    z.coerce
      .number({ invalid_type_error: `${label} must be a number` })
      .min(0)
      .max(100, `${label} cannot exceed 100%`)
      .transform((n) => Math.round(n * 100)),
  date: (label: string) =>
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} is required`)
      .transform(parseDate),
  optionalDate: () =>
    z
      .string()
      .optional()
      .transform((v) => (v ? parseDate(v) : null)),
  checkbox: () =>
    z
      .string()
      .optional()
      .transform((v) => v === "on" || v === "true"),
};

export function formValues(form: FormData) {
  const out: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === "string" && !key.startsWith("$ACTION")) out[key] = value;
  });
  return out;
}

export function formList(form: FormData, key: string): string[] {
  return form.getAll(key).filter((v): v is string => typeof v === "string" && v.length > 0);
}

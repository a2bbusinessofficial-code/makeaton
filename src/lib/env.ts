import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  ADMIN_EMAILS: z.string().default(""),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_SECURE: z.string().default("true").transform((v) => v === "true"),
  SMTP_USER: z.string().default(""),
  SMTP_PASSWORD: z.string().default(""),
  MAIL_FROM: z.string().default("Brightloop Billing <no-reply@brightloop.app>"),
  CRON_SECRET: z.string().default(""),
  COMPANY_STATE: z.string().default("Gujarat"),
});

let cached: z.infer<typeof serverSchema> | undefined;

/** Validated server-side environment. Throws a readable error on misconfiguration. */
export function env() {
  if (!cached) {
    const parsed = serverSchema.safeParse(process.env);
    if (!parsed.success) {
      const missing = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
      throw new Error(`Invalid environment configuration: ${missing}`);
    }
    cached = parsed.data;
  }
  return cached;
}

export function adminEmails(): string[] {
  return env()
    .ADMIN_EMAILS.split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

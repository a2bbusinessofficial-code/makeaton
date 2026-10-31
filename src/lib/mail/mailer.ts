import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (!transporter) {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD } = env();
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASSWORD } : undefined,
    });
  }
  return transporter;
}

export type MailResult = { ok: true; skipped?: boolean } | { ok: false; error: string };

/** RFC 2606 reserved domains used by demo/seed data — never actually emailed. */
const RESERVED = /@(?:[^@]+\.)?(example\.(com|org|net)|[^@]+\.(test|example|invalid|localhost))$/i;

/**
 * Sends an email. Never throws: a mail outage must not roll back a confirmed invoice or a
 * password change, so callers get a result they can surface to the user instead.
 */
export async function sendMail(message: { to: string; subject: string; html: string }): Promise<MailResult> {
  if (RESERVED.test(message.to)) return { ok: true, skipped: true };
  try {
    await getTransporter().sendMail({ from: env().MAIL_FROM, ...message });
    return { ok: true };
  } catch (error) {
    console.error("[mail] failed to send", message.subject, error);
    return { ok: false, error: error instanceof Error ? error.message : "Unknown mail error" };
  }
}

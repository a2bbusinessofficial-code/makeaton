import type { PaymentMethod, Prisma, SubscriptionState } from "@prisma/client";
import { parseDate, today } from "@/lib/dates";

/**
 * List filters shared by the list pages and their CSV exports, so an export always
 * contains exactly what the user is looking at. Params come straight from the URL.
 */
export type ListParams = Record<string, string | undefined>;

const SUBSCRIPTION_STATES: SubscriptionState[] = ["DRAFT", "QUOTATION", "CONFIRMED", "ACTIVE", "CLOSED"];
const PAYMENT_METHODS: PaymentMethod[] = ["CASH", "BANK_TRANSFER", "UPI", "CARD", "CHEQUE"];

const isoDate = (v: string | undefined) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? parseDate(v) : undefined);
const dateRange = (p: ListParams) => (isoDate(p.from) || isoDate(p.to) ? { gte: isoDate(p.from), lte: isoDate(p.to) } : undefined);

export function invoiceWhere(p: ListParams): Prisma.InvoiceWhereInput {
  const q = p.q?.trim();
  const status: Record<string, Prisma.InvoiceWhereInput> = {
    outstanding: { state: "CONFIRMED" },
    overdue: { state: "CONFIRMED", dueDate: { lt: today() } },
    paid: { state: "PAID" },
    draft: { state: "DRAFT" },
    cancelled: { state: "CANCELLED" },
  };
  return {
    ...(p.status ? status[p.status] : {}),
    invoiceDate: dateRange(p),
    ...(q && { OR: [{ number: { contains: q, mode: "insensitive" } }, { customerName: { contains: q, mode: "insensitive" } }] }),
  };
}

export function subscriptionWhere(p: ListParams): Prisma.SubscriptionWhereInput {
  const q = p.q?.trim();
  return {
    state: SUBSCRIPTION_STATES.includes(p.state as SubscriptionState) ? (p.state as SubscriptionState) : undefined,
    planId: p.planId || undefined,
    ...(q && {
      OR: [
        { number: { contains: q, mode: "insensitive" } },
        { customer: { name: { contains: q, mode: "insensitive" } } },
        { customer: { company: { contains: q, mode: "insensitive" } } },
      ],
    }),
  };
}

export function paymentWhere(p: ListParams): Prisma.PaymentWhereInput {
  return {
    method: PAYMENT_METHODS.includes(p.method as PaymentMethod) ? (p.method as PaymentMethod) : undefined,
    paymentDate: dateRange(p),
  };
}

export function customerWhere(p: ListParams): Prisma.CustomerWhereInput {
  const q = p.q?.trim();
  return q
    ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { company: { contains: q, mode: "insensitive" } }] }
    : {};
}

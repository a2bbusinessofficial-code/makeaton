import type { InvoiceState, SubscriptionState } from "@prisma/client";
import { Chip, type ChipColor } from "@/components/ui/chip";
import { today } from "@/lib/dates";

const SUBSCRIPTION: Record<SubscriptionState, [string, ChipColor]> = {
  DRAFT: ["Draft", "gray"],
  QUOTATION: ["Quotation", "blue"],
  CONFIRMED: ["Confirmed", "purple"],
  ACTIVE: ["Active", "green"],
  CLOSED: ["Closed", "gray"],
};

export const SUBSCRIPTION_STATES = Object.keys(SUBSCRIPTION) as SubscriptionState[];
export const subscriptionStateLabel = (s: SubscriptionState) => SUBSCRIPTION[s][0];

export function SubscriptionStatus({ state, isPaused, validUntil }: { state: SubscriptionState; isPaused?: boolean; validUntil?: Date | null }) {
  const [label, color] = SUBSCRIPTION[state];
  return (
    <span className="inline-flex gap-1">
      <Chip color={color}>{label}</Chip>
      {isPaused && state === "ACTIVE" && <Chip color="yellow">Paused</Chip>}
      {state === "QUOTATION" && validUntil && validUntil < today() && <Chip color="red">Expired</Chip>}
    </span>
  );
}

export function InvoiceStatus({ state, dueDate, amountPaid, total }: { state: InvoiceState; dueDate: Date; amountPaid: number; total: number }) {
  if (state === "PAID") return <Chip color="green">Paid</Chip>;
  if (state === "CANCELLED") return <Chip color="gray">Cancelled</Chip>;
  if (state === "DRAFT") return <Chip color="gray">Draft</Chip>;
  const overdue = dueDate < today();
  return (
    <span className="inline-flex gap-1">
      <Chip color={overdue ? "red" : "blue"}>{overdue ? "Overdue" : "Confirmed"}</Chip>
      {amountPaid > 0 && amountPaid < total && <Chip color="orange">Partly paid</Chip>}
    </span>
  );
}

/** The five-step progress bar from the brief: Draft → Quotation → Confirmed → Active → Closed. */
export function SubscriptionStepper({ state }: { state: SubscriptionState }) {
  const current = SUBSCRIPTION_STATES.indexOf(state);
  return (
    <ol className="flex flex-wrap items-center gap-1 text-xs">
      {SUBSCRIPTION_STATES.map((s, i) => (
        <li key={s} className="flex items-center gap-1">
          <span
            className={
              i === current
                ? "rounded bg-accent px-2 py-1 font-medium text-white"
                : i < current
                  ? "rounded bg-accent-soft px-2 py-1 text-accent"
                  : "rounded bg-app px-2 py-1 text-ink-3"
            }
          >
            {SUBSCRIPTION[s][0]}
          </span>
          {i < SUBSCRIPTION_STATES.length - 1 && <span className="text-ink-3">›</span>}
        </li>
      ))}
    </ol>
  );
}

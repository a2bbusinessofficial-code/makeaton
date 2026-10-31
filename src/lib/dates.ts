import type { BillingPeriod } from "@prisma/client";

/**
 * Dates are business dates (no time component). They are represented as JS Dates at
 * 00:00 UTC, which is exactly how Postgres `date` columns round-trip through Prisma.
 */

const BUSINESS_TZ = "Asia/Kolkata";

/** Today's date in India, as a UTC-midnight Date. */
export function today(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: BUSINESS_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return parseDate(parts);
}

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

export function diffDays(later: Date, earlier: Date): number {
  return Math.round((later.getTime() - earlier.getTime()) / 86_400_000);
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/**
 * Adds `count` billing periods to `start`. Monthly and yearly periods keep the original
 * day of month as an anchor and clamp to the month's length, so a subscription that starts
 * on 31 Jan bills on 28/29 Feb and then on 31 Mar again (no drift).
 */
export function addPeriods(start: Date, period: BillingPeriod, count: number, anchorDay = start.getUTCDate()): Date {
  switch (period) {
    case "DAILY":
      return addDays(start, count);
    case "WEEKLY":
      return addDays(start, 7 * count);
    case "MONTHLY":
    case "YEARLY": {
      const months = period === "MONTHLY" ? count : count * 12;
      const total = start.getUTCMonth() + months;
      const year = start.getUTCFullYear() + Math.floor(total / 12);
      const month = ((total % 12) + 12) % 12;
      return new Date(Date.UTC(year, month, Math.min(anchorDay, daysInMonth(year, month))));
    }
  }
}

/** Monthly-equivalent multiplier, used for MRR. */
export function monthlyFactor(period: BillingPeriod): number {
  switch (period) {
    case "DAILY":
      return 30;
    case "WEEKLY":
      return 52 / 12;
    case "MONTHLY":
      return 1;
    case "YEARLY":
      return 1 / 12;
  }
}

const display = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

export function formatDate(date: Date | null | undefined): string {
  return date ? display.format(date) : "—";
}

export const PERIOD_LABEL: Record<BillingPeriod, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export const PERIOD_UNIT: Record<BillingPeriod, string> = {
  DAILY: "day",
  WEEKLY: "week",
  MONTHLY: "month",
  YEARLY: "year",
};

import { describe, expect, it } from "vitest";
import { addPeriods, parseDate, toISODate } from "./dates";

const iso = (d: Date) => toISODate(d);

describe("addPeriods", () => {
  it("keeps the anchor day across short months", () => {
    const start = parseDate("2026-01-31");
    expect(iso(addPeriods(start, "MONTHLY", 1))).toBe("2026-02-28");
    expect(iso(addPeriods(start, "MONTHLY", 2))).toBe("2026-03-31");
    expect(iso(addPeriods(parseDate("2027-12-31"), "MONTHLY", 2))).toBe("2028-02-29");
  });

  it("handles yearly, weekly and daily periods", () => {
    expect(iso(addPeriods(parseDate("2028-02-29"), "YEARLY", 1))).toBe("2029-02-28");
    expect(iso(addPeriods(parseDate("2026-12-28"), "WEEKLY", 1))).toBe("2027-01-04");
    expect(iso(addPeriods(parseDate("2026-12-31"), "DAILY", 1))).toBe("2027-01-01");
  });
});

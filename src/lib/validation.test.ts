import { describe, expect, it } from "vitest";
import { emailSchema, passwordSchema } from "./validation";

describe("passwordSchema", () => {
  it("rejects exactly eight characters (the brief says MORE than eight)", () => {
    expect(passwordSchema.safeParse("Abcdef!1").success).toBe(false);
  });
  it("accepts nine characters with upper, lower and special", () => {
    expect(passwordSchema.safeParse("Abcdefg!1").success).toBe(true);
  });
  it.each([
    ["abcdefgh!", "uppercase"],
    ["ABCDEFGH!", "lowercase"],
    ["Abcdefghi", "special"],
  ])("rejects %s (missing %s)", (pw, missing) => {
    const r = passwordSchema.safeParse(pw);
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.message).join()).toContain(missing);
  });
});

describe("emailSchema", () => {
  it("normalises case and whitespace so one email = one account", () => {
    expect(emailSchema.parse("  Owner@Shop.IN ")).toBe("owner@shop.in");
  });
});

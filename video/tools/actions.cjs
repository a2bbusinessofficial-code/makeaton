// Capture the "action" moments (writes to the LOCAL database only).
const { chromium } = require("playwright");
const fs = require("fs");
const BASE = process.argv[2] || "http://localhost:3000";
const OUT = (process.argv[3] || "./shots") + "/actions";
fs.mkdirSync(OUT, { recursive: true });
const PW = "Brightloop@2026";
let n = 0;
const snap = async (page, name) => { n++; const f = `${OUT}/${String(n).padStart(2, "0")}-${name}.png`; await page.waitForLoadState("networkidle"); await page.waitForTimeout(400); await page.screenshot({ path: f }); console.log(f.split("/").pop(), page.url().replace(BASE, "")); };
const click = async (page, text) => { await page.getByRole("button", { name: text, exact: true }).first().click(); await page.waitForLoadState("networkidle"); await page.waitForTimeout(800); };

async function login(browser, email) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  page.on("dialog", (d) => d.accept());
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PW);
  await Promise.all([page.waitForURL((u) => !u.pathname.startsWith("/login")), page.click('button[type="submit"]')]);
  await page.waitForLoadState("networkidle");
  return { ctx, page };
}

(async () => {
  const browser = await chromium.launch();

  // 1. Sign-up live password checklist
  { const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } }); const page = await ctx.newPage();
    await page.goto(BASE + "/signup", { waitUntil: "networkidle" });
    await page.fill('input[name="fullName"], input[name="name"]', "Priya Sharma").catch(() => {});
    await page.fill('input[name="email"]', "priya@shopkart.in");
    await page.locator('input[name="password"]').pressSequentially("brightloop", { delay: 10 }); await snap(page, "signup-weak");
    await page.fill('input[name="password"]', ""); await page.locator('input[name="password"]').pressSequentially("Brightloop@2026", { delay: 10 }); await snap(page, "signup-strong");
    await page.fill('input[name="email"]', "ADMIN@example.com");
    await page.fill('input[name="confirmPassword"], input[name="confirm"]', "Brightloop@2026").catch(() => {});
    await page.locator('button[type="submit"]').click(); await page.waitForTimeout(1500); await snap(page, "signup-duplicate-email");
    await ctx.close(); }

  // 2. Staff: quote from template -> lifecycle
  { const { ctx, page } = await login(browser, "staff@example.com");
    await snap(page, "staff-dashboard-no-team-menu");
    await page.goto(BASE + "/subscriptions/new", { waitUntil: "networkidle" });
    await page.selectOption('select[name="templateId"]', { label: "SMB CRM — Monthly" });
    await page.fill('input[name="customerEmail"]', "arjun.desai.2@example.com"); await snap(page, "staff-new-from-template");
    await click(page, "Create draft"); await snap(page, "staff-sub-draft");
    await click(page, "Send quotation"); await snap(page, "staff-sub-quotation");
    await click(page, "Confirm"); await snap(page, "staff-sub-confirmed");
    await snap(page, "staff-sub-active");
    await page.mouse.wheel(0, 900); await page.waitForTimeout(400); await snap(page, "staff-sub-active-scrolled");
    await page.goto(BASE + "/users", { waitUntil: "networkidle" }); await snap(page, "staff-blocked-from-team");
    await ctx.close(); }

  // 3. Admin: billing run twice, record payment, team page
  { const { ctx, page } = await login(browser, "admin@example.com");
    await page.goto(BASE + "/billing", { waitUntil: "networkidle" }); await snap(page, "billing-preview");
    await page.check('input[name="autoConfirm"]'); await click(page, "Run billing"); await snap(page, "billing-run-1");
    await page.check('input[name="autoConfirm"]').catch(() => {}); await click(page, "Run billing"); await snap(page, "billing-run-2-nothing-twice");
    await page.mouse.wheel(0, 1200); await page.waitForTimeout(400); await snap(page, "billing-history");
    await page.goto(BASE + "/invoices/f82f026b-2d85-4bfb-ada3-ddbb4b80c9a4", { waitUntil: "networkidle" });
    await page.fill('input[name="note"]', "UTR 998877665"); await snap(page, "invoice-record-payment");
    await click(page, "Record payment"); await snap(page, "invoice-paid");
    await page.goto(BASE + "/users", { waitUntil: "networkidle" }); await snap(page, "admin-team-invite");
    await page.goto(BASE + "/invoices?status=overdue", { waitUntil: "networkidle" }); await snap(page, "invoices-overdue");
    await page.goto(BASE + "/dashboard", { waitUntil: "networkidle" }); await snap(page, "dashboard-after");
    await ctx.close(); }

  // 4. Customer: pause / resume, add-on toggle, 404 on other's invoice
  { const { ctx, page } = await login(browser, "customer@example.com");
    const sub = BASE + "/portal/subscriptions/93a245df-55b5-4450-9ec6-c66604682d7c";
    await page.goto(sub, { waitUntil: "networkidle" }); await snap(page, "portal-sub");
    await click(page, "Pause"); await snap(page, "portal-sub-paused");
    await click(page, "Resume"); await click(page, "Switch off"); await snap(page, "portal-addon-off");
    await click(page, "Switch on").catch(() => {});
    await page.goto(BASE + "/portal/invoices/f82f026b-2d85-4bfb-ada3-ddbb4b80c9a4", { waitUntil: "networkidle" }); await snap(page, "portal-other-customer-404");
    await ctx.close(); }

  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });

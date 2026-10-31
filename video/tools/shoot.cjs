// Screenshot every page for each role. Usage: node shoot.cjs <baseUrl> <outDir>
const { chromium } = require("playwright");
const fs = require("fs");
const BASE = process.argv[2] || "http://localhost:3000";
const OUT = process.argv[3] || "./shots";
const PW = "Brightloop@2026";

const ID = {
  crm: "cmvw9qh7900087di5hpb4xq9i",
  plan: "cmvw9qh85000z7di55o3l5a7z",
  tmpl: "cmvw9qh8e00157di5p4m6bvz9",
  disc: "cmvw9qh8800117di5a6ikq7xf",
  cust: "d1154c7c-fea4-4df1-8bd7-fafd13f4d486",
  sub: "10969acc-63ad-476b-87b0-d6bd9d0fb7c5",
  quote: "79e76bfd-8cb4-46e0-aaf9-0196f3c0533d",
  inv: "f82f026b-2d85-4bfb-ada3-ddbb4b80c9a4",
  mySub: "93a245df-55b5-4450-9ec6-c66604682d7c",
  myInv: "d0fcc226-cb90-4ec0-b8c6-c2713431234e",
};

const PUBLIC = [["00-landing", "/"], ["01-login", "/login"], ["02-signup", "/signup"], ["03-forgot", "/forgot-password"]];
const BACK = [
  ["dashboard", "/dashboard"], ["action-center", "/action-center"], ["subscriptions", "/subscriptions"],
  ["subscription-detail", `/subscriptions/${ID.sub}`], ["quotation-detail", `/subscriptions/${ID.quote}`],
  ["subscription-new", "/subscriptions/new"], ["invoices", "/invoices"], ["invoices-overdue", "/invoices?status=overdue"],
  ["invoice-detail", `/invoices/${ID.inv}`], ["invoice-print", `/print/invoices/${ID.inv}`], ["payments", "/payments"],
  ["customers", "/customers"], ["customer-detail", `/customers/${ID.cust}`], ["billing", "/billing"],
  ["products", "/products"], ["product-detail", `/products/${ID.crm}`], ["plans", "/plans"], ["plan-detail", `/plans/${ID.plan}`],
  ["templates", "/templates"], ["template-detail", `/templates/${ID.tmpl}`], ["discounts", "/discounts"],
  ["discount-detail", `/discounts/${ID.disc}`], ["taxes", "/taxes"], ["users", "/users"], ["account", "/account"],
];
const PORTAL = [
  ["portal", "/portal"], ["portal-subscription", `/portal/subscriptions/${ID.mySub}`], ["portal-invoice", `/portal/invoices/${ID.myInv}`],
  ["portal-plans", "/portal/plans"], ["portal-account", "/portal/account"], ["portal-other-invoice-404", `/portal/invoices/${ID.inv}`],
];

async function shoot(page, dir, name, path) {
  const t0 = Date.now();
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  const ms = Date.now() - t0;
  await page.screenshot({ path: `${dir}/${name}.png` });
  await page.screenshot({ path: `${dir}/full/${name}.png`, fullPage: true });
  console.log(`${dir.split("/").pop()}/${name}  ${ms}ms  -> ${page.url().replace(BASE, "")}`);
}

(async () => {
  const browser = await chromium.launch();
  const mk = async (role) => {
    const dir = `${OUT}/${role}`; fs.mkdirSync(`${dir}/full`, { recursive: true });
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    return { ctx, page: await ctx.newPage(), dir };
  };
  { const { ctx, page, dir } = await mk("public"); for (const [n, p] of PUBLIC) await shoot(page, dir, n, p); await ctx.close(); }
  for (const [role, email, list] of [["admin", "admin@example.com", BACK], ["staff", "staff@example.com", BACK], ["customer", "customer@example.com", PORTAL]]) {
    const { ctx, page, dir } = await mk(role);
    await page.goto(BASE + "/login", { waitUntil: "networkidle" });
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', PW);
    await Promise.all([page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 30000 }), page.click('button[type="submit"]')]);
    for (const [n, p] of list) await shoot(page, dir, n, p);
    await ctx.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });

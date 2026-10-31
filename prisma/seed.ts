/**
 * Seeds Brightloop's catalog and a realistic book of business:
 * ~1,500 customers, ~3,000 subscriptions and 12 months of invoices and payments, with
 * ~120 subscriptions due on "billing day" so the billing run can be demonstrated.
 *
 * Idempotent: it does nothing if products already exist (set SEED_FORCE=true to wipe first).
 * Demo logins are created in Supabase Auth when SUPABASE_SERVICE_ROLE_KEY is available.
 *
 *   npm run db:seed
 */
import { randomUUID } from "node:crypto";
import { PrismaClient, type Prisma, type BillingPeriod, type InvoiceState, type PaymentMethod, type SubscriptionState } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { addDays, addPeriods, parseDate, today } from "../src/lib/dates";
import { priceLines, type PricingDiscount } from "../src/domain/pricing";

const db = new PrismaClient();
const SUBSCRIPTIONS = Number(process.env.SEED_SUBSCRIPTIONS ?? 3000);
const CUSTOMERS = Math.round(SUBSCRIPTIONS / 2);
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? "Brightloop@2026";
const NOW = today();

// Deterministic randomness so every environment gets the same demo data.
let seed = 20261031;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T,>(items: readonly T[]) => items[Math.floor(rand() * items.length)];
const between = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
const chance = (p: number) => rand() < p;

const FIRST = ["Aarav", "Vivaan", "Aditya", "Ishaan", "Kabir", "Ananya", "Diya", "Saanvi", "Meera", "Priya", "Rohan", "Karan", "Neha", "Pooja", "Rahul", "Sneha", "Arjun", "Kavya", "Nikhil", "Riya", "Harsh", "Jinal", "Hetal", "Parth", "Dhruv"];
const LAST = ["Shah", "Patel", "Mehta", "Desai", "Joshi", "Iyer", "Reddy", "Nair", "Sharma", "Gupta", "Verma", "Kapoor", "Rao", "Kulkarni", "Trivedi", "Pandya", "Bhatt", "Chauhan"];
const BIZ = ["Textiles", "Traders", "Foods", "Pharma", "Logistics", "Electricals", "Exports", "Retail", "Ceramics", "Diamonds", "Agro", "Infotech", "Motors", "Packaging", "Clinic", "Studio"];
const CITY = ["Surat", "Ahmedabad", "Rajkot", "Vadodara", "Mumbai", "Pune", "Bengaluru", "Delhi", "Jaipur", "Indore", "Chennai", "Hyderabad"];
const STATE_OF: Record<string, string> = { Surat: "Gujarat", Ahmedabad: "Gujarat", Rajkot: "Gujarat", Vadodara: "Gujarat", Mumbai: "Maharashtra", Pune: "Maharashtra", Bengaluru: "Karnataka", Delhi: "Delhi", Jaipur: "Rajasthan", Indore: "Madhya Pradesh", Chennai: "Tamil Nadu", Hyderabad: "Telangana" };
const METHODS: PaymentMethod[] = ["BANK_TRANSFER", "BANK_TRANSFER", "UPI", "UPI", "UPI", "CARD", "CHEQUE", "CASH"];

async function chunked<T>(rows: T[], size: number, insert: (chunk: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += size) await insert(rows.slice(i, i + size));
}

async function wipe() {
  console.log("Wiping existing business data…");
  await db.$executeRawUnsafe(`TRUNCATE "Payment","DiscountUsage","InvoiceLine","Invoice","_SubscriptionLineToTax","SubscriptionLine","_DiscountToSubscription","Subscription","QuotationTemplateLine","QuotationTemplate","_DiscountToProduct","Discount","Plan","ProductVariant","_ProductToTax","Product","Tax","PaymentTerm","Customer","BillingRun","Activity","Sequence","ReminderLog" CASCADE`);
}

async function seedCatalog() {
  const [gst18, gst12, gst5] = await Promise.all([
    db.tax.create({ data: { name: "GST 18%", rateBps: 1800 } }),
    db.tax.create({ data: { name: "GST 12%", rateBps: 1200 } }),
    db.tax.create({ data: { name: "GST 5%", rateBps: 500 } }),
  ]);
  await db.tax.create({ data: { name: "GST Exempt", rateBps: 0 } });
  void gst12;
  void gst5;

  const terms = {
    immediate: await db.paymentTerm.create({ data: { name: "Immediate", dueDays: 0 } }),
    net15: await db.paymentTerm.create({ data: { name: "Net 15", dueDays: 15, isDefault: true } }),
    net30: await db.paymentTerm.create({ data: { name: "Net 30", dueDays: 30 } }),
    net45: await db.paymentTerm.create({ data: { name: "Net 45", dueDays: 45 } }),
  };

  const product = (name: string, type: "SERVICE" | "ADDON", salesPrice: number, costPrice: number, notes: string) =>
    db.product.create({ data: { name, type, salesPrice, costPrice, notes, taxes: { connect: { id: gst18.id } } } });

  const crm = await product("Brightloop CRM", "SERVICE", 99_900, 18_000, "Pipeline, contacts and quotations for growing sales teams.");
  const books = await product("Brightloop Books", "SERVICE", 149_900, 30_000, "GST-ready accounting, e-invoicing and bank reconciliation.");
  const hr = await product("Brightloop HR", "SERVICE", 79_900, 15_000, "Attendance, leaves and payroll.");
  const storage = await product("Extra storage (100 GB)", "ADDON", 29_900, 5_000, "Add-on: additional document storage.");
  const support = await product("Priority support", "ADDON", 199_900, 60_000, "Add-on: 4-hour response SLA and a named account manager.");
  const whatsapp = await product("WhatsApp integration", "ADDON", 49_900, 10_000, "Add-on: send quotes and invoices on WhatsApp.");

  const odoo = await db.productVariant.create({ data: { productId: crm.id, attribute: "Brand", value: "Odoo", priceExtra: 56_000 } });
  await db.productVariant.create({ data: { productId: crm.id, attribute: "Brand", value: "Standard", priceExtra: 0 } });
  await db.productVariant.create({ data: { productId: books.id, attribute: "Edition", value: "Multi-GSTIN", priceExtra: 50_000 } });

  const plan = (data: { name: string; productId: string; price: number; billingPeriod: BillingPeriod; minQuantity?: number; autoClose?: boolean; closable?: boolean; pausable?: boolean; renewable?: boolean; availableFrom?: Date; availableTo?: Date }) =>
    db.plan.create({ data });

  const plans = {
    crmMonthly: await plan({ name: "CRM Monthly", productId: crm.id, price: 99_900, billingPeriod: "MONTHLY" }),
    crmYearly: await plan({ name: "CRM Yearly", productId: crm.id, price: 999_000, billingPeriod: "YEARLY", minQuantity: 5 }),
    booksMonthly: await plan({ name: "Books Monthly", productId: books.id, price: 149_900, billingPeriod: "MONTHLY" }),
    booksYearly: await plan({ name: "Books Enterprise Yearly", productId: books.id, price: 1_499_000, billingPeriod: "YEARLY", minQuantity: 3, autoClose: true, closable: false }),
    hrWeekly: await plan({ name: "HR Weekly", productId: hr.id, price: 19_900, billingPeriod: "WEEKLY", minQuantity: 2 }),
    hrMonthly: await plan({ name: "HR Monthly", productId: hr.id, price: 79_900, billingPeriod: "MONTHLY" }),
    crmDaily: await plan({ name: "CRM Day Pass", productId: crm.id, price: 4_900, billingPeriod: "DAILY", autoClose: true, pausable: false, renewable: false }),
    diwali: await plan({ name: "Diwali Books Offer (Monthly)", productId: books.id, price: 119_900, billingPeriod: "MONTHLY", availableFrom: parseDate("2026-10-01"), availableTo: parseDate("2026-11-30") }),
  };

  const volume = await db.discount.create({ data: { name: "Volume 10% (10+ seats)", type: "PERCENTAGE", value: 1000, scope: "SUBSCRIPTION", minQuantity: 10, startDate: parseDate("2026-01-01"), endDate: parseDate("2026-12-31") } });
  await db.discount.create({ data: { name: "Diwali ₹500 off", type: "FIXED", value: 50_000, scope: "SUBSCRIPTION", minPurchase: 200_000, usageLimit: 200, startDate: parseDate("2026-10-15"), endDate: parseDate("2026-11-15") } });
  await db.discount.create({ data: { name: "Storage add-on 50% off", type: "PERCENTAGE", value: 5000, scope: "PRODUCTS", usageLimit: 3, startDate: parseDate("2026-06-01"), endDate: parseDate("2026-12-31"), products: { connect: { id: storage.id } } } });
  await db.discount.create({ data: { name: "Launch offer (expired)", type: "PERCENTAGE", value: 1500, scope: "SUBSCRIPTION", startDate: parseDate("2026-01-01"), endDate: parseDate("2026-03-31") } });

  await db.quotationTemplate.create({
    data: { name: "SMB CRM — Monthly", planId: plans.crmMonthly.id, validityDays: 15, paymentTermId: terms.net15.id, notes: "Includes onboarding call.", lines: { create: [{ productId: crm.id, quantity: 3 }, { productId: storage.id, quantity: 1 }] } },
  });
  await db.quotationTemplate.create({
    data: { name: "Enterprise Books — Yearly", planId: plans.booksYearly.id, validityDays: 30, paymentTermId: terms.net30.id, notes: "Annual contract, billed yearly in advance.", lines: { create: [{ productId: books.id, quantity: 10 }, { productId: support.id, quantity: 1 }] } },
  });
  await db.quotationTemplate.create({
    data: { name: "CRM Odoo edition — Yearly", planId: plans.crmYearly.id, validityDays: 30, paymentTermId: terms.net30.id, lines: { create: [{ productId: crm.id, variantId: odoo.id, quantity: 5 }, { productId: whatsapp.id, quantity: 1 }] } },
  });

  return { gst18, terms, crm, books, hr, storage, support, whatsapp, odoo, plans, volume };
}

type Catalog = Awaited<ReturnType<typeof seedCatalog>>;

async function seedBook(c: Catalog) {
  // ── Customers ──────────────────────────────────────────────
  const customers = Array.from({ length: CUSTOMERS }, (_, i) => {
    const first = pick(FIRST);
    const last = pick(LAST);
    const city = pick(CITY);
    const company = `${last} ${pick(BIZ)}`;
    return {
      id: randomUUID(),
      name: `${first} ${last}`,
      company: chance(0.85) ? company : null,
      email: `${first}.${last}.${i + 1}@example.com`.toLowerCase(),
      phone: `+91 9${between(100000000, 999999999)}`,
      address: `${between(1, 400)}, ${pick(["MG Road", "Ring Road", "Station Road", "CG Road", "SG Highway"])}, ${city}`,
      state: STATE_OF[city],
      gstin: chance(0.6) ? `24${String.fromCharCode(...Array.from({ length: 5 }, () => 65 + between(0, 25)))}${between(1000, 9999)}${String.fromCharCode(65 + between(0, 25))}1Z${between(1, 9)}` : null,
    };
  });
  await chunked(customers, 1000, (rows) => db.customer.createMany({ data: rows }));

  // ── Subscriptions, lines and invoice history ───────────────
  const planMix = [
    [c.plans.crmMonthly, 30],
    [c.plans.booksMonthly, 22],
    [c.plans.hrMonthly, 12],
    [c.plans.crmYearly, 12],
    [c.plans.booksYearly, 8],
    [c.plans.hrWeekly, 8],
    [c.plans.diwali, 5],
    [c.plans.crmDaily, 3],
  ] as const;
  const weighted = planMix.flatMap(([plan, w]) => Array(w).fill(plan));
  const addons = [c.storage, c.support, c.whatsapp];
  const termFor = (period: BillingPeriod) => (period === "YEARLY" ? c.terms.net30 : period === "DAILY" ? c.terms.immediate : c.terms.net15);

  const subs: Prisma.SubscriptionCreateManyInput[] = [];
  const lines: { id: string; subscriptionId: string; productId: string; variantId: string | null; description: string; quantity: number; unitPrice: number; isActive: boolean }[] = [];
  const invoices: Record<string, unknown>[] = [];
  const invoiceLines: Record<string, unknown>[] = [];
  const payments: Record<string, unknown>[] = [];
  const usages: { id: string; discountId: string; invoiceId: string; amount: number }[] = [];
  const discountLinks: [string, string][] = [];
  const activities: Record<string, unknown>[] = [];
  const subNumberByYear = new Map<number, number>();
  let dueForBillingDay = 0;

  const volumeDiscount: PricingDiscount = { ...c.volume, productIds: [] };

  for (let i = 0; i < SUBSCRIPTIONS; i++) {
    const plan = pick(weighted);
    const customer = customers[i % customers.length];
    const roll = rand();
    let state: SubscriptionState = roll < 0.76 ? "ACTIVE" : roll < 0.84 ? "CLOSED" : roll < 0.89 ? "CONFIRMED" : roll < 0.95 ? "QUOTATION" : "DRAFT";
    if (plan.id === c.plans.diwali.id && state === "CLOSED") state = "ACTIVE";

    const historyDays = plan.billingPeriod === "DAILY" ? 20 : plan.billingPeriod === "WEEKLY" ? 150 : plan.billingPeriod === "YEARLY" ? 700 : 365;
    let startDate = addDays(NOW, -between(1, historyDays));
    if (plan.id === c.plans.diwali.id) startDate = addDays(parseDate("2026-10-01"), between(0, Math.max(0, Math.round((NOW.getTime() - parseDate("2026-10-01").getTime()) / 86_400_000))));
    if (state === "CONFIRMED") startDate = addDays(NOW, between(1, 20));
    if (state === "QUOTATION" || state === "DRAFT") startDate = addDays(NOW, between(0, 14));

    const fixedTerm = plan.billingPeriod === "YEARLY" || plan.billingPeriod === "DAILY" || chance(0.25);
    const periods = plan.billingPeriod === "YEARLY" ? between(1, 2) : plan.billingPeriod === "DAILY" ? between(14, 30) : plan.billingPeriod === "WEEKLY" ? between(20, 52) : between(6, 18);
    let endDate = fixedTerm ? addPeriods(startDate, plan.billingPeriod, periods) : null;
    if (state === "ACTIVE" && endDate && endDate < NOW) endDate = addPeriods(NOW, plan.billingPeriod, 1, startDate.getUTCDate());

    const subId = randomUUID();
    const year = startDate.getUTCFullYear();
    const seq = (subNumberByYear.get(year) ?? 0) + 1;
    subNumberByYear.set(year, seq);

    // Lines: plan product (sometimes the Odoo variant) + optional add-ons.
    const qty = Math.max(plan.minQuantity, chance(0.15) ? between(10, 40) : between(1, 8));
    const useOdoo = plan.productId === c.crm.id && chance(0.3);
    const subLines = [
      { id: randomUUID(), subscriptionId: subId, productId: plan.productId, variantId: useOdoo ? c.odoo.id : null, description: useOdoo ? `${productName(c, plan.productId)} (Brand: Odoo)` : productName(c, plan.productId), quantity: qty, unitPrice: plan.price + (useOdoo ? c.odoo.priceExtra : 0), isActive: true },
    ];
    for (const addon of addons) {
      if (chance(0.22)) subLines.push({ id: randomUUID(), subscriptionId: subId, productId: addon.id, variantId: null, description: addon.name, quantity: 1, unitPrice: addon.salesPrice, isActive: chance(0.85) });
    }
    lines.push(...subLines);
    const hasVolume = qty >= 10 && chance(0.7);
    if (hasVolume) discountLinks.push([c.volume.id, subId]);

    // Invoice history for subscriptions that have been running.
    let nextInvoiceDate: Date | null = null;
    let closedAt: Date | null = null;
    if (state === "ACTIVE" || state === "CLOSED") {
      const closeOn = state === "CLOSED" ? addDays(NOW, -between(1, 120)) : null;
      if (closeOn && closeOn <= startDate) startDate = addDays(closeOn, -between(35, 200));
      const isDue = state === "ACTIVE" && chance(0.05);
      const anchor = startDate.getUTCDate();
      let cursor = startDate;
      const periodStarts: Date[] = [];
      while (cursor <= NOW && (!endDate || cursor <= endDate) && (!closeOn || cursor <= closeOn)) {
        periodStarts.push(cursor);
        cursor = addPeriods(cursor, plan.billingPeriod, 1, anchor);
      }
      if (isDue && periodStarts.length > 1) {
        cursor = periodStarts.pop()!; // left for billing day
        dueForBillingDay++;
      }
      for (const periodStart of periodStarts) {
        const periodEnd = addDays(addPeriods(periodStart, plan.billingPeriod, 1, anchor), -1);
        const pricing = priceLines(
          subLines.map((l) => ({ key: l.id, productId: l.productId, description: l.description, quantity: l.quantity, unitPrice: l.unitPrice, taxRateBps: 1800, isActive: l.isActive })),
          hasVolume ? [volumeDiscount] : [],
          periodStart,
        );
        const term = termFor(plan.billingPeriod);
        const dueDate = addDays(periodStart, term.dueDays);
        const age = Math.round((NOW.getTime() - dueDate.getTime()) / 86_400_000);
        const r = rand();
        const invState: InvoiceState = age > 60 ? (r < 0.95 ? "PAID" : r < 0.98 ? "CONFIRMED" : "CANCELLED") : age > 0 ? (r < 0.78 ? "PAID" : "CONFIRMED") : r < 0.45 ? "PAID" : "CONFIRMED";
        const invoiceId = randomUUID();
        let amountPaid = invState === "PAID" ? pricing.total : 0;
        if (invState === "CONFIRMED" && chance(0.15)) amountPaid = Math.round(pricing.total / 2);
        invoices.push({
          id: invoiceId,
          subscriptionId: subId,
          customerId: customer.id,
          state: invState,
          invoiceDate: periodStart,
          dueDate,
          periodStart,
          periodEnd,
          customerName: customer.company ? `${customer.name} (${customer.company})` : customer.name,
          customerEmail: customer.email,
          customerAddress: `${customer.address}, ${customer.state}`,
          customerGstin: customer.gstin,
          subtotal: pricing.subtotal,
          discountTotal: pricing.discountTotal,
          taxTotal: pricing.taxTotal,
          total: pricing.total,
          amountPaid,
          confirmedAt: periodStart,
          sentAt: periodStart,
          cancelledAt: invState === "CANCELLED" ? addDays(periodStart, 2) : null,
        });
        for (const l of pricing.lines) {
          invoiceLines.push({ id: randomUUID(), invoiceId, description: l.description, quantity: l.quantity, unitPrice: l.unitPrice, discountAmount: l.discountAmount, taxRateBps: l.taxRateBps, taxAmount: l.taxAmount, total: l.total });
        }
        if (invState !== "CANCELLED") for (const d of pricing.appliedDiscounts) usages.push({ id: randomUUID(), discountId: d.discountId, invoiceId, amount: d.amount });
        if (amountPaid > 0) {
          const paidOn = addDays(periodStart, between(0, term.dueDays + 7));
          payments.push({ id: randomUUID(), invoiceId, method: pick(METHODS), amount: amountPaid, paymentDate: paidOn > NOW ? NOW : paidOn, note: `UTR ${between(100000000, 999999999)}` });
        }
      }
      if (state === "ACTIVE") nextInvoiceDate = cursor;
      if (closeOn) closedAt = closeOn;
    }

    subs.push({
      id: subId,
      number: `SUB/${year}/${String(seq).padStart(5, "0")}`,
      customerId: customer.id,
      planId: plan.id,
      paymentTermId: termFor(plan.billingPeriod).id,
      state,
      startDate,
      endDate: state === "CLOSED" && closedAt ? (endDate && endDate < closedAt ? endDate : closedAt) : endDate,
      nextInvoiceDate,
      validUntil: state === "QUOTATION" ? addDays(NOW, between(-3, 15)) : null,
      isPaused: state === "ACTIVE" && plan.pausable && chance(0.03),
      pausedAt: null,
      closedAt,
      closeReason: closedAt ? pick(["Customer moved to a competitor", "Business closed", "Contract ended", "Downgraded to another plan"]) : null,
      createdAt: addDays(startDate, -between(1, 10)),
    });
    activities.push({ id: randomUUID(), entityType: "subscription", entityId: subId, action: "imported", message: "Imported from the old subscriptions spreadsheet", actorName: "Data migration", createdAt: addDays(startDate, -1) });
  }
  for (const s of subs) if (s.isPaused) s.pausedAt = addDays(NOW, -between(1, 10));

  // Invoice numbers in date order, per year (gap-free).
  const counters = new Map<number, number>();
  const numbered = invoices.filter((i) => i.state !== "DRAFT").sort((a, b) => (a.invoiceDate as Date).getTime() - (b.invoiceDate as Date).getTime());
  for (const inv of numbered) {
    const year = (inv.invoiceDate as Date).getUTCFullYear();
    const n = (counters.get(year) ?? 0) + 1;
    counters.set(year, n);
    inv.number = `INV/${year}/${String(n).padStart(5, "0")}`;
  }

  console.log(`Inserting ${subs.length} subscriptions, ${invoices.length} invoices, ${payments.length} payments…`);
  await chunked(subs, 1000, (rows) => db.subscription.createMany({ data: rows }));
  await chunked(lines, 2000, (rows) => db.subscriptionLine.createMany({ data: rows }));
  await chunked(lines, 2000, (rows) => db.$executeRawUnsafe(`INSERT INTO "_SubscriptionLineToTax" ("A","B") VALUES ${rows.map((r) => `('${r.id}','${c.gst18.id}')`).join(",")} ON CONFLICT DO NOTHING`));
  if (discountLinks.length) await chunked(discountLinks, 2000, (rows) => db.$executeRawUnsafe(`INSERT INTO "_DiscountToSubscription" ("A","B") VALUES ${rows.map(([a, b]) => `('${a}','${b}')`).join(",")} ON CONFLICT DO NOTHING`));
  await chunked(invoices, 1000, (rows) => db.invoice.createMany({ data: rows as never }));
  await chunked(invoiceLines, 2000, (rows) => db.invoiceLine.createMany({ data: rows as never }));
  await chunked(payments, 2000, (rows) => db.payment.createMany({ data: rows as never }));
  await chunked(usages, 2000, (rows) => db.discountUsage.createMany({ data: rows }));
  await chunked(activities, 2000, (rows) => db.activity.createMany({ data: rows as never }));
  await db.discount.update({ where: { id: c.volume.id }, data: { usedCount: usages.length } });

  for (const [year, n] of counters) await db.sequence.upsert({ where: { key: `INV/${year}` }, update: { next: n + 1 }, create: { key: `INV/${year}`, next: n + 1 } });
  for (const [year, n] of subNumberByYear) await db.sequence.upsert({ where: { key: `SUB/${year}` }, update: { next: n + 1 }, create: { key: `SUB/${year}`, next: n + 1 } });

  console.log(`${dueForBillingDay} subscriptions are due on billing day.`);
  return customers;
}

function productName(c: Catalog, productId: string) {
  return [c.crm, c.books, c.hr].find((p) => p.id === productId)!.name;
}

/** Demo logins (Supabase Auth) — admin, staff and a customer with real history. */
async function seedDemoUsers(customers: { id: string; email: string; name: string }[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return console.log("Skipping demo users (no Supabase service role key).");
  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const demo = [
    { email: "admin@example.com", fullName: "Asha Admin", role: "ADMIN" as const },
    { email: "staff@example.com", fullName: "Sam Staff", role: "STAFF" as const },
    { email: "customer@example.com", fullName: customers[0].name, role: "CUSTOMER" as const },
  ];
  for (const u of demo) {
    let id = (await db.profile.findUnique({ where: { email: u.email } }))?.id;
    if (!id) {
      const { data, error } = await supabase.auth.admin.createUser({ email: u.email, password: DEMO_PASSWORD, email_confirm: true, user_metadata: { full_name: u.fullName } });
      id = data.user?.id;
      if (error) {
        // Already exists in Auth (e.g. the database was reset): look it up instead.
        const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
        id = list?.users.find((x) => x.email === u.email)?.id;
        if (!id) throw error;
      }
      if (!id) throw new Error(`Could not create demo user ${u.email}`);
      await db.profile.create({ data: { id, email: u.email, fullName: u.fullName, role: u.role } });
    }
    if (u.role === "CUSTOMER") {
      // The demo customer takes over the first seeded customer, with all of its history.
      await db.customer.update({ where: { id: customers[0].id }, data: { email: u.email, name: u.fullName, profileId: id } });
      await db.invoice.updateMany({ where: { customerId: customers[0].id }, data: { customerEmail: u.email } });
    }
  }
  console.log(`Demo logins ready (password: ${DEMO_PASSWORD}).`);
}

async function main() {
  if (process.env.SEED_FORCE === "true") await wipe();
  else if ((await db.product.count()) > 0) {
    console.log("Database already seeded — skipping (SEED_FORCE=true to reseed).");
    return;
  }
  const started = Date.now();
  const catalog = await seedCatalog();
  const customers = await seedBook(catalog);
  await seedDemoUsers(customers);
  console.log(`Seed complete in ${((Date.now() - started) / 1000).toFixed(1)}s.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

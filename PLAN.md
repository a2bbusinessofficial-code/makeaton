# Subscription Management System: Hackathon Master Plan

> **Source:** Odoo hackathon problem statement, *"Subscription Management System: Build one system to run plans, subscriptions and recurring billing in one place."*
> **Client in the story:** Brightloop Software
> **This document:** every requirement in the PDF, split into phases, with our own additions (USPs) at the end.

---

## Contents

1. [Requirements extracted from the PDF (traceability list)](#1-requirements-extracted-from-the-pdf)
2. [Business view: who uses this and why it matters](#2-business-view)
3. [Key interpretation decisions (read before coding)](#3-key-interpretation-decisions)
4. [Phase plan](#4-phase-plan)
5. [Edge cases judges will test](#5-edge-cases-judges-will-test)
6. [Out of scope (traps to avoid)](#6-out-of-scope)
7. [Our unique value (USPs)](#7-our-unique-value-usps)
8. [Traceability matrix: requirement → phase](#8-traceability-matrix)
9. [Open questions for the team](#9-open-questions)

---

## 1. Requirements extracted from the PDF

Every sentence in the PDF that asks for something is listed here with an ID. Nothing below this section is allowed to drop any of these.

### 1.1 The challenge and Brightloop context
| ID | Requirement |
|----|-------------|
| R01 | One **unified** platform for the full subscription life: products & plans → invoices → payment collection → revenue reporting ("digital backbone") |
| R02 | Software billed **by the month or the year** |
| R03 | **Add-ons** that customers **switch on and off** |
| R04 | Some products come in **different variants** |
| R05 | Customers range from small shops on **monthly** plans to large companies on **yearly contracts** |
| R06 | **Admin** sets up **products, plans, taxes and discounts** |
| R07 | A small **internal team** handles customers day to day |
| R08 | Customers **see and manage their own subscriptions** without emailing anyone |

### 1.2 Pain points in "How Things Run Today"
| ID | Today | What the system must replace it with |
|----|-------|--------------------------------------|
| R09 | Subscriptions tracked in a spreadsheet | A central subscription register |
| R10 | Renewals remembered by whoever notices first | Renewals tracked by the system |
| R11 | Invoices typed by hand every month (and they go out wrong) | Auto-generated, correct invoices |
| R12 | Payments matched by scrolling bank statements | Payments recorded against invoices |
| R13 | Revenue reports built manually each quarter; "nobody can say how much recurring revenue the company actually has" | Live revenue reporting, including recurring revenue |

### 1.3 Scene: "A new customer signs up"
| ID | Requirement |
|----|-------------|
| R14 | Sign up with **email + password** |
| R15 | **Each email can belong to only one account** |
| R16 | Password: **more than eight characters** (so at least 9), with **an uppercase letter, a lowercase letter and a special character** |
| R17 | Forgot password → **reset link sent to the registered email** |
| R18 | Three access levels: **Admin** controls everything, **internal staff** do day-to-day work with **limited access**, **customers** see **only their own subscriptions and invoices through a portal** |
| R19 | **Only the admin can add a new staff member** |

### 1.4 Scene: "Launching a new plan"
| ID | Requirement |
|----|-------------|
| R20 | Product has **name, type, sales price, cost price, notes** |
| R21 | Product **variants** (e.g. by brand). **Choosing the Odoo brand adds 560 to the price** (a variant price extra) |
| R22 | Plan has **price** and **billing period: daily, weekly, monthly or yearly** |
| R23 | Plan has a **minimum quantity** |
| R24 | Plan has **dates it is available** (start / end) |
| R25 | Per plan, the admin chooses: **closes on its own when it ends** (auto-close), and whether it can be **closed early, paused, renewed** |

### 1.5 Scene: "Turning a quote into a subscription"
| ID | Requirement |
|----|-------------|
| R26 | **Quotation templates** pre-filled with the right **plan and product lines** |
| R27 | A template **stays valid for a set number of days** |
| R28 | Subscription has: **number, customer, plan, start date, expiry date, payment terms** |
| R29 | Subscription lines have: **product, quantity, unit price, taxes, amount** |
| R30 | Status flow: **Draft → Quotation → Confirmed → Active → Closed** |
| R31 | **Anyone on the team can see where a subscription stands** |

### 1.6 Scene: "Billing day"
| ID | Requirement |
|----|-------------|
| R32 | **Hundreds of subscriptions due at once**; invoices **created from the subscription**, no typing by hand |
| R33 | Invoice pre-filled with **customer details, product lines, taxes and totals** |
| R34 | **Taxes calculated automatically** from rules the admin has set |
| R35 | Team can **confirm, cancel, send or print any invoice** |
| R36 | Invoice status flow: **Draft → Confirmed → Paid** |
| R37 | **Nothing billed twice or skipped** |

### 1.7 Scene: "A customer asks for a better price"
| ID | Requirement |
|----|-------------|
| R38 | **Only the admin can create discount rules** |
| R39 | Discount is a **fixed amount or a percentage** |
| R40 | Discount has a **minimum purchase or minimum quantity** |
| R41 | Discount has **start and end dates** |
| R42 | Discount has a **limit on how many times it can be used** |
| R43 | Discount applies to **specific products or to whole subscriptions** |
| R44 | Once it applies, it **appears on the next invoice on its own** |
| R45 | It **stops when it expires or runs out** |

### 1.8 Scene: "The money comes in"
| ID | Requirement |
|----|-------------|
| R46 | Payments arrive **by different methods and on different days** |
| R47 | Each payment recorded with **method, amount, date and a note, against the right invoice** |
| R48 | At any moment, see **which invoices are paid and which are outstanding** |
| R49 | **Overdue invoices** visible so they can be chased |

### 1.9 Scene: "The finance lead, at the end of the month"
| ID | Requirement |
|----|-------------|
| R50 | One place showing **active subscriptions, revenue, payments, overdue invoices** |
| R51 | Answers "how much revenue came in, and **how much is still owed**?" |
| R52 | **Filters and a summary view** |
| R53 | Works with **thousands of subscriptions** |
| R54 | **Every page responds in under two seconds** |

**Total: 54 explicit requirements.** Section 8 maps each one to the phase that delivers it.

---

## 2. Business view

### 2.1 Personas and what "success" means for each
| Persona | In the PDF | Their pain | What they measure | Screens they live in |
|---------|-----------|------------|-------------------|----------------------|
| **Admin** (owner/ops head) | Sets up products, plans, taxes, discounts; adds staff | Wrong prices, uncontrolled discounts | Pricing correctness, discount leakage | Configuration, Users, Settings |
| **Internal staff** (sales/support/billing) | Quotes, subscriptions, invoices, payments | Manual typing, missed renewals | Time per invoice, renewals saved | Quotations, Subscriptions, Invoices, Payments |
| **Customer** (small shop / large company) | Self-service portal | Has to email to see or change anything | Self-service, clarity | Portal: My Subscriptions, My Invoices |
| **Finance lead** | Month-end review | Answers take days | Active subs, revenue, outstanding, overdue, recurring revenue | Dashboard |

### 2.2 Business metrics the product should speak to
- **Revenue leakage**: invoices skipped, discounts that never stop, renewals missed. Addressed by R37, R45, R10.
- **Days Sales Outstanding (DSO)**: how fast money comes in. Addressed by R48, R49 and the dunning USP.
- **MRR / ARR (Monthly / Annual Recurring Revenue)**: the number that "nobody can say" (R13). Addressed by the MRR USP.
- **Operational cost**: staff hours spent typing invoices and matching payments. Addressed by R32 and the bank-matching USP.

### 2.3 Story for the demo
Follow the PDF's own structure, **"A Month at Brightloop"**: run one scene after another live, on seeded data, ending at the finance dashboard. Judges wrote the scenes, so walking through them in order shows that nothing was missed.

---

## 3. Key interpretation decisions

The PDF leaves some things open. These are our default answers. **Agree on them in Phase 0 and write them in the README.**

| # | Topic | Decision | Why |
|---|-------|----------|-----|
| D1 | "More than eight characters" | **Minimum 9 characters.** 8 characters is rejected | Literal reading. Judges may test exactly 8 |
| D2 | Email uniqueness | Trim + lowercase before saving; unique index on the normalised email | `A@x.com` and `a@x.com` must not be two accounts |
| D3 | Who can sign up | Public signup always creates a **Customer**. Staff accounts are created **only by the admin**. The first admin is created by a seed script | R19 |
| D4 | Plan vs product pricing | A **Plan** belongs to a product and defines *recurring price + billing period + min qty + availability + flags*. Line unit price = plan price (or product sales price for add-ons) **+ variant price extra** | Matches Odoo's own model (recurring plans + product pricing), which Odoo judges will recognise |
| D5 | Add-ons (R03) | Add-ons are products with `type = add-on`. They are optional subscription lines with an **active on/off flag**. Only active lines are invoiced | Gives the "switch on and off" behaviour with little extra work |
| D6 | Variant price | Attribute (e.g. *Brand*) → Values (e.g. *Odoo +560*, *Generic +0*). Variant price = base + sum of extras | R21 example |
| D7 | Expiry date | Subscription `end_date` is optional (open-ended) or fixed (contract). Default = start + 1 × billing period × chosen number of periods | Supports monthly shops and yearly contracts (R05) |
| D8 | Status meanings | **Draft** = being edited; **Quotation** = sent to the customer (validity clock runs); **Confirmed** = customer accepted, start date in the future; **Active** = start date reached, being billed; **Closed** = ended (expired, closed early, or auto-closed). **Paused** is a flag on Active (not a new top-level state), so the PDF's 5-state flow is preserved | Keeps the exact flow from R30 while supporting pause (R25) |
| D9 | Quote validity | `valid_until = sent_date + template.validity_days`. An expired quotation **cannot be confirmed** | R27 |
| D10 | Numbering | Subscription number `SUB/2026/00001` given at creation. Invoice number `INV/2026/00001` given **at confirmation** (drafts have no number). Gap-free sequence per year | Odoo convention; avoids holes in invoice numbering |
| D11 | "Never twice, never skipped" | Each invoice stores `(subscription_id, period_start, period_end)`. A **unique constraint** on (subscription, period_start) for non-cancelled invoices. Billing run loops `while next_invoice_date <= today` (catches up missed periods). The whole run is transactional per subscription | R37, provable in the demo |
| D12 | Cancelled invoice | Cancelled invoices don't count in revenue and **free their period**, so the subscription can be re-billed for it. Paid invoices cannot be cancelled | Keeps "never skipped" true even after a cancellation |
| D13 | Taxes | Tax rule = name + percentage (optional fixed amount) + **price-exclusive** by default. Products carry default taxes; lines copy them and can be changed by staff | R34 |
| D14 | Discount usage counting | **One use = one invoice it is applied to** (also enforce a per-subscription link). When `used_count >= usage_limit` it stops applying | "Stops when it **runs out**" only makes sense when it is counted per application |
| D15 | Who applies discounts | **Admin creates** rules. **Staff can attach** an existing, valid rule to a subscription or line. Customers cannot | R38 says only the admin *creates* rules |
| D16 | Payments | Partial payments allowed. Invoice becomes **Paid automatically** when total paid ≥ total. Overpayment is rejected. Payments only on **Confirmed** invoices | R36, R47 |
| D17 | Overdue | `due_date = invoice_date + payment_term.days`. Overdue = Confirmed, not fully paid, `due_date < today` | R49 |
| D18 | Money | Store as integer minor units (paise/cents) or `DECIMAL(12,2)`, **never float**. Round per line, then sum | Wrong invoices are a stated pain (R11) |
| D19 | Month-end billing | Keep an anchor day: Jan 31 → Feb 28/29 → Mar 31 | Avoids drifting billing dates |
| D20 | Pause | While paused, no invoices are generated. On resume, `next_invoice_date` moves forward by the paused duration | R25 |
| D21 | Delete vs archive | Products, plans, taxes and discounts in use are **archived**, never hard-deleted | Old invoices must keep their history |
| D22 | Currency | Single currency (₹ assumed from the "adds 560" example). Confirm with team | Keeps scope tight |

---

## 4. Phase plan

**Priorities:** **P0** = explicitly required by the PDF (must ship). **P1** = our USP. **P2** = only if time is left.

**Build strategy (important):** first build a **thin end-to-end slice** (product → plan → subscription → invoice → payment → dashboard number) by the end of Phase 4.3. Then deepen each module. A working full flow beats a perfect half-system in judging.

---

### Phase 0: Kickoff, rules and design (≈10% of time)

**0.1 Read the rules**
- [ ] Confirm the judging criteria. Odoo hackathons typically score: database design, coding standards, modularity, logic, frontend/UX, performance, scalability, security, validation, **Git usage by all members**. Confirm for this event.
- [ ] Confirm what is allowed: own local DB (PostgreSQL/MySQL) vs BaaS (Firebase/Supabase are often discouraged). Is AI-generated code allowed? Is static JSON data allowed (usually not; data must be dynamic)?
- [ ] Check whether a mockup or wireframe link (often Excalidraw) was given separately.

**0.2 Team and workflow**
- [ ] Assign owners (see suggested split below).
- [ ] Git: `main` stays protected and demo-ready; feature branches per module; small, frequent commits with clear messages **from every member** (judges check commit history).
- [ ] Agree on code style, folder structure, `.env.example`, README skeleton.

**0.3 Stack and scaffold**
- [ ] Pick the stack (see open questions). Recommended default: **PostgreSQL** + one backend framework the team knows best + a component UI library for speed.
- [ ] Scaffold the repo: backend, frontend, DB migrations, seed script, lint/format, env config.
- [ ] Email: dev SMTP catcher (e.g. Mailtrap / MailHog / Ethereal) so reset links and invoice emails can be shown live.

**0.4 Data model (ER diagram)**. Draw it before coding.
- `users` (id, name, email unique, password_hash, role: admin/staff/customer, is_active, created_at)
- `password_reset_tokens` (user_id, token_hash, expires_at, used_at)
- `customers` / contacts (user_id nullable, company name, email, phone, billing address, tax ID)
- `taxes` (name, rate %, amount_type, is_active)
- `payment_terms` (name, due_days, e.g. Immediate=0, Net 15, Net 30)
- `products` (name, type: service/goods/add-on, sales_price, cost_price, notes, is_active)
- `product_taxes` (product_id, tax_id)
- `product_attributes` (name, e.g. Brand), `attribute_values` (attribute_id, name, price_extra)
- `product_variants` (product_id, sku, value ids, computed price)
- `plans` (product_id, name, price, billing_period: daily/weekly/monthly/yearly, min_quantity, start_date, end_date, auto_close, closable, pausable, renewable, is_active)
- `quotation_templates` (name, plan_id, validity_days, payment_term_id, notes) + `quotation_template_lines` (product/variant, qty, unit_price)
- `subscriptions` (number, customer_id, plan_id, state, start_date, end_date, next_invoice_date, payment_term_id, template_id, valid_until, sent_at, confirmed_at, paused_at, closed_at, close_reason, created_by)
- `subscription_lines` (subscription_id, product_id, variant_id, qty, unit_price, discount_id, is_active (add-on toggle), amount)
- `subscription_line_taxes`
- `discounts` (name, type: fixed/percent, value, min_purchase_amount, min_quantity, start_date, end_date, usage_limit, used_count, scope: products/subscription, is_active, created_by=admin)
- `discount_products` (discount_id, product_id), `subscription_discounts` (subscription_id, discount_id)
- `invoices` (number, subscription_id, customer snapshot, state: draft/confirmed/paid/cancelled, invoice_date, due_date, period_start, period_end, untaxed, tax_total, discount_total, total, amount_paid, amount_due, sent_at). **Unique (subscription_id, period_start) where state ≠ cancelled**
- `invoice_lines` (description, product, qty, unit_price, discount_amount, tax_amount, subtotal) + `invoice_line_taxes`
- `discount_usages` (discount_id, invoice_id), so usage counts can be audited
- `payments` (invoice_id, method: cash/bank transfer/UPI/card/cheque, amount, payment_date, note, recorded_by)
- `billing_runs` (run_at, triggered_by, created_count, skipped_count, failed_count, log)
- `activity_log` (entity, entity_id, action, from_state, to_state, user_id, timestamp), which powers "anyone can see where it stands" (R31)
- `sequences` (code, year, next_number)
- **Indexes** (plan for R54 now): `subscriptions(state)`, `subscriptions(next_invoice_date)`, `subscriptions(customer_id)`, `invoices(state, due_date)`, `invoices(customer_id)`, `invoices(invoice_date)`, `payments(invoice_id)`, `payments(payment_date)`

**0.5 Screens and navigation map**
- Public: Sign up, Log in, Forgot password, Reset password
- Admin/staff back office: Dashboard · Subscriptions (list + kanban by state) · Quotations · Invoices · Payments · Customers · *Configuration* (Products, Variants/Attributes, Plans, Taxes, Discounts, Payment Terms, Quotation Templates) · *Users* (admin only)
- Customer portal: My Subscriptions · Subscription detail (manage) · My Invoices · Invoice PDF · Profile · Browse plans
- Low-fidelity wireframes for each screen (Excalidraw/Figma), 30 minutes max

**0.6 Permission matrix** (enforced in the **backend**, not just hidden buttons)

| Action | Admin | Staff | Customer |
|--------|:----:|:----:|:----:|
| Create/edit products, variants, plans, taxes, payment terms | ✅ | 👁 view | ❌ |
| Create/edit **discount rules** | ✅ | 👁 view | ❌ |
| Attach existing discount to a subscription | ✅ | ✅ | ❌ |
| Create/edit quotation templates | ✅ | 👁 view (use) | ❌ |
| Add / deactivate **staff** | ✅ | ❌ | ❌ |
| Create/manage customers | ✅ | ✅ | own profile |
| Create quotations / subscriptions, change state | ✅ | ✅ | self-subscribe, own actions only |
| Generate / confirm / cancel / send / print invoices | ✅ | ✅ | view/download own |
| Record payments | ✅ | ✅ | ❌ |
| Finance dashboard | ✅ | ✅ (or limited, team decides) | ❌ |
| Run billing manually | ✅ | ✅ | ❌ |

**0.7 State machines** (write them down; enforce server-side; reject illegal moves)
- Subscription: `Draft → Quotation → Confirmed → Active → Closed`, plus `Draft → Confirmed` (direct, internal deals), `Quotation → Draft` (edit again), pause/resume flag while Active, `Active → Closed` (close early if plan allows, auto on expiry if auto_close)
- Invoice: `Draft → Confirmed → Paid`, `Draft/Confirmed (unpaid) → Cancelled`

**Exit criteria:** ER diagram, permission matrix, state diagrams, wireframes, repo scaffold, all committed.

---

### Phase 1: Identity and access (P0) · R14–R19, R18

**1.1 Sign up**
- [ ] Form: name, email, password, confirm password
- [ ] Email format validation; normalise (D2); **duplicate email → clear error** (R15)
- [ ] Password rules (R16): length ≥ 9, ≥1 uppercase, ≥1 lowercase, ≥1 special character. **Live checklist under the field**, plus the same check **on the server**
- [ ] Hash with bcrypt/argon2. Never store or log plain passwords
- [ ] New user role = Customer, with a linked customer/contact record

**1.2 Log in / session**
- [ ] Email + password; generic error ("invalid email or password")
- [ ] Session/JWT carries user id and role; logout
- [ ] Redirect by role: admin/staff → back office, customer → portal
- [ ] (P2) basic rate-limit on login attempts

**1.3 Forgot / reset password** (R17)
- [ ] "Forgot password" → enter email → **always show the same message** (doesn't reveal whether the account exists)
- [ ] Random token, store **hashed**, expiry ~30 min, **single use**
- [ ] Email the link `/reset-password?token=…` to the **registered** email
- [ ] Reset page applies the **same password policy**; invalidate the token after use

**1.4 Role-based access control** (R18)
- [ ] Middleware/guard on every API route checking role
- [ ] Customer queries always filtered by `customer_id = session user's customer`, **never** taken from the URL/body
- [ ] Frontend hides menus by role (cosmetic only; backend is the real guard)
- [ ] 403 page for wrong role; 404 for other customers' records

**1.5 Staff management (admin only)** (R19)
- [ ] Users page: list, create staff (name, email, temporary password or invite link), deactivate
- [ ] Backend rejects staff creation from non-admins
- [ ] Seed script creates the first admin

**1.6 Profile**
- [ ] User can edit name/contact details; customer can edit billing address

**Exit criteria:** three demo accounts (admin, staff, customer) each see different menus; password edge cases pass; reset email arrives in the mail catcher.

---

### Phase 2: Catalog and configuration (P0, admin) · R06, R20–R25, R34, R38–R43, R26–R27, R04

**2.1 Taxes** (R34)
- [ ] CRUD: name, rate %, (optional fixed), active
- [ ] Seed: GST 18%, GST 5%, Zero-rated (team to confirm)

**2.2 Payment terms** (R28)
- [ ] CRUD: name, due days. Seed: Immediate, Net 15, Net 30

**2.3 Products** (R20)
- [ ] CRUD: **name, type, sales price, cost price, notes**, default taxes, active
- [ ] Types: Service (main software), Add-on (R03), Goods (optional)
- [ ] Validation: prices ≥ 0; (P2) warn if sales price < cost price

**2.4 Variants** (R04, R21)
- [ ] Attributes + values with **price extra**
- [ ] Generate variants for a product from chosen attribute values
- [ ] Show computed price; **demo: Brand = Odoo → +560**

**2.5 Plans** (R22–R25)
- [ ] CRUD: product, name, **price**, **billing period (daily/weekly/monthly/yearly)**, **minimum quantity**, **available from / until**
- [ ] Toggles: **Auto-close at end**, **Closable early**, **Pausable**, **Renewable**
- [ ] Validation: min qty ≥ 1; until ≥ from; price ≥ 0
- [ ] Plans outside their availability dates **can't be picked** on new subscriptions (existing ones keep running)

**2.6 Discount rules (admin only)** (R38–R43)
- [ ] CRUD: name, **type fixed/percentage**, value, **min purchase amount** and/or **min quantity**, **start/end date**, **usage limit**, **scope: specific products or whole subscription**, product picker when scope = products
- [ ] Validation: percentage 0–100; fixed > 0; end ≥ start; limit ≥ 1 or empty (unlimited)
- [ ] Show `used_count / usage_limit` and status (Scheduled / Active / Expired / Exhausted)
- [ ] Backend: only admin can create/edit

**2.7 Quotation templates** (R26–R27)
- [ ] CRUD: name, plan, **validity (days)**, payment term, default lines (product/variant, qty, price), notes

**Exit criteria:** an admin can set up Brightloop's full catalog from the UI (products, the Odoo +560 variant, monthly/yearly plans, taxes, a discount, a template).

---

### Phase 3: Quotations and subscriptions (P0) · R26–R31, R25, R03, R05, R09, R10

**3.1 Create from template** (R26)
- [ ] "New quotation" → pick template → plan, lines, payment term, validity are copied → staff picks customer and edits
- [ ] Also allow creating from scratch

**3.2 Subscription form** (R28, R29)
- [ ] Header: **number** (auto), **customer**, **plan**, **start date**, **expiry date**, **payment terms**
- [ ] Lines: **product (+variant), quantity, unit price, taxes, amount**, all live-calculated
- [ ] Totals block: untaxed, discount, tax, total (same calculation code as invoices, see 4.1)
- [ ] Validation: qty ≥ plan min qty (R23); plan available on start date (R24); expiry > start

**3.3 Numbering** (D10): sequence `SUB/YYYY/NNNNN`

**3.4 State machine** (R30)
- [ ] Buttons: *Send quotation* (Draft→Quotation, sets valid_until, optional email to customer), *Confirm* (→Confirmed; blocked if quote expired), *Activate* (auto when start date arrives, or manually), *Close*
- [ ] Status bar showing the five steps with the current one highlighted
- [ ] Every transition written to the activity log (who, when, from, to)

**3.5 Lifecycle actions, respecting plan flags** (R25)
- [ ] **Pause / Resume**, only if plan is pausable (D20)
- [ ] **Close early**, only if plan is closable (reason required)
- [ ] **Renew**, only if plan is renewable: extend end date by one term (or create a linked renewal subscription)
- [ ] Buttons hidden **and** backend-blocked when not allowed

**3.6 Automatic jobs** (R25, R10)
- [ ] Daily job: Confirmed → Active when `start_date <= today`
- [ ] Daily job: if `end_date < today` and plan auto-closes → Closed (reason "expired")
- [ ] Quotations past `valid_until` are flagged "Expired"
- [ ] A manual "Run now" button so jobs can be shown during the demo

**3.7 Add-ons on/off** (R03, D5)
- [ ] Add-on lines have a toggle; switching it changes the amount from the next invoice
- [ ] Logged in the activity log

**3.8 Team visibility** (R31, R09)
- [ ] Subscription list: search (number, customer), filters (state, plan, customer, dates), sort, **server-side pagination**
- [ ] Kanban by state (Draft / Quotation / Confirmed / Active / Closed)
- [ ] Detail page with an activity timeline
- [ ] Customer page showing all their subscriptions and invoices

**Exit criteria:** a template becomes a quotation, is confirmed, goes Active, and is paused, renewed and closed, with every step visible in the timeline.

---

### Phase 4: Billing engine (P0, the heart of the system) · R32–R37, R44–R45, R11

**4.1 One pricing engine** (used by subscriptions, invoices and the portal)
- [ ] Line: `base = qty × (unit price incl. variant extra)` → line discount → tax on the discounted amount → line total
- [ ] Subscription-level discount spread across lines (or as its own negative line). Pick one and document it
- [ ] Integer/decimal maths, per-line rounding (D18)
- [ ] **Unit tests** for this module (cheap and very persuasive for judges)

**4.2 Discount application** (R44, R45)
- [ ] When an invoice is generated: for each attached discount check active window (start ≤ invoice date ≤ end), `used_count < usage_limit`, min purchase/qty met, scope matches
- [ ] Apply it automatically, record `discount_usages`, increment `used_count` **in the same transaction**
- [ ] When expired or exhausted it simply stops applying; show "Discount ended" on the subscription

**4.3 Generate an invoice from a subscription** (R32, R33)
- [ ] Copy **customer details (snapshot)**, **active lines**, taxes, discounts, totals; set period start/end, invoice date, due date from payment terms
- [ ] Created as **Draft**
- [ ] Advance `next_invoice_date` by the billing period (D19 anchor rule)

**4.4 Billing run, bulk and idempotent** (R32, R37)
- [ ] Selects all **Active, not paused** subscriptions with `next_invoice_date <= today`
- [ ] Per subscription, in a transaction: loop while due (catch-up of missed periods), insert invoice; the unique constraint prevents doubles
- [ ] Processes in batches; one failure doesn't stop the run; result saved to `billing_runs` (created / skipped-already-billed / failed + reason)
- [ ] Triggers: daily scheduler **and** a "Run billing now" button
- [ ] Option: auto-confirm generated invoices (setting), or leave as Draft for review
- [ ] **Demo proof:** click "Run billing" twice → second run creates **0** invoices

**4.5 Invoice actions and states** (R35, R36)
- [ ] **Confirm** (assigns number, locks lines), **Cancel** (only if unpaid; D12), **Send** (email with PDF), **Print** (PDF / print view)
- [ ] States Draft → Confirmed → Paid (+ Cancelled); illegal moves blocked
- [ ] Bulk actions on the list: confirm selected, send selected

**4.6 Invoice PDF / print layout**
- [ ] Company header (Brightloop), invoice number, dates, period, customer block, lines, tax breakdown, discount, totals, amount paid, amount due, payment terms

**4.7 Invoice email**
- [ ] Template with summary + PDF attachment (+ portal link); stores `sent_at`

**4.8 Scheduler**
- [ ] One daily job runner: activate → bill → auto-close → mark overdue (→ reminders, USP 1)

**Exit criteria:** with 500+ due subscriptions, one click generates all invoices correctly in seconds; a second click generates none; discounts apply, count down and stop.

---

### Phase 5: Payments and receivables (P0) · R46–R49, R12

**5.1 Record a payment** (R46, R47)
- [ ] From an invoice or the Payments page: **method** (Cash, Bank transfer, UPI, Card, Cheque), **amount**, **date**, **note**, linked invoice
- [ ] Validation: invoice is Confirmed; amount > 0 and ≤ amount due; date not in the future

**5.2 Invoice status update**
- [ ] `amount_paid`, `amount_due` updated; fully paid → **Paid** automatically; partial stays Confirmed with a "Partially paid" badge

**5.3 Receivables views** (R48, R49)
- [ ] Invoice list filters: Paid / Outstanding / **Overdue**, customer, date range
- [ ] Overdue highlighted (days overdue)
- [ ] (P2) Aging buckets: 0–30, 31–60, 61–90, 90+

**5.4 Payments list**
- [ ] All payments, filter by method/date/customer, totals

**Exit criteria:** partial + final payment flips the invoice to Paid; overdue list is accurate.

---

### Phase 6: Customer portal (P0) · R08, R18

**6.1 Portal home**: active subscriptions, next invoice date, amount due, overdue alert

**6.2 My subscriptions**
- [ ] List + detail (plan, lines, status, dates)
- [ ] Self-service actions **only where the plan allows**: pause/resume, close (cancel), renew, **toggle add-ons**
- [ ] Changes are logged; staff see them in the timeline

**6.3 My invoices**
- [ ] List with status (Paid / Outstanding / Overdue), view & download PDF
- [ ] (P2) "Pay now" button with a simulated payment

**6.4 Subscribe from the portal** ("finds Brightloop online and creates an account")
- [ ] Browse available plans → pick variant/qty (≥ min) → creates a Quotation for staff to confirm (or Confirmed directly; team decides)

**6.5 Data isolation tests**
- [ ] Change IDs in the URL/API → must get 404/403. Write this as a test

**Exit criteria:** customer does everything without contacting staff; cannot see anyone else's data.

---

### Phase 7: Finance dashboard and reporting (P0) · R50–R52, R13

**7.1 KPI cards (summary view)**
- [ ] Active subscriptions (count)
- [ ] Revenue (confirmed + paid invoices in the period)
- [ ] Payments received (sum in period)
- [ ] **Outstanding** amount (still owed)
- [ ] **Overdue** invoices (count + amount)
- [ ] MRR / ARR (USP 3)

**7.2 Filters**: date range (this month default), plan, product, customer, salesperson (P2)

**7.3 Charts** (keep to 2–3): revenue vs payments by month; subscriptions by state; overdue by aging bucket

**7.4 Drill-down tables**: click a card → filtered list (e.g. overdue invoices), paginated

**7.5 (P2)** CSV export of any list

**Exit criteria:** the finance lead's four questions (active subs? revenue in? still owed? which overdue?) are answered on one screen.

---

### Phase 8: Performance and scale (P0) · R53, R54

**8.1 Realistic seed data**: Brightloop catalog + **≥ 5,000 subscriptions**, ~2,000 customers, ~50,000 invoices across 12 months, mixed states, payments, overdue cases. One-command seed script.

**8.2 Make it fast**
- [ ] Server-side pagination, sorting and filtering everywhere (never load all rows)
- [ ] Indexes from 0.4; avoid N+1 queries (joins / eager loading)
- [ ] Dashboard KPIs via aggregate SQL (`COUNT`, `SUM`, `GROUP BY`), not app-side loops; (P2) cache for 60 s
- [ ] Billing run: batch inserts, one transaction per subscription

**8.3 Measure and show it**
- [ ] Time the key pages/APIs (browser devtools or a simple script). Target **< 2 s**, aim for < 500 ms
- [ ] Put the numbers in the README and on a demo slide ("5,000 subscriptions, dashboard in 0.3 s")

---

### Phase 9: Our USPs (P1). Details in [Section 7](#7-our-unique-value-usps)

- 9.1 Renewal & dunning autopilot
- 9.2 Bank-statement auto-match
- 9.3 Recurring revenue truth panel (MRR / ARR / churn)
- 9.4 Billing-run preview & audit
- 9.5 (P2 stretch) Proration when add-ons are switched mid-cycle

---

### Phase 10: Hardening and QA (P0, ≈10% of time, don't skip)

**10.1 Validation everywhere**: required fields, formats, ranges, **both client and server side**, with friendly error messages

**10.2 Security checklist**
- [ ] Hashed passwords, hashed reset tokens, token expiry
- [ ] Role checks on every endpoint; customer data isolation
- [ ] Parameterised queries / ORM (no SQL injection); output escaping (no XSS); CSRF protection if cookie sessions
- [ ] Secrets in `.env`, not in Git

**10.3 UX polish**
- [ ] Empty states, loading states, success toasts, confirm dialogs for destructive actions (cancel invoice, close subscription)
- [ ] Responsive layout (the portal at least must work on mobile)
- [ ] Consistent status colours: Draft grey, Quotation blue, Confirmed purple, Active green, Closed dark, Overdue red

**10.4 Test pass**: run every item in [Section 5](#5-edge-cases-judges-will-test); unit tests for pricing, discounts, billing idempotency and password validation

**10.5 Code quality**: remove dead code and console logs; consistent naming; modules split by domain (auth, catalog, subscriptions, billing, payments, reporting, portal)

---

### Phase 11: Demo, pitch and submission (≈10% of time)

**11.1 Demo script: "A Month at Brightloop"** (5–7 minutes, same order as the PDF)
1. New customer signs up → password rules → forgot password → email arrives
2. Admin adds a staff member; staff log in and see limited menus
3. Admin launches a product with the Odoo variant (+560) and monthly/yearly plans with flags
4. Staff create a quote from a template → Draft → Quotation → Confirmed → Active
5. Admin creates a discount; it's attached
6. **Billing day:** preview → run → hundreds of invoices → run again → 0 duplicates; discount applied automatically; send/print an invoice
7. Payments recorded (partial + full) and a bank CSV auto-matched (USP)
8. Customer portal: toggle an add-on, pause, download invoice
9. Finance dashboard: KPIs, filters, MRR, overdue, then mention the load time with 5,000 subscriptions

**11.2 Deliverables**
- [ ] README: problem, features mapped to scenes, decisions (Section 3), setup steps, seed command, demo logins, screenshots, ER diagram, performance numbers
- [ ] Demo video (backup in case the live demo fails)
- [ ] 5–6 slides: problem → solution → architecture/ER → demo → USPs → impact
- [ ] Clean Git history with contributions from every member

**11.3 Rehearse** twice; keep a pre-seeded database snapshot to restore instantly.

---

### Suggested team split (assuming 4 people; adjust once confirmed)
| Member | Owns |
|--------|------|
| A: Backend core | Data model, auth/RBAC, state machines, **billing engine**, scheduler |
| B: Backend domain | Catalog, discounts, payments, reporting queries, seed data, performance |
| C: Frontend back office | Admin/staff screens: config, subscriptions, invoices, payments |
| D: Frontend portal + dashboard | Auth pages, customer portal, finance dashboard, PDF layout, demo/pitch |

### Suggested time budget (proportions; scale to the hackathon length)
| Phase | Share |
|-------|------|
| 0 Kickoff & design | 10% |
| 1 Auth & access | 8% |
| 2 Catalog | 12% |
| 3 Subscriptions | 14% |
| 4 Billing engine | 16% |
| 5 Payments | 6% |
| 6 Portal | 8% |
| 7 Dashboard | 6% |
| 8 Performance | 4% |
| 9 USPs | 6% |
| 10 Hardening/QA | 5% |
| 11 Demo & pitch | 5% |

---

## 5. Edge cases judges will test

| # | Test | Expected |
|---|------|----------|
| E1 | Password of exactly 8 characters meeting all other rules | ❌ rejected (needs > 8) |
| E2 | Password missing special char / uppercase / lowercase | ❌ with a specific message |
| E3 | Sign up again with the same email in different case | ❌ "email already registered" |
| E4 | Reset link used twice / after expiry | ❌ "link invalid or expired" |
| E5 | Forgot password for an unknown email | Same neutral message (no account leak) |
| E6 | Staff open the admin-only "Add user" page or call its API | 403 |
| E7 | Customer changes invoice ID in URL to another customer's | 404/403 |
| E8 | Quantity below plan minimum | ❌ blocked |
| E9 | Plan outside availability dates | Not selectable for new subscriptions |
| E10 | Confirm an expired quotation | ❌ blocked |
| E11 | Pause/close/renew on a plan that doesn't allow it | Button hidden + API rejects |
| E12 | Run billing twice on the same day | Second run creates 0 invoices |
| E13 | Scheduler was down for 3 months | Catch-up creates the 3 missing invoices, no more |
| E14 | Paused subscription on billing day | Not billed |
| E15 | Discount with usage limit 2 | Applies to 2 invoices, then stops |
| E16 | Discount after its end date / below min purchase or qty | Not applied |
| E17 | Variant Odoo selected | Unit price +560 |
| E18 | Payment greater than amount due / on a Draft invoice | ❌ blocked |
| E19 | Two partial payments summing to total | Invoice becomes Paid |
| E20 | Cancel a Paid invoice | ❌ blocked |
| E21 | Cancelled invoice | Excluded from revenue; period can be re-billed |
| E22 | Subscription started Jan 31, monthly | Bills Feb 28/29, then Mar 31 |
| E23 | Auto-close plan reaches its end date | Moves to Closed automatically, no more invoices |
| E24 | Delete a product used in subscriptions | Archived instead, history intact |
| E25 | Dashboard with 5,000+ subscriptions | Loads < 2 s |

---

## 6. Out of scope

Saying "we deliberately did not build X" shows judgment. Skip these unless everything above is done:
- Real payment gateway integration (simulate it at most)
- Multi-currency, multi-company, full accounting journals/ledgers, government e-invoicing
- Complex proration (only as P2 stretch, 9.5)
- Native mobile app (a responsive web portal is enough)
- Building inside Odoo itself, **unless the rules require it** (see open questions)

---

## 7. Our unique value (USPs)

### The idea in one line
> **The PDF's scenes fix the billing month. We close the remaining gaps in "How Things Run Today", so every broken habit Brightloop listed has a fix.**

The PDF lists **five** broken habits. Its scenes fully solve three of them (spreadsheet → subscriptions, hand-typed invoices → billing day, manual reports → dashboard). For **renewals** it only gives a "renewable" flag, for **payment matching** only manual entry, and for **recurring revenue** no metric at all, even though the PDF says "nobody can say how much recurring revenue the company actually has." Our additions target exactly those gaps. Each one is small and built on modules we already have.

| "How Things Run Today" | PDF scene covers it? | Our addition |
|---|---|---|
| Subscriptions in a spreadsheet | ✅ Subscriptions module | — |
| **Renewals remembered by whoever notices** | ⚠️ Only a "renewable" flag | **USP 1: Renewal & dunning autopilot** |
| Invoices typed by hand | ✅ Billing day | **USP 4: Billing-run preview & audit** (proves "never twice, never skipped") |
| **Payments matched by scrolling bank statements** | ⚠️ Only manual payment entry | **USP 2: Bank-statement auto-match** |
| **"Nobody can say how much recurring revenue"** | ⚠️ Revenue, but no recurring metric | **USP 3: Recurring revenue truth panel** |

### USP 1: Renewal & dunning autopilot (≈2–3 h, reuses scheduler + email)
- **Action Center** page for staff: renewals due in the next 7/30 days, quotations about to expire, overdue invoices, sorted by amount at risk
- Automatic emails: **renewal reminder** 7 days before expiry; **overdue reminders** at +1, +7, +15 days (tracked so none are sent twice)
- *Business value:* stops silent churn and shortens DSO. "Renewals get missed" was the first problem in the PDF

### USP 2: Bank-statement auto-match (≈3 h, reuses payments)
- Upload a bank statement **CSV** (date, amount, narration/reference)
- Matching rules, in order: invoice number found in narration → exact amount + customer name → exact amount only (flagged as "check")
- Staff review suggested matches and **confirm all in one click**; payments are created with method "Bank transfer" and the narration as the note
- *Business value:* replaces "scrolling through bank statements" directly; hours of finance work become minutes

### USP 3: Recurring revenue truth panel (≈1.5 h, reuses dashboard queries)
- **MRR** = sum of active, non-paused subscription line amounts (after discount, before tax), converted to monthly (daily × 30, weekly × 52 ÷ 12, yearly ÷ 12)
- **ARR** = MRR × 12; **churned MRR** this month (subscriptions closed); **net new MRR**; **revenue at risk** (overdue + renewals due in 30 days)
- *Business value:* answers the exact sentence in the PDF: "nobody can say how much recurring revenue the company actually has"

### USP 4: Billing-run preview & audit (≈1.5 h, reuses billing engine)
- **Preview (dry run)** before billing day: how many invoices, for which customers, total amount, discounts that will apply/expire
- **Run report** after: created / skipped (already billed) / failed (with reason), stored in history
- *Business value:* makes "nothing billed twice or skipped" visible and auditable instead of a claim

### Stretch (P2): Fair proration on add-on toggles
- Switching an add-on on/off mid-period adds a prorated charge/credit line on the next invoice. Build only if everything else is done.

### Why this set and not "AI features"
- Each item maps to a sentence in the PDF, so judges can see why it is there
- Each one reuses an engine we already build (scheduler, email, payments, dashboard, billing), so the cost is low
- Each one is easy to show in a live demo (an email arriving, a CSV matching, a number on screen, a "0 duplicates" report)

---

## 8. Traceability matrix

| Req | Phase(s) | Req | Phase(s) | Req | Phase(s) |
|-----|----------|-----|----------|-----|----------|
| R01 | All (0.5 nav map, 11.1 demo) | R19 | 1.5 | R37 | 4.4, 0.4 (unique constraint), USP 4 |
| R02 | 2.5 | R20 | 2.3 | R38 | 2.6, 0.6 |
| R03 | 2.3, 3.7, 6.2 | R21 | 2.4 | R39 | 2.6 |
| R04 | 2.4 | R22 | 2.5 | R40 | 2.6, 4.2 |
| R05 | 2.5, 3.2 (D7) | R23 | 2.5, 3.2 | R41 | 2.6, 4.2 |
| R06 | Phase 2 | R24 | 2.5, 3.2 | R42 | 2.6, 4.2 |
| R07 | 0.6, Phases 3–5 | R25 | 2.5, 3.5, 3.6 | R43 | 2.6, 4.2 |
| R08 | Phase 6 | R26 | 2.7, 3.1 | R44 | 4.2 |
| R09 | Phase 3 (3.8) | R27 | 2.7, 3.4 | R45 | 4.2 |
| R10 | 3.5, 3.6, USP 1 | R28 | 3.2, 2.2 | R46 | 5.1 |
| R11 | Phase 4 | R29 | 3.2, 4.1 | R47 | 5.1 |
| R12 | Phase 5, USP 2 | R30 | 3.4, 0.7 | R48 | 5.3 |
| R13 | Phase 7, USP 3 | R31 | 3.8, 0.4 (activity log) | R49 | 5.3, USP 1 |
| R14 | 1.1 | R32 | 4.3, 4.4 | R50 | 7.1 |
| R15 | 1.1 | R33 | 4.3 | R51 | 7.1 |
| R16 | 1.1, 1.3 | R34 | 2.1, 4.1 | R52 | 7.2 |
| R17 | 1.3 | R35 | 4.5, 4.6, 4.7 | R53 | 8.1 |
| R18 | 1.4, 0.6, 6.5 | R36 | 4.5, 5.2 | R54 | 8.2, 8.3 |

All 54 requirements are mapped.

---

## 9. Open questions

Answers to these change the stack, the time budget and the team split, so we need them **before Phase 1 starts**:

1. **Hackathon length and team size?** (e.g. 8 h / 24 h / multi-day; 2–4 members)
2. **Tech stack / team skills?** Which languages and frameworks is the team strongest in? Any stack required by the organisers?
3. **Build from scratch or inside Odoo?** Odoo hackathons usually want a custom app, but if building it as an Odoo module is allowed or expected, the plan changes a lot (Odoo already has subscriptions and invoicing).
4. **Judging criteria and rules:** do we have the official list? Is BaaS (Firebase/Supabase) allowed? Is AI-assisted code allowed? Any mockup link?
5. **Email and payments:** is a real email (SMTP) needed in the demo, or is a mail catcher OK? Any payment gateway expected?
6. **Currency and tax:** INR with GST? Single currency OK?
7. **Deployment:** must the app be hosted (live URL) or is a local demo fine?

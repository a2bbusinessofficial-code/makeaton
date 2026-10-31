# Brightloop: Demo Video Script (v2)

**Length:** about 1:33 (voiceover measured at 90 s) · **Format:** 1920×1080, 30 fps · **Voice:** female, warm and confident (Kokoro, "Heart" voice by default)
**Rule for every scene:** one idea, one big visual, one short line. If a viewer only watches (sound off), the on-screen captions still tell the whole story.
**Look:** clean white UI screenshots floating on a deep navy (#0B1020) stage, with one accent colour (Brightloop blue #1F5EFF) plus green for "paid/success" and red for "overdue". Inter font, kinetic captions, soft shadows, 3D tilt-ins, cursor clicks with ripple, number count-ups.

Screens referenced below are in [`video/screens/`](screens), captured from the real app with the seeded demo data.

---

### 1 · Hook (0:00 – 0:06)
| | |
|---|---|
| **On screen** | A spreadsheet grid on black. Three pain lines **slam in** and strike through: ~~Subscriptions in a spreadsheet~~ · ~~Invoices typed by hand~~ · ~~Renewals forgotten~~ |
| **Motion** | Cells jitter and glitch, a red strike-through draws across each line, then the grid shatters into particles. |
| **Sound** | Low tension pulse, a glitch hit per line, then a sub-drop. |
| **VO** | *"Subscriptions in a spreadsheet. Invoices typed by hand. Renewals… forgotten."* |

### 2 · Logo and one-line promise (0:06 – 0:12)
| | |
|---|---|
| **On screen** | The particles form the **B** mark, which unfolds into **Brightloop**. Caption: *Plans · Subscriptions · Billing · Payments · Revenue, in one place.* |
| **Motion** | Logo scale-in with light sweep. The five words pop in one by one, joined by a glowing line. |
| **Sound** | Riser, then a clean logo "ping" as the music beat starts. |
| **VO** | *"Meet Brightloop: one platform to run plans, subscriptions, billing, payments and revenue."* |

### 3 · How it works in 5 seconds (0:12 – 0:16)
| | |
|---|---|
| **On screen** | **The core diagram** (the most important visual in the film): **Plan → Quote → Subscription → Invoice → Payment → Dashboard**. Below it, three role chips: **Admin** sets it up · **Staff** run it · **Customers** serve themselves. |
| **Motion** | Each node lights up left to right while a pulse travels along the line. The role chips drop in underneath. |
| **Sound** | Soft tick per node. |
| **VO** | *"Admins set it up, staff run it day to day, and customers serve themselves."* |

### 4 · Secure sign-up (0:16 – 0:23)
| | |
|---|---|
| **On screen** | `public/02-signup` → `actions/01-signup-weak` → `actions/02-signup-strong` (the four rules turn green). Then `actions/03-signup-duplicate-email`. |
| **Motion** | Zoom into the password field. Each rule ticks green with a pop. The duplicate email triggers a red shake. Floating badge: **"One account per email."** |
| **Sound** | Four soft ticks, then an error buzz. |
| **VO** | *"Sign-up checks strong passwords live, allows one account per email, and resets passwords by email."* |

### 5 · Admin builds the catalog (0:23 – 0:39)
| | |
|---|---|
| **On screen** | Quick 4-panel cascade: `admin/product-detail` (callout **Brand: Odoo +₹560**) → `admin/plan-detail` (callouts **Daily · Weekly · Monthly · Yearly**, *min qty*, *available 1 Oct – 30 Nov*, the four rule checkboxes) → `admin/discounts` (callout **Admin only 🔒**, *usage 0 / 200*) → `actions/18-admin-team-invite`. |
| **Motion** | Screens slide in as stacked cards. Callouts are pulled out of the UI as glowing chips. "+₹560" counts up. The checkboxes tick in sequence. |
| **Sound** | Whoosh per card, typing clicks. |
| **VO** | *"The admin builds the catalog: variants, so Odoo adds ₹560; plans from daily to yearly, with pause, renew and auto-close rules; GST; and discounts with limits. Only the admin adds staff."* |

### 6 · Staff: quote to subscription (0:39 – 0:47)
| | |
|---|---|
| **On screen** | `actions/05-staff-new-from-template` → `06-staff-sub-draft` → `07-staff-sub-quotation` → `08-staff-sub-confirmed` (zoom on the activity timeline). The staff sidebar has **no Team menu** (`04`). |
| **Motion** | The status rail **Draft → Quotation → Confirmed → Active** is pulled out of the UI and enlarged, with each step lighting up blue on the beat. The timeline entries slide in from the right. |
| **Sound** | Click per step, then a success chime on *Active*. |
| **VO** | *"Staff turn a template into a quote in seconds, then into an active subscription, with every step on a timeline the whole team can see."* |

### 7 · Billing day (0:47 – 0:57)
| | |
|---|---|
| **On screen** | `actions/12-billing-preview` (dry-run preview) → click **Run billing** → `13-billing-run-1` → invoice cards **rain** out of the screen with counter **81 invoices · ₹12.96 L**. Click again → `14-billing-run-2-nothing-twice`, where a shield stamps **0 duplicates**. |
| **Motion** | Cursor click ripple. A waterfall of mini invoices. A big counter rolls up. On the second click the cards bounce off a shield. |
| **Sound** | Riser, paper flutter, cash-register "ding", then a heavy "thunk" on the shield. |
| **VO** | *"On billing day, one click invoices every due subscription, with GST worked out. Click again: nothing is ever billed twice or skipped."* |

### 8 · Money comes in (0:57 – 1:06)
| | |
|---|---|
| **On screen** | `actions/16-invoice-record-payment` → `17-invoice-paid` (the **Partly paid** pill morphs into **Paid**). Then `admin/action-center` (renewals due, overdue invoices). |
| **Motion** | A ring fills 50% then 100% (two payments: UPI and bank transfer). The status pill morphs. Reminder envelopes fly out labelled **+1 · +7 · +15 days**. |
| **Sound** | Two coin taps, a success chime, envelope whooshes. |
| **VO** | *"Payments, even partial ones, close invoices automatically, and the Action Center plus daily reminders chase renewals and overdue bills."* |

### 9 · Customer portal (1:06 – 1:16)
| | |
|---|---|
| **On screen** | Switch to a phone-sized frame: `customer/portal` ("Hi Karan 👋") → `actions/22-portal-sub-paused` → `23-portal-addon-off` → `customer/portal-plans` → `customer/portal-invoice`. Ends on `actions/24-portal-other-customer-404` with the caption **"Only your own data."** |
| **Motion** | Fast cuts on the beat. Action chips fly in: **Accept quote · Pause · Renew · Cancel · Add-ons on/off · Subscribe · Download invoice**. The 404 glitches in. |
| **Sound** | UI pop per chip, then a glitch on the 404. |
| **VO** | *"Customers do it all themselves: accept quotes, pause, renew, switch add-ons, subscribe and download invoices, and they only ever see their own data."* |

### 10 · The finance answer (1:16 – 1:27)
| | |
|---|---|
| **On screen** | `admin/dashboard`. KPI tiles lift off the page in 3D: **Active 2,285 · Invoiced · Collected · Still owed**, then the hero **MRR ₹2.35 Cr · ARR ₹28.2 Cr**, plus *Revenue at risk*. The 6-month bars grow. Badge: **3,000 subscriptions · 15,000 invoices · pages load < 1.1 s**. |
| **Motion** | Count-ups, bars growing, a stopwatch sweep. |
| **Sound** | Big impact on MRR, ticking count-ups. |
| **VO** | *"And finally, the number nobody could answer: live recurring revenue, what's collected, what's owed, and what's at risk. Fast, even at three thousand subscriptions."* |

### 11 · End card (1:27 – 1:33)
| | |
|---|---|
| **On screen** | **Brightloop**. *Subscriptions, finally under control.* · `makeaton.vercel.app` · Built with Next.js · Supabase · Prisma · Team: **Aman Xavier · Anand S · Abhinav SB · Rahul VK** |
| **Motion** | Everything collapses into the logo, then the team names fade up in sequence. |
| **Sound** | Final logo hit, then the music resolves. |
| **VO** | *"Brightloop. Subscriptions, finally under control."* |

---

## Full voiceover (≈185 words · measured 90 s with the draft voice → `video/vo-draft-heart.mp3`)

> Subscriptions in a spreadsheet. Invoices typed by hand. Renewals… forgotten.
> Meet Brightloop: one platform to run plans, subscriptions, billing, payments and revenue.
> Admins set it up, staff run it day to day, and customers serve themselves.
> Sign-up checks strong passwords live, allows one account per email, and resets passwords by email.
> The admin builds the catalog: variants, so Odoo adds ₹560; plans from daily to yearly, with pause, renew and auto-close rules; GST; and discounts with limits. Only the admin adds staff.
> Staff turn a template into a quote in seconds, then into an active subscription, with every step on a timeline the whole team can see.
> On billing day, one click invoices every due subscription, with GST worked out. Click again: nothing is ever billed twice or skipped.
> Payments, even partial ones, close invoices automatically, and the Action Center plus daily reminders chase renewals and overdue bills.
> Customers do it all themselves: accept quotes, pause, renew, switch add-ons, subscribe and download invoices, and they only ever see their own data.
> And finally, the number nobody could answer: live recurring revenue, what's collected, what's owed, and what's at risk. Fast, even at three thousand subscriptions.
> Brightloop. Subscriptions, finally under control.

## Every feature covered (checklist against PLAN.md)

| Area | Shown in scene |
|---|---|
| Sign-up, password rules, unique email, reset by email, 3 roles | 3, 4 |
| Only admin adds staff · staff have limited menus | 5, 6 |
| Products, variants (Odoo +₹560), plans (daily→yearly, min qty, dates, auto-close/close/pause/renew), GST, discounts (fixed/%, min, dates, usage limit, scope) | 5 |
| Quotation templates with validity · Draft→Quotation→Confirmed→Active→Closed · team timeline | 6 |
| Billing run, GST (CGST+SGST / IGST), preview, history, never twice or skipped | 7 |
| Payments by method/date/note, partial → Paid, overdue view, Action Center, reminders | 8 |
| Customer portal self-service + data isolation | 9 |
| Dashboard KPIs, MRR/ARR, at-risk, filters, 6-month chart, performance | 10 |

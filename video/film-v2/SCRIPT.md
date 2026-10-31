# Brightloop: Investor demo (v2) · 2:02

15 scenes, pastel neo-brutalism, real screens from the latest `main` running locally on the seeded demo data.
Narration is one line per area; the detail of each area appears on screen as checklist rows, stickers and highlight boxes.

| # | Scene | Narration | On screen (beyond the narration) |
|---|---|---|---|
| 1 | Intro | Meet Brightloop: one platform that runs a subscription business, from the first sign-up to the revenue report. | Logo, 7-step flow Sign-up → Revenue |
| 2 | Sign-up | Sign-up checks strong passwords live, allows one account per email, and sends a real confirmation. Confirm on your phone, and the laptop signs itself in. | Live checklist, server re-check, A@x.com = a@x.com, "Check your inbox", phone confirm → laptop opens the portal, resend |
| 3 | Login & recovery | Logins never reveal who has an account, and every password reset or change is confirmed by email. | Generic error, unconfirmed message, neutral forgot-password, same-password rejected, 4 branded email templates, "password changed" email |
| 4 | Roles & access | Admins, staff and customers each see only what they should, enforced on the server, and only admins manage the team. | Staff → dashboard, customer → portal, someone else's invoice → 404, invite staff, deactivate |
| 5 | Configuration | Admins set up GST and payment terms, products with variants, plans with their own rules, discount limits, and quotation templates. | Carousel: taxes/terms, Odoo +₹560, plan switches, discount status + usage, one-click quotation; staff read-only |
| 6 | Customers | Customers are searchable, with validated GST numbers and live balances. | Scroll through 1,500 customers, search, GSTIN error, balance on detail |
| 7 | Subscriptions | Quotes become subscriptions through a five-step pipeline. Expired quotes are blocked, discounts preview live, and pause, renew or close follow each plan's rules. | Pipeline counts, template → draft → sent, expired blocked, "− ₹3,747.50 on next invoice" / "Not applied: below minimum quantity", paused, renewed, timeline |
| 8 | Billing | On billing day, preview the run, then one click invoices every due subscription. Run it again, and nothing is billed twice. | Dry-run preview, 79 invoices · ₹12,88,400, second run 0, DB constraint |
| 9 | Invoices | Every invoice is a proper GST tax invoice, with gap-free numbers, email and PDF. | Totals bar, Export CSV, CGST + SGST, invoice number, Send / Print, print view |
| 10 | Payments | Payments can be partial or full. Or upload a bank statement, and Brightloop matches each credit to its invoice, and records them all at once. | Partly paid → Paid, CSV upload, 5 of 7 matched (invoice no. / name + amount), record 5 payments · ₹2,42,480 |
| 11 | Reporting | The finance dashboard shows MRR, ARR, collections, what's owed and what's at risk, with an action center and CSV exports. | MRR ₹2.35 Cr / ARR ₹28.2 Cr, collected, owed, at risk, aging, action center scroll, real CSV rows |
| 12 | Automation | Every morning, a scheduled job activates, bills, closes and sends reminders on its own. | 06:00 IST cron, Activate → Bill → Close → Remind, +1/+7/+15 days, renewal −7 days, sent once, max 50 |
| 13 | Customer portal | Customers serve themselves: accept quotes, pause, renew, switch add-ons, subscribe, and download invoices. | Accept quotation click, paused, add-on off, plans → subscribed, invoice PDF |
| 14 | Under the hood | All of it runs on three thousand subscriptions, with money stored in paise, row-level security, and thirty-three passing tests. | 1,500 / 3,000 / 15,000 / 13,000, paise, RLS, one invoice per period, < 1.1 s, `npm test` 33/33 |
| 15 | End card | Brightloop. Subscriptions, finally under control. | makeaton.vercel.app · Aman Xavier · Anand S · Abhinav SB · Rahul VK |

Music: NIVIRO – Flares [NCS Release] (calm sections only). Voice: Kokoro "Heart".

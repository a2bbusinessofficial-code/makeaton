// Renders video/STORYBOARD.jpg from the captured screens.
const { chromium } = require("playwright");
const fs = require("fs");
const S = "/home/user/makeaton/video/screens";
const img = (p) => "data:image/jpeg;base64," + fs.readFileSync(`${S}/${p}.jpg`).toString("base64");
const scenes = [
  ["1", "0:00", "Hook", "Spreadsheet chaos, pains struck through", null, "Subscriptions in a spreadsheet. Invoices typed by hand…"],
  ["2", "0:06", "Logo", "B mark unfolds → Brightloop", null, "Meet Brightloop: one platform…"],
  ["3", "0:12", "How it works", "Plan → Quote → Subscription → Invoice → Payment → Dashboard", null, "Admins set it up, staff run it, customers serve themselves."],
  ["4", "0:16", "Secure sign-up", "Live password rules · one account per email", "actions/02-signup-strong", "Strong passwords, one account per email…"],
  ["5", "0:23", "Admin: catalog", "Variant Odoo +₹560 · plans · GST · discounts · invite staff", "admin/product-detail", "Choosing Odoo adds ₹560…"],
  ["6", "0:39", "Staff: quote → subscription", "Draft → Quotation → Confirmed → Active + timeline", "actions/08-staff-sub-confirmed", "Every step on a timeline the team can see."],
  ["7", "0:47", "Billing day", "81 invoices in one click · second click: 0", "actions/14-billing-run-2-nothing-twice", "Nothing is ever billed twice or skipped."],
  ["8", "0:57", "Payments", "Partly paid → Paid · Action Center · reminders", "actions/17-invoice-paid", "Payments close invoices automatically…"],
  ["9", "1:06", "Customer portal", "Pause · renew · add-ons · subscribe · own data only", "customer/portal-subscription", "Customers do it all themselves…"],
  ["10", "1:16", "Finance answer", "MRR ₹2.35 Cr · ARR ₹28.2 Cr · < 1.1 s", "admin/dashboard", "The number nobody could answer…"],
  ["11", "1:27", "End card", "Brightloop · makeaton.vercel.app · team", null, "Subscriptions, finally under control."],
];
const flow = ["Plan", "Quote", "Subscription", "Invoice", "Payment", "Dashboard"];
const art = (n) => n === "1" ? `<div class="art hook"><s>Subscriptions in a spreadsheet</s><s>Invoices typed by hand</s><s>Renewals forgotten</s></div>`
  : n === "2" ? `<div class="art logo"><b>B</b><span>Brightloop</span></div>`
  : n === "3" ? `<div class="art flow">${flow.map((f) => `<i>${f}</i>`).join("<em>→</em>")}</div>`
  : `<div class="art logo end"><b>B</b><span>Brightloop</span><small>Aman Xavier · Anand S · Abhinav SB · Rahul VK</small></div>`;
const html = `<!doctype html><html><head><style>
body{margin:0;background:#0B1020;font-family:Inter,system-ui,sans-serif;color:#E8ECF8;padding:56px}
h1{margin:0 0 6px;font-size:40px;letter-spacing:-.02em}h1 b{color:#5B8CFF}
p.sub{margin:0 0 36px;color:#8E9AC0;font-size:18px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:28px}
.card{background:#121A33;border:1px solid #23305A;border-radius:16px;overflow:hidden}
.thumb{aspect-ratio:16/9;background:#0E1530;display:flex;align-items:center;justify-content:center;overflow:hidden}
.thumb img{width:100%;height:100%;object-fit:cover;object-position:top left}
.meta{padding:14px 16px 16px}.top{display:flex;gap:10px;align-items:center;font-size:13px;color:#8E9AC0}
.n{background:#1F5EFF;color:#fff;border-radius:999px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px}
h3{margin:8px 0 4px;font-size:19px}.what{font-size:14px;color:#B9C3E4;margin:0 0 8px}.vo{font-size:13px;color:#7FA2FF;font-style:italic;margin:0}
.art{width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px}
.hook s{color:#FF6B6B;font-size:20px;font-weight:600;text-decoration-thickness:3px}
.logo b{background:#fff;color:#0B1020;width:64px;height:64px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:34px}
.logo span{font-size:30px;font-weight:700}.logo small{color:#8E9AC0;font-size:13px}
.flow{flex-direction:row;flex-wrap:wrap;padding:20px;gap:6px}.flow i{font-style:normal;background:#1F5EFF;color:#fff;border-radius:8px;padding:6px 10px;font-size:14px;font-weight:600}.flow em{color:#5B8CFF;font-style:normal}
</style></head><body>
<h1><b>Brightloop</b> · Demo video storyboard</h1>
<p class="sub">≈ 1:33 · 11 scenes · real screens from the app · female voiceover</p>
<div class="grid">${scenes.map(([n, t, title, what, shot, vo]) => `<div class="card"><div class="thumb">${shot ? `<img src="${img(shot)}">` : art(n)}</div>
<div class="meta"><div class="top"><span class="n">${n}</span>${t}</div><h3>${title}</h3><p class="what">${what}</p><p class="vo">“${vo}”</p></div></div>`).join("")}</div>
</body></html>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.setContent(html, { waitUntil: "load" });
  await p.screenshot({ path: "/home/user/makeaton/video/STORYBOARD.jpg", fullPage: true, type: "jpeg", quality: 88 });
  await b.close(); console.log("ok");
})();

import { C, icon, browser, cursorSVG, scene } from "./lib.mjs";

// ---------- S1 · The problem (spreadsheet chaos) ----------
export function s1() {
  const L = 0.6; // VO lead
  const rows = [
    ["CUSTOMER", "PLAN", "RENEWS ON", "INVOICE", "PAID?"],
    ["Bhatt Textiles", "CRM ×3", "??", "typed by hand", "✗"],
    ["Iyer Foods", "Books yearly", "31/10 (?)", "#REF!", "?"],
    ["Verma Studio", "HR weekly", "ask finance", "INV-0??", "✓?"],
    ["Kapoor Logistics", "CRM", "—", "copy of row 2", "✗"],
    ["Desai Agro", "Books", "forgot", "₹4,999??", "?"],
  ];
  const hot = new Set(["1-2", "2-3", "3-2", "5-2", "2-4", "4-3"]);
  const cells = rows
    .map((r, i) => r.map((t, j) => `<div class="s1c" id="s1-c${i}-${j}" style="${i === 0 ? "background:#111;color:#fff;font-weight:700" : hot.has(`${i}-${j}`) ? `background:${C.pink}` : ""}">${t}</div>`).join(""))
    .join("");
  const pains = [
    ["file-spreadsheet", "Subscriptions in<br>a spreadsheet", C.yellow, -3, 0],
    ["keyboard", "Invoices typed<br>by hand", C.blue, 2, 1.83],
    ["bell-off", "Renewals…<br>forgotten", C.pink, -2, 3.46],
  ];
  const body = `
  <div class="pill" id="s1-tag" style="left:110px;top:90px;background:${C.cream}">${icon("clock")} How it runs today</div>
  <div class="card" id="s1-sheet" style="position:absolute;left:110px;top:190px;width:1040px;padding:0">
    <div style="height:56px;border-bottom:4px solid #111;display:flex;align-items:center;gap:12px;padding:0 18px;background:${C.paper}">
      <img src="assets/icons/file-spreadsheet.svg" style="width:30px;height:30px" alt=""><span class="label" style="text-transform:none;letter-spacing:.02em;font-size:22px">subscriptions_FINAL_v7 (2).xlsx</span></div>
    <div style="display:grid;grid-template-columns:250px 190px 190px 220px 182px">${cells}</div>
  </div>
  ${pains
    .map(
      ([ic, t, bg], k) => `<div class="sticker" id="s1-p${k}" style="left:1230px;top:${210 + k * 220}px;width:600px;background:${bg};font-size:40px">
      <div class="ico">${icon(ic)}</div><div>${t}</div><div class="s1strike" id="s1-x${k}"></div></div>`,
    )
    .join("")}
  <div class="star" id="s1-star" style="left:1700px;top:820px;width:150px;height:150px"><b style="background:${C.yellow}"></b></div>
  <style>
    .s1c{height:76px;border-right:3px solid #111;border-bottom:3px solid #111;padding:0 14px;display:flex;align-items:center;font:500 24px/1.1 "Space Grotesk";color:#111;background:#fff}
    .s1strike{position:absolute;left:-14px;right:-14px;top:50%;height:12px;margin-top:-6px;background:#111;transform-origin:0 50%}
  </style>`;
  const script = `
  tl.fromTo("#s1-sheet",{y:40,rotation:-4,opacity:1},{y:0,rotation:-2,duration:0.9,ease:"expo.out"},0);
  tl.fromTo("#s1-tag",{opacity:0,x:-40},{opacity:1,x:0,duration:0.6,ease:"expo.out"},0.1);
  tl.fromTo(".s1c",{opacity:0},{opacity:1,duration:0.01,stagger:0.028},0.05);
  const P=[${pains.map((p) => p[3]).join(",")}], T=[${pains.map((p) => (L + p[4]).toFixed(2)).join(",")}];
  for(let k=0;k<3;k++){ stamp(tl,"#s1-p"+k,T[k],P[k]); tl.fromTo("#s1-x"+k,{scaleX:0},{scaleX:1,duration:0.35,ease:"power4.inOut"},T[k]+0.75); }
  // the sheet jitters when things go wrong
  tl.to("#s1-sheet",{x:-8,duration:0.05,repeat:5,yoyo:true,ease:"none"},${(L + 1.9).toFixed(2)});
  tl.to("#s1-c2-3",{backgroundColor:"${C.pink}",scale:1.08,duration:0.15,yoyo:true,repeat:1},${(L + 1.9).toFixed(2)});
  tl.to("#s1-sheet",{x:8,duration:0.05,repeat:5,yoyo:true,ease:"none"},${(L + 4.2).toFixed(2)});
  pop(tl,"#s1-star",${(L + 3.6).toFixed(2)},12);
  `;
  const sfx = [
    ["typing", 0.25, 0.25],
    ["pop", L + 0.0, 0.32], ["whoosh-short", L + 0.8, 0.22],
    ["pop", L + 1.83, 0.32], ["whoosh", L + 2.6, 0.22],
    ["pop", L + 3.46, 0.32], ["whoosh-short", L + 4.25, 0.22],
    ["glitch-3", L + 4.2, 0.18],
  ];
  return { id: "s1", dur: 6.0, lead: L, ground: C.paper, sfx, html: scene("s1", { ground: C.paper, body, script }) };
}

// ---------- S2 · Meet Brightloop ----------
export function s2() {
  const L = 0.35;
  const feats = [["Plans", "box", 2.45], ["Subscriptions", "calendar-repeat", 2.91], ["Billing", "file-invoice", 3.88], ["Payments", "credit-card", 4.35], ["Revenue", "chart-bar", 4.95]];
  const letters = "BRIGHTLOOP".split("").map((ch, i) => `<span class="s2l" id="s2-l${i}" style="display:inline-block">${ch}</span>`).join("");
  const body = `
  <div class="star" id="s2-star" style="left:1530px;top:90px;width:260px;height:260px"><b style="background:${C.pink}"></b></div>
  <div class="stripes" id="s2-stripes" style="left:90px;top:860px;width:360px;height:110px;background-color:${C.blue}"></div>
  <div id="s2-tile" class="abs" style="left:300px;top:260px;width:210px;height:210px;background:#111;border:4px solid #111;box-shadow:12px 12px 0 #fff;display:flex;align-items:center;justify-content:center;font:900 150px/1 Inter;color:#fff">B</div>
  <div class="abs h1" style="left:560px;top:280px;font-size:168px;letter-spacing:-0.04em">${letters}</div>
  <div class="pill" id="s2-tag" style="left:560px;top:480px;background:#fff">${icon("bolt")} One platform to run</div>
  <div class="abs" id="s2-line" style="left:200px;top:688px;width:1520px;height:8px;background:#111;transform-origin:0 50%"></div>
  ${feats
    .map(
      ([t, ic], k) => `<div class="sticker" id="s2-f${k}" style="left:${150 + k * 330}px;top:640px;width:300px;justify-content:center;background:${[C.pink, C.blue, C.green, C.cream, "#fff"][k]};font-size:30px;padding:18px 14px">
       <div class="ico" style="width:46px;height:46px">${icon(ic)}</div>${t}</div>`,
    )
    .join("")}`;
  const script = `
  tl.fromTo("#s2-tile",{y:-520,rotation:-28,opacity:1},{y:0,rotation:-6,duration:0.75,ease:"back.out(1.3)"},0.02);
  tl.fromTo(".s2l",{y:90,opacity:0},{y:0,opacity:1,duration:0.55,ease:"expo.out",stagger:0.035},${(L + 0.2).toFixed(2)});
  tl.fromTo("#s2-star",{scale:0,rotation:-40},{scale:1,rotation:8,duration:0.9,ease:"back.out(1.4)"},0.15);
  tl.fromTo("#s2-stripes",{x:-480},{x:0,duration:0.8,ease:"expo.out"},0.1);
  pop(tl,"#s2-tag",${(L + 1.2).toFixed(2)},-2);
  tl.fromTo("#s2-line",{scaleX:0},{scaleX:1,duration:2.6,ease:"power2.inOut"},${(L + 2.1).toFixed(2)});
  const R=[-3,2,-2,3,-1], T=[${feats.map((f) => (L + f[2]).toFixed(2)).join(",")}];
  for(let k=0;k<5;k++) pop(tl,"#s2-f"+k,T[k],R[k]);
  `;
  const sfx = [["impact-bass-1", 0.62, 0.3], ["sparkle", 0.4, 0.12], ...feats.map((f, k) => [k % 2 ? "click-soft" : "pop", L + f[2] + 0.05, 0.3])];
  return { id: "s2", dur: 6.2, lead: L, ground: C.yellow, sfx, html: scene("s2", { ground: C.yellow, body, script }) };
}

// ---------- S3 · How it works ----------
export function s3() {
  const L = 0.35;
  const flow = [["Plan", "box", C.pink], ["Quote", "file-text", C.cream], ["Subscription", "calendar-repeat", C.green], ["Invoice", "file-invoice", C.yellow], ["Payment", "credit-card", C.blue], ["Dashboard", "chart-bar", "#fff"]];
  const roles = [
    ["Admin", "Sets it up", "Products · plans · taxes · discounts · team", C.pink, "user-circle", 0],
    ["Staff", "Runs it daily", "Quotes · subscriptions · invoices · payments", C.green, "users", 1.19],
    ["Customer", "Serves themselves", "Self-service portal · their own data only", C.yellow, "user-circle", 2.63],
  ];
  const cw = 230, gap = 52, left0 = (1920 - (6 * cw + 5 * gap)) / 2;
  const body = `
  <div class="pill" id="s3-tag" style="left:${left0}px;top:70px;background:#fff">${icon("bolt")} How it works</div>
  ${flow
    .map(
      ([t, ic, bg], k) => `<div class="card s3f" id="s3-f${k}" style="position:absolute;left:${left0 + k * (cw + gap)}px;top:160px;width:${cw}px;height:150px;background:${bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;box-shadow:7px 7px 0 #111">
      <img src="assets/icons/${ic}.svg" style="width:52px;height:52px" alt=""><div style="font:800 25px/1 Inter;text-transform:uppercase;letter-spacing:-0.01em">${t}</div></div>
      ${k < 5 ? `<div class="abs" id="s3-a${k}" style="left:${left0 + k * (cw + gap) + cw + 6}px;top:229px;width:${gap - 12}px;height:10px;background:#111;transform-origin:0 50%"></div>` : ""}`,
    )
    .join("")}
  ${roles
    .map(
      ([r, big, small, bg, ic], k) => `<div class="card" id="s3-r${k}" style="position:absolute;left:${130 + k * 570}px;top:440px;width:520px;height:420px;background:${bg};padding:34px">
      <div class="pill" style="position:relative;display:inline-flex;background:#fff">${icon(ic)} ${r}</div>
      <div style="font:900 64px/0.95 Inter;text-transform:uppercase;letter-spacing:-0.03em;margin-top:34px">${big}</div>
      <div style="font:500 28px/1.35 Inter;margin-top:24px">${small}</div></div>`,
    )
    .join("")}`;
  const script = `
  pop(tl,"#s3-tag",0.05,-2);
  for(let k=0;k<6;k++){ tl.fromTo("#s3-f"+k,{opacity:0,y:40,scale:0.85},{opacity:1,y:0,scale:1,duration:0.5,ease:"back.out(1.6)"},0.1+k*0.14);
    if(k<5) tl.fromTo("#s3-a"+k,{scaleX:0},{scaleX:1,duration:0.25,ease:"power3.out"},0.3+k*0.14); }
  const T=[${roles.map((r) => (L + r[5]).toFixed(2)).join(",")}], R=[-2,1.5,-1.5];
  for(let k=0;k<3;k++) tl.fromTo("#s3-r"+k,{opacity:0,y:220,rotation:R[k]*3},{opacity:1,y:0,rotation:R[k],duration:0.8,ease:"back.out(1.2)"},T[k]);
  `;
  const sfx = [["whoosh-short", 0.15, 0.18], ...roles.map((r, k) => [k === 1 ? "whoosh" : "whoosh-short", L + r[5] + 0.1, 0.25])];
  return { id: "s3", dur: 5.0, lead: L, ground: C.blue, sfx, html: scene("s3", { ground: C.blue, body, script }) };
}

// ---------- S4 · Secure sign-up ----------
export function s4() {
  const L = 0.35;
  const B = browser("s4b", { left: 90, top: 150, w: 1040, urls: ["makeaton.vercel.app/signup", "makeaton.vercel.app/signup"], shots: ["01-signup-weak", "02-signup-strong", "03-signup-duplicate-email"] });
  const rules = ["More than 8 characters", "An uppercase letter", "A lowercase letter", "A special character"];
  const body = `
  <div class="pill" id="s4-tag" style="left:90px;top:60px;background:#fff">${icon("user-circle")} Sign up</div>
  ${B.html}
  <div class="abs h2" id="s4-h" style="left:1240px;top:150px;width:620px">Strong passwords,<br>checked live</div>
  ${rules
    .map(
      (r, k) => `<div class="card abs" id="s4-r${k}" style="left:1240px;top:${300 + k * 92}px;width:600px;height:74px;display:flex;align-items:center;gap:18px;padding:0 18px;box-shadow:6px 6px 0 #111">
      <div class="tick" id="s4-t${k}"><img id="s4-ti${k}" src="assets/icons/check.svg" alt=""></div><div style="font:800 28px/1 Inter;text-transform:uppercase;letter-spacing:-0.01em">${r}</div></div>`,
    )
    .join("")}
  <div class="sticker" id="s4-one" style="left:1240px;top:700px;background:${C.yellow}"><div class="ico">${icon("shield-check")}</div>One account per email</div>
  <div class="sticker" id="s4-mail" style="left:1290px;top:850px;background:${C.blue}"><div class="ico">${icon("mail")}</div>Reset link by email</div>`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,960,520,1.9,0,0);
  frameIn(tl,"#s4b",0.05,{y:160,rotation:-3});
  pop(tl,"#s4-tag",0.1,-2);
  tl.fromTo("#s4-h",{opacity:0,x:60},{opacity:1,x:0,duration:0.7,ease:"expo.out"},0.3);
  for(let k=0;k<4;k++){ slideIn(tl,"#s4-r"+k,0.45+k*0.09,80,0); }
  swap(tl,g,0,1,${(L + 1.15).toFixed(2)});
  for(let k=0;k<4;k++){ const t=${(L + 1.3).toFixed(2)}+k*0.16;
    tl.to("#s4-t"+k,{backgroundColor:"${C.green}",duration:0.12},t); tl.fromTo("#s4-ti"+k,{opacity:0,scale:0.3},{opacity:1,scale:1,duration:0.35,ease:"back.out(2.4)"},t); }
  swap(tl,g,1,2,${(L + 2.4).toFixed(2)});
  zoom(tl,g,960,700,1.9,${(L + 2.4).toFixed(2)},0.8);
  stamp(tl,"#s4-one",${(L + 2.6).toFixed(2)},-3);
  tl.to("#s4b",{x:-10,duration:0.05,repeat:5,yoyo:true,ease:"none"},${(L + 3.2).toFixed(2)});
  tl.fromTo("#s4-mail",{opacity:0,x:700,rotation:8},{opacity:1,x:0,rotation:2,duration:0.8,ease:"expo.out"},${(L + 4.45).toFixed(2)});
  `;
  const sfx = [
    ["whoosh-short", 0.15, 0.2],
    ...[0, 1, 2, 3].map((k) => ["click-soft", L + 1.3 + k * 0.16, 0.35]),
    ["pop", L + 2.6, 0.3], ["error", L + 2.9, 0.12],
    ["whoosh", L + 4.55, 0.22], ["notification", L + 4.9, 0.14],
  ];
  return { id: "s4", dur: 7.0, lead: L, ground: C.pink, sfx, html: scene("s4", { ground: C.pink, body, script }) };
}

// ---------- S5 · Admin builds the catalog ----------
export function s5() {
  const L = 0.35;
  const B = browser("s5b", {
    left: 650, top: 120, w: 1190,
    urls: ["makeaton.vercel.app/products/crm", "makeaton.vercel.app/plans/diwali-offer", "makeaton.vercel.app/taxes", "makeaton.vercel.app/discounts", "makeaton.vercel.app/users"],
    shots: ["product-detail", "plan-detail", "taxes", "discounts", "18-admin-team-invite"],
  });
  const list = [["Variants", "box", 1.98], ["Plans", "calendar-repeat", 5.51], ["Rules", "check", 7.16], ["GST", "receipt-tax", 9.84], ["Discounts", "discount", 11.13], ["Staff", "users", 12.92]];
  const body = `
  <div class="pill" id="s5-tag" style="left:90px;top:60px;background:#fff">${icon("user-circle")} Admin · Asha</div>
  <div class="abs h1" id="s5-h" style="left:90px;top:150px;width:520px;font-size:76px">Builds the catalog</div>
  ${list
    .map(
      ([t, ic], k) => `<div class="card abs" id="s5-l${k}" style="left:90px;top:${370 + k * 96}px;width:470px;height:78px;display:flex;align-items:center;gap:18px;padding:0 18px;box-shadow:6px 6px 0 #111;background:${[C.pink, C.blue, C.cream, C.yellow, "#fff", C.blue][k]}">
      <div class="tick" style="background:#fff"><img src="assets/icons/${ic}.svg" alt=""></div><div style="font:900 34px/1 Inter;text-transform:uppercase;letter-spacing:-0.02em">${t}</div></div>`,
    )
    .join("")}
  ${B.html}
  ${cursorSVG("s5-cur")}
  <div class="sticker" id="s5-odoo" style="left:720px;top:830px;background:${C.yellow};z-index:30"><div class="ico">${icon("box")}</div>Brand: Odoo <span style="margin-left:8px;padding:6px 14px;background:#111;color:#fff">+₹<span id="s5-n">0</span></span></div>
  <div class="sticker" id="s5-slot" style="left:720px;top:830px;background:${C.blue};z-index:30">
    <div class="ico">${icon("calendar-repeat")}</div>Billed
    <div style="position:relative;height:44px;width:250px;overflow:hidden;border:3px solid #111;background:#fff"><div id="s5-roll" style="position:absolute;left:0;top:0;width:100%">
    ${["Daily", "Weekly", "Monthly", "Yearly"].map((w) => `<div style="height:44px;line-height:44px;text-align:center">${w}</div>`).join("")}</div></div></div>
  ${["Pause ✓", "Renew ✓", "Auto-close ✓"].map((t, k) => `<div class="pill" id="s5-o${k}" style="left:${1180 + k * 230}px;top:840px;background:${[C.green, C.pink, C.cream][k]};z-index:30;font-size:26px">${t}</div>`).join("")}
  <div class="sticker" id="s5-gst" style="left:760px;top:830px;background:${C.cream};z-index:30"><div class="ico">${icon("receipt-tax")}</div>GST 0 · 5 · 12 · 18%</div>
  <div class="sticker" id="s5-lock" style="left:1460px;top:180px;background:${C.pink};z-index:30;font-size:40px"><div class="ico">${icon("lock")}</div>Admin only</div>
  <div class="pill" id="s5-lim" style="left:760px;top:850px;background:#fff;z-index:30;font-size:26px">Dates · usage limits · min. purchase</div>
  <div class="sticker" id="s5-staff" style="left:1250px;top:820px;background:${C.green};z-index:30"><div class="ico">${icon("users")}</div>Only admins add staff</div>`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,960,540,1,0,0);
  pop(tl,"#s5-tag",0.05,-2);
  tl.fromTo("#s5-h",{opacity:0,y:40},{opacity:1,y:0,duration:0.7,ease:"expo.out"},0.15);
  frameIn(tl,"#s5b",0.1,{x:300,rotation:4});
  const LT=[${list.map((l) => (L + l[2]).toFixed(2)).join(",")}];
  for(let k=0;k<6;k++) slideIn(tl,"#s5-l"+k,LT[k],-260,k%2?1:-1);
  // a · variants
  zoom(tl,g,1700,230,1.9,${(L + 1.9).toFixed(2)},1.0);
  stamp(tl,"#s5-odoo",${(L + 3.0).toFixed(2)},-3);
  count(tl,"#s5-n",0,560,${(L + 3.5).toFixed(2)},0.8,(v)=>inr(v));
  tl.to("#s5-odoo",{opacity:0,y:40,duration:0.25,ease:"power2.in"},${(L + 5.05).toFixed(2)});
  // b · plans
  swap(tl,g,0,1,${(L + 5.1).toFixed(2)},"whip"); url(tl,g,0,1,${(L + 5.1).toFixed(2)});
  zoom(tl,g,577,300,1.65,${(L + 5.1).toFixed(2)},0.6);
  stamp(tl,"#s5-slot",${(L + 5.5).toFixed(2)},-2);
  tl.fromTo("#s5-roll",{y:0},{y:-132,duration:1.1,ease:"power3.inOut"},${(L + 5.75).toFixed(2)});
  tl.to("#s5-slot",{opacity:0,y:40,duration:0.25,ease:"power2.in"},${(L + 7.0).toFixed(2)});
  zoom(tl,g,560,470,2.3,${(L + 7.0).toFixed(2)},0.8);
  pop(tl,"#s5-o0",${(L + 7.45).toFixed(2)},-3); pop(tl,"#s5-o1",${(L + 7.95).toFixed(2)},2); pop(tl,"#s5-o2",${(L + 8.55).toFixed(2)},-2);
  tl.to(["#s5-o0","#s5-o1","#s5-o2"],{opacity:0,y:40,duration:0.25,stagger:0.04,ease:"power2.in"},${(L + 9.45).toFixed(2)});
  // c · GST
  swap(tl,g,1,2,${(L + 9.5).toFixed(2)},"whip"); url(tl,g,1,2,${(L + 9.5).toFixed(2)});
  zoom(tl,g,650,240,1.8,${(L + 9.5).toFixed(2)},0.6);
  stamp(tl,"#s5-gst",${(L + 9.85).toFixed(2)},2);
  tl.to("#s5-gst",{opacity:0,y:40,duration:0.25,ease:"power2.in"},${(L + 10.85).toFixed(2)});
  // d · discounts
  swap(tl,g,2,3,${(L + 10.9).toFixed(2)},"whip"); url(tl,g,2,3,${(L + 10.9).toFixed(2)});
  zoom(tl,g,1000,170,1.45,${(L + 10.9).toFixed(2)},0.6);
  stamp(tl,"#s5-lock",${(L + 11.2).toFixed(2)},6);
  pop(tl,"#s5-lim",${(L + 11.7).toFixed(2)},-1);
  tl.to(["#s5-lock","#s5-lim"],{opacity:0,duration:0.25},${(L + 12.6).toFixed(2)});
  // e · team
  swap(tl,g,3,4,${(L + 12.65).toFixed(2)},"whip"); url(tl,g,3,4,${(L + 12.65).toFixed(2)});
  zoom(tl,g,528,330,1.8,${(L + 12.65).toFixed(2)},0.6);
  const c=pt(g,317,419,[528,330,1.8]);
  tl.fromTo("#s5-cur",{x:1500,y:1000,opacity:0},{opacity:1,duration:0.2},${(L + 12.8).toFixed(2)});
  click(tl,"#s5-cur",c[0],c[1],${(L + 13.75).toFixed(2)},0.7);
  stamp(tl,"#s5-staff",${(L + 13.1).toFixed(2)},-3);
  `;
  const sfx = [
    ["whoosh", 0.15, 0.2], ...list.map((l, k) => [k % 2 ? "click-soft" : "pop", L + l[2] + 0.05, 0.26]),
    ["pop", L + 3.0, 0.3], ["ping", L + 4.3, 0.14],
    ["whoosh-short", L + 5.25, 0.2], ["pop", L + 5.5, 0.26], ["click-soft", L + 6.85, 0.3],
    ["whoosh", L + 9.65, 0.2], ["pop", L + 9.85, 0.26],
    ["whoosh-short", L + 11.05, 0.2], ["pop", L + 11.2, 0.3],
    ["whoosh", L + 12.8, 0.2], ["pop", L + 13.1, 0.28], ["click", L + 13.75, 0.4],
  ];
  return { id: "s5", dur: 15.4, lead: L, ground: C.green, sfx, html: scene("s5", { ground: C.green, body, script }) };
}

// ---------- S6 · Staff: quote to subscription ----------
export function s6() {
  const L = 0.35;
  const B = browser("s6b", { left: 90, top: 290, w: 1120, urls: ["makeaton.vercel.app/subscriptions/new", "makeaton.vercel.app/subscriptions/SUB-2026-02426"], shots: ["05-staff-new-from-template", "06-staff-sub-draft", "07-staff-sub-quotation", "08-staff-sub-confirmed"] });
  const steps = [["Draft", C.cream], ["Quotation", C.blue], ["Confirmed", C.pink], ["Active", C.green], ["Closed", "#fff"]];
  const tline = [["Created from template", "file-text"], ["Quotation sent", "mail"], ["Subscription confirmed", "check"], ["Active · billed automatically", "bolt"]];
  const body = `
  <div class="pill" id="s6-tag" style="left:90px;top:60px;background:#fff">${icon("users")} Staff · Sam</div>
  ${steps
    .map(
      ([t], k) => `<div class="card abs s6s" id="s6-s${k}" style="left:${420 + k * 290}px;top:130px;width:250px;height:96px;display:flex;align-items:center;justify-content:center;font:900 30px/1 Inter;text-transform:uppercase;letter-spacing:-0.01em;box-shadow:6px 6px 0 #111;${k === 4 ? "opacity:.45" : ""}">${t}</div>
      ${k < 4 ? `<div class="abs" id="s6-a${k}" style="left:${420 + k * 290 + 254}px;top:174px;width:32px;height:8px;background:#111"></div>` : ""}`,
    )
    .join("")}
  ${B.html}
  <div class="pill" id="s6-tmpl" style="left:120px;top:930px;background:${C.yellow};z-index:30">${icon("file-text")} Template: SMB CRM — Monthly</div>
  <div class="pill" id="s6-tlh" style="left:1290px;top:300px;background:#fff">${icon("clock")} Team timeline</div>
  ${tline
    .map(
      ([t, ic], k) => `<div class="card abs" id="s6-t${k}" style="left:1290px;top:${390 + k * 140}px;width:560px;height:116px;display:flex;align-items:center;gap:18px;padding:0 20px;box-shadow:7px 7px 0 #111;background:${[C.cream, C.blue, C.pink, C.green][k]}">
      <div class="tick" style="background:#fff;width:54px;height:54px"><img src="assets/icons/${ic}.svg" alt=""></div>
      <div><div style="font:900 28px/1.05 Inter;text-transform:uppercase;letter-spacing:-0.01em">${t}</div><div class="label" style="margin-top:8px;font-size:18px">Sam Staff · 04:11 pm</div></div></div>`,
    )
    .join("")}`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,577,330,1.6,0,0);
  pop(tl,"#s6-tag",0.05,-2);
  for(let k=0;k<5;k++){ tl.fromTo("#s6-s"+k,{opacity:0,y:-60},{opacity:k===4?0.45:1,y:0,duration:0.6,ease:"expo.out"},0.1+k*0.07); if(k<4) tl.fromTo("#s6-a"+k,{opacity:0},{opacity:1,duration:0.2},0.35+k*0.07); }
  frameIn(tl,"#s6b",0.15,{y:200,rotation:-2});
  pop(tl,"#s6-tmpl",${(L + 0.6).toFixed(2)},-2);
  const lit=(k,t)=>{ tl.to("#s6-s"+k,{backgroundColor:["${C.cream}","${C.blue}","${C.pink}","${C.green}"][k],duration:0.15},t);
    tl.fromTo("#s6-s"+k,{scale:1.14,rotation:k%2?2:-2},{scale:1,rotation:0,duration:0.45,ease:"back.out(2)"},t); };
  swap(tl,g,0,1,${(L + 1.0).toFixed(2)}); url(tl,g,0,1,${(L + 1.0).toFixed(2)}); zoom(tl,g,960,300,1.15,${(L + 1.0).toFixed(2)},0.7); lit(0,${(L + 1.05).toFixed(2)});
  tl.to("#s6-tmpl",{opacity:0,duration:0.2},${(L + 1.0).toFixed(2)});
  swap(tl,g,1,2,${(L + 1.95).toFixed(2)}); lit(1,${(L + 2.0).toFixed(2)});
  swap(tl,g,2,3,${(L + 2.95).toFixed(2)}); lit(2,${(L + 3.0).toFixed(2)});
  lit(3,${(L + 3.85).toFixed(2)});
  zoom(tl,g,1725,640,2.0,${(L + 4.9).toFixed(2)},0.9);
  pop(tl,"#s6-tlh",${(L + 4.95).toFixed(2)},-2);
  for(let k=0;k<4;k++) slideIn(tl,"#s6-t"+k,${(L + 5.25).toFixed(2)}+k*0.38,320,k%2?1.5:-1.5);
  `;
  const sfx = [
    ["whoosh-short", 0.2, 0.2], ["pop", L + 0.6, 0.26],
    ["click", L + 1.05, 0.35], ["click", L + 2.0, 0.35], ["click", L + 3.0, 0.35], ["chime", L + 3.85, 0.16],
    ["whoosh", L + 4.95, 0.2], ...[0, 1, 2, 3].map((k) => ["click-soft", L + 5.35 + k * 0.38, 0.28]),
  ];
  return { id: "s6", dur: 8.9, lead: L, ground: C.cream, sfx, html: scene("s6", { ground: C.cream, body, script }) };
}

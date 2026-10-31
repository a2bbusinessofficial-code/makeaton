import { C, icon, browser, cursorSVG, scene } from "./lib.mjs";

// ---------- S7 · Billing day ----------
export function s7() {
  const L = 0.35;
  const B = browser("s7b", { left: 90, top: 140, w: 1200, urls: ["makeaton.vercel.app/billing"], shots: ["12-billing-preview", "13-billing-run-1", "14-billing-run-2-nothing-twice"] });
  const inv = Array.from({ length: 12 }, (_, k) => k);
  const body = `
  <div class="pill" id="s7-tag" style="left:90px;top:60px;background:#fff">${icon("player-play")} Billing day</div>
  ${B.html}
  ${inv
    .map(
      (k) => `<div class="card abs s7i" id="s7-i${k}" style="left:0;top:0;width:150px;height:190px;padding:14px;box-shadow:5px 5px 0 #111;z-index:${25 + k};background:${[C.paper, "#fff", C.cream][k % 3]}">
      <div style="font:900 18px/1 Inter">INV</div><div style="height:8px;background:#111;margin:12px 0 8px;width:80%"></div>
      <div style="height:6px;background:#bbb;margin:6px 0;width:90%"></div><div style="height:6px;background:#bbb;margin:6px 0;width:70%"></div><div style="height:6px;background:#bbb;margin:6px 0;width:85%"></div>
      <div style="margin-top:22px;height:22px;background:${C.green};border:2px solid #111;width:60%"></div></div>`,
    )
    .join("")}
  <div class="card abs" id="s7-cnt" style="left:1370px;top:140px;width:470px;padding:26px 30px;background:${C.blue};z-index:40">
    <div class="label">Invoices created</div>
    <div id="s7-n" style="font:900 150px/1 Inter;letter-spacing:-0.04em;margin-top:10px">0</div>
    <div id="s7-amt" style="font:800 34px/1 Inter;margin-top:12px">₹12,96,178 incl. GST</div></div>
  <div class="sticker" id="s7-gst" style="left:1370px;top:560px;background:${C.cream};font-size:30px;z-index:40;white-space:normal;width:470px"><div class="ico">${icon("receipt-tax")}</div><div>GST worked out<br><span style="font:700 22px/1.3 'Space Grotesk';letter-spacing:.06em">CGST + SGST · IGST</span></div></div>
  <div class="abs" id="s7-stamp" style="left:420px;top:560px;z-index:45;padding:18px 34px;border:7px solid #111;background:${C.pink};box-shadow:12px 12px 0 #111;font:900 110px/1 Inter;letter-spacing:-0.03em;text-transform:uppercase;white-space:nowrap">0 duplicates</div>
  <div class="pill" id="s7-never" style="left:470px;top:760px;background:#fff;z-index:46;font-size:28px">${icon("shield-check")} Never billed twice · never skipped</div>
  ${cursorSVG("s7-cur")}`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,960,540,1,0,0);
  pop(tl,"#s7-tag",0.05,-2);
  frameIn(tl,"#s7b",0.05,{y:-180,rotation:2});
  tl.fromTo("#s7-cnt",{opacity:0,x:500},{opacity:1,x:0,duration:0.8,ease:"expo.out"},0.3);
  tl.set("#s7-amt",{opacity:0},0);
  const b=pt(g,303,360,[960,540,1]);
  tl.fromTo("#s7-cur",{x:900,y:1000,opacity:0},{opacity:1,duration:0.2},0.4);
  click(tl,"#s7-cur",b[0],b[1],${(L + 1.1).toFixed(2)},0.8);
  swap(tl,g,0,1,${(L + 1.2).toFixed(2)});
  const R=[-8,6,-4,9,-6,3,-10,5,-3,7,-5,4];
  for(let k=0;k<12;k++){ const t=${(L + 1.2).toFixed(2)}+k*0.07;
    tl.fromTo("#s7-i"+k,{x:b[0]-40,y:b[1]-60,scale:0.3,rotation:0,opacity:0},{x:1400+(k%4)*95,y:330+Math.floor(k/4)*30+(k%2)*14,scale:0.9,rotation:R[k],opacity:1,duration:0.75,ease:"power3.out"},t); }
  count(tl,"#s7-n",0,81,${(L + 1.35).toFixed(2)},1.4,(v)=>Math.round(v));
  tl.fromTo("#s7-amt",{opacity:0,y:20},{opacity:1,y:0,duration:0.4,ease:"expo.out"},${(L + 2.75).toFixed(2)});
  tl.to(".s7i",{y:"+=40",opacity:0,duration:0.35,stagger:0.02,ease:"power2.in"},${(L + 3.4).toFixed(2)});
  stamp(tl,"#s7-gst",${(L + 3.64).toFixed(2)},-2);
  click(tl,"#s7-cur",b[0],b[1],${(L + 6.1).toFixed(2)},0.5);
  swap(tl,g,1,2,${(L + 6.2).toFixed(2)});
  tl.to("#s7-n",{opacity:0.25,duration:0.2},${(L + 6.2).toFixed(2)});
  stamp(tl,"#s7-stamp",${(L + 6.7).toFixed(2)},-7);
  pop(tl,"#s7-never",${(L + 7.25).toFixed(2)},2);
  `;
  const sfx = [
    ["whoosh", 0.1, 0.2], ["click", L + 1.1, 0.42], ["whoosh-cinematic", L + 1.25 - 2.5 + 2.5, 0.0],
    ["whoosh", L + 1.3, 0.25], ["ping", L + 2.75, 0.16], ["pop", L + 3.64, 0.28],
    ["click", L + 6.1, 0.42], ["impact-bass-1", L + 6.7, 0.28], ["pop", L + 7.25, 0.26],
  ].filter((s) => s[2] > 0);
  return { id: "s7", dur: 9.4, lead: L, ground: C.yellow, sfx, html: scene("s7", { ground: C.yellow, body, script }) };
}

// ---------- S8 · Payments + Action Center ----------
export function s8() {
  const L = 0.35;
  const B = browser("s8b", { left: 90, top: 140, w: 1180, urls: ["makeaton.vercel.app/invoices/INV-2026-13934", "makeaton.vercel.app/action-center"], shots: ["16-invoice-record-payment", "17-invoice-paid", "action-center"] });
  const body = `
  <div class="pill" id="s8-tag" style="left:90px;top:60px;background:#fff">${icon("credit-card")} Payments</div>
  ${B.html}
  ${cursorSVG("s8-cur")}
  <div class="card abs" id="s8-card" style="left:1350px;top:150px;width:500px;padding:28px;background:#fff">
    <div class="label">INV/2026/13934</div>
    <div style="position:relative;height:64px;margin-top:16px">
      <div class="pill" id="s8-pp" style="left:0;top:0;background:${C.cream};font-size:26px">Partly paid</div>
      <div class="pill" id="s8-paid" style="left:0;top:0;background:${C.green};font-size:26px">${icon("check")} Paid</div></div>
    <div style="display:flex;height:64px;border:4px solid #111;margin-top:22px;background:#fff">
      <div style="flex:1;border-right:4px solid #111;position:relative;overflow:hidden"><div id="s8-b1" style="position:absolute;inset:0;background:${C.blue};transform-origin:0 50%"></div></div>
      <div style="flex:1;position:relative;overflow:hidden"><div id="s8-b2" style="position:absolute;inset:0;background:${C.pink};transform-origin:0 50%"></div></div></div>
    <div style="display:flex;justify-content:space-between;margin-top:14px">
      <div id="s8-l1" class="label" style="font-size:20px">UPI · ₹5,305</div><div id="s8-l2" class="label" style="font-size:20px">Bank · ₹5,305</div></div></div>
  <div class="sticker" id="s8-ren" style="left:330px;top:300px;background:${C.cream};font-size:30px;z-index:30"><div class="ico">${icon("calendar-repeat")}</div>Renewals due</div>
  <div class="sticker" id="s8-ovd" style="left:850px;top:300px;background:${C.pink};font-size:30px;z-index:30"><div class="ico">${icon("file-invoice")}</div>Overdue invoices</div>
  <div class="card abs" id="s8-rem" style="left:1350px;top:180px;width:500px;padding:28px;background:${C.yellow}">
    <div class="label">Automatic reminders</div>
    ${["+1 day", "+7 days", "+15 days"].map((t, k) => `<div class="pill" id="s8-m${k}" style="position:relative;display:flex;margin-top:22px;width:${300 + k * 40}px;background:#fff;font-size:28px">${icon("mail")} ${t}</div>`).join("")}
    <div class="label" id="s8-rn" style="margin-top:26px;font-size:20px;line-height:1.4">+ renewal reminders, each sent once</div></div>`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,1150,380,1.3,0,0);
  pop(tl,"#s8-tag",0.05,-2);
  frameIn(tl,"#s8b",0.05,{x:-300,rotation:-3});
  tl.fromTo("#s8-card",{opacity:0,x:400,rotation:4},{opacity:1,x:0,rotation:2,duration:0.8,ease:"expo.out"},0.3);
  tl.set("#s8-paid",{opacity:0},0);
  tl.fromTo("#s8-b1",{scaleX:0},{scaleX:1,duration:0.6,ease:"power3.out"},${(L + 0.3).toFixed(2)});
  tl.fromTo("#s8-b2",{scaleX:0},{scaleX:0,duration:0.01},0);
  const b=pt(g,1635,339,[1150,380,1.3]);
  tl.fromTo("#s8-cur",{x:1100,y:1000,opacity:0},{opacity:1,duration:0.2},0.6);
  click(tl,"#s8-cur",b[0],b[1],${(L + 1.75).toFixed(2)},0.8);
  swap(tl,g,0,1,${(L + 1.85).toFixed(2)});
  tl.to("#s8-b2",{scaleX:1,duration:0.6,ease:"power3.out"},${(L + 1.9).toFixed(2)});
  tl.to("#s8-pp",{opacity:0,rotationX:90,duration:0.2,ease:"power2.in"},${(L + 2.35).toFixed(2)});
  tl.fromTo("#s8-paid",{opacity:0,rotationX:-90,scale:1},{opacity:1,rotationX:0,scale:1,duration:0.4,ease:"back.out(2)"},${(L + 2.5).toFixed(2)});
  tl.to("#s8-cur",{opacity:0,duration:0.2},${(L + 3.4).toFixed(2)});
  tl.to("#s8-card",{x:600,rotation:8,opacity:0,duration:0.45,ease:"power3.in"},${(L + 3.9).toFixed(2)});
  swap(tl,g,1,2,${(L + 4.15).toFixed(2)},"whip"); url(tl,g,0,1,${(L + 4.15).toFixed(2)});
  zoom(tl,g,960,420,1.05,${(L + 4.15).toFixed(2)},0.6);
  stamp(tl,"#s8-ren",${(L + 5.0).toFixed(2)},-3); stamp(tl,"#s8-ovd",${(L + 5.5).toFixed(2)},2);
  tl.fromTo("#s8-rem",{opacity:0,x:400,rotation:-4},{opacity:1,x:0,rotation:-2,duration:0.8,ease:"expo.out"},${(L + 6.3).toFixed(2)});
  for(let k=0;k<3;k++) slideIn(tl,"#s8-m"+k,${(L + 6.6).toFixed(2)}+k*0.4,200,0);
  tl.fromTo("#s8-rn",{opacity:0},{opacity:1,duration:0.4},${(L + 8.0).toFixed(2)});
  `;
  const sfx = [
    ["whoosh-short", 0.1, 0.2], ["pop", L + 0.3, 0.22], ["click", L + 1.75, 0.42], ["chime", L + 2.5, 0.2],
    ["whoosh", L + 4.1, 0.22], ["pop", L + 5.0, 0.28], ["pop", L + 5.5, 0.28],
    ["notification", L + 6.55, 0.14], ["click-soft", L + 7.0, 0.26], ["click-soft", L + 7.4, 0.26],
  ];
  return { id: "s8", dur: 9.5, lead: L, ground: C.blue, sfx, html: scene("s8", { ground: C.blue, body, script }) };
}

// ---------- S9 · Customer portal ----------
export function s9() {
  const L = 0.35;
  const B = browser("s9b", {
    left: 90, top: 140, w: 1180,
    urls: ["makeaton.vercel.app/portal", "makeaton.vercel.app/portal/invoices/someone-else"],
    shots: ["portal", "22-portal-sub-paused", "23-portal-addon-off", "portal-plans", "portal-invoice", "24-portal-other-customer-404"],
  });
  const acts = [["Accept quotes", "check", 2.21], ["Pause", "clock", 3.22], ["Renew", "calendar-repeat", 3.75], ["Switch add-ons", "bolt", 4.34], ["Subscribe", "box", 5.45], ["Download invoices", "file-invoice", 6.4]];
  const body = `
  <div class="pill" id="s9-tag" style="left:90px;top:60px;background:#fff">${icon("user-circle")} Customer portal · Karan</div>
  ${B.html}
  <div class="abs h2" id="s9-h" style="left:1350px;top:140px;width:520px;font-size:50px">Self-service,<br>no emails</div>
  ${acts
    .map(
      ([t, ic], k) => `<div class="card abs" id="s9-a${k}" style="left:1350px;top:${290 + k * 100}px;width:500px;height:80px;display:flex;align-items:center;gap:16px;padding:0 18px;box-shadow:6px 6px 0 #111;background:${[C.cream, C.blue, C.green, C.yellow, "#fff", C.blue][k]}">
      <div class="tick" style="background:#fff"><img src="assets/icons/${ic}.svg" alt=""></div><div style="font:900 32px/1 Inter;text-transform:uppercase;letter-spacing:-0.02em">${t}</div></div>`,
    )
    .join("")}
  <div class="sticker" id="s9-own" style="left:280px;top:690px;background:${C.yellow};font-size:56px;z-index:40;padding:24px 34px"><div class="ico" style="width:72px;height:72px">${icon("lock")}</div>Only their own data</div>`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,960,330,1.45,0,0);
  pop(tl,"#s9-tag",0.05,-2);
  frameIn(tl,"#s9b",0.05,{y:180,rotation:2});
  tl.fromTo("#s9-h",{opacity:0,y:30},{opacity:1,y:0,duration:0.7,ease:"expo.out"},${(L + 0.2).toFixed(2)});
  const T=[${acts.map((a) => (L + a[2]).toFixed(2)).join(",")}];
  for(let k=0;k<6;k++) slideIn(tl,"#s9-a"+k,T[k],240,k%2?1:-1);
  swap(tl,g,0,1,T[1]); zoom(tl,g,1150,200,1.6,T[1],0.6);
  swap(tl,g,1,2,T[3]); zoom(tl,g,960,440,1.45,T[3],0.6);
  swap(tl,g,2,3,T[4],"whip"); zoom(tl,g,960,420,1.25,T[4],0.6);
  swap(tl,g,3,4,T[5],"whip"); zoom(tl,g,960,380,1.45,T[5],0.6);
  const t404=${(L + 7.6).toFixed(2)};
  tl.to("#s9b",{x:12,duration:0.04,repeat:7,yoyo:true,ease:"none"},t404);
  swap(tl,g,4,5,t404+0.05); url(tl,g,0,1,t404+0.05); zoom(tl,g,960,540,1.3,t404+0.05,0.01);
  stamp(tl,"#s9-own",t404+0.45,-4);
  `;
  const sfx = [
    ["whoosh-short", 0.1, 0.2], ...acts.map((a, k) => [k % 2 ? "click-soft" : "pop", L + a[2] + 0.05, 0.28]),
    ["glitch-3", L + 7.6, 0.2], ["impact-bass-1", L + 8.05, 0.18],
  ];
  return { id: "s9", dur: 10.3, lead: L, ground: C.pink, sfx, html: scene("s9", { ground: C.pink, body, script }) };
}

// ---------- S10 · Finance dashboard ----------
export function s10() {
  const L = 0.35;
  const B = browser("s10b", { left: 90, top: 140, w: 1180, urls: ["makeaton.vercel.app/dashboard"], shots: ["dashboard"] });
  const stats = [["Collected", "₹2.47 Cr", C.green, 4.19], ["Still owed", "₹1.25 Cr", C.cream, 5.2], ["At risk", "₹1.06 Cr", C.pink, 6.2]];
  const body = `
  <div class="pill" id="s10-tag" style="left:90px;top:60px;background:#fff">${icon("chart-bar")} Finance · month end</div>
  ${B.html}
  <div class="card abs" id="s10-mrr" style="left:1340px;top:120px;width:520px;padding:28px 30px;background:${C.yellow}">
    <div class="label">Monthly recurring revenue</div>
    <div style="font:900 112px/1 Inter;letter-spacing:-0.04em;margin-top:12px">₹<span id="s10-n">0.00</span><span style="font-size:60px"> Cr</span></div>
    <div id="s10-arr" class="pill" style="position:relative;display:inline-flex;margin-top:18px;background:#fff;font-size:26px">ARR ₹28.2 Cr</div></div>
  ${stats
    .map(
      ([t, v, bg], k) => `<div class="card abs" id="s10-s${k}" style="left:${1340 + (k % 2) * 30}px;top:${470 + k * 150}px;width:490px;height:124px;padding:18px 24px;background:${bg};box-shadow:7px 7px 0 #111">
      <div style="position:absolute;right:16px;top:16px;width:16px;height:16px;border-radius:50%;border:3px solid #111;background:#fff"></div>
      <div class="label">${t}</div><div style="font:900 56px/1 Inter;letter-spacing:-0.03em;margin-top:10px">${v}</div></div>`,
    )
    .join("")}
  <div class="sticker" id="s10-fast" style="left:150px;top:780px;background:${C.blue};z-index:40;font-size:44px"><div class="ico">${icon("clock")}</div>Every page &lt; 1.1 s</div>
  <div class="pill" id="s10-scale" style="left:170px;top:910px;background:#fff;z-index:41;font-size:26px">3,000 subscriptions · 15,000 invoices</div>`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,960,540,1,0,0);
  pop(tl,"#s10-tag",0.05,-2);
  frameIn(tl,"#s10b",0.05,{y:200,rotation:-2});
  zoom(tl,g,1050,240,1.35,${(L + 1.4).toFixed(2)},1.2);
  tl.fromTo("#s10-mrr",{opacity:0,y:-300,rotation:-10},{opacity:1,y:0,rotation:-2,duration:0.7,ease:"back.out(1.3)"},${(L + 2.45).toFixed(2)});
  count(tl,"#s10-n",0,2.35,${(L + 2.6).toFixed(2)},1.0,(v)=>v.toFixed(2));
  pop(tl,"#s10-arr",${(L + 3.4).toFixed(2)},0);
  const T=[${stats.map((s) => (L + s[3]).toFixed(2)).join(",")}], R=[2,-2,1.5];
  for(let k=0;k<3;k++) tl.fromTo("#s10-s"+k,{opacity:0,x:420,rotation:R[k]*4},{opacity:1,x:0,rotation:R[k],duration:0.7,ease:"expo.out"},T[k]);
  zoom(tl,g,700,520,1.25,${(L + 5.3).toFixed(2)},1.2);
  stamp(tl,"#s10-fast",${(L + 7.35).toFixed(2)},-3);
  pop(tl,"#s10-scale",${(L + 8.15).toFixed(2)},1);
  `;
  const sfx = [
    ["whoosh-short", 0.1, 0.2], ["riser", L + 2.45 - 3.47, 0.16], ["impact-bass-1", L + 2.6, 0.26],
    ["pop", L + 3.4, 0.24], ...stats.map((s) => ["click-soft", L + s[3] + 0.05, 0.28]),
    ["pop", L + 7.35, 0.3], ["click-soft", L + 8.15, 0.24],
  ];
  return { id: "s10", dur: 10.8, lead: L, ground: C.green, sfx, html: scene("s10", { ground: C.green, body, script }) };
}

// ---------- S11 · End card ----------
export function s11() {
  const L = 0.35;
  const team = ["Aman Xavier", "Anand S", "Abhinav SB", "Rahul VK"];
  const words = ["Subscriptions,", "finally", "under", "control."];
  const body = `
  <div class="abs" id="s11-frame" style="left:260px;top:110px;width:1400px;height:800px;border:6px solid #fff;box-shadow:18px 18px 0 ${C.yellow};background:#111"></div>
  <div class="star" id="s11-star" style="left:1530px;top:30px;width:220px;height:220px;background:#fff"><b style="background:${C.pink}"></b></div>
  <div id="s11-tile" class="abs" style="left:370px;top:190px;width:170px;height:170px;background:#fff;border:4px solid #fff;display:flex;align-items:center;justify-content:center;font:900 124px/1 Inter;color:#111">B</div>
  <div class="abs" id="s11-name" style="left:580px;top:202px;font:900 148px/1 Inter;letter-spacing:-0.045em;color:#fff">BRIGHTLOOP</div>
  <div class="abs" style="left:372px;top:410px;width:1200px;font:900 64px/1.08 Inter;letter-spacing:-0.02em;text-transform:uppercase;color:#fff">
    ${words.map((w, k) => `<span id="s11-w${k}" style="display:inline-block;margin-right:20px;${k > 0 ? `color:${C.yellow}` : ""}">${w}</span>${k === 0 ? "<br>" : ""}`).join("")}</div>
  <div class="pill" id="s11-url" style="left:372px;top:600px;background:${C.yellow};font-size:30px">${icon("bolt")} makeaton.vercel.app</div>
  <div class="abs label" id="s11-by" style="left:372px;top:716px;color:#fff;font-size:28px">Built by</div>
  ${team.map((t, k) => `<div class="pill" id="s11-t${k}" style="left:${372 + [0, 300, 560, 860][k]}px;top:764px;background:${[C.pink, C.blue, C.green, C.cream][k]};font-size:28px">${t}</div>`).join("")}`;
  const script = `
  tl.fromTo("#s11-frame",{opacity:0,scale:0.9},{opacity:1,scale:1,duration:0.7,ease:"expo.out"},0.05);
  tl.fromTo("#s11-tile",{opacity:0,y:-200,rotation:-25},{opacity:1,y:0,rotation:-5,duration:0.7,ease:"back.out(1.4)"},${(L - 0.1).toFixed(2)});
  tl.fromTo("#s11-name",{opacity:0,x:-40},{opacity:1,x:0,duration:0.7,ease:"expo.out"},${(L + 0.05).toFixed(2)});
  tl.fromTo("#s11-star",{scale:0,rotation:-60},{scale:1,rotation:10,duration:0.9,ease:"back.out(1.4)"},${(L + 0.5).toFixed(2)});
  const W=[${(L + 0.69).toFixed(2)},${(L + 1.67).toFixed(2)},${(L + 2.0).toFixed(2)},${(L + 2.35).toFixed(2)}];
  for(let k=0;k<4;k++) tl.fromTo("#s11-w"+k,{opacity:0,y:30},{opacity:1,y:0,duration:0.45,ease:"expo.out"},W[k]);
  pop(tl,"#s11-url",${(L + 3.0).toFixed(2)},-2);
  tl.fromTo("#s11-by",{opacity:0},{opacity:1,duration:0.4},${(L + 3.5).toFixed(2)});
  const R=[-2,1.5,-1,2];
  for(let k=0;k<4;k++) pop(tl,"#s11-t"+k,${(L + 3.6).toFixed(2)}+k*0.14,R[k]);
  `;
  const sfx = [["impact-bass-1", L + 0.25, 0.24], ["sparkle", L + 0.6, 0.12], ["pop", L + 3.0, 0.24], ...team.map((t, k) => ["click-soft", L + 3.65 + k * 0.14, 0.2])];
  return { id: "s11", dur: 6.8, lead: L, ground: "#111", sfx, html: scene("s11", { ground: "#111", body, script, dots: false }) };
}

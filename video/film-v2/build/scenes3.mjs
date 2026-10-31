import { C, icon, browser, cursorSVG, hls, chapter, column, scene } from "./lib.mjs";
const f2 = (v) => v.toFixed(2);

// 11 · Reporting
export function s11() {
  const L = 0.3, id = "s11";
  const B = browser(`${id}b`, { left: 90, top: 150, w: 1180, H: 3023, full: ["b02-action-center"], urls: ["makeaton.vercel.app/dashboard", "makeaton.vercel.app/action-center"], shots: ["b01-dashboard", "b02-action-center"] });
  const stats = [["Collected", "₹2.47 Cr · 103%", C.green, 3.83], ["Still owed", "₹1.25 Cr", C.cream, 4.6], ["At risk", "₹1.06 Cr", C.pink, 5.2]];
  const rows = [["INV/2026/14227", "Pooja Joshi (Joshi Retail)", "877.92"], ["INV/2026/14310", "Neha Kapoor (Kapoor Traders)", "1745.22"], ["INV/2026/14306", "Sneha Bhatt (Bhatt Electricals)", "4311.72"], ["INV/2026/14184", "Saanvi Shah", "2416.64"]];
  const body = `${chapter(id, "chart-bar", "Reporting")}
  ${B.html}${hls(id, 3)}
  <div class="card abs" id="${id}-mrr" style="left:1340px;top:120px;width:520px;padding:26px 30px;background:${C.yellow};z-index:30">
    <div class="label">Monthly recurring revenue</div>
    <div style="font:900 108px/1 Inter;letter-spacing:-0.04em;margin-top:12px">₹<span id="${id}-n">0.00</span><span style="font-size:58px"> Cr</span></div>
    <div class="pill" id="${id}-arr" style="position:relative;display:inline-flex;margin-top:16px;background:#fff">ARR ₹28.2 Cr</div></div>
  ${stats.map(([t, v, bg], k) => `<div class="card abs" id="${id}-s${k}" style="left:${1340 + (k % 2) * 30}px;top:${450 + k * 140}px;width:490px;height:118px;padding:16px 22px;background:${bg};box-shadow:7px 7px 0 #111;z-index:30">
      <div style="position:absolute;right:16px;top:16px;width:16px;height:16px;border-radius:50%;border:3px solid #111;background:#fff"></div>
      <div class="label">${t}</div><div style="font:900 52px/1 Inter;letter-spacing:-0.03em;margin-top:10px">${v}</div></div>`).join("")}
  <div class="card abs" id="${id}-csv" style="left:150px;top:600px;width:1040px;padding:22px 26px;background:#fff;z-index:45">
    <div style="display:flex;align-items:center;gap:14px"><div class="pill" style="position:relative;background:${C.green}">${icon("table-export")} Export CSV</div><div class="label">overdue-invoices.csv · 723 rows · same filters as the screen</div></div>
    <div style="margin-top:16px;font:500 22px/1.55 'Space Grotesk';white-space:pre">${[["Number", "Customer", "Balance (INR)"], ...rows].map((r) => `<div class="${id}row">${r[0].padEnd(16)}${r[1].padEnd(34)}${r[2]}</div>`).join("")}</div></div>`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,960,540,1,0,0);
  pop(tl,"#${id}-ch",0.05,-2); frameIn(tl,"#${id}b",0.05,{y:-200,r:-2});
  zoom(tl,g,443,297,2.1,${f2(L + 1.5)},0.7);
  hl(tl,"#${id}-hl0",g,241,251,645,343,[443,297,2.1],${f2(L + 2.0)},1.4);
  tl.fromTo("#${id}-mrr",{opacity:0,y:-300,rotation:-10},{opacity:1,y:0,rotation:-2,duration:0.7,ease:"back.out(1.3)"},${f2(L + 1.85)});
  count(tl,"#${id}-n",0,2.35,${f2(L + 2.0)},0.9,(v)=>v.toFixed(2));
  pop(tl,"#${id}-arr",${f2(L + 2.76)},0);
  zoom(tl,g,1300,240,1.5,${f2(L + 3.5)},0.6);
  hl(tl,"#${id}-hl1",g,1074,143,1478,235,[1300,240,1.5],${f2(L + 3.9)},0.7);
  hl(tl,"#${id}-hl2",g,1491,143,1895,343,[1300,240,1.5],${f2(L + 4.65)},0.9);
  const T=[${stats.map((s) => f2(L + s[3])).join(",")}], R=[2,-2,1.5];
  for(let k=0;k<3;k++) tl.fromTo("#${id}-s"+k,{opacity:0,x:420,rotation:R[k]*4},{opacity:1,x:0,rotation:R[k],duration:0.6,ease:"expo.out"},T[k]);
  zoom(tl,g,1620,480,1.7,${f2(L + 5.4)},0.5);
  swap(tl,g,0,1,${f2(L + 5.95)},"up"); url(tl,g,0,1,${f2(L + 5.95)}); zoom(tl,g,960,540,1,${f2(L + 5.95)},0.01);
  zoom(tl,g,960,2500,1,${f2(L + 6.2)},1.4,"power2.inOut");
  tl.fromTo("#${id}-csv",{opacity:0,y:300,rotation:4},{opacity:1,y:0,rotation:-1,duration:0.7,ease:"back.out(1.2)"},${f2(L + 7.2)});
  tl.fromTo(".${id}row",{opacity:0,x:-30},{opacity:1,x:0,duration:0.25,stagger:0.08},${f2(L + 7.5)});
  `;
  const sfx = [["whoosh", 0.1, 0.18], ["riser", L + 1.85 - 3.47, 0.14], ["impact-bass-1", L + 2.0, 0.24], ["pop", L + 2.76, 0.22], ...stats.map((s) => ["click-soft", L + s[3] + 0.05, 0.26]), ["whoosh-short", L + 6.0, 0.16], ["whoosh", L + 7.2, 0.2], ["typing", L + 7.5, 0.3]];
  return { id, dur: 9.6, lead: L, ground: C.yellow, sfx, html: scene(id, { ground: C.yellow, body, script }) };
}

// 12 · Automation
export function s12() {
  const L = 0.3, id = "s12";
  const B = browser(`${id}b`, { left: 1020, top: 500, w: 820, urls: ["makeaton.vercel.app/billing"], shots: ["f01-billing-preview"] });
  const jobs = [["Activate", "player-play", C.green, 1.9], ["Bill", "file-invoice", C.yellow, 2.79], ["Close", "ban", C.pink, 3.57], ["Remind", "mail", C.blue, 4.3]];
  const rem = [["Overdue +1 day", C.pink], ["Overdue +7 days", C.pink], ["Overdue +15 days", C.pink], ["Renewal −7 days", C.green]];
  const body = `${chapter(id, "robot", "Automation")}
  <div class="card abs" id="${id}-clk" style="left:90px;top:170px;width:520px;height:330px;background:#fff;padding:28px">
    <div class="label">Every day · Vercel Cron</div>
    <div style="display:flex;align-items:center;gap:26px;margin-top:22px">
      <div style="position:relative;width:170px;height:170px;border:6px solid #111;border-radius:50%;background:${C.cream}">
        <div id="${id}-hand" style="position:absolute;left:79px;top:20px;width:8px;height:66px;background:#111;transform-origin:4px 66px"></div>
        <div style="position:absolute;left:73px;top:74px;width:20px;height:20px;background:#111;border-radius:50%"></div></div>
      <div style="font:900 84px/0.9 Inter;letter-spacing:-0.04em">06:00<div style="font-size:40px;margin-top:8px">IST</div></div></div>
    <div class="label" style="margin-top:20px;font-size:18px">Secret-protected endpoint</div></div>
  ${jobs.map(([t, ic, bg], k) => `<div class="sticker" id="${id}-j${k}" style="left:${680 + k * 300}px;top:220px;width:270px;justify-content:center;background:${bg};font-size:38px"><div class="ico">${icon(ic)}</div>${t}</div>`).join("")}
  ${jobs.slice(0, 3).map((_, k) => `<div class="abs" id="${id}-a${k}" style="left:${950 + k * 300}px;top:262px;width:30px;height:10px;background:#111"></div>`).join("")}
  ${rem.map(([t, bg], k) => `<div class="pill" id="${id}-m${k}" style="left:${100 + (k % 2) * 440}px;top:${600 + Math.floor(k / 2) * 110}px;background:${bg};font-size:28px">${icon("mail")} ${t}</div>`).join("")}
  <div class="pill" id="${id}-once" style="left:100px;top:850px;background:#fff">${icon("check")} Each sent once · max 50 per run</div>
  ${B.html}
  <div class="sticker" id="${id}-nb" style="left:1060px;top:380px;background:${C.cream};font-size:28px;z-index:30">Failed email never blocks the action</div>`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,960,540,1,0,0);
  pop(tl,"#${id}-ch",0.05,-2);
  tl.fromTo("#${id}-clk",{opacity:0,x:-400,rotation:-6},{opacity:1,x:0,rotation:-2,duration:0.7,ease:"expo.out"},0.15);
  tl.fromTo("#${id}-hand",{rotation:-90},{rotation:270,duration:5.5,ease:"none"},0.3);
  const T=[${jobs.map((j) => f2(L + j[3])).join(",")}];
  for(let k=0;k<4;k++){ stamp(tl,"#${id}-j"+k,T[k],k%2?2:-2); if(k<3) tl.fromTo("#${id}-a"+k,{scaleX:0,transformOrigin:"0 50%"},{scaleX:1,duration:0.3},T[k+1]-0.2); }
  for(let k=0;k<4;k++) slideIn(tl,"#${id}-m"+k,${f2(L + 4.5)}+k*0.18,-300,k%2?1.5:-1.5);
  pop(tl,"#${id}-once",${f2(L + 5.3)},-1);
  frameIn(tl,"#${id}b",0.4,{y:300,r:3});
  zoom(tl,g,1485,250,2.1,0.9,0.8);
  stamp(tl,"#${id}-nb",${f2(L + 4.9)},-2);
  `;
  const sfx = [["whoosh-short", 0.1, 0.18], ...jobs.map((j, k) => [k % 2 ? "click-soft" : "pop", L + j[3], 0.26]), ...[0, 1, 2, 3].map((k) => ["notification", L + 4.5 + k * 0.18, 0.08]), ["pop", L + 5.3, 0.2]];
  return { id, dur: 6.5, lead: L, ground: C.blue, sfx, html: scene(id, { ground: C.blue, body, script }) };
}

// 13 · Customer portal
export function s13() {
  const L = 0.3, id = "s13";
  const B = browser(`${id}b`, { left: 90, top: 150, w: 1180, urls: ["makeaton.vercel.app/portal", "makeaton.vercel.app/portal/subscriptions/SUB-2026-02426", "makeaton.vercel.app/portal/plans", "makeaton.vercel.app/portal/invoices/INV-2026-12405"],
    shots: ["l01-portal", "l02-portal-quotation", "l03-portal-accepted", "l05-portal-paused", "l06-portal-addon-off", "l08-portal-plans", "l09-portal-subscribed", "l07-portal-invoice"] });
  const items = [["Accept quotes", "check", C.cream], ["Pause / resume", "player-pause", C.blue], ["Renew", "rotate-clockwise", C.green], ["Switch add-ons", "toggle-right", C.yellow], ["Subscribe online", "shopping-cart", "#fff"], ["Download invoice PDF", "download", C.blue]];
  const T = [1.81, 2.9, 3.72, 4.67, 5.45, 6.05];
  const body = `${chapter(id, "user-circle", "Customer portal · Karan")}
  ${B.html}
  ${column(id, "Self-service", items, { top: 140 })}
  ${cursorSVG(`${id}-cur`)}`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,960,330,1.4,0,0);
  pop(tl,"#${id}-ch",0.05,-2); frameIn(tl,"#${id}b",0.05,{y:200,r:2});
  tl.fromTo("#${id}-title",{opacity:0,x:60},{opacity:1,x:0,duration:0.6,ease:"expo.out"},0.15);
  const T=[${T.map((t) => f2(L + t)).join(",")}];
  for(let k=0;k<6;k++) slideIn(tl,"#${id}-r"+k,T[k],240,k%2?1:-1);
  swap(tl,g,0,1,${f2(L + 1.5)},"whip"); url(tl,g,0,1,${f2(L + 1.5)}); zoom(tl,g,1100,160,1.6,${f2(L + 1.5)},0.5);
  const a=pt(g,1389,98,[1100,160,1.6]);
  tl.fromTo("#${id}-cur",{x:1000,y:1000,opacity:0},{opacity:1,duration:0.15},${f2(L + 1.3)});
  click(tl,"#${id}-cur",a[0],a[1],${f2(L + 2.15)},0.5);
  swap(tl,g,1,2,${f2(L + 2.22)});
  swap(tl,g,2,3,${f2(L + 2.9)},"up"); zoom(tl,g,1250,130,1.8,${f2(L + 2.9)},0.4);
  tl.to("#${id}-cur",{opacity:0,duration:0.15},${f2(L + 2.9)});
  swap(tl,g,3,4,${f2(L + 4.55)}); zoom(tl,g,1100,450,1.7,${f2(L + 4.55)},0.4);
  swap(tl,g,4,5,${f2(L + 5.25)},"whip"); url(tl,g,1,2,${f2(L + 5.25)}); zoom(tl,g,960,300,1.3,${f2(L + 5.25)},0.3);
  swap(tl,g,5,6,${f2(L + 5.7)}); zoom(tl,g,1100,200,1.5,${f2(L + 5.7)},0.3);
  swap(tl,g,6,7,${f2(L + 6.15)},"up"); url(tl,g,2,3,${f2(L + 6.15)}); zoom(tl,g,1150,250,1.45,${f2(L + 6.15)},0.4);
  `;
  const sfx = [["whoosh-short", 0.1, 0.18], ...T.map((t, k) => [k % 2 ? "click-soft" : "pop", L + t + 0.05, 0.22]), ["whoosh-short", L + 1.55, 0.14], ["click", L + 2.15, 0.36], ["chime", L + 2.3, 0.12], ["whoosh", L + 5.3, 0.14]];
  return { id, dur: 7.3, lead: L, ground: C.pink, sfx, html: scene(id, { ground: C.pink, body, script }) };
}

// 14 · Under the hood
export function s14() {
  const L = 0.3, id = "s14";
  const cards = [
    ["Customers", 1500, (v) => "inr", C.cream, 0.3], ["Subscriptions", 3000, 0, C.blue, 1.03], ["Invoices", 15000, 0, C.yellow, 1.5], ["Payments", 13000, 0, C.pink, 1.9],
  ];
  const facts = [["Money in whole paise", "currency-rupee", C.green, 2.99], ["Row-level security", "shield-lock", C.blue, 4.82], ["One invoice per period", "database-cog", C.cream, 5.4], ["Pages < 1.1 s", "clock-play", C.pink, 5.9]];
  const body = `${chapter(id, "test-pipe", "Under the hood")}
  ${cards.map(([t, n, , bg], k) => `<div class="card abs" id="${id}-c${k}" style="left:${90 + k * 445}px;top:150px;width:410px;height:190px;padding:22px 26px;background:${bg}">
      <div style="position:absolute;right:16px;top:16px;width:16px;height:16px;border-radius:50%;border:3px solid #111;background:#fff"></div>
      <div class="label">${t}</div><div id="${id}-n${k}" style="font:900 92px/1 Inter;letter-spacing:-0.04em;margin-top:16px">0</div></div>`).join("")}
  ${facts.map(([t, ic, bg], k) => `<div class="sticker" id="${id}-f${k}" style="left:90px;top:${420 + k * 118}px;background:${bg};font-size:36px"><div class="ico">${icon(ic)}</div>${t}</div>`).join("")}
  <div class="card abs" id="${id}-term" style="left:1180px;top:420px;width:650px;height:420px;background:#111;padding:26px 30px;font:500 26px/1.6 'Space Grotesk';color:#fff">
    <div style="color:${C.yellow}">$ npm test</div>
    ${["✓ pricing & GST split", "✓ discounts & limits", "✓ month-end billing dates", "✓ password rules", "✓ bank matching"].map((t, k) => `<div class="${id}tl" style="color:${C.green}">${t}</div>`).join("")}
    <div id="${id}-pass" style="margin-top:12px;font:900 44px/1 Inter;color:#fff">33 / 33 passed</div></div>`;
  const script = `
  pop(tl,"#${id}-ch",0.05,-2);
  const N=[1500,3000,15000,13000], T=[0.05,0.35,0.65,0.95], R=[-2,1.5,-1.5,2];
  for(let k=0;k<4;k++){ tl.fromTo("#${id}-c"+k,{opacity:0,y:-220,rotation:R[k]*4},{opacity:1,y:0,rotation:R[k],duration:0.65,ease:"back.out(1.4)"},T[k]);
    count(tl,"#${id}-n"+k,0,N[k],T[k]+0.1,0.9,(v)=>inr(v)); }
  const F=[${facts.map((f) => f2(L + f[3])).join(",")}];
  for(let k=0;k<4;k++) stamp(tl,"#${id}-f"+k,F[k],k%2?2:-2);
  tl.fromTo("#${id}-term",{opacity:0,x:500,rotation:5},{opacity:1,x:0,rotation:1,duration:0.7,ease:"expo.out"},${f2(L + 5.6)});
  tl.fromTo(".${id}tl",{opacity:0},{opacity:1,duration:0.05,stagger:0.12},${f2(L + 6.0)});
  tl.fromTo("#${id}-pass",{opacity:0,scale:1.5},{opacity:1,scale:1,duration:0.4,ease:"back.out(2)"},${f2(L + 6.75)});
  `;
  const sfx = [["whoosh-short", 0.1, 0.18], ...[0.05,0.35,0.65,0.95].map((t) => ["pop", t + 0.1, 0.22]), ...facts.map((f, k) => [k % 2 ? "click-soft" : "pop", L + f[3], 0.24]), ["typing", L + 6.0, 0.25], ["chime", L + 6.8, 0.2]];
  return { id, dur: 8.7, lead: L, ground: C.green, sfx, html: scene(id, { ground: C.green, body, script }) };
}

// 15 · End card
export function s15() {
  const L = 0.3, id = "s15";
  const team = ["Aman Xavier", "Anand S", "Abhinav SB", "Rahul VK"];
  const words = ["Subscriptions,", "finally", "under", "control."];
  const body = `
  <div class="abs" id="${id}-frame" style="left:260px;top:110px;width:1400px;height:800px;border:6px solid #fff;box-shadow:18px 18px 0 ${C.yellow};background:#111"></div>
  <div class="star" id="${id}-star" style="left:1530px;top:30px;width:220px;height:220px;background:#fff"><b style="background:${C.pink}"></b></div>
  <div id="${id}-tile" class="abs" style="left:370px;top:190px;width:170px;height:170px;background:#fff;border:4px solid #fff;display:flex;align-items:center;justify-content:center;font:900 124px/1 Inter;color:#111">B</div>
  <div class="abs" id="${id}-name" style="left:580px;top:202px;font:900 148px/1 Inter;letter-spacing:-0.045em;color:#fff">BRIGHTLOOP</div>
  <div class="abs" style="left:372px;top:410px;width:1200px;font:900 64px/1.08 Inter;letter-spacing:-0.02em;text-transform:uppercase;color:#fff">
    ${words.map((w, k) => `<span id="${id}-w${k}" style="display:inline-block;margin-right:20px;${k > 0 ? `color:${C.yellow}` : ""}">${w}</span>${k === 0 ? "<br>" : ""}`).join("")}</div>
  <div class="pill" id="${id}-url" style="left:372px;top:600px;background:${C.yellow};font-size:30px">${icon("bolt")} makeaton.vercel.app</div>
  <div class="abs label" id="${id}-by" style="left:372px;top:716px;color:#fff;font-size:28px">Built by</div>
  ${team.map((t, k) => `<div class="pill" id="${id}-t${k}" style="left:${372 + [0, 300, 560, 860][k]}px;top:764px;background:${[C.pink, C.blue, C.green, C.cream][k]};font-size:28px">${t}</div>`).join("")}`;
  const script = `
  tl.fromTo("#${id}-frame",{opacity:0,scale:0.9},{opacity:1,scale:1,duration:0.7,ease:"expo.out"},0.05);
  tl.fromTo("#${id}-tile",{opacity:0,y:-200,rotation:-25},{opacity:1,y:0,rotation:-5,duration:0.7,ease:"back.out(1.4)"},0.2);
  tl.fromTo("#${id}-name",{opacity:0,x:-40},{opacity:1,x:0,duration:0.7,ease:"expo.out"},${f2(L + 0.05)});
  tl.fromTo("#${id}-star",{scale:0,rotation:-60},{scale:1,rotation:10,duration:0.9,ease:"back.out(1.4)"},${f2(L + 0.5)});
  const W=[${[0.69, 1.67, 2.0, 2.35].map((t) => f2(L + t)).join(",")}];
  for(let k=0;k<4;k++) tl.fromTo("#${id}-w"+k,{opacity:0,y:30},{opacity:1,y:0,duration:0.45,ease:"expo.out"},W[k]);
  pop(tl,"#${id}-url",${f2(L + 3.0)},-2);
  tl.fromTo("#${id}-by",{opacity:0},{opacity:1,duration:0.4},${f2(L + 3.5)});
  const R=[-2,1.5,-1,2];
  for(let k=0;k<4;k++) pop(tl,"#${id}-t"+k,${f2(L + 3.6)}+k*0.14,R[k]);
  `;
  const sfx = [["impact-bass-1", L + 0.25, 0.24], ["sparkle", L + 0.6, 0.12], ["pop", L + 3.0, 0.24], ...team.map((t, k) => ["click-soft", L + 3.65 + k * 0.14, 0.2])];
  return { id, dur: 6.5, lead: L, ground: "#111", sfx, html: scene(id, { ground: "#111", body, script, dots: false }) };
}

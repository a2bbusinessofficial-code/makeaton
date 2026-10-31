import { C, icon, browser, cursorSVG, hls, chapter, column, scene } from "./lib.mjs";
const f2 = (v) => v.toFixed(2);
const colAnim = (id, T, L) => `
  tl.fromTo("#${id}-title",{opacity:0,x:60},{opacity:1,x:0,duration:0.6,ease:"expo.out"},0.15);
  const T=[${T.map((t) => f2(L + t)).join(",")}];
  for(let k=0;k<T.length;k++) slideIn(tl,"#${id}-r"+k,T[k],240,k%2?1:-1);`;

// 6 · Customers
export function s06() {
  const L = 0.3, id = "s06";
  const B = browser(`${id}b`, { left: 90, top: 150, w: 1180, H: 1603, full: ["d01-customers"], urls: ["makeaton.vercel.app/customers", "makeaton.vercel.app/customers/shah-exports"], shots: ["d01-customers", "d02-customers-search", "d03-gstin-invalid", "d04-customer-detail"] });
  const items = [["Search · pagination", "search", C.cream], ["Portal-login tag", "user-circle", "#fff"], ["GSTIN format-checked", "id-badge-2", C.pink], ["Live balance owed", "currency-rupee", C.green]];
  const T = [0.2, 0.9, 1.6, 3.6];
  const body = `${chapter(id, "users", "Customers")}
  ${B.html}${hls(id, 2)}
  ${column(id, "1,500 customers", items, { top: 150 })}`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,960,540,1,0,0);
  pop(tl,"#${id}-ch",0.05,-2); frameIn(tl,"#${id}b",0.05,{y:-160,r:2});
  ${colAnim(id, T, L)}
  zoom(tl,g,960,1300,1,${f2(L + 0.1)},1.2,"power2.inOut");
  swap(tl,g,0,1,${f2(L + 1.25)},"up"); zoom(tl,g,500,300,1.5,${f2(L + 1.25)},0.5);
  swap(tl,g,1,2,${f2(L + 1.75)}); zoom(tl,g,600,930,1.6,${f2(L + 1.75)},0.5);
  hl(tl,"#${id}-hl0",g,583,824,896,856,[600,930,1.6],${f2(L + 2.3)},1.2);
  hl(tl,"#${id}-hl1",g,258,1050,896,1080,[600,930,1.6],${f2(L + 2.6)},0.9);
  swap(tl,g,2,3,${f2(L + 3.5)},"whip"); url(tl,g,0,1,${f2(L + 3.5)}); zoom(tl,g,960,280,1.25,${f2(L + 3.5)},0.5);
  `;
  const sfx = [["whoosh-short", 0.1, 0.18], ...T.map((t, k) => [k % 2 ? "click-soft" : "pop", L + t + 0.05, 0.22]), ["whoosh", L + 0.2, 0.12], ["error", L + 2.4, 0.1], ["whoosh-short", L + 3.55, 0.16]];
  return { id, dur: 5.8, lead: L, ground: C.yellow, sfx, html: scene(id, { ground: C.yellow, body, script }) };
}

// 7 · Subscriptions
export function s07() {
  const L = 0.3, id = "s07";
  const B = browser(`${id}b`, { left: 90, top: 300, w: 1150, urls: ["makeaton.vercel.app/subscriptions/new", "makeaton.vercel.app/subscriptions/SUB-2026-02426", "makeaton.vercel.app/subscriptions/SUB-2026-00135", "makeaton.vercel.app/subscriptions/SUB-2026-01356"],
    shots: ["k01-new-quotation", "k02-draft", "k03-quotation-sent", "e05-quote-expired-blocked", "e06-discount-applied", "e07-discount-not-applied", "e08-paused", "e09-renewed"] });
  const tiles = [["Draft", 161, C.cream], ["Quotation", 166, C.blue], ["Confirmed", 153, C.pink], ["Active", 2285, C.green], ["Closed", 235, "#fff"]];
  const items = [["Start from a template", "file-text", C.cream], ["Five-step pipeline", "arrows-exchange", "#fff"], ["Expired quote blocked", "ban", C.pink], ["Live discount preview", "percentage", C.yellow], ["Pause · renew · close", "player-pause", C.green], ["Full audit timeline", "clock", "#fff"]];
  const T = [0.2, 1.5, 3.82, 5.64, 7.24, 9.0];
  const body = `${chapter(id, "calendar-repeat", "Subscriptions")}
  ${tiles
    .map(
      ([t, n, bg], k) => `<div class="card abs" id="${id}-t${k}" style="left:${500 + k * 274}px;top:40px;width:248px;height:120px;padding:14px 18px;background:${bg};box-shadow:7px 7px 0 #111">
      <div class="label">${t}</div><div id="${id}-n${k}" style="font:900 52px/1 Inter;letter-spacing:-0.03em;margin-top:12px">0</div></div>`,
    )
    .join("")}
  ${B.html}${hls(id, 2)}
  ${items.map(([t, ic, bg], k) => `<div class="row" id="${id}-r${k}" style="left:1310px;top:${300 + k * 100}px;width:540px;background:${bg}"><div class="tick">${icon(ic)}</div><div>${t}</div></div>`).join("")}
  <div class="sticker" id="${id}-blk" style="left:330px;top:640px;background:${C.pink};z-index:45;font-size:48px;border-width:6px"><div class="ico">${icon("ban")}</div>Expired → can't confirm</div>
  <div class="sticker" id="${id}-d1" style="left:160px;top:850px;background:${C.green};z-index:45;font-size:30px">− ₹3,747.50 on next invoice</div>
  <div class="sticker" id="${id}-d2" style="left:160px;top:850px;background:${C.cream};z-index:45;font-size:30px">Not applied: below minimum quantity</div>`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,577,330,1.5,0,0);
  pop(tl,"#${id}-ch",0.05,-2); frameIn(tl,"#${id}b",0.1,{y:200,r:-2});
  const N=[${tiles.map((t) => t[1]).join(",")}];
  for(let k=0;k<5;k++){ tl.fromTo("#${id}-t"+k,{opacity:0,y:-160,rotation:k%2?6:-6},{opacity:1,y:0,rotation:k%2?1:-1,duration:0.6,ease:"back.out(1.5)"},0.1+k*0.08);
    count(tl,"#${id}-n"+k,0,N[k],0.3+k*0.08,1.1,(v)=>inr(v)); }
  for(let k=0;k<4;k++) tl.fromTo("#${id}-t"+k,{scale:1},{scale:1.1,duration:0.18,yoyo:true,repeat:1,ease:"power2.out"},${f2(L + 1.6)}+k*0.28);
  const T=[${T.map((t) => f2(L + t)).join(",")}];
  for(let k=0;k<6;k++) slideIn(tl,"#${id}-r"+k,T[k],260,k%2?1:-1);
  swap(tl,g,0,1,${f2(L + 1.05)}); url(tl,g,0,1,${f2(L + 1.05)}); zoom(tl,g,960,280,1.15,${f2(L + 1.05)},0.6);
  swap(tl,g,1,2,${f2(L + 2.2)});
  hl(tl,"#${id}-hl0",g,240,72,596,100,[960,280,1.15],${f2(L + 2.3)},1.2);
  swap(tl,g,2,3,${f2(L + 3.7)},"whip"); url(tl,g,1,2,${f2(L + 3.7)}); zoom(tl,g,1450,200,1.3,${f2(L + 3.7)},0.5);
  stamp(tl,"#${id}-blk",${f2(L + 4.0)},-5); out(tl,"#${id}-blk",${f2(L + 5.35)},-40);
  swap(tl,g,3,4,${f2(L + 5.5)},"whip"); url(tl,g,2,0,${f2(L + 5.5)}); zoom(tl,g,1725,250,2.0,${f2(L + 5.5)},0.6);
  hl(tl,"#${id}-hl1",g,1565,168,1890,210,[1725,250,2.0],${f2(L + 6.0)},1.3);
  stamp(tl,"#${id}-d1",${f2(L + 5.9)},-2); out(tl,"#${id}-d1",${f2(L + 6.6)});
  swap(tl,g,4,5,${f2(L + 6.6)}); url(tl,g,0,3,${f2(L + 6.6)}); stamp(tl,"#${id}-d2",${f2(L + 6.7)},2); out(tl,"#${id}-d2",${f2(L + 7.4)});
  swap(tl,g,5,6,${f2(L + 7.4)},"up"); zoom(tl,g,1650,120,1.8,${f2(L + 7.4)},0.5);
  swap(tl,g,6,7,${f2(L + 8.3)}); zoom(tl,g,960,250,1.3,${f2(L + 8.3)},0.5);
  zoom(tl,g,1725,640,1.9,${f2(L + 9.0)},0.7);
  `;
  const sfx = [["whoosh-short", 0.1, 0.18], ...[0, 1, 2, 3, 4].map((k) => ["click-soft", 0.15 + k * 0.08, 0.14]), ...[0, 1, 2, 3].map((k) => ["key-press", L + 1.6 + k * 0.28, 0.4]), ...T.map((t, k) => [k % 2 ? "click-soft" : "pop", L + t + 0.05, 0.2]),
    ["impact-bass-1", L + 4.0, 0.2], ["error", L + 4.1, 0.1], ["pop", L + 5.9, 0.24], ["pop", L + 6.7, 0.24], ["whoosh-short", L + 7.45, 0.14]];
  return { id, dur: 10.8, lead: L, ground: C.blue, sfx, html: scene(id, { ground: C.blue, body, script }) };
}

// 8 · Billing
export function s08() {
  const L = 0.3, id = "s08";
  const B = browser(`${id}b`, { left: 90, top: 150, w: 1220, urls: ["makeaton.vercel.app/billing"], shots: ["f01-billing-preview", "f02-billing-run", "f03-billing-run-again"] });
  const body = `${chapter(id, "player-play", "Billing day")}
  ${B.html}${hls(id, 1)}
  ${Array.from({ length: 14 }, (_, k) => `<div class="card abs ${id}i" id="${id}-i${k}" style="left:0;top:0;width:140px;height:178px;padding:13px;box-shadow:5px 5px 0 #111;z-index:${25 + k};background:${[C.paper, "#fff", C.cream][k % 3]}">
      <div style="font:900 17px/1 Inter">INV</div><div style="height:8px;background:#111;margin:10px 0 8px;width:80%"></div>
      <div style="height:6px;background:#bbb;margin:6px 0;width:90%"></div><div style="height:6px;background:#bbb;margin:6px 0;width:70%"></div><div style="height:6px;background:#bbb;margin:6px 0;width:85%"></div>
      <div style="margin-top:20px;height:20px;background:${C.green};border:2px solid #111;width:60%"></div></div>`).join("")}
  <div class="card abs" id="${id}-cnt" style="left:1380px;top:150px;width:470px;padding:26px 30px;background:${C.blue};z-index:40">
    <div class="label">Invoices created</div><div id="${id}-n" style="font:900 150px/1 Inter;letter-spacing:-0.04em;margin-top:10px">0</div>
    <div id="${id}-amt" style="font:800 32px/1 Inter;margin-top:12px">₹12,88,400 incl. GST</div></div>
  <div class="sticker" id="${id}-pv" style="left:1380px;top:560px;background:${C.cream};z-index:40;font-size:30px"><div class="ico">${icon("search")}</div><div>Dry-run preview<small>NOTHING WRITTEN YET</small></div></div>
  <div class="abs" id="${id}-stamp" style="left:330px;top:560px;z-index:45;padding:18px 34px;border:7px solid #111;background:${C.pink};box-shadow:12px 12px 0 #111;font:900 106px/1 Inter;letter-spacing:-0.03em;text-transform:uppercase;white-space:nowrap">0 duplicates</div>
  <div class="pill" id="${id}-db" style="left:380px;top:760px;background:#fff;z-index:46">${icon("database-cog")} Database-enforced · catches up missed periods</div>
  ${cursorSVG(`${id}-cur`)}`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,960,540,1,0,0);
  pop(tl,"#${id}-ch",0.05,-2); frameIn(tl,"#${id}b",0.05,{y:-180,r:2});
  tl.fromTo("#${id}-cnt",{opacity:0,x:500},{opacity:1,x:0,duration:0.8,ease:"expo.out"},0.25);
  tl.set("#${id}-amt",{opacity:0},0);
  zoom(tl,g,1060,130,1.6,${f2(L + 0.9)},0.6);
  hl(tl,"#${id}-hl0",g,796,73,1895,165,[1060,130,1.6],${f2(L + 1.1)},0.9);
  stamp(tl,"#${id}-pv",${f2(L + 1.1)},-2);
  zoom(tl,g,960,540,1,${f2(L + 1.85)},0.4,"power2.in");
  const b=pt(g,303,360,[960,540,1]);
  tl.fromTo("#${id}-cur",{x:900,y:1000,opacity:0},{opacity:1,duration:0.2},${f2(L + 1.6)});
  click(tl,"#${id}-cur",b[0],b[1],${f2(L + 2.35)},0.55);
  swap(tl,g,0,1,${f2(L + 2.42)});
  const R=[-8,6,-4,9,-6,3,-10,5,-3,7,-5,4,-7,6];
  for(let k=0;k<14;k++) tl.fromTo("#${id}-i"+k,{x:b[0]-40,y:b[1]-60,scale:0.3,rotation:0,opacity:0},{x:1390+(k%4)*100,y:400+Math.floor(k/4)*26+(k%2)*12,scale:0.85,rotation:R[k],opacity:1,duration:0.7,ease:"power3.out"},${f2(L + 2.45)}+k*0.06);
  count(tl,"#${id}-n",0,79,${f2(L + 2.55)},1.3,(v)=>Math.round(v));
  tl.fromTo("#${id}-amt",{opacity:0,y:20},{opacity:1,y:0,duration:0.4,ease:"expo.out"},${f2(L + 3.8)});
  out(tl,"#${id}-pv",${f2(L + 2.3)});
  tl.to(".${id}i",{y:"+=50",opacity:0,duration:0.3,stagger:0.015,ease:"power2.in"},${f2(L + 4.4)});
  click(tl,"#${id}-cur",b[0],b[1],${f2(L + 5.35)},0.45);
  swap(tl,g,1,2,${f2(L + 5.42)});
  tl.to("#${id}-n",{opacity:0.25,duration:0.2},${f2(L + 5.45)});
  stamp(tl,"#${id}-stamp",${f2(L + 6.05)},-7);
  pop(tl,"#${id}-db",${f2(L + 6.6)},2);
  `;
  const sfx = [["whoosh", 0.1, 0.18], ["pop", L + 1.1, 0.24], ["click", L + 2.35, 0.42], ["whoosh", L + 2.5, 0.24], ["ping", L + 3.85, 0.14], ["click", L + 5.35, 0.42], ["impact-bass-1", L + 6.05, 0.28], ["pop", L + 6.6, 0.22]];
  return { id, dur: 8.4, lead: L, ground: C.pink, sfx, html: scene(id, { ground: C.pink, body, script }) };
}

// 9 · Invoices
export function s09() {
  const L = 0.3, id = "s09";
  const B = browser(`${id}b`, { left: 90, top: 150, w: 1180, urls: ["makeaton.vercel.app/invoices", "makeaton.vercel.app/invoices/INV-2026-09730", "makeaton.vercel.app/print/invoices/INV-2026-14432"], shots: ["g01-invoices-totals", "g03-invoice-cgst-sgst", "g07-invoice-print"] });
  const items = [["Totals bar · filters", "chart-bar", C.cream], ["Export CSV", "table-export", "#fff"], ["CGST + SGST or IGST", "receipt-tax", C.green], ["Gap-free numbers", "file-invoice", C.blue], ["Send by email", "mail", C.pink], ["Print · save as PDF", "download", C.yellow]];
  const T = [0.2, 0.9, 1.2, 3.22, 4.8, 5.8];
  const body = `${chapter(id, "file-invoice", "Invoices")}
  ${B.html}${hls(id, 3)}
  ${column(id, "GST tax invoices", items, { top: 140 })}
  <div class="sticker" id="${id}-gst" style="left:180px;top:850px;background:${C.green};z-index:45;font-size:32px">Same state → CGST 9% + SGST 9%</div>`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,960,540,1,0,0);
  pop(tl,"#${id}-ch",0.05,-2); frameIn(tl,"#${id}b",0.05,{x:-300,r:-2});
  ${colAnim(id, T, L)}
  zoom(tl,g,500,160,2.1,${f2(L + 0.1)},0.6);
  hl(tl,"#${id}-hl0",g,250,150,735,172,[500,160,2.1],${f2(L + 0.5)},0.8);
  zoom(tl,g,1700,50,2.0,${f2(L + 0.85)},0.4);
  hl(tl,"#${id}-hl1",g,1798,16,1895,48,[1700,50,2.0],${f2(L + 1.0)},0.3);
  swap(tl,g,0,1,${f2(L + 1.35)},"whip"); url(tl,g,0,1,${f2(L + 1.35)}); zoom(tl,g,1100,560,2.1,${f2(L + 1.35)},0.6);
  hl(tl,"#${id}-hl2",g,950,543,1245,592,[1100,560,2.1],${f2(L + 1.9)},1.2);
  stamp(tl,"#${id}-gst",${f2(L + 2.0)},-2); out(tl,"#${id}-gst",${f2(L + 3.1)});
  zoom(tl,g,1150,170,2.4,${f2(L + 3.1)},0.6);
  hl(tl,"#${id}-hl0",g,1090,150,1245,180,[1150,170,2.4],${f2(L + 3.5)},1.1);
  zoom(tl,g,1700,40,2.2,${f2(L + 4.65)},0.5);
  hl(tl,"#${id}-hl1",g,1620,16,1820,48,[1700,40,2.2],${f2(L + 4.9)},0.8);
  swap(tl,g,1,2,${f2(L + 5.75)},"up"); url(tl,g,1,2,${f2(L + 5.75)}); zoom(tl,g,960,420,1.2,${f2(L + 5.75)},0.5);
  `;
  const sfx = [["whoosh-short", 0.1, 0.18], ...T.map((t, k) => [k % 2 ? "click-soft" : "pop", L + t + 0.05, 0.2]), ["whoosh", L + 1.4, 0.16], ["pop", L + 2.0, 0.24], ["whoosh-short", L + 5.8, 0.16]];
  return { id, dur: 7.1, lead: L, ground: C.cream, sfx, html: scene(id, { ground: C.cream, body, script }) };
}

// 10 · Payments + bank reconciliation
export function s10() {
  const L = 0.3, id = "s10";
  const B = browser(`${id}b`, { left: 90, top: 150, w: 1180, urls: ["makeaton.vercel.app/invoices/INV-2026-14432", "makeaton.vercel.app/payments/reconcile"], shots: ["g05-record-payment", "g06-invoice-paid", "h02-reconcile-upload", "h03-reconcile-file", "h04-reconcile-matches", "h05-reconcile-recorded"] });
  const items = [["Any payment method", "credit-card", C.cream], ["Partly paid → paid", "check", C.green], ["Upload bank CSV", "file-spreadsheet", "#fff"], ["Match by invoice no.", "receipt", C.blue], ["…or name + amount", "search", C.yellow], ["Record all, one click", "building-bank", C.pink]];
  const T = [0.2, 1.2, 2.4, 4.35, 5.2, 7.17];
  const body = `${chapter(id, "building-bank", "Payments & bank reconciliation")}
  ${B.html}${hls(id, 2)}
  ${column(id, "Money in", items, { top: 140 })}
  ${cursorSVG(`${id}-cur`)}
  <div class="sticker" id="${id}-ok" style="left:200px;top:820px;background:${C.green};z-index:45;font-size:40px"><div class="ico">${icon("building-bank")}</div><div>5 payments · ₹2,42,480<small>NEVER MATCHES TWICE · NEVER GUESSES</small></div></div>`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,1300,260,1.35,0,0);
  pop(tl,"#${id}-ch",0.05,-2); frameIn(tl,"#${id}b",0.05,{y:180,r:2});
  ${colAnim(id, T, L)}
  const p1=pt(g,1635,339,[1300,260,1.35]);
  tl.fromTo("#${id}-cur",{x:1000,y:1000,opacity:0},{opacity:1,duration:0.2},0.25);
  click(tl,"#${id}-cur",p1[0],p1[1],${f2(L + 0.95)},0.6);
  swap(tl,g,0,1,${f2(L + 1.02)}); zoom(tl,g,1050,330,1.6,${f2(L + 1.1)},0.6);
  hl(tl,"#${id}-hl0",g,1150,150,1250,200,[1050,330,1.6],${f2(L + 1.5)},0.9);
  swap(tl,g,1,2,${f2(L + 2.4)},"whip"); url(tl,g,0,1,${f2(L + 2.4)}); zoom(tl,g,700,200,1.7,${f2(L + 2.4)},0.5);
  const p2=pt(g,307,200,[700,200,1.7]), p3=pt(g,613,200,[700,200,1.7]);
  click(tl,"#${id}-cur",p2[0],p2[1],${f2(L + 3.1)},0.5);
  swap(tl,g,2,3,${f2(L + 3.15)});
  click(tl,"#${id}-cur",p3[0],p3[1],${f2(L + 3.75)},0.4);
  swap(tl,g,3,4,${f2(L + 3.85)}); zoom(tl,g,1150,420,1.25,${f2(L + 3.9)},0.6);
  hl(tl,"#${id}-hl0",g,1700,340,1820,512,[1150,420,1.25],${f2(L + 4.5)},1.4);
  hl(tl,"#${id}-hl1",g,1045,340,1460,512,[1150,420,1.25],${f2(L + 5.3)},1.0);
  zoom(tl,g,1600,300,1.6,${f2(L + 6.3)},0.6);
  const p4=pt(g,1754,276,[1600,300,1.6]);
  click(tl,"#${id}-cur",p4[0],p4[1],${f2(L + 7.1)},0.5);
  swap(tl,g,4,5,${f2(L + 7.2)}); zoom(tl,g,960,300,1.2,${f2(L + 7.25)},0.5);
  tl.to("#${id}-cur",{opacity:0,duration:0.2},${f2(L + 7.6)});
  stamp(tl,"#${id}-ok",${f2(L + 7.5)},-2);
  `;
  const sfx = [["whoosh-short", 0.1, 0.18], ...T.map((t, k) => [k % 2 ? "click-soft" : "pop", L + t + 0.05, 0.2]), ["click", L + 0.95, 0.38], ["chime", L + 1.3, 0.14], ["whoosh", L + 2.45, 0.16],
    ["click", L + 3.1, 0.36], ["click", L + 3.75, 0.36], ["sparkle", L + 4.0, 0.1], ["click", L + 7.1, 0.38], ["impact-bass-1", L + 7.5, 0.24]];
  return { id, dur: 9.0, lead: L, ground: C.green, sfx, html: scene(id, { ground: C.green, body, script }) };
}

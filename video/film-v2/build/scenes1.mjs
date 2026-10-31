import { C, icon, browser, cursorSVG, hls, chapter, column, scene } from "./lib.mjs";
const f2 = (v) => v.toFixed(2);

// 1 · Intro
export function s01() {
  const L = 0.5, id = "s01";
  const nodes = [["Sign-up", "user-plus", C.pink], ["Plans", "box", C.cream], ["Quotes", "file-text", "#fff"], ["Subscriptions", "calendar-repeat", C.blue], ["Invoices", "file-invoice", C.cream], ["Payments", "credit-card", C.green], ["Revenue", "chart-bar", C.pink]];
  const W = 222, G = 34, X0 = (1920 - (7 * W + 6 * G)) / 2;
  const body = `
  <div class="star" id="${id}-star" style="left:1560px;top:70px;width:240px;height:240px"><b style="background:${C.pink}"></b></div>
  <div class="stripes" id="${id}-str" style="left:80px;top:90px;width:300px;height:96px;background-color:${C.blue}"></div>
  <div id="${id}-tile" class="abs" style="left:330px;top:250px;width:200px;height:200px;background:#111;border:4px solid #111;box-shadow:12px 12px 0 #fff;display:flex;align-items:center;justify-content:center;font:900 144px/1 Inter;color:#fff">B</div>
  <div class="abs h1" style="left:575px;top:265px;font-size:162px;letter-spacing:-0.045em">${"BRIGHTLOOP".split("").map((c, i) => `<span class="${id}l" id="${id}-l${i}" style="display:inline-block">${c}</span>`).join("")}</div>
  <div class="pill" id="${id}-tag" style="left:580px;top:460px;background:#fff">${icon("bolt")} Subscription management system</div>
  <div class="abs" id="${id}-rail" style="left:${X0}px;top:836px;width:${7 * W + 6 * G}px;height:12px;background:#111;transform-origin:0 50%"></div>
  ${nodes
    .map(
      ([t, ic, bg], k) => `<div class="card abs" id="${id}-n${k}" style="left:${X0 + k * (W + G)}px;top:620px;width:${W}px;height:180px;background:${bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;box-shadow:7px 7px 0 #111">
      <img src="assets/icons/${ic}.svg" style="width:56px;height:56px" alt=""><div style="font:900 25px/1 Inter;text-transform:uppercase;letter-spacing:-0.01em">${t}</div></div>`,
    )
    .join("")}`;
  const script = `
  tl.fromTo("#${id}-tile",{y:-560,rotation:-30},{y:0,rotation:-6,duration:0.75,ease:"back.out(1.3)"},0.02);
  tl.fromTo(".${id}l",{y:110,opacity:0},{y:0,opacity:1,duration:0.55,ease:"expo.out",stagger:0.035},${f2(L + 0.2)});
  tl.fromTo("#${id}-star",{scale:0,rotation:-60},{scale:1,rotation:10,duration:0.9,ease:"back.out(1.4)"},0.15);
  tl.fromTo("#${id}-str",{x:-420},{x:0,duration:0.8,ease:"expo.out"},0.1);
  pop(tl,"#${id}-tag",${f2(L + 1.1)},-2);
  for(let k=0;k<7;k++) tl.fromTo("#${id}-n"+k,{opacity:0,y:120,rotation:k%2?6:-6},{opacity:1,y:0,rotation:k%2?1.5:-1.5,duration:0.6,ease:"back.out(1.5)"},${f2(L + 1.3)}+k*0.3);
  tl.fromTo("#${id}-rail",{scaleX:0},{scaleX:1,duration:1.5,ease:"power2.inOut"},${f2(L + 4.2)});
  tl.fromTo("#${id}-n0",{scale:1},{scale:1.12,duration:0.25,yoyo:true,repeat:1,ease:"power2.out"},${f2(L + 4.3)});
  tl.fromTo("#${id}-n6",{scale:1},{scale:1.15,duration:0.25,yoyo:true,repeat:1,ease:"power2.out"},${f2(L + 5.6)});
  `;
  const sfx = [["impact-bass-1", 0.62, 0.3], ["sparkle", 0.35, 0.12], ...[0, 1, 2, 3, 4, 5, 6].map((k) => [k % 2 ? "click-soft" : "pop", L + 1.35 + k * 0.3, 0.22]), ["whoosh", L + 4.25, 0.2], ["ping", L + 5.65, 0.14]];
  return { id, dur: 7.3, lead: L, ground: C.yellow, sfx, html: scene(id, { ground: C.yellow, body, script }) };
}

// 2 · Sign-up
export function s02() {
  const L = 0.3, id = "s02";
  const B = browser(`${id}b`, { left: 90, top: 150, w: 1180, urls: ["makeaton.vercel.app/signup", "makeaton.vercel.app/portal"], shots: ["a04-signup-weak", "a05-signup-strong", "a06-signup-duplicate", "a07-check-inbox", "a08-auto-signed-in-portal"] });
  const items = [["Live password checklist", "checklist", C.cream], ["Checked again on server", "shield-lock", "#fff"], ["One account per email", "id-badge-2", C.blue], ["Real confirmation email", "mail-check", C.yellow], ["Confirm on any device", "phone-check", C.green], ["Resend email", "refresh", "#fff"]];
  const T = [0.4, 1.3, 2.73, 4.7, 7.0, 8.6];
  const body = `${chapter(id, "user-plus", "Accounts · sign-up")}
  ${B.html}${hls(id, 2)}
  ${column(id, "Sign up in<br>seconds", items, { top: 140 })}
  <div class="sticker" id="${id}-dup" style="left:150px;top:840px;background:${C.yellow};z-index:40"><div class="ico">${icon("id-badge-2")}</div><div>A@x.com = a@x.com<small>CAPITALS &amp; SPACES IGNORED</small></div></div>
  <div class="abs" id="${id}-phone" style="left:1000px;top:300px;width:330px;height:640px;background:#111;border:4px solid #111;border-radius:44px;padding:16px;box-shadow:12px 12px 0 #111;z-index:45">
    <div style="position:relative;width:100%;height:100%;border-radius:30px;overflow:hidden;background:#fff">
      <div style="position:relative;z-index:2;height:46px;background:${C.paper};border-bottom:3px solid #111;display:flex;align-items:center;gap:8px;padding:0 14px;font:700 16px 'Space Grotesk'"><img src="assets/icons/mail.svg" style="width:22px" alt="">INBOX</div>
      <img src="assets/emails/m-email-confirmation.png" style="position:absolute;left:-127px;top:22px;width:544px;max-width:none" alt="">
      <div id="${id}-ok" style="position:absolute;inset:0;background:${C.green};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;font:900 34px/1 Inter;text-transform:uppercase"><div class="tick" style="width:90px;height:90px"><img src="assets/icons/check.svg" style="width:60px;height:60px" alt=""></div>Confirmed</div>
    </div></div>
  ${cursorSVG(`${id}-cur`)}
  <div class="sticker" id="${id}-auto" style="left:200px;top:830px;background:${C.green};z-index:50"><div class="ico">${icon("device-laptop")}</div><div>Laptop signed in by itself<small>CHECKS EVERY 3 S · AND ON TAB RETURN</small></div></div>`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,960,540,1.7,0,0);
  pop(tl,"#${id}-ch",0.05,-2); frameIn(tl,"#${id}b",0.05,{y:160,r:-3});
  tl.fromTo("#${id}-title",{opacity:0,x:60},{opacity:1,x:0,duration:0.6,ease:"expo.out"},0.15);
  const T=[${T.map((t) => f2(L + t)).join(",")}];
  for(let k=0;k<6;k++) slideIn(tl,"#${id}-r"+k,T[k],240,k%2?1:-1);
  swap(tl,g,0,1,${f2(L + 1.0)});
  swap(tl,g,1,2,${f2(L + 2.6)}); zoom(tl,g,960,640,1.7,${f2(L + 2.6)},0.6);
  stamp(tl,"#${id}-dup",${f2(L + 2.9)},-3); tl.to("#${id}b",{x:-12,duration:0.05,repeat:5,yoyo:true,ease:"none"},${f2(L + 2.9)});
  out(tl,"#${id}-dup",${f2(L + 4.4)});
  swap(tl,g,2,3,${f2(L + 4.5)},"up"); zoom(tl,g,960,560,1.9,${f2(L + 4.5)},0.7);
  hl(tl,"#${id}-hl0",g,788,620,990,652,[960,560,1.9],${f2(L + 5.2)},1.6);
  tl.fromTo("#${id}-phone",{opacity:0,x:500,rotation:14},{opacity:1,x:0,rotation:4,duration:0.75,ease:"expo.out"},${f2(L + 6.6)});
  tl.set("#${id}-ok",{opacity:0},0);
  tl.fromTo("#${id}-cur",{x:1400,y:1000,opacity:0},{opacity:1,duration:0.15},${f2(L + 6.9)});
  click(tl,"#${id}-cur",1077,481,${f2(L + 7.55)},0.55);
  tl.to("#${id}-ok",{opacity:1,duration:0.2},${f2(L + 7.65)});
  tl.fromTo("#${id}-ok .tick",{scale:0.2},{scale:1,duration:0.45,ease:"back.out(2.2)"},${f2(L + 7.65)});
  tl.to("#${id}-cur",{opacity:0,duration:0.2},${f2(L + 7.9)});
  swap(tl,g,3,4,${f2(L + 8.0)},"whip"); url(tl,g,0,1,${f2(L + 8.0)}); zoom(tl,g,960,300,1.35,${f2(L + 8.0)},0.6);
  tl.to("#${id}-phone",{x:520,rotation:16,opacity:0,duration:0.45,ease:"power3.in"},${f2(L + 8.6)});
  stamp(tl,"#${id}-auto",${f2(L + 8.3)},-2);
  `;
  const sfx = [["whoosh-short", 0.1, 0.18], ...T.map((t, k) => [k % 2 ? "click-soft" : "pop", L + t + 0.05, 0.22]), ["chime", L + 1.1, 0.12],
    ["error", L + 2.95, 0.12], ["notification", L + 4.6, 0.14], ["whoosh", L + 6.65, 0.2], ["click", L + 7.55, 0.38], ["chime", L + 7.7, 0.18], ["impact-bass-1", L + 8.3, 0.2]];
  return { id, dur: 10.5, lead: L, ground: C.pink, sfx, html: scene(id, { ground: C.pink, body, script }) };
}

// 3 · Login & recovery
export function s03() {
  const L = 0.3, id = "s03";
  const B = browser(`${id}b`, { left: 90, top: 170, w: 1000, urls: ["makeaton.vercel.app/login", "makeaton.vercel.app/forgot-password", "makeaton.vercel.app/reset-password"], shots: ["a03-login-invalid", "a09-login-unconfirmed", "a10-forgot-neutral", "l13-reset-same-password"] });
  const mails = [["m-email-confirmation", "Confirm sign-up", C.pink, -4], ["m-email-recovery", "Reset password", C.blue, 3], ["m-email-invite", "Staff invite", C.green, -2], ["m-email-email_change", "Email change", C.yellow, 4]];
  const body = `${chapter(id, "key", "Login & recovery")}
  ${B.html}
  <div class="sticker" id="${id}-gen" style="left:140px;top:820px;background:${C.yellow};z-index:40"><div class="ico">${icon("shield-lock")}</div><div>"Invalid email or password"<small>NEVER REVEALS WHO HAS AN ACCOUNT</small></div></div>
  <div class="sticker" id="${id}-same" style="left:140px;top:820px;background:${C.pink};z-index:40"><div class="ico">${icon("ban")}</div><div>Same rules · no reusing old password</div></div>
  ${mails
    .map(
      ([img, t, bg], k) => `<div class="abs" id="${id}-m${k}" style="left:${1170 + (k % 2) * 360}px;top:${170 + Math.floor(k / 2) * 380}px;width:330px;z-index:${30 + k}">
      <div class="card" style="width:330px;height:270px;overflow:hidden;box-shadow:8px 8px 0 #111"><img src="assets/emails/${img}.png" style="width:619px;max-width:none;display:block;margin-left:-144px;margin-top:-20px" alt=""></div>
      <div class="pill" style="position:relative;display:inline-flex;margin-top:16px;background:${bg};font-size:22px">${icon("mail")} ${t}</div></div>`,
    )
    .join("")}
  <div class="sticker" id="${id}-chg" style="left:1210px;top:900px;background:#fff;z-index:40;font-size:30px"><div class="ico">${icon("mail-check")}</div>"Your password was changed"</div>`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,960,430,1.8,0,0);
  pop(tl,"#${id}-ch",0.05,-2); frameIn(tl,"#${id}b",0.05,{x:-260,r:-2});
  stamp(tl,"#${id}-gen",${f2(L + 0.7)},-2);
  swap(tl,g,0,1,${f2(L + 1.45)},"up");
  out(tl,"#${id}-gen",${f2(L + 2.2)});
  swap(tl,g,1,2,${f2(L + 2.3)},"whip"); url(tl,g,0,1,${f2(L + 2.3)}); zoom(tl,g,960,400,1.8,${f2(L + 2.3)},0.5);
  swap(tl,g,2,3,${f2(L + 3.3)},"whip"); url(tl,g,1,2,${f2(L + 3.3)}); zoom(tl,g,960,560,1.7,${f2(L + 3.3)},0.5);
  stamp(tl,"#${id}-same",${f2(L + 3.6)},2);
  const R=[-4,3,-2,4];
  for(let k=0;k<4;k++) tl.fromTo("#${id}-m"+k,{opacity:0,y:300,rotation:R[k]*4},{opacity:1,y:0,rotation:R[k],duration:0.7,ease:"back.out(1.3)"},${f2(L + 2.8)}+k*0.28);
  stamp(tl,"#${id}-chg",${f2(L + 5.0)},-2);
  `;
  const sfx = [["whoosh-short", 0.1, 0.18], ["pop", L + 0.7, 0.26], ["whoosh-short", L + 1.5, 0.14], ["whoosh", L + 2.35, 0.16], ["whoosh-short", L + 3.35, 0.16], ["pop", L + 3.6, 0.24],
    ...[0, 1, 2, 3].map((k) => ["click-soft", L + 2.85 + k * 0.28, 0.22]), ["notification", L + 5.0, 0.16]];
  return { id, dur: 7.1, lead: L, ground: C.blue, sfx, html: scene(id, { ground: C.blue, body, script }) };
}

// 4 · Roles & team
export function s04() {
  const L = 0.3, id = "s04";
  const B = browser(`${id}b`, { left: 640, top: 150, w: 1200, urls: ["makeaton.vercel.app/users", "makeaton.vercel.app/dashboard", "makeaton.vercel.app/portal", "makeaton.vercel.app/portal/invoices/someone-else"],
    shots: ["j02-staff-blocked-team", "l11-backoffice-redirect", "l12-other-invoice-404", "i02-team-invited", "i03-team-deactivated"] });
  const roles = [["Admin", "Everything", C.pink, "user-shield"], ["Staff", "Day-to-day work", C.green, "users"], ["Customer", "Portal · own data", C.yellow, "user-circle"]];
  const chips = [["Staff → sent to dashboard", C.cream], ["Customer → sent to portal", C.blue], ["Someone else's invoice → 404", C.pink], ["Invite staff by email", C.green], ["Deactivate = login blocked", C.yellow]];
  const body = `${chapter(id, "user-shield", "Roles & access")}
  ${roles
    .map(
      ([r, d, bg, ic], k) => `<div class="card abs" id="${id}-r${k}" style="left:90px;top:${180 + k * 210}px;width:480px;height:180px;background:${bg};padding:26px">
      <div class="pill" style="position:relative;display:inline-flex;background:#fff">${icon(ic)} ${r}</div>
      <div style="font:900 38px/1 Inter;text-transform:uppercase;letter-spacing:-0.02em;margin-top:22px;white-space:nowrap">${d}</div></div>`,
    )
    .join("")}
  ${B.html}
  ${chips.map(([t, bg], k) => `<div class="sticker" id="${id}-c${k}" style="left:700px;top:870px;background:${bg};z-index:40;font-size:32px">${t}</div>`).join("")}
  <div class="sticker" id="${id}-srv" style="left:980px;top:420px;background:#fff;z-index:45;font-size:52px;padding:22px 30px"><div class="ico" style="width:70px;height:70px">${icon("lock-check")}</div>Checked on the server</div>`;
  const script = `
  const g=${JSON.stringify(B.geo)};
  zoom(tl,g,140,280,2.2,0,0);
  pop(tl,"#${id}-ch",0.05,-2);
  const RT=[${[0, 1.05, 1.8].map((t) => f2(L + t)).join(",")}];
  for(let k=0;k<3;k++) tl.fromTo("#${id}-r"+k,{opacity:0,x:-500,rotation:-8},{opacity:1,x:0,rotation:k%2?1.5:-1.5,duration:0.7,ease:"expo.out"},RT[k]);
  frameIn(tl,"#${id}b",0.1,{x:400,r:4});
  const CT=[${[0.9, 1.9, 2.75, 5.3, 6.4].map((t) => f2(L + t)).join(",")}];
  for(let k=0;k<5;k++){ stamp(tl,"#${id}-c"+k,CT[k],k%2?2:-2); if(k<4) out(tl,"#${id}-c"+k,CT[k+1]-0.2); }
  swap(tl,g,0,1,CT[1]-0.1,"whip"); url(tl,g,1,2,CT[1]-0.1); zoom(tl,g,960,300,1.3,CT[1]-0.1,0.5);
  swap(tl,g,1,2,CT[2]-0.1); url(tl,g,2,3,CT[2]-0.1); zoom(tl,g,960,540,1.5,CT[2]-0.1,0.4);
  stamp(tl,"#${id}-srv",${f2(L + 3.6)},-4); out(tl,"#${id}-srv",${f2(L + 4.9)},-40);
  swap(tl,g,2,3,CT[3]-0.15,"up"); url(tl,g,3,0,CT[3]-0.15); zoom(tl,g,700,260,1.4,CT[3]-0.15,0.6);
  swap(tl,g,3,4,CT[4]-0.15); zoom(tl,g,1100,150,1.8,CT[4]-0.15,0.6);
  `;
  const sfx = [["whoosh-short", 0.1, 0.18], ...[0, 1.05, 1.8].map((t) => ["whoosh-short", L + t + 0.1, 0.16]), ...[0.9, 1.9, 2.75, 5.3, 6.4].map((t, k) => [k % 2 ? "click-soft" : "pop", L + t, 0.24]),
    ["glitch-3", L + 2.7, 0.12], ["impact-bass-1", L + 3.6, 0.2], ["click", L + 6.3, 0.3]];
  return { id, dur: 8.0, lead: L, ground: C.cream, sfx, html: scene(id, { ground: C.cream, body, script }) };
}

// 5 · Configuration carousel
export function s05() {
  const L = 0.3, id = "s05", FW = 1000, STEP = 1150, CX = (1920 - FW - 8) / 2;
  const frames = [
    ["c01-taxes-terms", "taxes", 650, 230, 1.6], ["c03-product-variants", "products/brightloop-crm", 1700, 210, 1.9], ["c05-plan-detail", "plans/diwali-offer", 577, 420, 1.7],
    ["c06-discounts", "discounts", 1060, 170, 1.45], ["c08-template-detail", "templates/smb-crm-monthly", 1100, 250, 1.35],
  ];
  const B = frames.map(([s, u], k) => browser(`${id}f${k}`, { left: k * STEP, top: 0, w: FW, urls: [`makeaton.vercel.app/${u}`], shots: [s] }));
  const stick = [["GST 18 · 12 · 5 · Exempt", "receipt-tax", C.cream, 0.3], ["Net 15 · 30 · 45 days", "calendar-time", C.blue, 1.83], ["Brand: Odoo +₹560", "box", C.yellow, 3.1], ["Daily → yearly · 4 rule switches", "toggle-right", C.pink, 4.15],
    ["Fixed/% · limits · usage counter", "percentage", C.cream, 5.3], ["One click → new quotation", "file-text", C.blue, 7.1]];
  const body = `${chapter(id, "database-cog", "Configuration · admin only", C.yellow)}
  <div class="abs" id="${id}-strip" style="left:${CX}px;top:250px;width:6000px;height:700px">${B.map((b) => b.html).join("")}</div>
  ${stick.map(([t, ic, bg], k) => `<div class="sticker" id="${id}-s${k}" style="left:${k === 1 ? 1180 : k % 2 ? 980 : 520}px;top:${k % 2 ? 150 : 140}px;background:${bg};z-index:40"><div class="ico">${icon(ic)}</div>${t}</div>`).join("")}
  <div class="pill" id="${id}-ro" style="left:1430px;top:930px;background:#fff;z-index:40">${icon("lock")} Staff: read-only</div>`;
  const arrive = [0, 2.75, 3.85, 5.0, 6.85];
  const script = `
  const G=${JSON.stringify(B.map((b) => b.geo))}; const F=${JSON.stringify(frames.map((f) => [f[2], f[3], f[4]]))};
  for(let k=0;k<5;k++) zoom(tl,G[k],960,540,1,0,0);
  pop(tl,"#${id}-ch",0.05,-2);
  tl.fromTo("#${id}-strip",{x:900,rotation:2},{x:0,rotation:0,duration:0.8,ease:"expo.out"},0.02);
  const A=[${arrive.map((t) => f2(t ? L + t : 0)).join(",")}];
  for(let k=0;k<5;k++){
    if(k>0) tl.to("#${id}-strip",{x:-k*${STEP},duration:0.55,ease:"power3.inOut"},A[k]-0.55);
    zoom(tl,G[k],F[k][0],F[k][1],F[k][2],A[k]+(k?0.05:0.45),0.6,"power3.out");
    if(k<4) zoom(tl,G[k],960,540,1,A[k+1]-0.75,0.3,"power2.in"); }
  const ST=[${stick.map((s) => f2(L + s[3])).join(",")}];
  for(let k=0;k<6;k++){ stamp(tl,"#${id}-s"+k,ST[k],k%2?2:-2); if(k<5) out(tl,"#${id}-s"+k,ST[k+1]-0.2+(k===0?1.3:0),-30); }
  pop(tl,"#${id}-ro",${f2(L + 8.2)},-2);
  `;
  const sfx = [["whoosh", 0.05, 0.2], ...arrive.slice(1).map((t, k) => [k % 2 ? "whoosh" : "whoosh-short", L + t - 0.3, 0.2]), ...stick.map((s, k) => [k % 2 ? "click-soft" : "pop", L + s[3], 0.24]), ["ping", L + 3.6, 0.12]];
  return { id, dur: 9.4, lead: L, ground: C.green, sfx, html: scene(id, { ground: C.green, body, script }) };
}

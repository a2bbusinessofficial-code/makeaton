// Shared design system + helpers for the Brightloop film (pastel neo-brutalism).
export const C = {
  ink: "#111111", paper: "#FFFBF2", white: "#FFFFFF",
  pink: "#FFB3E1", blue: "#AEE6FF", green: "#B8EFA2", yellow: "#FFDD72", cream: "#FFE7BA",
};

export const CSS = `
@font-face{font-family:"Inter";src:url("assets/fonts/inter-latin-500-normal.woff2") format("woff2");font-weight:500}
@font-face{font-family:"Inter";src:url("assets/fonts/inter-latin-700-normal.woff2") format("woff2");font-weight:700}
@font-face{font-family:"Inter";src:url("assets/fonts/inter-latin-800-normal.woff2") format("woff2");font-weight:800}
@font-face{font-family:"Inter";src:url("assets/fonts/inter-latin-900-normal.woff2") format("woff2");font-weight:900}
@font-face{font-family:"Space Grotesk";src:url("assets/fonts/space-grotesk-latin-500-normal.woff2") format("woff2");font-weight:500}
@font-face{font-family:"Space Grotesk";src:url("assets/fonts/space-grotesk-latin-700-normal.woff2") format("woff2");font-weight:700}
*{margin:0;padding:0;box-sizing:border-box}
.ground{position:absolute;inset:0}
.dots{position:absolute;inset:0;background-image:radial-gradient(rgba(0,0,0,.16) 1.6px,transparent 1.8px);background-size:30px 30px}
.abs{position:absolute}
.card{background:#fff;border:4px solid #111;box-shadow:10px 10px 0 #111}
.pill{position:absolute;display:flex;align-items:center;gap:12px;padding:12px 22px;border:3px solid #111;border-radius:999px;box-shadow:5px 5px 0 #111;font:700 24px/1 "Space Grotesk";letter-spacing:.08em;text-transform:uppercase;background:#fff;color:#111;white-space:nowrap}
.pill img{width:28px;height:28px}
.h1{font:900 84px/0.95 "Inter";letter-spacing:-0.03em;text-transform:uppercase;color:#111}
.h2{font:900 54px/1 "Inter";letter-spacing:-0.02em;text-transform:uppercase;color:#111}
.sticker{position:absolute;display:flex;align-items:center;gap:18px;padding:18px 26px;border:4px solid #111;box-shadow:8px 8px 0 #111;font:900 36px/1.05 "Inter";letter-spacing:-0.01em;text-transform:uppercase;color:#111;white-space:nowrap}
.sticker .ico{width:56px;height:56px;border:3px solid #111;background:#fff;display:flex;align-items:center;justify-content:center;flex:none}
.sticker .ico img{width:36px;height:36px}
.browser{position:absolute;background:#fff;border:4px solid #111;box-shadow:14px 14px 0 #111}
.browser .bar{height:52px;border-bottom:4px solid #111;display:flex;align-items:center;gap:10px;padding:0 16px;background:${C.paper}}
.browser .bar i{width:18px;height:18px;border:3px solid #111;display:block}
.browser .url{position:relative;margin-left:14px;flex:1;height:32px;border:3px solid #111;border-radius:999px;background:#fff;overflow:hidden}
.browser .url span{position:absolute;left:16px;top:0;line-height:26px;font:700 16px/26px "Space Grotesk";letter-spacing:.04em;color:#111}
.view{position:relative;overflow:hidden;background:#f7f7f7}
.shot{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0}
.shot img{position:absolute;left:0;top:0;width:1920px;height:1080px}
.cursor{position:absolute;left:0;top:0;width:46px;height:56px;z-index:50}
.star{position:absolute;clip-path:polygon(50% 0%,61% 30%,95% 20%,72% 47%,98% 75%,63% 70%,50% 100%,37% 70%,2% 75%,28% 47%,5% 20%,39% 30%);background:#111}
.star b{position:absolute;inset:7px;clip-path:inherit;display:block}
.stripes{position:absolute;border:4px solid #111;background:repeating-linear-gradient(45deg,#111 0 10px,transparent 10px 26px)}
.tick{display:inline-flex;width:44px;height:44px;border:3px solid #111;background:#fff;align-items:center;justify-content:center;flex:none}
.tick img{width:30px;height:30px}
.label{font:700 22px/1 "Space Grotesk";letter-spacing:.08em;text-transform:uppercase;color:#111}
`;

export const icon = (n) => `<img src="assets/icons/${n}.svg" alt="">`;

// Browser frame with stacked screenshots. Returns {html, geo}
export function browser(id, { left, top, w, urls, shots, z = 20 }) {
  const h = Math.round((w * 1080) / 1920);
  const html = `
  <div class="browser" id="${id}" style="left:${left}px;top:${top}px;width:${w + 8}px;z-index:${z}">
    <div class="bar"><i style="background:${C.pink}"></i><i style="background:${C.yellow}"></i><i style="background:${C.green}"></i>
      <div class="url">${urls.map((u, i) => `<span id="${id}-u${i}" style="opacity:${i ? 0 : 1}">${u}</span>`).join("")}</div></div>
    <div class="view" style="width:${w}px;height:${h}px"><div class="shot" id="${id}-shot">${shots
      .map((s, i) => `<img id="${id}-i${i}" src="assets/screens/${s}.png" style="opacity:${i ? 0 : 1}" alt="">`)
      .join("")}</div></div>
  </div>`;
  return { html, geo: { id, left, top, w, h, s: w / 1920 } };
}

export const cursorSVG = (id) => `<svg class="cursor" id="${id}" viewBox="0 0 46 56"><path d="M4 3 L4 46 L15 35 L23 53 L31 49 L23 32 L39 32 Z" fill="#111" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>`;

// JS helpers injected into every scene script (deterministic).
export const JS = `
const Z = {};
function zoomState(g, px, py, z){ const S=g.s*z; let x=g.w/2-px*S, y=g.h/2-py*S;
  x=Math.min(0,Math.max(g.w-1920*S,x)); y=Math.min(0,Math.max(g.h-1080*S,y)); return {S,x,y}; }
function zoom(tl, g, px, py, z, at, dur, ease){ const st=zoomState(g,px,py,z); Z[g.id]={px,py,z};
  if(dur===0){ tl.set("#"+g.id+"-shot",{scale:st.S,x:st.x,y:st.y},at); }
  else tl.to("#"+g.id+"-shot",{scale:st.S,x:st.x,y:st.y,duration:dur||0.9,ease:ease||"power3.inOut"},at); }
function pt(g, px, py, zs){ const st=zoomState(g,zs[0],zs[1],zs[2]); return [g.left+4+st.x+px*st.S, g.top+4+52+st.y+py*st.S]; }
function swap(tl, g, from, to, at, mode){ const a="#"+g.id+"-i"+from, b="#"+g.id+"-i"+to;
  if(mode==="whip"){ tl.to(a,{x:-260,opacity:0,duration:0.22,ease:"power3.in"},at); tl.fromTo(b,{x:260,opacity:0},{x:0,opacity:1,duration:0.38,ease:"expo.out"},at+0.16); }
  else { tl.to(a,{opacity:0,duration:0.25,ease:"none"},at); tl.fromTo(b,{opacity:0},{opacity:1,duration:0.25,ease:"none"},at); } }
function url(tl, g, from, to, at){ tl.to("#"+g.id+"-u"+from,{opacity:0,y:-14,duration:0.18},at); tl.fromTo("#"+g.id+"-u"+to,{opacity:0,y:14},{opacity:1,y:0,duration:0.25,ease:"power3.out"},at+0.1); }
function frameIn(tl, sel, at, from){ from=from||{y:140,rotation:3}; tl.fromTo(sel,{opacity:0,y:from.y||0,x:from.x||0,rotation:from.rotation||0},{opacity:1,y:0,x:0,rotation:0,duration:0.9,ease:"expo.out"},at); }
function stamp(tl, sel, at, rot){ rot=rot||0; tl.fromTo(sel,{opacity:0,scale:1.55,rotation:rot-7},{opacity:1,scale:1,rotation:rot,duration:0.5,ease:"back.out(1.5)"},at); }
function pop(tl, sel, at, rot){ rot=rot||0; tl.fromTo(sel,{opacity:0,scale:0.4,rotation:rot},{opacity:1,scale:1,rotation:rot,duration:0.45,ease:"back.out(1.8)"},at); }
function slideIn(tl, sel, at, dx, rot){ tl.fromTo(sel,{opacity:0,x:dx,rotation:rot||0},{opacity:1,x:0,rotation:rot||0,duration:0.7,ease:"expo.out"},at); }
function click(tl, cur, x, y, at, travel){ tl.to(cur,{x:x-4,y:y-3,duration:travel||0.7,ease:"power3.inOut"},at-(travel||0.7)-0.05);
  tl.to(cur,{scale:0.8,duration:0.07,ease:"power2.in"},at); tl.to(cur,{scale:1,duration:0.18,ease:"back.out(2)"},at+0.07); }
function count(tl, sel, from, to, at, dur, fmt){ const o={v:from}; tl.to(o,{v:to,duration:dur,ease:"power2.out",onUpdate:()=>{document.querySelector(sel).textContent=fmt(o.v);}},at); }
const inr=(v)=>Math.round(v).toLocaleString("en-IN");
`;

export function scene(id, { ground, body, script, dots = true }) {
  return `<template>
  <style>
    #root{position:absolute;inset:0;overflow:hidden;font-family:"Inter"}
    ${CSS}
  </style>
  <div id="root" data-composition-id="${id}" data-width="1920" data-height="1080" data-layout-allow-overlap>
    <div class="ground" style="background:${ground}"></div>
    ${dots ? '<div class="dots"></div>' : ""}
    ${body}
  </div>
  <script>
    (function(){
    const tl = gsap.timeline({ paused: true });
    ${JS}
    ${script}
    window.__timelines["${id}"] = tl;
    })();
  </script>
</template>
`;
}

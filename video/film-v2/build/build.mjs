// node build/build.mjs → index.html + compositions/*.html (+ prints music cut points)
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { C } from "./lib.mjs";
import { s01, s02, s03, s04, s05 } from "./scenes1.mjs";
import { s06, s07, s08, s09, s10 } from "./scenes2.mjs";
import { s11, s12, s13, s14, s15 } from "./scenes3.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const PEAK = { chime: 0.418, "click-soft": 0.073, click: 0.073, error: 0.745, "glitch-3": 1.823, "impact-bass-1": 0.073, notification: 0.229, ping: 0.324, pop: 0.12, riser: 3.472, sparkle: 0.027, typing: 0.0, whoosh: 0.162, "whoosh-short": 0.162, "key-press": 0.076 };
const DUR = { chime: 2.54, "click-soft": 0.37, click: 0.37, error: 1.62, "glitch-3": 3.1, "impact-bass-1": 2.12, notification: 2.46, ping: 1.32, pop: 0.72, riser: 10.03, sparkle: 1.8, typing: 1.54, whoosh: 0.57, "whoosh-short": 0.57, "key-press": 0.43 };
const VO = fs.readdirSync(ROOT + "assets/vo").sort().map((f) => +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", ROOT + "assets/vo/" + f]).toString().trim());

const scenes = [s01(), s02(), s03(), s04(), s05(), s06(), s07(), s08(), s09(), s10(), s11(), s12(), s13(), s14(), s15()];
fs.rmSync(ROOT + "compositions", { recursive: true, force: true });
fs.mkdirSync(ROOT + "compositions", { recursive: true });
let t = 0;
for (const s of scenes) { s.start = +t.toFixed(3); t += s.dur; fs.writeFileSync(`${ROOT}compositions/${s.id}.html`, s.html); }
const TOTAL = +t.toFixed(3);

// ---- transitions: four kinds, cycled ----
const kinds = ["slab-x", "bars", "slab-y", "shutter"];
const seams = scenes.slice(1).map((s, k) => ({ k, at: s.start, color: s.ground, kind: kinds[k % 4], rev: k % 8 >= 4 }));
const el = (w) => {
  if (w.kind.startsWith("slab")) return `<div class="slab" id="w${w.k}" style="background:${w.color}"><div class="band"></div></div>`;
  if (w.kind === "bars") return Array.from({ length: 6 }, (_, i) => `<div class="bar" id="w${w.k}b${i}" style="left:${i * 320}px;background:${w.color}"></div>`).join("");
  return `<div class="half" id="w${w.k}t" style="top:0;background:${w.color}"></div><div class="half" id="w${w.k}u" style="top:540px;background:${w.color}"></div>`;
};
const wipeHTML = `<template>
  <style>#root{position:absolute;inset:0;overflow:hidden;pointer-events:none}
  .slab{position:absolute;left:0;top:0;width:1920px;height:1080px;border:8px solid #111}
  .slab .band{position:absolute;left:0;right:0;top:495px;height:90px;border-top:6px solid #111;border-bottom:6px solid #111;background:repeating-linear-gradient(45deg,#111 0 12px,transparent 12px 30px)}
  .bar{position:absolute;top:0;width:320px;height:1080px;border:6px solid #111}
  .half{position:absolute;left:0;width:1920px;height:540px;border:8px solid #111}</style>
  <div id="root" data-composition-id="wipes" data-width="1920" data-height="1080" data-layout-ignore>
    ${seams.map(el).join("\n    ")}
  </div>
  <script>(function(){
    const tl = gsap.timeline({ paused: true });
    const W=${JSON.stringify(seams)};
    for(const w of W){
      if(w.kind==="slab-x"||w.kind==="slab-y"){ const ax=w.kind==="slab-x"?"x":"y", sg=w.rev?-1:1, size=ax==="x"?1960:1120;
        const a={},b={},c={}; a[ax]=sg*size; b[ax]=0; c[ax]=-sg*size;
        tl.set("#w"+w.k,a,0); tl.fromTo("#w"+w.k,a,Object.assign({duration:0.3,ease:"power3.in"},b),w.at-0.3); tl.to("#w"+w.k,Object.assign({duration:0.4,ease:"power3.out"},c),w.at); }
      else if(w.kind==="bars"){ for(let i=0;i<6;i++){ const id="#w"+w.k+"b"+i, d=(w.rev?5-i:i)*0.035;
        tl.set(id,{y:-1120},0); tl.fromTo(id,{y:-1120},{y:0,duration:0.26,ease:"power3.in"},w.at-0.3+d-0.06); tl.to(id,{y:1120,duration:0.36,ease:"power3.out"},w.at+d); } }
      else { tl.set("#w"+w.k+"t",{y:-560},0); tl.set("#w"+w.k+"u",{y:560},0);
        tl.fromTo("#w"+w.k+"t",{y:-560},{y:0,duration:0.28,ease:"power3.in"},w.at-0.28); tl.fromTo("#w"+w.k+"u",{y:560},{y:0,duration:0.28,ease:"power3.in"},w.at-0.28);
        tl.to("#w"+w.k+"t",{y:-560,duration:0.4,ease:"power3.out"},w.at+0.02); tl.to("#w"+w.k+"u",{y:560,duration:0.4,ease:"power3.out"},w.at+0.02); } }
    tl.set({},{},${TOTAL});
    window.__timelines["wipes"] = tl; })();</script>
</template>`;
fs.writeFileSync(ROOT + "compositions/wipes.html", wipeHTML);

// ---- audio ----
const audio = [];
scenes.forEach((s, k) => {
  const n = String(k + 1).padStart(2, "0");
  audio.push(`<audio id="vo${n}" class="clip" src="assets/vo/vo${n}.mp3" data-start="${(s.start + s.lead).toFixed(3)}" data-duration="${VO[k].toFixed(3)}" data-track-index="20" data-volume="1"></audio>`);
});
let sx = 0;
const place = (name, at, vol) => {
  const start = Math.max(0, at - PEAK[name] + 0.033);
  audio.push(`<audio id="fx${++sx}" class="clip" src="assets/sfx/${name}.mp3" data-start="${start.toFixed(3)}" data-duration="${DUR[name]}" data-track-index="${30 + sx}" data-volume="${vol}"></audio>`);
};
for (const s of scenes) for (const [name, at, vol] of s.sfx) place(name, s.start + at, vol);
seams.forEach((w, k) => place(k % 2 ? "whoosh" : "whoosh-short", w.at - 0.06, 0.15));
audio.push(`<audio id="music" class="clip" src="assets/music/flares-bed.mp3" data-start="0" data-duration="${TOTAL}" data-track-index="10" data-volume="1"></audio>`);

const hosts = scenes.map((s) => `<div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${s.start}" data-duration="${s.dur}" data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:1"></div>`);
const index = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Brightloop investor demo</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <style>*{margin:0;padding:0;box-sizing:border-box} html,body{width:1920px;height:1080px;overflow:hidden;background:${C.paper}}</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1920" data-height="1080">
      ${hosts.join("\n      ")}
      <div id="wipes" data-composition-id="wipes" data-composition-src="compositions/wipes.html" data-start="0" data-duration="${TOTAL}" data-track-index="2" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:5"></div>
      ${audio.join("\n      ")}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`;
fs.writeFileSync(ROOT + "index.html", index);
const lastVoEnd = scenes[14].start + scenes[14].lead + VO[14];
fs.writeFileSync(ROOT + "build/timing.json", JSON.stringify({ TOTAL, lastVoEnd, starts: scenes.map((s) => [s.id, s.start, s.dur]) }, null, 1));
console.log(`total ${TOTAL}s · ${scenes.length} scenes · ${audio.length} audio clips · last VO ends ${lastVoEnd.toFixed(2)}`);

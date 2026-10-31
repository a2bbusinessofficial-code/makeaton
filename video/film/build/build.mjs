// node build/build.mjs  → writes index.html + compositions/*.html
import fs from "node:fs";
import { C } from "./lib.mjs";
import { s1, s2, s3, s4, s5, s6 } from "./scenes-a.mjs";
import { s7, s8, s9, s10, s11 } from "./scenes-b.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const PEAK = { chime: 0.418, "click-soft": 0.073, click: 0.073, error: 0.745, "glitch-3": 1.823, "impact-bass-1": 0.073, notification: 0.229, ping: 0.324, pop: 0.12, riser: 3.472, sparkle: 0.027, typing: 0.0, whoosh: 0.162, "whoosh-short": 0.162 };
const DUR = { chime: 2.54, "click-soft": 0.37, click: 0.37, error: 1.62, "glitch-3": 3.1, "impact-bass-1": 2.12, notification: 2.46, ping: 1.32, pop: 0.72, riser: 10.03, sparkle: 1.8, typing: 1.54, whoosh: 0.57, "whoosh-short": 0.57 };
const VO = [5.013, 5.483, 4.224, 6.293, 14.613, 8.171, 8.683, 8.789, 9.6, 10.027, 2.923];

const scenes = [s1(), s2(), s3(), s4(), s5(), s6(), s7(), s8(), s9(), s10(), s11()];
fs.mkdirSync(ROOT + "compositions", { recursive: true });
let t = 0;
for (const s of scenes) { s.start = +t.toFixed(3); t += s.dur; fs.writeFileSync(`${ROOT}compositions/${s.id}.html`, s.html); }
const TOTAL = +t.toFixed(3);

// ---- wipes between scenes: the next scene's ground sweeps across ----
const dirs = ["x", "y", "-x", "y", "x", "-y", "x", "y", "-x", "x"];
const wipes = scenes.slice(1).map((s, k) => ({ id: `w${k + 1}`, at: s.start, color: s.ground, d: dirs[k] }));
const wipeHTML = `<template>
  <style>#root{position:absolute;inset:0;overflow:hidden;pointer-events:none}
  .slab{position:absolute;left:0;top:0;width:1920px;height:1080px;border:8px solid #111}
  .slab .band{position:absolute;inset:0;margin:auto;width:100%;height:90px;top:0;bottom:0;border-top:6px solid #111;border-bottom:6px solid #111;background:repeating-linear-gradient(45deg,#111 0 12px,transparent 12px 30px)}</style>
  <div id="root" data-composition-id="wipes" data-width="1920" data-height="1080" data-layout-ignore>
    ${wipes.map((w) => `<div class="slab" id="${w.id}" style="background:${w.color}"><div class="band"></div></div>`).join("\n    ")}
  </div>
  <script>(function(){
    const tl = gsap.timeline({ paused: true });
    const W=${JSON.stringify(wipes)};
    for(const w of W){ const ax=w.d.includes("x")?"x":"y", sg=w.d.startsWith("-")?-1:1, size=ax==="x"?1960:1120;
      const a={}, b={}, c={}; a[ax]=sg*size; b[ax]=0; c[ax]=-sg*size;
      tl.set("#"+w.id,Object.assign({},a),0);
      tl.fromTo("#"+w.id,a,Object.assign({duration:0.32,ease:"power3.in"},b),w.at-0.32);
      tl.to("#"+w.id,Object.assign({duration:0.42,ease:"power3.out"},c),w.at); }
    tl.set({},{},${TOTAL});
    window.__timelines["wipes"] = tl; })();</script>
</template>`;
fs.writeFileSync(ROOT + "compositions/wipes.html", wipeHTML);

// ---- audio ----
let track = 3;
const audio = [];
scenes.forEach((s, k) => {
  const n = String(k + 1).padStart(2, "0");
  audio.push(`<audio id="vo${n}" class="clip" src="assets/vo/vo${n}.mp3" data-start="${(s.start + s.lead).toFixed(3)}" data-duration="${VO[k]}" data-track-index="20" data-volume="1"></audio>`);
});
let sx = 0;
const place = (name, at, vol) => {
  const start = Math.max(0, at - PEAK[name] + 0.033);
  audio.push(`<audio id="fx${++sx}" class="clip" src="assets/sfx/${name}.mp3" data-start="${start.toFixed(3)}" data-duration="${DUR[name]}" data-track-index="${30 + sx}" data-volume="${vol}"></audio>`);
};
for (const s of scenes) for (const [name, at, vol] of s.sfx) place(name, s.start + at, vol);
wipes.forEach((w, k) => place(k % 2 ? "whoosh" : "whoosh-short", w.at - 0.05, 0.16));
audio.push(`<audio id="music" class="clip" src="assets/music/flares-bed.mp3" data-start="0" data-duration="${TOTAL}" data-track-index="10" data-volume="1"></audio>`);

const hosts = scenes.map((s) => `<div id="${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${s.start}" data-duration="${s.dur}" data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:1"></div>`);

const index = `<!doctype html>
<html lang="en" data-composition-variables='[
  {"id":"color-pink","type":"color","label":"Pink","default":"${C.pink}"},
  {"id":"color-blue","type":"color","label":"Blue","default":"${C.blue}"},
  {"id":"color-green","type":"color","label":"Green","default":"${C.green}"},
  {"id":"color-yellow","type":"color","label":"Yellow","default":"${C.yellow}"}
]'>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Brightloop demo</title>
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
console.log(`total ${TOTAL}s · ${scenes.length} scenes · ${audio.length} audio clips`);
console.log(scenes.map((s) => `${s.id}@${s.start}`).join("  "));

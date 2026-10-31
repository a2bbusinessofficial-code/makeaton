# Brightloop demo film: review notes

**Film:** 95.3 s · 1920×1080 · 30 fps · 11 scenes · pastel neo-brutalism (based on the HyperFrames "blockframe" preset, with softened pastels)

## Creative calls
- **Look:** 4 px black borders, hard offset shadows, square corners, tilted stickers, and pastel grounds that cycle once per scene (paper → yellow → blue → pink → green → cream → yellow → blue → pink → green → black end card). Type is Inter 800–900 uppercase with Space Grotesk labels.
- **Screens:** real 1920×1080 captures of the app (seeded demo data), shown inside brutalist browser frames. Punch-ins, cursor clicks and screen swaps are animated; the UI itself is never redrawn.
- **Transitions:** the next scene's ground sweeps across the cut with a striped band, alternating horizontal and vertical. Inside scenes there are whip swaps, card slides and stamp drops.
- **Motion:** expo.out arrivals, back.out(1.3–1.8) springs only on stickers and pills, power3.inOut camera zooms. No looping or floating motion.
- **Sound:** Kokoro "Heart" voiceover; music is NIVIRO "Flares" (NCS), calm sections only (intro, breakdown and outro, crossfaded; bass −7 dB, treble −3 dB) at about −31 LUFS under the voice, lifting on the end card. Sound effects come from the bundled library at 0.12–0.42 gain, each timed to the action that causes it.

## Measured vs. only looked at
- `hyperframes check`: ok, with 0 errors and 0 warnings after fixes (one text-size warning on the end card was fixed).
- Review sheets (beats, seams, phone) were looked at; fixes were made to the empty first frame of the logo scene, a stray rail connector in the staff scene, and the end-card tagline colliding with the URL.
- Audio was measured with `hyperframes audio` (levels and timing), not listened to.
- Voice-to-picture sync was timed from silence detection on each voice line (word-level transcription was unavailable offline), so cues are accurate to about ±0.2 s.

## Weakest shot
- **Admin catalog (24–39 s)** is the densest scene: five screens in 15 s. With more time, give it two shorter scenes, or drop the GST beat to a sticker only.
- Some UI text inside the frames is small at 1:1. The punch-ins carry the important parts, but the full-page shots (billing, action center) read as texture on a phone.

## Credits to include when publishing
Music: NIVIRO – Flares [NCS Release], provided by NoCopyrightSounds.

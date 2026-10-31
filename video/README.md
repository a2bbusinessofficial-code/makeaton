# Demo video production

| File | What it is |
|---|---|
| `SCRIPT.md` | Scene-by-scene script: visuals, motion, sound and voiceover |
| `STORYBOARD.jpg` | One-page storyboard with a real screen per scene |
| `VOICEOVER.txt` | Voiceover lines, one per scene (TTS input) |
| `vo-draft-heart.mp3` | Draft voiceover (Kokoro "Heart" voice, about 90 s) |
| `voice-samples.mp3` | Four female voice options to choose from |
| `screens/` | 1920×1080 captures of every page: `public/`, `admin/`, `customer/`, and `actions/` (live interactions such as billing runs and payments) |
| `tools/` | Scripts used to capture the screens and build the storyboard |
| `brightloop-demo.mp4` | **The rendered film** (95 s, 1080p, pastel neo-brutalism) |
| `film/` | HyperFrames project for the film. `node build/build.mjs` regenerates `index.html` + `compositions/`; `npx hyperframes preview` opens it in Studio; `npx hyperframes render -o out.mp4` renders. See `film/REVIEW.md`. |

Music: NIVIRO – Flares [NCS Release], provided by NoCopyrightSounds. Credit it wherever the video is published.

## Re-capturing the screens locally

The captures come from the real app running locally with the seeded data, using a small Supabase Auth stand-in (`tools/local-auth-stub.mjs`, dev only, never deployed):

```bash
node video/tools/local-auth-stub.mjs &      # fake GoTrue on :54321
# .env: DATABASE_URL to a local Postgres, NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
npx prisma migrate deploy && npm run db:seed && npm run build && npm start
node video/tools/shoot.cjs http://localhost:3000 ./shots     # every page, per role
node video/tools/actions.cjs http://localhost:3000 ./shots   # interactions (writes to the local DB)
```

The record IDs inside `shoot.cjs` belong to one seed run. Look up new ones after re-seeding.

Voiceover: each line of `VOICEOVER.txt` goes through `npx hyperframes tts "<line>" -v af_heart -o line.wav` (needs `pip install kokoro-onnx soundfile`).

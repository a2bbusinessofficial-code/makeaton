# Review notes (v2)
- `hyperframes check`: ok. Lint: 0 errors; 8 warnings are repeated icon images (harmless) and the carousel's entry/slide overlap (intended).
- Rendered file: 122 s, 1080p30, −15.7 LUFS, true peak −1.5 dBTP, no clipping (measured, not listened to).
- Every number on screen comes from the app's seeded data, captured from the latest `main` running locally (the live site was not reachable from the build environment).
- Fixed after review: overflowing checklist captions, role-card wrapping, sticker collisions in the configuration and under-the-hood scenes, an empty first frame in the under-the-hood scene, and the automation frame's position.
- Weakest parts: the configuration carousel moves fast (five screens in about 9 s), and the voice is synthetic (Kokoro).

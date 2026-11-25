# GitHub source-sync status — 25 November 2026

## Source
Base: latest user-supplied `apex-engineering-&-industrial-solutions (3).zip`.

## Changes from base
- Restored the named Firestore database ID found in the existing GitHub `firebase-applet-config.json`.
- Added fail-closed validation in `src/firebase.ts`: missing named database config must not fall back to `(default)`.
- Added a static test for this critical config and updated README to remove irrelevant Gemini-key setup.
- Left all 21 supplied images and the user-facing site design unchanged.

## Checks
- ZIP file integrity and image inventory can be checked offline.
- Unit tests run on Node 22.16 using `node --experimental-strip-types --test tests/*.test.ts`.
- CI expects Node 24.12+ and independently runs `npm ci`, `npm run lint`, `npm test`, audit and build.
- This workspace does not have a full local npm dependency install; do not claim local CI/build pass.

## Deploy and Firebase
- GitHub `main` and the existing backup branch must remain intact until a verified fast-forward sync.
- Firestore rules in this ZIP are *source-only*; they were not deployed to live Firebase.
- Live Firebase/Emulator and browser acceptance tests are still required prior to switching production domain.

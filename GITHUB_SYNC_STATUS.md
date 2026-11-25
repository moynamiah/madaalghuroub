# GitHub Source Sync — 25 November 2026

**Status:** Final code, RFQ security changes, CI, and all 21 optimized/official images were merged into `main` via [Pull Request #1](https://github.com/moynamiah/madaalghuroub/pull/1).

- **Merged PR commit:** `a4ef86b4a62720a6f176acecc3847c021644e109`.
- **Full source inventory:** 70 files. Original 21 visual assets preserved byte-for-byte.
- **Firebase safety:** original named Firestore database ID retained; missing config now fails closed instead of silently using `(default)`.
- **Lockfile:** regenerated and tested on Node.js 24.12.0 to correct missing cross-platform optional dependencies; `npm ci` passes.
- **GitHub Actions:** [main-branch CI success](https://github.com/moynamiah/madaalghuroub/actions/runs/45578073424): install, TypeScript, unit tests, audit and Hostinger build passed.
- **Rollback:** existing `backup/main-before-final-sync-20261124` branch preserved at `0224fc3a13bf4e8303aee47fdac9efcc233cbd52`.
- **Removed obsolete files:** legacy AdminSettingsModal, bun.lock, old JPEG gallery assets and failed one-time release-import workflow.
- **Production Firebase:** no Firestore documents, rules, auth settings or live database were changed by this GitHub sync.

## Tasks remaining outside GitHub source control

1. Perform Firestore Emulator/security-rule tests and deploy updated `firestore.rules` only with explicit approval.
2. Add the future custom Hostinger domain to Firebase Authorized Domains if authentication is used.
3. Deploy the static build to Hostinger and perform real-browser QA (mobile/RTL, RFQ, images, network conditions).
4. Pull the verified GitHub version into the *existing* AI Studio project after checking its working-tree changes and avoiding overwrite conflicts.

GitHub CI passing does not establish that live Firebase rules or the Hostinger website have been deployed or tested.

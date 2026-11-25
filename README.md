# Moyna Miah — Mada Al Ghuroub Professional Website

Existing Google AI Studio project, prepared for GitHub CI and future Hostinger static hosting.

## Development
- Node.js 24.12.0 or newer, npm
- Run `npm ci`, `npm run lint`, `npm test`, and `VITE_BASE_PATH=/ npm run build`.
- Public web Firebase settings are in `firebase-applet-config.json`.
- **Important:** The original named Firestore database ID is retained. Do not delete `firestoreDatabaseId` or change to `(default)`.
- Firebase credentials for service accounts or other private keys must never be committed.
- Hosting the static site on Hostinger does **not** migrate or deploy Firestore data/rules.
- This website does not use the Gemini API; a `GEMINI_API_KEY` is not required.

See `HOSTINGER_DEPLOYMENT.md` and `GITHUB_SYNC_STATUS.md` for deployment and validation notes.

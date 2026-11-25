# Deployment & Multi-Target Build Guide

This project supports three deployment targets from the exact same codebase using the `VITE_BASE_PATH` environment variable in `vite.config.ts`.

## Supported Targets

| Target | `VITE_BASE_PATH` | Build Command |
|---|---|---|
| Google AI Studio Preview | `/` (default) | `npm run build` |
| GitHub Pages (`https://moynamiah.github.io/madaalghuroub/`) | `/madaalghuroub/` | `VITE_BASE_PATH=/madaalghuroub/ npm run build` |
| Hostinger Custom Domain Root (e.g., `https://madaalghuroub.com/`) | `/` (default) | `npm run build` |

## Local Development & Verification

```bash
npm ci
npm run lint
npm run build
npm run preview
```

## GitHub Pages Deployment (Automated)

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs:
1. `actions/setup-node@v4` with Node 24 (Node 22+ supported) and `cache: npm` (backed by `package-lock.json`)
2. `npm ci`
3. `npm run lint` (TypeScript check)
4. `VITE_BASE_PATH=/madaalghuroub/ npm run build`
5. `cp dist/index.html dist/404.html`
6. GitHub Pages upload and deployment via `actions/deploy-pages@v4`

## Hostinger Static Deployment

1. Run `npm ci && npm run build` (uses default `VITE_BASE_PATH="/"`).
2. Upload the contents of `dist/` to `public_html/` on Hostinger.
3. No GitHub subpath is hardcoded in default builds.

## Security Notes

- Never commit `.env`, `.env.local`, API keys, or service credentials.
- `firebase-applet-config.json` contains only public Firebase Web SDK configuration; database access is enforced server-side by `firestore.rules`.

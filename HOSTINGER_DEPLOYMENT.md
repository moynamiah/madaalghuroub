# Hostinger Production Deployment Guide — Moyna Miah (Mada Al Ghuroub)

This document provides the complete production deployment, security, and rollback procedure for hosting **Moyna Miah — MADA AL-GHUROUB GENERAL CONTRACTING COMPANY** on Hostinger.

---

## 1. Architecture & Compatible Hostinger Plans

This application is a **pure client-side React 19 + TypeScript + Vite 8 Single-Page Application (SPA)** connected directly to **Firebase Firestore** (with server-enforced `firestore.rules`).

- **Does NOT require a Node.js backend or Express server.**
- **Compatible Hostinger Plans:**
  1. **Hostinger Web Hosting (Single / Premium / Business Shared Hosting)** — Recommended & most cost-effective. Upload the static `dist/` folder directly to `public_html/`, or use Hostinger Git Deployment.
  2. **Hostinger Cloud Hosting** — Fully compatible (`public_html/`).
  3. **Hostinger VPS / Node.js Web App** — Compatible if desired, serving static `dist/` output.

---

## 2. Build Command & Output Directory

| Setting | Value |
|---|---|
| **Package Manager** | `npm` (locked via `package-lock.json`) |
| **Install Command** | `npm ci` |
| **TypeCheck Command** | `npm run lint` |
| **Automated Unit Tests** | `npm test` |
| **Production Build Command** | `npm run build` |
| **Base Path (`VITE_BASE_PATH`)** | `/` (default when unset or `VITE_BASE_PATH=/`) |
| **Output Directory** | `dist/` |

> **Important:** The default `npm run build` uses `VITE_BASE_PATH=/` automatically. Do **not** set `VITE_BASE_PATH=/madaalghuroub/` when building for Hostinger custom-domain root deployment.

---

## 3. Required Environment Variables

No private secrets or API keys are stored in `.env` files.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_BASE_PATH` | `/` | Asset and routing base path (`/` for Hostinger custom domain root and AI Studio Preview; `/madaalghuroub/` for GitHub Pages project site). |

Firebase Web SDK identifiers are loaded from `firebase-applet-config.json`. These are public client identifiers by design; data security is enforced on Google's servers by `firestore.rules`. **Never store private keys or service-account JSON credentials in `VITE_` variables.**

---

## 4. Step-by-Step Hostinger Deployment

### Option A: Upload Pre-Built Static Output (`dist/`) via Hostinger File Manager
1. On your local machine, extract the clean release ZIP and run:
   ```bash
   npm ci
   npm run lint
   npm test
   npm run build
   ```
2. Verify `dist/` contains:
   - `dist/index.html`
   - `dist/.htaccess` (automatically copied from `public/.htaccess`)
   - `dist/robots.txt`
   - `dist/assets/*.js`, `dist/assets/*.css`, `dist/assets/*.webp`, `dist/assets/*.jpg`
3. Log in to **Hostinger hPanel** → **Files** → **File Manager**.
4. Open `public_html/` and remove any default placeholder file (`default.php`).
5. Upload all contents of `dist/` (including the hidden `.htaccess` file) directly into `public_html/`.

### Option B: Automated Git Deployment on Hostinger
1. In **Hostinger hPanel** → **Advanced** → **Git**, connect `https://github.com/moynamiah/madaalghuroub.git` (`main` branch).
2. If using a CI artifact or build step, build with `npm ci && npm run build` and publish the `dist/` directory to `public_html/`.

---

## 5. Custom Domain & HTTPS Configuration

1. In **Hostinger hPanel** → **Domains**, point your custom domain (e.g., `madaalghuroub.com`) to your Hostinger hosting plan via Hostinger nameservers or `A` / `CNAME` DNS records.
2. In **hPanel** → **Security** → **SSL**, ensure the free **Let's Encrypt SSL/TLS certificate** is status **Active**.
3. The included `public/.htaccess` file automatically:
   - Enforces `HTTPS` (`301` redirect from `http://` to `https://`).
   - Configures SPA fallback routing to `index.html`.
   - Sets security headers (`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, and `Content-Security-Policy` compatible with Google Fonts & Firebase).
   - Enables 1-year immutable caching for hashed WebP/JS/CSS assets while revalidating `index.html`.

---

## 6. Firebase Authorized Domains Configuration

Before going live on your custom domain, register the domain in Firebase so Firestore & Firebase Auth requests from your domain are trusted:

1. Open the [Firebase Console](https://console.firebase.google.com/) and select project **`gen-lang-client-0758969490`**.
2. Go to **Authentication** → **Settings** → **Authorized domains**.
3. Click **Add domain** and enter your custom domain (e.g., `madaalghuroub.com` and `www.madaalghuroub.com`).
4. If you have added Google Cloud API key HTTP referrer restrictions on the Firebase Web API key, also add `https://madaalghuroub.com/*` and `https://www.madaalghuroub.com/*` in Google Cloud Console → **APIs & Services** → **Credentials**.
5. **Recommended Server-Side Abuse Protection (Free Tier):** Client-side cooldown (30s) and honeypot fields do not provide server-side rate limiting against automated bots calling Firestore directly. To add zero-cost server-side protection without paid Cloud Functions, enable **Firebase App Check** with **reCAPTCHA v3** (or reCAPTCHA Enterprise free tier) in Firebase Console → **App Check**, register your custom domain, populate `recaptchaSiteKey` in `firebase-applet-config.json`, and enforce App Check on Cloud Firestore once verified.

---

## 7. Post-Deployment Verification Checklist

After uploading `dist/` to `public_html/`:

1. **HTTPS & Root Load:** Visit `https://<your-domain>/` and confirm the SSL lock icon is active and the page renders with zero console errors.
2. **Portrait & Logo:** Confirm Moyna Miah's authentic portrait and the MADA AL-GHUROUB logo display sharply in the Navbar, Hero card, Executive Profile, RFQ section, and Footer.
3. **WebP Asset Delivery:** Confirm all 19 industrial photography assets load with HTTP `200` from `/assets/*.webp`.
4. **Language & RTL Switch:** Toggle **العربية / EN** in the top bar and confirm `<html lang="ar" dir="rtl">` applies smoothly across all sections.
5. **Interactive Sections:** Test the Project Dossier modal, Workforce Allocation Matrix calculator, Equipment Rental daily/monthly toggle, and Analytics simulators.
6. **Tender RFQ Submission:** Submit a test RFQ inquiry and confirm the official receipt (`RFQ-MM-YYYY-XXXXXX`, dynamically matching the current Riyadh year) is generated only after Firestore confirms persistence and is downloadable as `.TXT`.
7. **Security Headers:** Run `curl -I https://<your-domain>/` to confirm `Strict-Transport-Security`, `X-Content-Type-Options`, and `Content-Security-Policy` headers are returned.

---

## 8. Rollback Instructions

### Git Rollback
A rollback tag and backup branch are preserved at the pre-synchronization commit (`0224fc3a13bf4e8303aee47fdac9efcc233cbd52`):
- **Tag:** `backup-main-0224fc3`
- **Branch:** `backup/main-before-sync`

To build from a previous Git commit or tag:
```bash
git checkout backup-main-0224fc3
npm ci && npm run build
```

### Hostinger File Manager / Backup Rollback
1. In **Hostinger hPanel** → **Files** → **Backups**, select **Files backups**.
2. Choose the backup timestamp prior to deployment and click **Restore files** for `public_html/`.

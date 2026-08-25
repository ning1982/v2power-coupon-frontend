# V2Power Coupon -- Voucher Redeem

> Scan QR -> email + token -> verify -> voucher by email. SPA at coupon.v2power.com/coupon/.

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

English-only UI. Flow: Redeem -> Success / Help. API prefix /coupon_api (dev proxy -> 192.168.33.100:8088, prod same-origin Nginx).

## Features
- QR auto-fill: ?t=V2P-XXXX pre-fills Token (trim / uppercase / paste-normalize)
- Single email + GDPR consent (Zod + Hook Form, blocks submit until checked)
- Bot protection: reCAPTCHA v2 prod / none locally -- site key 6Ldb3ZctAAAAAAgBlmOmyHyh2xXlI0__qdFUuI_4
- Privacy-safe: success uses history.state, never email in URL
- Resilient: 15s timeout with check-inbox-first copy, draft cleared on success/close
- Support: WhatsApp wa.me on Success & Help
- Mock: VITE_MOCK=1 dev only (fakes V2PTEST*)

## Stack
| Layer | Choice |
|---|---|
| Build | Vite 8, base /coupon/ |
| UI | React 19 + Router 7 + Tailwind 4 |
| Form | React Hook Form + Zod |
| Test | Vitest 3 + Testing Library + jsdom |
| Deploy | Static dist/ via Nginx try_files |

## Structure
`
v2power-coupon-frontend/
  docs/specs/  PRD v1.2 + IA v1.2 (9 boss items merged)
  docs/api/    v2power-coupon-API_SIMPLE_v8.md
  src/api/     coupon.ts (redeem), captcha.ts
  src/lib/     validation.ts, errorMap.ts, storage.ts
  src/pages/   RedeemPage.tsx, SuccessPage.tsx, HelpPage.tsx
  vite.config.ts  proxy /coupon_api -> 192.168.33.100:8088
`

## Quick Start (Windows)
`ash
npm install
npm run dev      # http://localhost:5173/coupon/?t=V2P-TEST1234
npm run build    # -> dist/ ~341KB JS, dist.zip ~115KB
npm test
`

## Env
| Var | Example | Notes |
|---|---|---|
| VITE_CAPTCHA | none (dev) / recaptcha (prod) | prod needs Google allowlist |
| VITE_TURNSTILE_SITEKEY | 6Ldb3ZctAAAAAAgBlmOmyHyh2xXlI0__qdFUuI_4 | site key |
| VITE_WHATSAPP | https://wa.me/447000000000 | replace with real number |
| VITE_API_TARGET | http://192.168.33.100:8088 | dev proxy only |
| VITE_MOCK | 1 | dev only |

See .env.example. .env.production ships with recaptcha.

## API v8
Base http://192.168.33.100:8088 prefix /coupon_api

| Method | Path | Purpose |
|---|---|---|
| POST | /coupon_api/admin/import | Import Excel -> batch_id + tokens |
| POST | /coupon_api/coupon/redeem | {email, confirmed_email, token, captcha_token} |
| GET | /coupon_api/captcha/config | {site_key} |
| GET | /coupon_api/captcha/test-token | dev test token |
| GET | /coupon_api/admin/qr?token=... | QR PNG |
| GET | /coupon_api/admin/batch/{id}/qrs | ZIP |

Contract: docs/api/v2power-coupon-API_SIMPLE_v8.md

## Deploy (Linux + Nginx)
root /var/www/coupon;
location /coupon/ { try_files $uri $uri/ /coupon/index.html; }
location /coupon_api/ { proxy_pass http://127.0.0.1:8088; }

Build: npm run build -> unzip dist.zip -d /var/www/coupon/
QR for print: https://coupon.v2power.com/coupon/?t=V2P-XXXX

## Specs
- PRD: docs/specs/2026-08-25-v2power-voucher-redeem-website-prd.md
- IA: docs/specs/2026-08-25-v2power-voucher-interaction-logic.md
- API v8: docs/api/v2power-coupon-API_SIMPLE_v8.md

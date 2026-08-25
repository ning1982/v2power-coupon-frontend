# Handover — v2power-coupon-frontend (dev1)

**Branch**: `dev1` on https://github.com/ning1982/v2power-coupon-frontend
(fork of Lois7090/v2power-coupon-frontend — `ning1982` has no write access to the original yet)

**Commits**: `490a280` + `6e4b57b`

---

## What was done

### 1. Redeem page — rebuilt on Material Design 3
- Brand primary locked to exact `#0366BB` (M3 would normalise it to `#005faf`; drivers compare the screen to printed cards, so exact match matters)
- Light mode only, `color-scheme: light` to stop iOS auto-inverting
- CTA is **never disabled** — click validates + shakes + announces via `aria-live` (a disabled button is a silent dead end on mobile)
- Amount read from `?amt=` URL param with graceful degradation ("Claim your £100 charging credit" vs generic copy)
- `<form>` semantics so the mobile keyboard shows a Go key

### 2. Admin console — new, at `/admin`
| View | Route | What it does |
|---|---|---|
| Login | `/admin/login` | Front-end guard (password `demo` in dev) |
| Batches | `/admin` | Batch list + 4 stat cards (count / redeemed / total value / batches) |
| Import | `/admin/import` | Excel upload, batch name, format guide |
| Batch detail | `/admin/batch/:id` | Voucher table, token search, status filter, pagination |
| **Print cards** | `/admin/print/:id` | **CR80 cards, 2-up on A4, print or save as PDF** |

### 3. Voucher card design (3 styles)
Designed via agy (Claude Opus 4.6), implemented by me. 85.6 × 54mm (credit-card size), 2 per A4 row, dashed cut borders.
- **Minimal** — white + ink + blue
- **Brand blue** — full `#0366BB` + white
- **Vibrant** — white + `#FFBE1D` accents

Every voucher gets its **own unique QR code** — token → `?t=<token>&amt=<amount>` → unique image. Verified: 500 cards rendered, 500 distinct QR codes.
QR zone is always pure white with ≥2mm quiet zone (print scan reliability).

### 4. Privacy policy — moved in-app
The old link went to `v2power.io/v2power/privacy/`, which has **no back button** — users who tapped it could not return to the redeem flow. Now `/privacy` in-app with a Back button, full policy text (effective 20 Dec 2024), and copy fixes (missing bracket, stray spaces).

### 5. Email delivery — working locally
`server/index.mjs` (Express + nodemailer) sends the voucher email over SMTP. In dev it points at **Mailpit** (`localhost:1025`, web UI `:8025`) so nothing reaches real inboxes.
Verified end to end: redeem → `{"code":0,"data":{"email_sent":true,"email":"n***g@v2power.io"}}` → email captured in Mailpit with the voucher code.

To send for real, change only the SMTP config in `server/index.mjs` — no front-end changes needed.

---

## State

- `npm run build` — clean (154 modules)
- `npm test` — 46/46 passing
- Dev server, mail backend and Mailpit all running locally

## Backend work still required

The production backend (`192.168.33.100:8088`) was unreachable from here and its code is not in this repo, so the admin console runs on mock data. Full spec is in **`docs/api/v2power-coupon-ADMIN-backend.md`**:

| # | Endpoint / change | Why |
|---|---|---|
| **0** | **Auth on all `/coupon_api/admin/*`** | **P0 — the console has no server-side auth today** |
| 1 | `import` accepts an amount column + batch name | Amount is a batch attribute; ops needs to identify batches |
| 2 | QR payload includes `&amt=` | So the redeem page can show the amount |
| 3 | `GET /admin/batches` | Batch list — currently import only returns a `batch_id`, history is unviewable |
| 4 | `GET /admin/batch/{id}` with `status` + `q` params | Voucher list, filtering, single-voucher support lookups |
| 5 | Optional: CSV export, batch void, async import for >1000 rows | Print-shop mapping, risk control, timeout safety |

Security requirements (email masking server-side, token whitelist against Excel formula injection, upload limits, presigned ZIP URLs) are in the same doc.

---

## Notes

- `.env` is gitignored (it held an internal IP)
- Test token in dev: any `V2PTEST…` token when `VITE_MOCK=1`; with the mail backend running, any token works
- New deps: `express`, `nodemailer`, `qrcode` (0 vulnerabilities)

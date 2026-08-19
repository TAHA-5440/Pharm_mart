# Agent handoff

**Project:** Pharmstore / public UI name **ProcureX**  
**Workspace:** `d:\taha\Pharmstore`  
**Last updated:** 19 August 2026  
**Updated by:** Cursor agent  
**Status:** Supplier mini-sites work as `{slug}.localhost` wrappers; path URLs stay canonical. Step 13 still next.

---

## How to use this file

1. Incoming agent: read this, then [STEPS.md](./STEPS.md). Continue at first unchecked step (**13**).
2. Update this file after milestones or when context is nearly exhausted.

---

## What this product is

Pakistan-first verified B2B RFQ marketplace (pharma + food). Buyers free. No checkout in V1.

---

## Run

```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

[http://localhost:3000](http://localhost:3000)  
Marketplace: [http://localhost:3000/marketplace](http://localhost:3000/marketplace)

Demo password: `password123`  
- Admin `sarah.b@example.net`  
- Buyer `maria.s@example.com`  
- Supplier `laura.c@example.net` (ABC Engineering)

**Loop:** buyer posts RFQ → admin **Classify + Open + match** → supplier quotes on `/seller` → buyer compares on `/buyer/rfqs/[id]`.

Reseed to load extra demo products from the updated `prisma/seed.ts`.

---

## Decisions (locked)

Web first, no cart, **Neon Postgres** (not SQLite on Vercel), JWT cookie auth (not Auth.js). Google OAuth is an extra login method on that same cookie.

**Public UI:** Home is glass on a soft paper/forest CSS wash — no page-background photo. Forest green CTAs. Other pages stay paper + white cards.

**Register fields:** Required = account type, name, company, email, and password (skipped for Google). Optional = phone, city, industry, plant photo, supplier address/NTN/CNIC/proof. Filled optional values are still format-checked (PK mobile, NTN digits, etc.).

**Seller desk:** Quotes is the pipeline (revise + report won/lost). There is no Orders page and no listing-approval queue — org approval is the gate; approved-org listings go live. Desk keeps the three counts; Analytics is not a nav item. `/seller/orders` and `/seller/analytics` redirect.

**RFQ matching:** Admin sets supply type (and industry) on Open. That type’s approved suppliers are notified — via their profile types **or** live listings in that type. Blank type = all approved, cap 12. Directed “this supplier only” RFQs skip type matching.

**Supplier URLs:** Path `/suppliers/[slug]` is canonical. Optional wrapper: `{slug}.{APP_HOST}` rewrites to that page (local: `abc-engineering.localhost:3000`). Not enabled as link targets on `vercel.app`. Cookie domain `.localhost` locally so login works on the mini-site.

---

## Next agent

1. Step 13: message threads UI + Resend email (stub if no API key)  
2. Wire remaining AnalyticsEvent types (listing view, RFQ, quote) — profile views now increment on `/suppliers/[slug]`  
3. Unique metadata/sitemap; PWA optional  
4. Neon is created (`procurex`). Vercel needs `DATABASE_URL` + `AUTH_SECRET`. Google login also needs `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_URL`.  
5. Do not start payments/Expo  

---

## Changelog

| When | What |
| --- | --- |
| 2026-08-18 | Specs, canvas, STEPS |
| 2026-08-18 | Implemented Steps 1–12, 14–15. App builds. |
| 2026-08-18 | Wrote PAGES.md |
| 2026-08-18 | Implemented PAGES.md. Dropped book/serif/hairline squares and motion. Rounded marketplace UI. `/search` → `/marketplace`. |
| 2026-08-18 | Homepage expanded: forest / navy / sage / mist / ink bands covering industries, categories, RFQ, buyers vs suppliers, verification, cities. |
| 2026-08-18 | Homepage redesigned as one Grove palette (paper, white, forest). Removed navy/mist bands and theme swatches. Split hero, overlay tiles, single CTA band. |
| 2026-08-18 | Homepage glass theme: frosted panels, glass hero card, glass header on `/` only. |
| 2026-08-18 | Mobile: hamburger menu with search/nav; homepage hero, cards, and CTAs stack on small screens. |
| 2026-08-19 | Google OAuth on existing JWT cookies. New Google users finish organisation on `/register`. Migration `google_auth`. |
| 2026-08-19 | Register required-vs-optional: stars only on name, company, email, password, account type. Supplier NTN/proof optional at signup. |
| 2026-08-19 | Applied `buyer_cover` + `supplier_verification` migrations (cnic, businessProofUrl, rejectionReason). |
| 2026-08-19 | Seller: Analytics (14-day bars), Orders as won quotes, product and used-machine editors. Still no payments. |
| 2026-08-19 | Seller logic: folded Orders into Quotes (deals reported, no checkout). Listings go live when the org is approved — no pending_review trap. Documents sit in Work until approved. Analytics nav removed; desk keeps the three figures. |
| 2026-08-19 | Admin Open RFQ: pick supply type (or all approved). Matching uses org types + live listing categories. Seller profile can tick supply types. |
| 2026-08-19 | Supplier subdomain wrapper: `{slug}.{host}` rewrites to `/suppliers/[slug]`. Canonical stays on the path. |

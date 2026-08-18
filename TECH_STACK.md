# Tech stack

**Product:** Pharmstore (working name)  
**Document type:** Technical stack recommendation  
**Aligned to:** [PRD.md](./PRD.md) v1.0  
**Version:** 1.0  
**Date:** 18 August 2026  
**Strategy:** Web first. Mobile second. One backend for both.

---

## 1. Direct answer: is Next.js the stack for web *and* mobile?

**Next.js is the right choice for the website. It is not a native iOS/Android app framework.**

| What people mean | Reality |
| --- | --- |
| “Next.js for web” | Yes. Server-rendered React. Excellent for SEO, dashboards, and this marketplace. |
| “Next.js for mobile” | Means a **responsive website** (and optionally a PWA) that works on phones in the browser. Not an App Store / Play Store app. |
| “One codebase for web + native apps” | That is **React Native (Expo)** for native, plus **Next.js** for web — sharing API, types, and some logic. Not Next.js alone. |

For *this* product, that split is correct:

1. **Build the web app in Next.js** (desktop + mobile browser).
2. **Ship a PWA** so suppliers can “install” it on their phone without an app store.
3. **Add Expo (React Native) later** only if push, offline, or store presence is clearly worth a second client.

Procurement managers work at desks. SEO pages like `tablet compression machine suppliers pakistan` are a growth channel in the PRD. WhatsApp will carry more day-to-day mobile behaviour than a native app in Year 1. So **web-first is not a compromise — it matches how the business works.**

**Do not** start with Flutter, React Native-only, or “one Next.js app that is also the mobile app.” You would either hurt SEO or delay the RFQ loop.

---

## 2. Platform sequence

```
Phase 1 (MVP / Year 1)     Next.js web  +  mobile-responsive  +  PWA
Phase 2 (after liquidity)  Same API  +  Expo iOS/Android if metrics justify it
Phase 3                    Payments, escrow, richer native only if needed
```

| Surface | When | Why |
| --- | --- | --- |
| Public marketplace (search, suppliers, machines, RFQ) | Now | SEO, trust, buyer acquisition |
| Buyer + seller dashboards in the browser | Now | Core loop |
| Admin / ops | Now | Verification, moderation |
| Mobile browser + PWA | Now (same Next.js app) | RFQ alerts, quoting on the factory floor / in a shop |
| Native iOS / Android | After ~liquidity | Push, camera for machine listings, store credibility |
| WhatsApp / email / SMS | Now (integrations) | Do not fight behaviour (PRD §9.10) |

**Rule:** one API and one data model. Web and future mobile are clients, not two products.

---

## 3. Recommended stack (MVP)

Opinionated defaults for a small team shipping a Pakistan-first B2B marketplace.

### 3.1 Application (web)

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js** (App Router) | SSR/SSG for category and supplier pages (SEO). Server Actions / Route Handlers for RFQs and dashboards. One repo for marketing site + app. |
| Language | **TypeScript** | Shared types for RFQ, quotation, supplier, machine — reused later by Expo. |
| UI | **Tailwind CSS** + **shadcn/ui** | Fast, consistent dashboards and comparison tables. Easy to make responsive. |
| Forms / validation | **React Hook Form** + **Zod** | RFQ posting, quotes, listings, verification docs. Zod schemas can be shared with the API. |
| Tables / filters | TanStack Table (when lists get heavy) | RFQ inbox, quote comparison, admin queues. |

Next.js also supports a **PWA** (installable, home-screen icon, basic offline shell). Treat that as “mobile v0,” not a fake native app.

### 3.2 Backend

Keep the backend **inside Next.js for MVP** (Route Handlers + server code). Split to a separate API service only when jobs, matching, or WhatsApp volume outgrow it.

| Layer | Choice | Why |
| --- | --- | --- |
| API | Next.js Route Handlers (`/api/...`) | One deploy, enough for V1. |
| ORM | **Drizzle** or **Prisma** | Either is fine. Drizzle is lighter SQL; Prisma is faster to start. Pick one and stay. |
| Database | **PostgreSQL** | Relational data: users, companies, categories, RFQs, quotes, listings, verification. Good full-text search to start. |
| Hosted Postgres | **Neon** (or equivalent serverless Postgres) | Branching for previews; fits Next.js. Swap host later if needed — stay on Postgres. |
| Auth | **Better Auth** or **Auth.js** | Email/password + magic link + Google. Roles: buyer, supplier, admin. Phone OTP later if needed. |
| File storage | **Cloudflare R2** or **S3** | Catalogues, certificates, machine photos/videos. Do not store blobs in Postgres. |
| Email | **Resend** (or SES) | RFQ submitted, quote received, verification status. |
| WhatsApp | **WhatsApp Cloud API** (Meta) | New RFQ to supplier; quote alert to buyer. Enquiry must be created **on-platform first**. |
| Background jobs | **Inngest** or **Trigger.dev** (or a simple queue) | RFQ matching, notification fan-out, moderation reminders. Do not do this only in the HTTP request. |
| Search (V1) | **Postgres full-text** + filters | Enough for 100–200 suppliers. |
| Search (later) | **Meilisearch** or **Algolia** | Typo-tolerant product/machine search and SEO landing pages. |

### 3.3 Hosting and ops

| Layer | Choice | Why |
| --- | --- | --- |
| Web hosting | **Vercel** | Native Next.js, preview deploys, edge/CDN for public pages. |
| Object CDN | R2/S3 + public CDN | Fast images for machine listings. |
| Images | **next/image** + a loader | Required for used-machinery photo galleries. |
| Analytics | **PostHog** or Plausible + a simple admin KPI dashboard | Funnel + PRD liquidity metrics (RFQs, quotes/RFQ). |
| Errors | **Sentry** | Dashboards and file uploads will break in the field. |
| Repo | **Monorepo later** (`apps/web`, `apps/mobile`, `packages/shared`) | Start as one Next.js app. Extract `packages/shared` (Zod types, API client) **before** Expo. |

---

## 4. What not to use in V1

Aligned with PRD non-goals.

| Avoid now | Why |
| --- | --- |
| Native iOS/Android app | Extra store, review, and two UIs before the RFQ loop is proven. |
| Flutter as the only client | Weak SEO; procurement discovery is search-driven. |
| Microservices | One Next.js app + Postgres is enough. |
| Kubernetes | Overkill. |
| Elasticsearch on day one | Postgres search until catalogue size hurts. |
| In-app wallet / escrow / JazzCash checkout | Year 3 transaction phase. |
| Custom chat server | Start with in-app threads + WhatsApp/email. Upgrade if volume demands it. |
| AI matching / Smart RFQ | Needs data. Rules: category + industry + city first. |
| Separate “mobile website” codebase | One responsive Next.js app. |

---

## 5. Mobile strategy (detail)

### 5.1 Phase 1 — Next.js *is* the mobile product

Every P0 screen in the PRD must work on a phone:

- Post RFQ
- Quote comparison table (horizontal scroll is acceptable; cramped Excel clones are not)
- Supplier profile, call, message
- Seller RFQ inbox and submit quotation
- Used-machine listing with photo upload

**PWA extras (cheap, high leverage in Pakistan):**

- Add to Home Screen
- Push (web push) for “new RFQ” / “new quotation” if WhatsApp is delayed
- Camera input for `input type="file"` on machine photos

This covers “I want it on mobile and web” for launch **without a second app.**

### 5.2 Phase 2 — Expo (React Native), same TypeScript family

Add native apps when at least one is true:

- Suppliers need reliable **push** and WhatsApp is not enough
- Field dealers need **camera + offline draft** for used machines
- Buyers/suppliers ask for App Store / Play presence (trust)

Then:

```
apps/web          → Next.js
apps/mobile       → Expo (iOS + Android)
packages/shared   → Zod schemas, API types, match-score helpers
```

**Share:** API contracts, validation, auth session strategy, design tokens.  
**Do not share:** Next.js pages/components 1:1 into React Native. UI is rewritten; business rules are not.

Expo is the default native choice because it stays in TypeScript/React. A second team in Flutter would duplicate every RFQ/quote screen.

### 5.3 Why not Next.js-only forever?

Browsers cannot match native push reliability, background upload of machine videos, or store listing credibility. When those matter, Expo — not “more Next.js.”

---

## 6. Architecture (logical)

```
                    ┌─────────────┐     ┌─────────────┐
                    │  Next.js    │     │ Expo app    │
                    │  Web + PWA  │     │ (Phase 2)   │
                    └──────┬──────┘     └──────┬──────┘
                           │                   │
                           └────────┬──────────┘
                                    │ HTTPS / same API
                           ┌────────▼────────┐
                           │  Application    │
                           │  (Next.js API)  │
                           └────────┬────────┘
              ┌─────────────┬───────┼────────┬──────────────┐
              ▼             ▼       ▼        ▼              ▼
         PostgreSQL      R2/S3   Email   WhatsApp      Job runner
         (source of      files   Resend  Cloud API     matching +
          truth)                                         notifications
```

**Source of truth is the database, not WhatsApp.** Notifications are a side effect after an RFQ or quote row exists.

---

## 7. Mapping stack → PRD modules

| PRD module | Stack implication |
| --- | --- |
| Supplier marketplace + SEO pages | Next.js SSR/SSG, unique URLs, sitemap, metadata |
| RFQ + quotations | Postgres transactions; job to notify matched suppliers |
| Used machinery | Object storage + image variants; structured columns (make, model, year, serial) |
| Verification | Document uploads to R2; admin workflow; badge as a field, not CSS-only |
| Messaging | First-party thread table; optional WhatsApp copy |
| Admin | Same Next.js app, role-gated `/admin` |
| Match score (later) | Job + SQL; not a separate “AI service” at start |
| Subscriptions (Year 2) | Stripe or local billing later; plans as data now |
| Escrow (Year 3) | Out of stack until then |

---

## 8. SEO (why Next.js specifically)

The PRD treats search pages as an acquisition channel. That is a **web** problem.

Next.js should render:

- Category pages
- Supplier public profiles
- Used-machine listings
- Intent pages (`/suppliers/pakistan/tablet-compression-machines`)

Use server rendering (or static generation where data is stable) so Google sees real HTML. A client-only SPA or a Flutter web export would fight this.

Mobile apps do not replace these pages. Apps sit **behind** login; SEO pages stay on the web forever.

---

## 9. Suggested V1 folder shape (single Next.js app)

```
apps/web/          (or repo root until a monorepo is needed)
  app/
    (public)/      search, categories, suppliers, machines, post-rfq
    (buyer)/       dashboard, rfqs, quotes, saved
    (seller)/      profile, listings, rfq-inbox, quotes, analytics
    (admin)/       approvals, verification, moderation
    api/           auth, webhooks, uploads
  lib/             db, auth, matching, notifications
  prisma/ or drizzle/
```

Extract `packages/shared` when Expo starts — not before.

---

## 10. Decision log

| Decision | Choice | Revisit when |
| --- | --- | --- |
| Web framework | Next.js | Never, unless SEO + React stop fitting |
| Mobile v0 | Responsive web + PWA | Native requested or push fails |
| Native later | Expo | Phase 2 criteria in §5.2 |
| Database | PostgreSQL | Unlikely |
| Backend | Next.js API first | Matching/WhatsApp volume needs workers at scale |
| Search | Postgres FTS | Catalogue search quality drops |
| Chat | In-app + WhatsApp | Real-time chat becomes a product |

---

## 11. One-line summary

**Next.js is the best stack for the web product and for phones in the browser. It is not the native mobile stack.** Build one Next.js marketplace (SEO + dashboards + PWA), keep a clean API, then add Expo if you need real iOS/Android apps — same TypeScript, same backend, two UIs.

---

*End of tech stack v1.0*

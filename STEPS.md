# Full project steps

**Product:** Pharmstore (public brand TBD)  
**Audience:** Any agent or developer building this repo  
**Version:** 1.0  
**Date:** 18 August 2026  
**Goal:** Ship a Pakistan-first B2B RFQ marketplace (pharma + food) that matches the PRD, stack, and Workshop editorial UI.

This file is the **build order**. Do not skip ahead to payments, native apps, or AI matching.

---

## How to use this file

1. Read **this page’s rules**, then the sources in Step 0.
2. Complete steps **in order**. A later step assumes earlier ones exist.
3. Each step has **Done when**. Do not mark it done from a screenshot of a template.
4. After every completed step: tick the box here **and** update [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) (status, next step, changelog).
5. If context is nearly full: update the handoff **before** stopping. The next agent starts at the first unchecked step.

### Hard rules (never violate)

| Rule | Why |
| --- | --- |
| Web first (Next.js). No Expo/Flutter in V1 | SEO + procurement desks |
| No cart, escrow, JazzCash, logistics, ERP | PRD non-goals |
| RFQ is the core loop, not product browsing | Differentiator |
| Buyers free; suppliers free in Year 1 | Liquidity |
| Restyle shadcn — no default Inter/zinc/indigo | FRONTEND_DESIGN §3 and §1A |
| Create RFQ/enquiry **before** WhatsApp | Moat + metrics |
| Pharma + food categories only at launch | Do not become a general directory |
| Public pages must pass attractiveness bar | FRONTEND_DESIGN §1A |

### Sources of truth (do not reinvent)

| Doc | Use for |
| --- | --- |
| [PRD.md](./PRD.md) | Fields, statuses, permissions, user stories, MVP cut |
| [TECH_STACK.md](./TECH_STACK.md) | Libraries, hosting, what not to build |
| [FRONTEND_DESIGN.md](./FRONTEND_DESIGN.md) | Tokens, types A–E, layouts §8, motion, §1A beauty |
| [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) | Current state |
| Canvas `section-8-wireframes.canvas.tsx` | Click-through structure (not final visuals) |

---

## Progress tracker

Copy this into the handoff when you update it.

- [x] 0 Read and lock
- [x] 1 Repo + Next.js scaffold
- [x] 2 Design system (tokens, fonts, primitives)
- [x] 3 Database + domain schema
- [x] 4 Auth, roles, organisations
- [x] 5 Public chrome + homepage
- [x] 6 Categories, search, supplier directory
- [x] 7 Supplier profile (mini-website)
- [x] 8 Used machinery listings
- [x] 9 Buyer: Post RFQ
- [x] 10 Matching + Open RFQ
- [x] 11 Seller: quote + inbox
- [x] 12 Buyer: quote comparison
- [ ] 13 Messaging + email notifications *(in-app Notification rows exist; no email/WhatsApp yet)*
- [x] 14 Admin ops *(RFQ open/reject + supplier approve; no on-behalf profile builder yet)*
- [x] 15 Seed data + empty-marketplace rules
- [ ] 16 Analytics events + liquidity dashboard *(model exists; events not wired)*
- [ ] 17 SEO, legal, performance, PWA *(terms/privacy/how-it-works live)*
- [ ] 18 Staging deploy + launch checklist
- [ ] 19 P1 only after liquidity (do not start now)

---

## Step 0 — Read and lock

**Goal:** The agent knows the product and will not reopen closed decisions.

**Do**

1. Read AGENT_HANDOFF.md (full).
2. Read PRD: executive summary, principles, §8 P0, §11 data dictionaries, §12 statuses, Scenario A in appendix.
3. Read TECH_STACK §1–4.
4. Read FRONTEND_DESIGN §1, **§1A**, §3–8, §10.
5. Open the §8 canvas if available; walk Home → Post RFQ → quotes.

**Done when:** You can state in one paragraph: RFQ loop, buyers free, Workshop editorial, no checkout.

**Do not:** Redesign the brand, switch to Flutter, or add a shopping cart “just for small parts.”

---

## Step 1 — Repo + Next.js scaffold

**Goal:** A running App Router app in this workspace.

**Stack (lock these, do not bikeshed)**

- Next.js (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui (will be restyled in Step 2)
- React Hook Form + Zod
- Prisma + PostgreSQL (Neon is fine)
- Auth.js **or** Better Auth — pick **one** in this step and never mix
- `next/image`

**Do**

1. `create-next-app` in `d:\taha\Pharmstore` (or `apps/web` only if you already need a monorepo — default is **repo root app**).
2. ESLint, Prettier, path alias `@/`.
3. Env template: `DATABASE_URL`, `AUTH_SECRET`, `BLOB`/`R2` keys, `RESEND_API_KEY` — empty values OK.
4. Folder sketch:

```
app/
  (public)/          home, search, suppliers, machines, how-it-works, legal
  (auth)/            login, register
  (buyer)/           dashboard, rfqs
  (seller)/          dashboard, listings, inbox
  (admin)/           queues
  api/               auth, webhooks
components/          ui (shadcn), workshop (stamps, title-block, etc.)
lib/                 db, auth, matching, notifications
prisma/              schema + seed
```

5. `.gitignore` for `.env*`.
6. README: how to run locally.

**Done when:** `npm run dev` shows a placeholder page. Git works if the user wants it (do not force remotes).

**Do not:** Add Stripe, Redis, Elasticsearch, or a second package manager.

---

## Step 2 — Design system (attractive Workshop editorial)

**Goal:** Every screen can use tokens so nothing looks like default shadcn or the gray canvas.

**References:** FRONTEND_DESIGN §6, §1A, §10, §11.

**Do**

1. CSS variables: `ink` `#12141A`, `ink-soft`, `paper` `#F4F1EA`, `sheet` `#FFFcf7`, `rule`, `mill`, `steel` `#1F4B5A`, `mark` `#E3B341`, `mark-ink`, `live`, `hold`, `stop`.
2. Fonts: **Newsreader** or **Source Serif 4** (display) + **IBM Plex Sans** (UI, tabular nums) + **IBM Plex Mono** (stamps/filters). `font-display: swap`.
3. Radius 2–4px. Hairline borders. Almost no shadow.
4. Restyle shadcn Button, Input, Table, Dialog, Sheet, Toast to these tokens. Kill Inter and zinc.
5. Build workshop primitives: `TitleBlock`, `Stamp`, `MarkButton` (yellow Post RFQ only), `InkButton`, `Nameplate`, `Sheet`, `ContactSheet`, `DefinitionList`, `EmptyDesk`, `StickyActions`.
6. Motion tokens: 120 / 180 / 240ms, `ease-machine`. `prefers-reduced-motion`.
7. Public layout shell + app shell (buyer/seller/admin).
8. Placeholder industrial photos in `/public` (licensed or clearly temporary). Home **must not** ship without a photograph-scale hero.

**Done when:** A Story-less demo route (or home WIP) shows serif 48px+, overlapping paper on a photo, yellow Post RFQ, stamp, and a table that does not look like shadcn docs.

**Do not:** Gradients, glass, Lottie blobs, dark-mode public, pill-shaped primary CTAs.

---

## Step 3 — Database + domain schema

**Goal:** Prisma models match PRD §11–12.

**Entities (minimum)**

- User (role: buyer | supplier | admin)
- BuyerOrganisation, SupplierOrganisation
- Category (parent, kind, slug, active)
- ProductListing, UsedMachineListing
- Rfq, Quotation, MessageThread, Message
- VerificationCase
- Notification
- SavedSupplier, FavouriteListing
- AnalyticsEvent (or equivalent)

**Statuses:** copy enums from PRD §12. Do not invent extra ones.

**Do**

1. Write `schema.prisma` with PKR as integer *or* decimal — be consistent (suggest integer paisa or decimal `Decimal(14,2)`).
2. Cities as enum or seed table (PRD appendix city list).
3. File URLs as strings pointing at object storage — no blobs in Postgres.
4. Initial migration + `prisma db seed` stub.
5. Indexes: RFQ status+createdAt, listing status+category, supplier publicStatus, category slug unique.

**Done when:** `prisma migrate` applies on a local or Neon database; seed can create one admin user.

**Do not:** Elasticsearch. Do not encode verification as a CSS class with no field.

---

## Step 4 — Auth, roles, organisations

**Goal:** Register/login as buyer **or** supplier; admin via seeded account.

**References:** PRD §6, FRONTEND_DESIGN §8.8.

**Do**

1. Email + password (magic link optional). Password reset.
2. Register: two large sheets (buyer vs supplier), not a dropdown.
3. Create User + Organisation in one transaction.
4. Middleware: `(buyer)` / `(seller)` / `(admin)` route gates.
5. V1: one user ↔ one org. Dual-role is P1 — ops workaround if needed.
6. Guest: browse public; no phones on search cards (PRD §6.3).
7. Session on public pages so Post RFQ can return to the form after login.

**Done when:** You can register a buyer and a supplier, log in, hit 403 on the other role’s dashboard, and log in as admin.

**Do not:** Phone OTP yet (P1). Do not show supplier mobile to guests.

---

## Step 5 — Public chrome + homepage

**Goal:** Attractive Type A homepage that converts to Search or Post RFQ.

**References:** FRONTEND_DESIGN §8.1, §1A; canvas Home.

**Do**

1. Header: wordmark, search, **Post RFQ** (MarkButton, always visible), Log in. Mobile: Post RFQ not buried in the menu.
2. Hero: ~62/38 photo + overlapping paper panel; serif “Find trusted industrial suppliers”; industry chips; Search suppliers + Post an RFQ.
3. 01 Categories: photo tiles + name + count (counts can be 0 at first).
4. 02 RFQ band (repeat pattern).
5. 03 How it works (three numbered steps, no icon circles).
6. 04 Used this week (contact-sheet; hide section if zero live listings).
7. Footer: industries, cities, legal placeholders.
8. Sticky compact header on scroll. Motion: hairline draw under H1 once.

**Done when:** Lighthouse-ish LCP is the hero image or title (not a JS dashboard). §1A review bar passes. Mobile sticky Post RFQ works.

**Do not:** Fake “12 people viewing.” Do not use a tilted SaaS dashboard mock in the hero.

---

## Step 6 — Categories, search, supplier directory

**Goal:** Type B browse/search for **approved** suppliers.

**Do**

1. Seed Phase 1 pharma taxonomy (PRD §24): industries → families → ~15–30 leaf types. Include used-machine families.
2. Admin-only category CRUD can wait until Step 14; seed JSON is enough to start.
3. Search: All | Suppliers | Products | Used machines.
4. Filters: industry, category, city, min verification.
5. Desktop: filter rail + **table** of suppliers (logo, name, stamp, city, industries, Request quotation).
6. Toggle grid for used machines (photo-first).
7. Zero results: one sentence + Post RFQ.
8. SSR/SSG category pages with unique titles for SEO later.

**Done when:** An approved supplier in “Tablet compression” appears in that category; a pending supplier does not.

---

## Step 7 — Supplier profile (mini-website)

**Goal:** Public Type C profile; seller can edit and submit for review.

**Do**

1. Public: header + stamp, about, products, used machines, certificates, cities, CTAs.
2. Desktop 7/5 with sticky Request quotation / Call / Message / catalogue.
3. Mobile sticky bottom Request | Call.
4. Seller: profile form, completeness checklist (PRD §20.4).
5. Status: draft → pending_review → approved. Only approved is public.
6. Admin can create a profile on behalf (Month 2 supply build) — implement in Step 14 if time-boxed, but schema must allow `createdByAdmin`.

**Done when:** Scenario-like: approved ABC Engineering URL works; Request quotation starts an RFQ (Step 9) pre-filled / single-supplier.

---

## Step 8 — Used machinery listings

**Goal:** Specification-first listings, not classified ads.

**Do**

1. Create/edit form with PRD §11.6 required fields. Min 5 photos for submit (ops waiver flag).
2. Public page: ContactSheet gallery, title block, definition list, stamps INSPECTION / INSTALLATION / VIDEO, enquire rail.
3. Enquire creates RFQ linked to listing (or private single-supplier RFQ).
4. Moderation required before Live. Sold / withdrawn hide from search.
5. Filters: condition, manufacturer, city, inspection available.

**Done when:** Live HPLC-style listing is findable and enquireable; two-photo junk cannot go Live without admin waiver.

---

## Step 9 — Buyer: Post RFQ

**Goal:** The demand engine.

**References:** PRD §15, §11.7, §12.1; FRONTEND_DESIGN §8.5.

**Do**

1. Auth wall: register/login as buyer; preserve category from deep link.
2. Wizard: 01 What → 02 Quantity & when → 03 Optional → 04 Review.
3. Draft autosave (`DRAFT SAVED HH:MM`).
4. Visibility V1: matched suppliers only — **not** Google-indexed.
5. Submit → status `Submitted`. Buyer sees “We’ll review and notify matching suppliers.”
6. “Send to this supplier only” from profile/listing skips matching later.

**Done when:** A buyer completes the canonical RFQ (500 L SS316, qty 2, Lahore, 30 days) and sees it in My RFQs as Submitted.

---

## Step 10 — Matching + Open RFQ

**Goal:** Right suppliers get the RFQ; quality over blast.

**References:** PRD §23.

**Do**

1. Admin (or allowlisted auto-open later): classify if “Not sure”, then Open.
2. Candidate rules: approved supplier, category overlap, industry overlap, city/nationwide.
3. Cap default **12**, aim **6–10** notified, **3–5 quotes**. Rank: admin pin, verification, same city, completeness, recency.
4. Job/queue: do not notify 40 vendors inside the HTTP request if it may timeout — Inngest/Trigger or sequential after Open is OK for V1 volume.
5. Store match rows (who was notified). Buyer sees match count.

**Done when:** Opening the vessel RFQ notifies only relevant fabricators/machinery suppliers, not a dairy-only packer. Admin can add a missed supplier.

---

## Step 11 — Seller: quote + inbox

**Goal:** Suppliers can earn the loop.

**Do**

1. Seller dashboard: work queue — views, RFQs received, quotes submitted (big tabular numbers, no pie charts).
2. RFQ feed: Open RFQs matched to them.
3. Quote form: PRD §11.8 (price PKR, delivery, warranty, notes, PDF).
4. One quote per RFQ; allow one revision until closed; withdraw.
5. Lead inbox: matched RFQs + profile/listing enquiries.
6. Cannot see other suppliers’ prices.

**Done when:** Three suppliers can submit the comparison-table example (1.80m / 1.65m / 2.10m).

---

## Step 12 — Buyer: quote comparison

**Goal:** One table (desktop) / cards (mobile) to shortlist.

**References:** FRONTEND_DESIGN §8.6; PRD US-Q2.

**Do**

1. RFQ detail: title block, status stamp, closing, match count, spec definition list.
2. Desktop: frozen supplier column; expand row for notes/PDF; Message / Call.
3. Mobile: stacked cards in order price → delivery → warranty → stamp. Same data, never drop warranty.
4. Empty: “Waiting for quotations.”
5. Buyer can extend closing or cancel.

**Done when:** Scenario A in PRD appendix is completable with real accounts.

---

## Step 13 — Messaging + email notifications

**Goal:** Threads are the system of record; email is the V1 guarantee.

**Do**

1. One thread per RFQ per supplier.
2. Text + optional file. Log call clicks.
3. Notifications (in-app + email): RFQ submitted; changes requested/rejected; RFQ Open (supplier); quote submitted (buyer); listing/supplier approved or rejected.
4. Copy from PRD §18.4.
5. WhatsApp Cloud API = **optional** behind env; never instead of creating the row.

**Done when:** Supplier receives email on Open; buyer receives email on first quote; messages persist on the RFQ.

---

## Step 14 — Admin ops

**Goal:** Ops can run Month 2–3 without engineering.

**Do**

1. Liquidity home: pending RFQs, pending suppliers, quotes/RFQ 30d, pending listings, active buyers.
2. Queues: suppliers (approve/reject, set verification level, preview), RFQs (classify, match, Open, reject with reason), listings (checklist).
3. Create supplier/buyer org on behalf.
4. Category hide/create.
5. Audit: who approved verification (user, time).
6. CRM-lite notes + anchor flag.

**Done when:** Ops can onboard a supplier without them registering first, and reject spam RFQs with zero supplier emails.

---

## Step 15 — Seed data + empty-marketplace rules

**Goal:** Honest empty states; path to 100–200 suppliers.

**Do**

1. Seed: admin, 2–3 demo approved suppliers (clearly demo), pharma categories, 1 demo used machine **or** hide used section if none.
2. Never fake reviews, quote counts, or “trending” ghosts.
3. README for ops: how to import suppliers (CSV later is P1; admin form is P0).

**Done when:** Staging with zero suppliers still looks intentional (Post RFQ + how it works), not broken.

---

## Step 16 — Analytics events + liquidity dashboard

**Goal:** Moat data + PRD KPIs.

**Events:** profile view, listing view, catalogue download, RFQ submit/open/match, quote submit, message, call click, search query.

**Admin KPIs:** active buyers/suppliers, RFQs/month, quotes/RFQ, response time. Target **3–5 quotes per qualified RFQ**.

**Done when:** Completing Scenario A writes events you can query. No vanity-only registration chart as the main view.

---

## Step 17 — SEO, legal, performance, PWA

**Do**

1. Index: home, categories, approved profiles, live listings. **Noindex:** dashboards, RFQs, messages, admin, drafts.
2. Unique titles/descriptions; sitemap; metadata API.
3. Terms + privacy: platform does not sell the goods; quotes ≠ POs.
4. Images: `next/image`, dimensions, srcset; hero budget for 4G.
5. CLS: reserved stamp widths.
6. Optional PWA: install + basic shell. Web push is P1.
7. Sentry + one analytics tool.

**Done when:** `robots`/metadata correct; legal pages live; mobile 4G homepage is usable.

---

## Step 18 — Staging deploy + launch checklist

**Do**

1. Neon (or Postgres) + Vercel + R2/S3 + Resend.
2. Preview deploys on PRs if git remote exists.
3. Run PRD appendix Scenario A–E on staging.
4. **Do not publicly advertise** until ~100–200 suppliers and 30–50 anchor buyers are in motion (GTM is ops; product must not depend on an empty network).

**Launch = Scenario A completable with real users**, not “pages exist.”

**Done when:** Staging URL works; env secrets not in git; admin can operate.

---

## Step 19 — P1 (after liquidity only)

Do **not** start these in the first build pass:

- Quote accepted/declined/won-lost, reviews, match score, phone OTP, multi-user orgs, dual-role, WhatsApp templates, self-serve paid plans, featured listings, SEO intent landing factories, PWA push, bilingual Urdu.

**P2 / Year 2–3:** Smart RFQ, certified inspection, escrow, payments, Expo native apps, GCC.

---

## Vertical slice (if you must demo early)

If the user needs a demo before all steps, ship **in this order** and stop at a demo tag:

1. Steps 1–4  
2. Step 5 (homepage)  
3. Steps 9–12 with **admin-forced matches** (skip fancy ranking)  
4. Step 14 RFQ approve + Open  

That is a credible “one requirement, three quotes” demo. Then fill 6–8, 13, 15–18.

---

## Step working protocol (every coding session)

1. Open AGENT_HANDOFF.md → first unchecked STEPS box.  
2. Implement only that step (or the vertical slice the user named).  
3. Check **Done when**.  
4. Tick STEPS.md + update handoff next-step line.  
5. If blocked on secrets (Neon, Resend), use local stubs and document in handoff — do not skip the product behaviour.

---

## Explicitly out of this whole-project plan (V1)

Shopping cart, escrow, in-app payments, warehousing, logistics, ERP/PO accounting, trade finance, cross-border, 10k categories, AI Smart RFQ, Marketplace Certified product, native iOS/Android, fake social proof.

---

*End of STEPS.md v1.0*

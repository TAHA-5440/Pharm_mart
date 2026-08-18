# Product Requirements Document

**Product working name:** Pharmstore (public brand TBD)  
**Document type:** Product Requirements Document  
**Market:** Pakistan-first B2B industrial marketplace  
**Initial industries:** Pharmaceutical manufacturing; Food & Beverage manufacturing  
**Version:** 2.0  
**Status:** Detailed draft — ready for design and implementation planning  
**Date:** 18 August 2026  
**Supersedes:** PRD v1.0  

**Scope of this document:** *what* to build, for *whom*, with *which* rules, fields, states, and acceptance criteria.  
**Out of this document:** languages, frameworks, hosting, databases, and third-party platforms. Those live in [TECH_STACK.md](./TECH_STACK.md).

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [Vision, positioning, and principles](#2-vision-positioning-and-principles)
3. [Problem and opportunity](#3-problem-and-opportunity)
4. [Goals, non-goals, and success metrics](#4-goals-non-goals-and-success-metrics)
5. [Personas](#5-personas)
6. [Roles, accounts, and permissions](#6-roles-accounts-and-permissions)
7. [Glossary](#7-glossary)
8. [Release scope](#8-release-scope)
9. [Product architecture](#9-product-architecture)
10. [Information architecture](#10-information-architecture)
11. [Domain objects and data dictionaries](#11-domain-objects-and-data-dictionaries)
12. [Status machines](#12-status-machines)
13. [Discovery, homepage, search, and categories](#13-discovery-homepage-search-and-categories)
14. [Supplier marketplace](#14-supplier-marketplace)
15. [RFQ marketplace](#15-rfq-marketplace)
16. [Quotations](#16-quotations)
17. [Used machinery marketplace](#17-used-machinery-marketplace)
18. [Messaging and notifications](#18-messaging-and-notifications)
19. [Buyer workspace](#19-buyer-workspace)
20. [Seller workspace](#20-seller-workspace)
21. [Admin and operations](#21-admin-and-operations)
22. [Trust and verification](#22-trust-and-verification)
23. [Matching and lead routing](#23-matching-and-lead-routing)
24. [Category taxonomy](#24-category-taxonomy)
25. [Content, language, and SEO](#25-content-language-and-seo)
26. [Business model (product implications)](#26-business-model-product-implications)
27. [Go-to-market product requirements](#27-go-to-market-product-requirements)
28. [Non-functional requirements](#28-non-functional-requirements)
29. [Risks, assumptions, and open questions](#29-risks-assumptions-and-open-questions)
30. [Appendices](#30-appendices)

---

## 1. Executive summary

Pharmstore is a **verified B2B procurement and industrial asset platform** for Pakistan’s manufacturing industry. It is not a general product-listing website and not a consumer checkout.

Buyers (procurement managers at factories, labs, hospitals, and related manufacturers) use it to:

- Find verified local suppliers
- Post a requirement once and receive comparable quotations
- Find technical service providers (installation, maintenance, validation, calibration)
- Buy and sell used industrial machinery with enough specification to take seriously

Sellers (machinery makers, dealers, packaging and raw-material suppliers, fabricators, service companies, used-equipment sellers) use it to receive **qualified industrial demand**, not generic directory traffic.

**Positioning statement**

> The verified B2B marketplace for Pakistan’s manufacturing industry. Find suppliers. Request quotations. Buy equipment. Sell machinery.

**Primary strategic rule**

Do not start by selling everything to everybody. Own industrial procurement for **pharmaceutical** and **food** first. Become the place a factory goes when a procurement manager says: *find me three reliable suppliers for this.*

**Primary product rule**

Version 1 is an **RFQ marketplace**, not a shopping cart. A PKR 25 million tablet compression machine is not bought like a mobile phone.

**Core loop (must work at launch)**

Buyer posts a serious RFQ → matched verified-enough suppliers are notified → 3–5 comparable quotations arrive → buyer shortlists, messages, or calls → activity stays linked to the RFQ on the platform.

---

## 2. Vision, positioning, and principles

### 2.1 Long-term vision

A lightweight **B2B procurement operating system** for Pakistani (then regional) manufacturing: suppliers, RFQs, quotations, used assets, verification, later purchase orders, payments, inspection, logistics, and financing.

The website is not the moat. The moat is the **network and data**: verified suppliers, buyer RFQ history, quote outcomes, machine catalogue, and pricing intelligence.

### 2.2 Positioning versus existing B2B portals

Broad Pakistani B2B directories already exist (e.g. Alahdeen, B2BMAP, Tradewheel). Copying them is a losing strategy.

| Typical B2B directory | This product |
| --- | --- |
| Broad categories | Manufacturing-focused (pharma + food first) |
| Basic profiles | Verified businesses with visible, earned badges |
| Product listing | Procurement workflow |
| Generic leads | Matched industrial RFQs |
| Contact exchange | Quote comparison table |
| Classified ads | Specification-rich used machinery |
| No inspection | Inspection pathway (later certified equipment) |
| Advertising platform | Procurement platform |

**Outcome copy (always lead with this, never “please register”)**

| Audience | Promise |
| --- | --- |
| Buyers | One requirement. Multiple verified quotations. |
| Suppliers | Get industrial buyers actively looking for your products. |
| Machinery sellers | Sell industrial equipment to verified businesses nationwide. |

**Supplier onboarding pitch (ops and sales must use this)**

Not: *Register on our marketplace.*  
Yes: *We are building Pakistan’s industrial procurement platform and will send verified purchasing requirements directly to suitable suppliers.*

### 2.3 Product principles (non-negotiable)

1. **Procurement over catalogue.** Homepage, CTAs, and dashboards centre on finding suppliers and posting RFQs.
2. **Buyers free, suppliers freemium.** Buyers are the demand engine; suppliers are the monetization engine.
3. **Trust is a product.** Verification levels are visible and earned. Reviews alone are not enough.
4. **Do not fight behaviour.** WhatsApp, phone, and email stay in the loop. The platform **creates the enquiry first** so it can be tracked.
5. **Quality of quotes over volume.** Target 3–5 strong quotations per qualified RFQ, not 30 low-quality replies.
6. **Liquidity over registrations.** Active buyers, RFQs, and quotes-per-RFQ beat sign-up counts.
7. **Two industries first.** Pharma + food until the loop works.
8. **No checkout in V1.** RFQ first; transactions years later.
9. **Structured data everywhere.** Every RFQ, quote, listing, and message thread must be queryable later. Untracked WhatsApp-only conversations are a product failure.
10. **Web first, phone-usable.** Public SEO pages and dashboards must work on desktop and mobile browser. Native apps are a later client, not a second product.

### 2.4 Recommended company build sequence

1. Pharma + Food  
2. Verified supplier directory  
3. RFQ marketplace  
4. Used machinery marketplace  
5. Supplier subscriptions  
6. Inspection and verification services  
7. Procurement software (lightweight OS)  
8. Payments / escrow  
9. Logistics / financing  
10. GCC expansion  

---

## 3. Problem and opportunity

### 3.1 Current buying behaviour

A procurement manager who needs a *stainless steel 500 L mixing tank* typically:

1. Asks colleagues  
2. Calls known vendors  
3. Searches Google  
4. Messages WhatsApp groups  
5. Contacts dealers  
6. Collects quotations in mismatched PDFs, images, and voice notes  

The process is slow, informal, and hard to audit.

### 3.2 Buyer problems

| Problem | What happens today | Product response |
| --- | --- | --- |
| Legitimate suppliers are hard to find | Rely on a small known set | Verified supplier directory + matching |
| Prices are not transparent | Weak negotiation | Comparable quote table |
| Quotations arrive in different formats | Hours of spreadsheet work | Structured quote fields |
| Credentials are hard to verify | Compliance and fraud risk | Verification levels + documents |
| Local specialists are invisible | Default to famous / imported | Industry + city filters, SME profiles |
| Spare parts take days | Line downtime | Category search + RFQ for parts |
| Used equipment is informal | Photo ads, no specs, no inspection | Structured listings + later certification |

### 3.3 Supplier problems

| Problem | What happens today | Product response |
| --- | --- | --- |
| High spend on salespeople | Costly coverage | Qualified inbound RFQs |
| Unqualified leads | Wasted quoting | Matching + buyer company context |
| Poor online visibility | Lost to better-known names | Mini-website profile + SEO pages |
| Google ads bring junk enquiries | Low conversion | Industrial RFQs with specs |
| Directories go stale | Buyers stop trusting them | Ops verification + activity scores |

### 3.4 Market context (why Pakistan first)

- **Pharmaceutical manufacturing** is regulated. DRAP publishes information on licensed manufacturing units, which can support verification where applicable.
- **Food and beverage processing** is described by the Board of Investment as Pakistan’s second-largest industry after textiles, with a significant share of manufacturing value addition and employment.
- **Digital payments exist at scale** (SBP: 9.1 billion retail payment transactions in FY25; Q2 FY26 review: 305 million e-commerce purchases worth PKR 422 billion in one quarter). This supports *later* payments/escrow, **not** the MVP.

V1 is Pakistan-only (cities, verification documents, copy, categories). Cross-border (UAE, GCC, China, India, Turkey, Europe) is a later geographic stage after domestic liquidity.

### 3.5 Geographic stages (product scope)

| Stage | Geography | Product implication |
| --- | --- | --- |
| 1 (now) | Pakistan | PKR, Pakistani cities, NTN/DRAP/provincial docs |
| 2 | Pakistan + UAE | Multi-currency, export-ready suppliers — out of V1 |
| 3 | Saudi Arabia + GCC | Same |
| 4 | Regional sourcing | International equipment into Pakistani factories — out of V1 |

Long-term commercial story: Pakistani manufacturers → GCC buyers, and international equipment suppliers → Pakistani factories. **Do not build this until the domestic RFQ loop works.**

---

## 4. Goals, non-goals, and success metrics

### 4.1 Product goals (Year 1)

1. Become the default place a pharma or food procurement manager goes to get **three reliable suppliers** for a requirement.
2. Make **RFQ + comparable quotations** the core loop, not product browsing.
3. Make **verification** visible and meaningful (at least Registered and Business Verified in production).
4. Make **used machinery** specification-rich, not classified ads.
5. Keep **buyers free**; do not block liquidity with supplier paywalls in Year 1.
6. Capture every enquiry on-platform even if the conversation continues on WhatsApp or phone.

### 4.2 Explicit non-goals (not in Version 1)

| Out of V1 | Why |
| --- | --- |
| Shopping cart / consumer checkout | Industrial buying cycle is RFQ → PO |
| Escrow, in-platform payments, JazzCash/card checkout | Year 3 transaction phase |
| Warehousing, logistics, last-mile | Not the first problem |
| ERP, accounting, full PO/invoice OS | Later “procurement OS” |
| Trade finance, leasing, insurance | After liquidity |
| Cross-border trade | After Pakistan liquidity |
| 10,000 categories / general marketplace | Dilutes specialization |
| AI Smart RFQ | Needs catalogue and RFQ history |
| Marketplace Certified Equipment product | Needs inspection partners |
| Native iOS/Android apps | Web + mobile browser first |
| Public reviews as the trust system | Verification first; reviews are secondary |

### 4.3 North-star metric

**100 companies that repeatedly submit serious RFQs.**

Not 10,000 registered users. A marketplace with 150 suppliers and 50 active procurement departments is more valuable than 500 suppliers and zero buyers.

### 4.4 Liquidity KPIs (definitions)

Admin and later leadership views must show these. Definitions are part of the product.

| KPI | Definition | Target (early) |
| --- | --- | --- |
| Active buyers | Distinct buyer organisations that posted or meaningfully engaged with ≥1 RFQ in the last 30 days | Growing; quality over count |
| Active suppliers | Distinct suppliers that viewed or responded to ≥1 RFQ in the last 30 days | — |
| RFQs / month | RFQs that reach status `Open` or beyond (not drafts, not rejected spam) | Year 1 model: 500 |
| Qualified RFQ | Moderated, complete, serious industrial requirement (ops flag or rules) | Most Open RFQs should be qualified |
| Quotes / RFQ | Number of submitted quotations per Open/Closed RFQ | **3–5 strong quotes** |
| RFQ response time | Time from `Open` to first submitted quote | Track; improve |
| Time to 3 quotes | Time from `Open` to third submitted quote | Track |
| Buyer repeat rate | Buyers with ≥2 RFQs in 90 days / buyers with ≥1 RFQ in 90 days | High |
| Supplier response rate | RFQs matched to a supplier that received a quote or explicit decline | Track by supplier |
| Leads / supplier | Quote requests + matched RFQs per supplier per month | Seller ROI story |
| Paid supplier conversion | Paying suppliers / registered suppliers | Year 1 may be ~0–10% by design |
| Supplier churn | Paying suppliers who cancel or go inactive | After monetization |
| RFQ → reported transaction | Buyer or seller marks a deal won (self-reported in V1) | Directional only |
| CAC / LTV | After paid plans exist | — |

**Anti-metrics (do not optimise)**

- Raw registrations  
- Quotes per RFQ above ~8 (usually means poor matching)  
- Page views without RFQs  

### 4.5 Strategic 3-year model (not a forecast)

| Metric | Year 1 | Year 2 | Year 3 |
| --- | --- | --- | --- |
| Registered suppliers | 1,000 | 5,000 | 15,000 |
| Paying suppliers | 100 | 750 | 2,500 |
| Registered buyers | 2,000 | 15,000 | 50,000 |
| RFQs / month | 500 | 3,000 | 10,000 |
| Used machines listed | 500 | 3,000 | 10,000 |
| Major industries | 2 | 5 | 10+ |

---

## 5. Personas

Each persona includes context, jobs, success, constraints, and product implications.

### 5.1 Buyer — procurement manager (primary, demand engine)

**Name (composite):** Ahmed, Purchase Manager  
**Organisation:** Mid-size pharmaceutical plant, Lahore (or food plant, Faisalabad)  
**Team:** 1–3 purchase officers; reports to GM / owner  
**Tools today:** WhatsApp, Excel, email, phone, Google  

**Jobs to be done**

- Source a machine, spare, packaging material, or service before a production deadline  
- Get 3 comparable quotes he can show management  
- Avoid fake or unlicensed vendors (especially pharma)  
- Keep a record of who was asked and what they quoted  

**Success looks like**

Posted one RFQ in 10 minutes; by day 3 has 3–5 quotes in one table with price, delivery, warranty, and verification badges; can call two shortlisted suppliers without losing the thread.

**Constraints**

- Busy; will abandon long forms  
- May not have CAD; may have a photo, PDF spec, or verbal description  
- Desktop at office; phone in the plant and after hours  
- English OK for technical terms; Urdu for conversation  
- Will still close on WhatsApp — that is acceptable if the RFQ and quotes exist on-platform  

**Willingness to pay:** None in V1. Buyers stay free.

**Fear:** Posting a requirement that leaks to competitors or attracts brokers. V1 should allow company-name visibility to matched suppliers (needed for trust) but not make RFQs a public classified ad by default.

### 5.2 Buyer — plant / engineering lead (influencer)

**Jobs:** Confirm technical fit (SS316 vs SS304, capacity, utilities, GMP). May attach drawings. May reject a cheap quote as non-compliant.

**Product implication:** RFQ attachments; quote notes and spec sheets; optional technical questions in messages.

### 5.3 Buyer — owner of a smaller factory

Less process, more WhatsApp. Needs a very short RFQ form and a prominent call button. Still must land in the same data model.

### 5.4 Secondary buyers (not launch marketing focus)

Nutraceutical, cosmetics, chemical, packaging converters, contract manufacturers, hospital/lab procurement, distributors. Accounts may exist; IA and sales focus stay pharma + food.

### 5.5 Seller — machinery manufacturer / engineering company (primary monetization)

**Name (composite):** ABC Engineering, Lahore, established 2008  
**Jobs:** Get RFQs that match what they actually build; look professional online; know which leads are worth quoting.

**Success:** This month — 87 RFQs received, 42 quotes sent, 7 deals reported — enough to justify Rs 15,000–30,000 later.

**Constraints:** Small sales team; will ignore a portal that sends junk. Must get WhatsApp/email the same day as the RFQ.

### 5.6 Seller — equipment dealer / used-machinery trader

**Jobs:** List machines with enough data to get serious buyers; avoid tyre-kickers; optional inspection later.

**Fear:** Giving away stock to brokers. V1 shows price or “request price”; seller can choose.

### 5.7 Seller — packaging / raw-material / spare-parts SME

Weaker website. The supplier profile *is* their digital sales department. Catalogue PDF + product list + Request quotation matter more than a fancy storefront.

### 5.8 Seller — service provider

Installation, maintenance, validation, calibration, automation, HVAC, water systems. Categories must include **services**, not only products. RFQ type: Product / Service / Turnkey / Spare / Used machine.

### 5.9 Admin / operations

Internal: approve suppliers, verification, moderate RFQs and machines, route high-value RFQs, manage categories, talk to anchor buyers, report liquidity.

**Success:** Queue of pending suppliers and RFQs is empty daily; quotes/RFQ stays in 3–5 band; fake listings do not go live.

### 5.10 Future — inspection partner (P2)

Engineer or approved firm producing Marketplace Certified Equipment reports. No login product in V1 beyond maybe a note field that inspection was requested.

### 5.11 Future — finance / billing (P2)

Offline invoicing of supplier plans is enough in Year 1. Self-serve subscriptions are P1/P2.

---

## 6. Roles, accounts, and permissions

### 6.1 Account types

| Type | Who | Notes |
| --- | --- | --- |
| Guest | Anonymous visitor | Can search, view public profiles and live listings; cannot post RFQ or quote |
| Buyer user | Person | Belongs to one buyer organisation in V1 |
| Supplier user | Person | Belongs to one supplier organisation in V1 |
| Admin | Internal staff | Full ops tools |
| Super-admin | Founder / lead ops | Role management, destructive actions |

V1: a person is **either** a buyer **or** a supplier **or** admin. Dual-role (factory that also sells used machines) is **P1**: allow a second organisation membership or a “also sell used equipment” flag on a buyer org. Until then, ops can create a second account if needed.

### 6.2 Organisation types

| Org type | Description |
| --- | --- |
| Buyer organisation | Factory, lab, hospital, distributor that posts RFQs |
| Supplier organisation | Company that lists products/machines and quotes |

A used-machine seller is a supplier organisation (may have zero manufactured products).

### 6.3 Permission matrix (V1)

| Action | Guest | Buyer | Supplier (pending) | Supplier (approved) | Admin |
| --- | --- | --- | --- | --- | --- |
| Browse public catalogue | Yes | Yes | Yes | Yes | Yes |
| View public supplier profile | Yes | Yes | Yes | Yes | Yes |
| View live used listing | Yes | Yes | Yes | Yes | Yes |
| See supplier phone | No* | Yes if policy allows | Own | Own | Yes |
| Post RFQ | No | Yes | No | No | Yes (on behalf) |
| Submit quotation | No | No | No | Yes (if matched or invited) | No |
| Message on an RFQ | No | Own RFQs | No | If matched / quoting | Yes |
| Create/edit own listings | No | No | Draft only | Yes | Yes |
| Publish listings | No | No | No | Submit for review | Approve |
| Change verification badge | No | No | No | No | Yes |
| View other buyers’ RFQs | No | No | No | Only matched Open RFQs | All |
| Admin queues | No | No | No | No | Yes |

\*Guest: show “Log in to view contact / request quote” rather than leaking phones for scraping.

**Phone visibility rule (V1):** After login, buyers see Call on approved suppliers. Guests see Request quote / Log in. Suppliers never see a buyer’s personal mobile until the buyer has posted an RFQ that matched them **or** the buyer initiated contact (reduces spam). Company switchboard can be shown on RFQ to matched suppliers.

### 6.4 Multi-user (P1)

- Buyer org: several purchase officers, one billing/admin contact  
- Supplier org: sales users + profile admin  

V1 may be **one login per organisation** if that ships faster, but the data model should still have User and Organisation as separate objects so multi-user can be added without a rewrite of RFQs.

### 6.5 Session and account recovery (product)

- Email login required  
- Phone number stored and optionally verified (OTP is P1; V1 can verify phone manually via ops)  
- Password reset via email  
- Deactivate account (admin); user can request deletion (P1 privacy)

---

## 7. Glossary

| Term | Meaning |
| --- | --- |
| RFQ | Request for quotation — a structured buying requirement |
| Qualified RFQ | Moderated, complete, serious requirement |
| Quotation / Quote | Supplier’s structured offer against an RFQ or listing enquiry |
| Lead | Any inbound demand a supplier can act on (matched RFQ, quote request from profile, machine enquiry) |
| Matched supplier | Supplier selected by rules (or admin) to receive an RFQ |
| Verification level | Earned trust badge on an organisation |
| Listing | Public product, service, or used-machine record |
| Catalogue | PDF or file representing a supplier’s range |
| Anchor buyer | Recruited company expected to post RFQs regularly |
| Liquidity | Rate of useful matching (RFQs with 3–5 good quotes) |
| Enquiry | On-platform thread spawned from RFQ, profile, or listing — source of truth |
| PO | Purchase order — **out of V1** |
| Marketplace Certified | Inspected used machine — **out of V1** |
| Smart RFQ | AI-drafted technical RFQ — **out of V1** |

---

## 8. Release scope

Priority: **P0** = must launch, **P1** = soon after, **P2** = later.

### 8.1 P0 — Version 1 (liquidity loop)

**Public**

- Homepage (procurement surface)  
- Search (suppliers, products/services, used machines)  
- Category browse (Phase 1 pharma taxonomy + used-machine families)  
- Public supplier profile (mini-website)  
- Public used-machine listing  
- Persistent Post RFQ CTAs  
- Auth: register / login as buyer or supplier  

**Buyer**

- Organisation + user profile  
- Post RFQ (full field set in §15)  
- RFQ list and RFQ detail with quote comparison  
- Save supplier / favourite listing  
- Messages on own RFQs  
- Basic dashboard  

**Supplier**

- Organisation profile (draft → submitted → approved)  
- Products/services listings (submit for review)  
- Used-machine listings (submit for review)  
- Matched RFQ feed  
- Submit quotation  
- Lead inbox (RFQs + quote requests + messages)  
- Basic analytics: profile views, RFQs received, quotes submitted  

**Admin**

- Approve/reject suppliers  
- Set verification level  
- Moderate RFQs (approve, reject, request changes, manual match)  
- Moderate listings  
- Category CRUD (controlled vocabulary)  
- Reports: active buyers/suppliers, RFQs, quotes per RFQ  
- Create/edit supplier profile on behalf (manual onboarding)  
- Create buyer org on behalf (anchor onboarding)  

**Comms**

- In-platform messages tied to RFQ or listing  
- Email notification: new matched RFQ; new quotation  
- WhatsApp or SMS notification **if available**; email is the V1 guarantee  
- Click-to-call for revealed numbers  

### 8.2 P1 — After first liquidity

- Quote statuses (accepted / declined / expired) and won/lost  
- Reviews (secondary)  
- Response-time and completed-enquiry stats on profiles  
- Saved searches; richer filters  
- SEO intent landing pages as first-class templates  
- WhatsApp message templates  
- Lead routing caps (max N suppliers per RFQ)  
- Match score  
- Phone OTP  
- Multi-user per org  
- Buyer that also sells used machines  
- Subscription plan flags (even if billing is offline)  
- Featured listing flag  
- Document checklist UI for verification  
- Buyer documents folder  

### 8.3 P2 — Later

- Smart RFQ  
- Certified equipment + inspection partner workspace  
- Self-serve paid plans, premium leads  
- PO, invoices, payments, deliveries  
- Delivery score, technical capability score  
- GCC / multi-country  
- Native mobile apps  

### 8.4 MVP cut line (if time-constrained)

If the team must cut, **keep** in this order: (1) admin-created supplier profiles + public directory, (2) RFQ post + moderate + notify + quote + compare, (3) used listing with required spec fields, (4) buyer/seller self-serve registration. **Cut first:** analytics polish, reviews, PWA extras, WhatsApp (keep email), product catalogue depth beyond one PDF + 10 products.

---

## 9. Product architecture

Five modules. V1 ships A–E at the depth below.

### A. Supplier marketplace

Industry directory with deep profiles, not a flat company list.

Example path: Pharmaceutical → Machinery → Tablet Manufacturing → Tablet Compression Machines

### B. RFQ marketplace

The most valuable loop. Structured requirement → match → notify → structured quotes → comparison.

### C. Used machinery marketplace

Specification-first listings. Inspection/certification later.

### D. Verification and trust

Levelled badges + document/physical process. Visible everywhere a supplier appears.

### E. Messaging and communication

On-platform thread is the system of record. WhatsApp/phone/email are delivery channels.

---

## 10. Information architecture

### 10.1 Public sitemap (conceptual)

```
Home
├── Search results (all / suppliers / products / used machines)
├── Industries
│   ├── Pharmaceutical
│   │   └── [families → types]
│   └── Food & Beverage          (may be soft-launched)
├── Categories (shortcut tiles)
├── Suppliers (index + filters)
├── Used machinery (index + filters)
├── Supplier profile
│   ├── About
│   ├── Products & services
│   ├── Used machines
│   ├── Certificates & catalogue
│   └── Projects / videos
├── Product / service listing
├── Used machine listing
├── Post an RFQ (auth wall)
├── How it works / For buyers / For suppliers
├── Trust & verification explained
└── Legal (terms, privacy)
```

### 10.2 Buyer area

```
Buyer home (dashboard)
├── My RFQs
│   └── RFQ detail (quotes table, messages, activity)
├── Quotations (inbox across RFQs)
├── Saved suppliers
├── Saved / recent listings
├── Messages
└── Organisation & users (settings)
```

### 10.3 Seller area

```
Seller home (dashboard)
├── RFQ feed (matched)
├── Quotations sent
├── Lead inbox
├── Company profile
├── Products & services
├── Used machines
├── Analytics
└── Settings
```

### 10.4 Admin area

```
Admin home (liquidity snapshot)
├── Suppliers queue
├── Buyers / orgs
├── RFQs queue
├── Listings queue
├── Categories
├── Verification cases
├── Reports
└── Staff
```

### 10.5 Global chrome

- Logo → Home  
- Search  
- Post RFQ (always visible, primary)  
- Browse categories  
- Used machinery  
- Log in / Register (Buyer vs Supplier choice)  
- For logged-in: dashboard, notifications, org name, role  

RFQ CTA also on: homepage mid-page, category empty and populated states, supplier profile, listing pages, search zero-results.

---

## 11. Domain objects and data dictionaries

Fields: **R** = required to save/submit, **O** = optional, **S** = system-set.

Validation is product-level (formats, requiredness), not implementation.

### 11.1 User

| Field | R/O/S | Rules |
| --- | --- | --- |
| Full name | R | 2–80 chars |
| Email | R | Unique, valid email |
| Phone | R | Pakistani mobile preferred; store country code |
| Password / auth | R | Per security policy |
| Role | S | buyer / supplier / admin |
| Organisation | R | After onboarding |
| Job title | O | e.g. Purchase Manager |
| Status | S | active / disabled |
| Last login | S | |

### 11.2 Buyer organisation

| Field | R/O/S | Rules |
| --- | --- | --- |
| Legal / trading name | R | |
| Display name | O | Defaults to legal name |
| Industry | R | Pharmaceutical, Food & Beverage, Other (Other allowed but not marketed) |
| Sub-industry | O | e.g. Tablet, Syrup, Dairy, Bakery |
| City | R | Controlled list of Pakistani cities (§30.2) |
| Address | O | |
| NTN | O | Strongly encouraged; required for “Business Verified” buyer later |
| Company type | O | Manufacturer, Hospital/Lab, Distributor, Other |
| Approx. plant size | O | Optional band |
| Website | O | |
| About | O | |
| Status | S | active |

Buyers are **not** publicly listed as a directory in V1 (privacy + broker risk). Matched suppliers see buyer org name, city, industry on the RFQ.

### 11.3 Supplier organisation

| Field | R/O/S | Rules |
| --- | --- | --- |
| Legal name | R | |
| Display name | R | Public |
| Tagline | O | Max 120 chars |
| About | R | Min 80 chars for submit-for-approval |
| Year established | O | 1900–current |
| Head office city | R | Controlled list |
| Other cities served | O | Multi |
| Address | O | Required for Verified Supplier |
| Phone (public/switchboard) | R | |
| WhatsApp number | O | |
| Email (public) | R | |
| Website | O | |
| Industries served | R | Multi; must include Pharma and/or Food for launch targeting |
| Categories | R | At least 1 leaf category |
| Services offered | O | Manufacturing, Dealer, Installation, Maintenance, Validation/Calibration, Automation, Fabrication, Trading (used) |
| Brands represented | O | |
| Employee band | O | |
| NTN | O | Required for Business Verified |
| STRN | O | |
| SECP / company registration | O | |
| DRAP-related note | O | Ops; not a public claim unless Industry Verified |
| Logo | O | Image |
| Cover image | O | |
| Catalogue file | O | PDF, max size policy |
| Intro video URL | O | |
| Verification level | S | See §22 |
| Public status | S | draft / pending_review / approved / rejected / suspended |
| Response stats | S | P1 |
| Created by | S | self or admin |

### 11.4 Category

| Field | R/O/S | Rules |
| --- | --- | --- |
| Name | R | Unique in parent |
| Slug | S/R | URL |
| Parent | O | Null = industry or root |
| Kind | R | industry / family / type |
| Applies to | R | suppliers, products, used_machines, services, rfqs |
| Description (SEO) | O | P1 required for public pages |
| Sort order | O | |
| Active | R | Hidden categories not in browse |

### 11.5 Product / service listing (new equipment or offering)

| Field | R/O/S | Rules |
| --- | --- | --- |
| Supplier | S | |
| Type | R | Product or Service |
| Name | R | |
| Category (leaf) | R | |
| Short description | R | |
| Long description | O | |
| Specs (key-value or text) | O | e.g. capacity, material SS316 |
| Brands | O | |
| Images | O | At least 1 recommended; 1 required for approval if product |
| Price | O | Amount + currency PKR; or “On request” |
| Unit | O | piece, set, kg, etc. |
| Lead time (days) | O | |
| Status | S | draft / pending_review / live / rejected / archived |

### 11.6 Used machine listing

| Field | R/O/S | Rules |
| --- | --- | --- |
| Seller (supplier org) | S | |
| Title | R | e.g. HPLC System — Waters Alliance e2695 |
| Category | R | Used-machine taxonomy |
| Manufacturer | R | |
| Model | R | |
| Year | O | 4-digit; reasonable range |
| Condition | R | New unused / Excellent / Good / Fair / As-is / Refurbished |
| Serial number | O | Required for P1 “serial verified” |
| Location city | R | |
| Description | R | Min 50 chars |
| Operating hours / throughput | O | |
| Utilities / power | O | |
| Accessories included | O | |
| Photos | R | Minimum 5 for approval (ops may waive) |
| Video URL or file | O | |
| Price | R | PKR amount **or** “Request price” |
| Price visible | R | Yes / Request only |
| Warranty | O | None / 1 month / 3 months / 6 months / 1 year / custom |
| Installation available | R | Yes/No |
| Inspection available | R | Yes/No |
| Reason for sale | O | |
| Status | S | draft / pending_review / live / rejected / sold / withdrawn |
| Trust flags | S | video_verified, ownership_verified, serial_verified — P1 |
| Certified | S | P2 only |

### 11.7 RFQ

| Field | R/O/S | Rules |
| --- | --- | --- |
| Buyer org + user | S | |
| Title | R | Short name, e.g. 500 L SS316 mixing vessel |
| Description | R | What is needed, constraints, quality (GMP, food-grade, etc.) |
| RFQ type | R | Product / Service / Turnkey line / Spare parts / Used machine |
| Industry | R | Pharma / Food / Other |
| Category | R | Best-fit leaf; “Not sure” allowed → ops classify |
| Quantity | R | Number + unit |
| Target city / delivery location | R | |
| Needed by | R | Date **or** relative window (7 / 15 / 30 / 60 / 90 days) |
| Budget | O | Band or figure; hidden from suppliers unless buyer opts in |
| Budget visible to suppliers | O | Default No |
| Attachments | O | PDF, images, drawings; max count/size policy |
| Preferred brands | O | |
| Must-have specs | O | e.g. SS316, 500 L, cGMP |
| Installation required | O | Yes/No |
| Warranty required | O | |
| Allow used equipment | O | Yes/No |
| Closing date | R | Default = needed-by or +14 days; buyer can edit |
| Visibility | R | V1: **Matched suppliers only** (not a public bulletin) |
| Status | S | See §12.1 |
| Qualified flag | S | Admin |
| Match count | S | |
| Quote count | S | |

**Example RFQ (canonical)**

- Required: 500 L SS316 mixing vessel  
- Industry: Pharmaceutical  
- Quantity: 2  
- Location: Lahore  
- Required within: 30 days  
- Attachments: sketch + capacity note  

### 11.8 Quotation

| Field | R/O/S | Rules |
| --- | --- | --- |
| RFQ | S | |
| Supplier | S | |
| Price | R | Numeric |
| Currency | R | PKR in V1 |
| Price type | R | Lump sum / per unit / estimate |
| Validity days | R | Default 15 |
| Delivery / lead time | R | Days or date |
| Warranty | R | Text or enum + text |
| Incoterms / delivery terms | O | Ex-works, delivered, etc. |
| Includes installation | O | Yes/No |
| Includes GST | O | Yes/No/Not specified |
| Notes | O | Exclusions, alternatives |
| Attachments | O | Official quote PDF |
| Status | S | See §12.2 |
| Submitted at | S | |

**Comparison table columns (buyer RFQ detail)**

Supplier (name + badge + city) | Price | Delivery | Warranty | Installation | Quote date | Actions (view, message, call)

### 11.9 Quote request (from profile or listing, not a full RFQ)

A lighter object so “Request quotation” on a supplier page still creates a trackable lead.

| Field | R/O/S | Rules |
| --- | --- | --- |
| Buyer | S | Must be logged in |
| Supplier | S | |
| Source | S | profile / product / used_listing |
| Message | R | Min 20 chars |
| Quantity | O | |
| Status | S | open / quoted / closed |

Seller may convert a quote request into a quotation or reply by message. V1 may implement this as an RFQ pre-filled from the listing (preferred: one RFQ model with `source`).

**Product decision (V1):** “Request quotation” on a profile/listing **creates an RFQ** (possibly single-supplier or private) so comparison and metrics stay unified. If the buyer selects “send to this supplier only,” matching is skipped; only that supplier is notified.

### 11.10 Message thread

| Field | R/O/S | Rules |
| --- | --- | --- |
| Parent | S | RFQ, quote request, or listing enquiry |
| Participants | S | Buyer users + supplier users + optional admin |
| Messages | | Text; file optional |
| Created at | S | |

Messages are not deleted for the other party (hide for self only). Admin can view for disputes.

### 11.11 Verification case

| Field | R/O/S | Rules |
| --- | --- | --- |
| Organisation | S | Usually supplier |
| Target level | R | |
| Documents | R | See §22 |
| Ops notes | O | Including physical visit |
| Status | S | open / approved / rejected |
| Reviewer | S | |

### 11.12 Notification

| Field | R/O/S | Rules |
| --- | --- | --- |
| User | S | |
| Type | S | See §18 |
| Title, body, link | S | |
| Channel | S | in-app, email, whatsapp, sms |
| Read | S | |
| Sent at | S | |

### 11.13 Saved / activity (buyer)

- Saved suppliers  
- Favourite listings  
- Recently viewed listings/profiles (last 20 is enough)  

### 11.14 Analytics events (must be recorded)

Even if the UI is simple, record:

- Profile view (unique viewer/day)  
- Listing view  
- Catalogue download  
- RFQ submitted / opened / matched  
- Quote submitted  
- Message sent  
- Call click (not whether the call connected)  
- Search query (anonymized later)  

This is the moat requirement: performance and pricing intelligence later.

---

## 12. Status machines

### 12.1 RFQ statuses

```
Draft → Submitted → Under review → Open → Closed
                              ↘ Rejected
                              ↘ Changes requested → Submitted
Open → Expired (past closing, auto) 
Open → Cancelled (buyer)
Closed = buyer marked complete, or expired + 7 days with no action
```

| Status | Who sees | Matching |
| --- | --- | --- |
| Draft | Buyer only | No |
| Submitted | Buyer, admin | No |
| Under review | Buyer, admin | No |
| Changes requested | Buyer, admin | No |
| Open | Buyer, matched suppliers, admin | Yes, notifications sent |
| Rejected | Buyer, admin | No |
| Expired | Buyer, matched (read-only quotes) | No new quotes |
| Cancelled | Buyer, admin; suppliers see “cancelled” | No |
| Closed | Read-only | No |

**Who can quote:** supplier status = approved, RFQ = Open, supplier is matched or invited, closing date not passed.

### 12.2 Quotation statuses (P0 submit; P1 rest)

| Status | V1? | Meaning |
| --- | --- | --- |
| Draft | Optional | Supplier not yet sent |
| Submitted | P0 | Visible to buyer |
| Withdrawn | P0 | Supplier retracts; buyer sees withdrawn |
| Accepted | P1 | Buyer shortlisted / selected (not a legal PO) |
| Declined | P1 | Buyer passed |
| Expired | P1 | Past validity |
| Won | P1 | Self-reported deal |
| Lost | P1 | Self-reported |

V1 minimum: Submitted + Withdrawn. Buyer can still message without formal Accept.

### 12.3 Supplier organisation statuses

`Draft → Pending review → Approved → Suspended`  
`Pending review → Rejected` (can resubmit)

Only **Approved** organisations appear in public search and receive RFQs. Pending can complete profile.

### 12.4 Listing statuses

`Draft → Pending review → Live → Archived`  
`Pending → Rejected`  
Used machines add `Sold` and `Withdrawn`.

Live listings of a **Suspended** supplier are hidden.

### 12.5 Verification levels (independent of approval)

An approved supplier can still be only `Registered`. Approval = “allowed on the platform.” Verification = “how much we trust them.” See §22.

---

## 13. Discovery, homepage, search, and categories

### 13.1 Homepage (procurement surface, not a product grid)

**Above the fold**

- Headline: Find Trusted Industrial Suppliers  
- Industry chips: Pharma • Food • Packaging • Laboratory • Machinery  
- Search field: *Search suppliers, products or machines…*  
- Primary buttons: **Search suppliers** | **Post an RFQ**  

**Next**

- Popular categories (tiles): Pharmaceutical Machinery, Food Machinery, Packaging Equipment, Laboratory Equipment, Raw Materials, Packaging Materials, Industrial Automation, HVAC, Water Treatment, Used Machinery  

**RFQ band (repeat on many pages)**

> Can’t find what you need? Post your requirement once. Receive quotations from multiple verified suppliers.  
> **Post RFQ**

**Below (optional P0 if time)**

- How it works (3 steps: Post → Receive quotes → Compare)  
- Trust strip (verification levels explained in one line)  
- Featured / recently verified suppliers (admin-curated; do not fake activity)  
- Recent used machines (live only)  

**Empty marketplace rule:** If supplier count is low, do not show ghost “trending products.” Show real suppliers or a waitlist/onboarding message. Never fake reviews or quote counts.

### 13.2 Search

**Query**

- One box; user can filter result type: All | Suppliers | Products & services | Used machines  

**Filters (P0)**

- Industry  
- Category  
- City / Punjab, Sindh, etc. if city list is grouped  
- Verification level (minimum)  
- Used only: condition, manufacturer, price band, inspection available  

**Sort (P0)**

- Relevance (default)  
- Recently updated  
- Verification (higher first) — do not sort only by who paid in V1  

**Zero results**

- Message + **Post an RFQ** CTA  
- Suggestions: broaden city, related category  

**Guest vs logged-in:** same results; contact CTAs differ (§6.3).

### 13.3 Category pages

- H1: category name  
- Short explanation  
- Subcategories  
- Supplier list (approved, matching category)  
- Product/machine slices  
- Post RFQ pre-filled with that category  
- P1: SEO body (what to look for, typical specs)  

### 13.4 User stories — discovery

**US-D1.** As a guest procurement manager, I can search “tablet compression machine” and see relevant suppliers and listings without an account.  
**AC:** Results include matching leaf category; each supplier card shows name, city, verification badge, industries; clicking opens profile.

**US-D2.** As a guest, I can start Post RFQ and am asked to register/login as a buyer, then return to the RFQ form with category preserved if I came from a category page.

**US-D3.** As a user on mobile, I can use search, open a profile, and tap Post RFQ without horizontal-only layouts breaking the primary actions. Quote comparison table may scroll horizontally.

---

## 14. Supplier marketplace

### 14.1 Supplier card (search / category)

Must show: display name, verification badge, city, primary industries, short tagline or first categories, CTA Request quotation. Optional: years established.

### 14.2 Supplier profile (mini-website)

**P0 sections**

1. Header: logo, name, badge, city, established year, industries, services  
2. Primary CTA: **Request quotation**  
3. Secondary: Call (if allowed), Message (login), View products, Download catalogue (if file exists)  
4. About  
5. Products & services grid  
6. Used machines by this seller  
7. Certificates (images/PDFs)  
8. Cities served  
9. Contact block (subject to visibility rules)  

**P1 sections**

- Projects / photos  
- Videos  
- Reviews  
- Response time, years on platform, completed enquiries  
- Brands represented  

**Must not**

- Show unpaid “featured” as if it were verification  
- Show a verification badge that was not granted  

### 14.3 Public vs pending

Pending/rejected/suspended profiles are not publicly URL-listed. Admin can preview. Guessable IDs should not leak pending data.

### 14.4 User stories — suppliers

**US-S1.** As a buyer, I open a verified supplier and understand what they make, where they are, and how trusted they are within 10 seconds.  
**AC:** Badge, city, industries, about, and Request quotation are visible without scrolling on desktop; on mobile, CTA is sticky or immediately visible.

**US-S2.** As a supplier, my public page is complete enough to replace a weak company website.  
**AC:** All P0 fields can be filled; catalogue PDF downloads; products list paginates.

**US-S3.** As admin, I can create a full supplier profile without the supplier logging in, then invite them to claim it.  
**AC:** Flag `created_by_admin`; claim flow P1 (email invite). V1: ops shares login or supplier registers and ops merges (merge can be manual).

**US-S4.** As a guest, I cannot harvest phone numbers from search pages.  
**AC:** Phone not in card HTML for guests; Call requires login.

---

## 15. RFQ marketplace

### 15.1 Post RFQ — form UX

**Principles:** short first screen; progressive disclosure; “Not sure” never blocks submit.

**Step 1 — What do you need?**  
Title, type, industry, category (or not sure), description, attachments  

**Step 2 — Quantity and timing**  
Quantity + unit, city, needed-by, closing date (defaulted)  

**Step 3 — Optional commercial**  
Budget (hidden by default), used equipment allowed, installation, warranty, brands  

**Step 4 — Review and submit**  
Preview as suppliers will see (without hidden budget)

Save draft at any time.

### 15.2 What suppliers see on an Open RFQ

- Title, description, type, industry, category  
- Quantity, city, needed-by, closing date  
- Attachments  
- Buyer **organisation name**, city, industry (not buyer personal phone until contact)  
- Verification of buyer if any (optional P1)  
- Budget only if buyer opted in  

They do **not** see other suppliers’ prices (no reverse-auction war in V1).

### 15.3 Moderation

Default V1: **every RFQ is reviewed** before Open (liquidity is low; quality matters).

Ops may later auto-open RFQs from trusted anchor buyers (P1 allowlist).

**Reject reasons (enum + note):** spam, incomplete, not industrial, duplicate, prohibited item, other.

**Changes requested:** buyer is notified, edits, resubmits.

**SLA (ops, not software-enforced):** review within 1 business day.

### 15.4 Closing and expiry

- No new quotes after closing date (end of that calendar day, Pakistan time)  
- Buyer can extend closing (P0: edit if Open)  
- Buyer can cancel with optional reason  

### 15.5 User stories — RFQ

**US-R1.** As Ahmed, I post a 500 L SS316 vessel RFQ in under 10 minutes including one PDF.  
**AC:** All required fields validated; draft works; submit → Submitted; I see “We’ll review and notify matching suppliers.”

**US-R2.** As Ahmed, I see how many suppliers were matched once the RFQ is Open, and a table that fills as quotes arrive.  
**AC:** Match count visible; empty state “Waiting for quotations”; email when first quote arrives.

**US-R3.** As admin, I reject a junk RFQ and the buyer sees the reason; no supplier is notified.

**US-R4.** As Ahmed, I post “send to this supplier only” from a profile and only that supplier is notified.  
**AC:** Matching skipped; RFQ still exists for audit.

**US-R5.** As a matched supplier, I cannot see the RFQ after it is cancelled.

**US-R6.** As Ahmed, I do not want my RFQ on a public Google-indexed page in V1.  
**AC:** Open RFQs are not in the public sitemap; require auth and match.

---

## 16. Quotations

### 16.1 Submit quote (seller)

Form mapped to §11.8. Warn if price is 0 or implausible (ops can still allow). Cannot quote twice on the same RFQ; can **update** submitted quote until withdrawn or RFQ closed (P0: allow one revision).

### 16.2 Comparison (buyer)

- Sort by price, delivery, or recently submitted  
- Expand row for notes and attachments  
- Highlight verification badge  
- Actions: Message, Call, Download attachment  

**Not in V1:** automatic “best score,” legal acceptance, payment.

### 16.3 User stories — quotes

**US-Q1.** As a supplier, I submit price, 30-day delivery, 1-year warranty, and a PDF, and the buyer sees it in the table within the same session after refresh/notification.

**US-Q2.** As Ahmed, I compare three quotes on one screen without opening three WhatsApp chats.  
**AC:** Table shows Supplier A Rs 1.8m / 30 days / 1 year; B Rs 1.65m / 45 days / 1 year; C Rs 2.1m / 25 days / 2 years.

**US-Q3.** As a supplier, if I withdraw a quote, the buyer sees it as withdrawn, not deleted history.

---

## 17. Used machinery marketplace

### 17.1 Why it is a differentiator

The informal market is photos and phone numbers. This product requires manufacturer, model, condition, location, and commercial flags before going Live.

### 17.2 Listing quality bar (approval checklist)

Ops should not approve if:

- Fewer than policy-minimum photos (default 5) unless waived  
- No manufacturer/model  
- Stock photo only / watermarked competitor photos (reject)  
- Price missing and not “request price”  

### 17.3 Buyer actions on a listing

- Request quotation / Enquire (creates RFQ or enquiry linked to listing)  
- Save  
- Call (login + rules)  
- Ask if inspection is available (message)  

### 17.4 Sold / withdrawn

Seller marks Sold; listing leaves search; URL may show “no longer available.” Admin can unpublish.

### 17.5 Category families (used)

Pharmaceutical machinery, food-processing machinery, packaging machinery, laboratory instruments, generators, compressors, boilers, chillers, HVAC, water-treatment, printing, CNC, material-handling.

A used listing still has a leaf category for matching.

### 17.6 Canonical listing example (product copy)

**HPLC System**  
Manufacturer: Waters · Model: Alliance e2695 · Year: 2018 · Condition: Refurbished · Location: Lahore · Serial: (optional) · Installation: Yes · Warranty: 3 months · Inspection: Yes · Video: Yes · Price: PKR (or request)

### 17.7 P2 — Marketplace Certified Equipment (specify now, do not build)

Inspection report includes: mechanical condition, electrical condition, operating test, serial verification, accessories, photos/video, recommended repairs, estimated remaining usability. Sold as a paid service (Rs 15,000–75,000+ hypothesis).

### 17.8 User stories — used

**US-U1.** As a dealer, I cannot publish a live listing with only two photos and a title.  
**AC:** Submit for review blocked or ops rejects per checklist.

**US-U2.** As a buyer, I can filter used lab equipment in Lahore with inspection available.

**US-U3.** As admin, I unpublish a listing that used stolen photos.

---

## 18. Messaging and notifications

### 18.1 Principle

**Create the row first, then notify.** If a user only sends WhatsApp without an RFQ/enquiry, the company has no liquidity data and no moat.

### 18.2 Threads

- One thread per RFQ per supplier (quotes + messages together)  
- Listing enquiry thread  
- Admin can message either party (P1; V1 email-out-of-band is OK)  

**P0 composer:** text + optional file. No read receipts required. Show sent time.

**Prohibited (policy):** malware files; ops can disable a user.

### 18.3 Notification catalogue (P0)

| Event | Buyer | Supplier | Admin |
| --- | --- | --- | --- |
| RFQ submitted | Confirmation | — | Queue ping |
| RFQ changes requested / rejected | Yes + reason | — | — |
| RFQ Open + matched | “X suppliers notified” | New RFQ | — |
| Quote submitted | Yes | Confirmation | — |
| Quote withdrawn | Yes | — | — |
| New message | Yes | Yes | — |
| Listing approved / rejected | — | Yes | — |
| Supplier approved / rejected | — | Yes | — |

### 18.4 Channel copy (examples)

**Supplier — new RFQ (email/WhatsApp)**  
New RFQ: 500 L SS316 Mixing Vessel · Lahore · Closing: 20 Aug · View RFQ  

**Buyer — new quotation**  
ABC Engineering submitted a quotation on your RFQ “500 L SS316 mixing vessel.” View quotes  

### 18.5 WhatsApp (P1 depth, P0 optional)

Do not replace the portal. Deep link to the RFQ or quote. If WhatsApp fails, email still sends.

### 18.6 User stories — comms

**US-C1.** As a supplier off-site, I get an email for a new RFQ and can open the RFQ after login.

**US-C2.** As Ahmed, I message a supplier from the quote table and the thread is stored on that RFQ.

**US-C3.** Call clicks are logged as events even though call quality is outside the product.

---

## 19. Buyer workspace

### 19.1 Dashboard (P0)

- Open RFQs and quote counts  
- Unread messages  
- Saved suppliers (count)  
- Shortcuts: Post RFQ, Search  

### 19.2 My RFQs

Filters: status, date. Each row: title, status, quotes, closing date.

### 19.3 P1 extras

Purchase requirements list, side-by-side supplier compare workspace, documents vault.

### 19.4 P2 extras

POs, invoices, payments, deliveries.

### 19.5 User stories — buyer app

**US-B1.** As Ahmed, I resume a draft RFQ after a call interrupts me.

**US-B2.** As Ahmed, I see recently viewed machines and saved suppliers.

---

## 20. Seller workspace

### 20.1 Dashboard (P0)

- New matched RFQs (unread)  
- Quotes needing follow-up (P1)  
- Profile completeness % (nudge to fill catalogue)  
- Analytics snapshot  

**Example monthly snapshot (P1; P0 can show raw counts)**

Profile views: 3,420 · RFQs received: 87 · Quotes submitted: 42 · Contacts: 31 · Deals reported: 7  

This snapshot is what later justifies Rs 15,000–30,000/month.

### 20.2 RFQ feed

Only Open RFQs matched to this supplier. Filters: category, city, closing soon.

### 20.3 Lead inbox

Unified: matched RFQs, profile quote requests, machine enquiries, messages.

### 20.4 Profile completeness (P0 nudge)

Checklist: logo, about, ≥1 category, ≥3 products or 1 catalogue PDF, NTN uploaded, WhatsApp number. Completeness does not block approval if ops onboarded a thin profile, but self-serve suppliers should be pushed to complete.

### 20.5 User stories — seller

**US-SE1.** As ABC Engineering, I quote from the RFQ feed without hunting email.

**US-SE2.** As a new supplier, I see why my profile is not public yet (pending review).

**US-SE3.** As a seller, I edit a live product; changes go to review **or** auto-publish minor edits (V1: any edit → pending if already live, to be safe — or auto-publish text edits and review new images; pick one and document in admin SOP). **V1 decision:** minor text auto-publish; new images/files → pending review.

---

## 21. Admin and operations

### 21.1 Liquidity home

Today/this week: new RFQs, pending RFQs, quotes/RFQ (trailing 30 days), pending suppliers, pending listings, active buyers.

### 21.2 Queues

Each queue: filter, search, assign to admin (P1; V1 unassigned OK), actions.

**Supplier queue:** preview profile, approve, reject with reason, set verification level, impersonate/preview public page.

**RFQ queue:** classify category if “not sure,” match extra suppliers, remove bad matches, approve Open.

**Listing queue:** checklist, approve/reject.

### 21.3 Manual matching (P0)

Admin adds/removes suppliers on an RFQ before or after Open. Adding after Open sends a notification.

### 21.4 CRM-lite (P0)

List of buyer orgs and supplier orgs with last activity, RFQ count, notes field (ops). Anchor flag.

### 21.5 Category management

Create/hide categories; do not allow suppliers to invent top-level industries in V1.

### 21.6 Acting on behalf

Admin can post RFQ for an anchor buyer (phone-in requirement) with attribution “posted by ops.” Still counted as that buyer’s RFQ.

Admin can create supplier profiles for Month 2 supply build.

### 21.7 User stories — admin

**US-A1.** As ops, I onboard 150 suppliers by filling profiles myself and approving them.

**US-A2.** As ops, I open a submitted RFQ, set the correct leaf category, select 8 suppliers, Open it; all 8 get notified.

**US-A3.** As ops, I see quotes per RFQ this month and spot RFQs with 0 quotes after 48 hours to chase suppliers.

---

## 22. Trust and verification

### 22.1 Levels

| Status | Meaning | Typical evidence |
| --- | --- | --- |
| Registered | Phone/email account | Signup |
| Business Verified | Real company | NTN and/or company registration docs, name match |
| Verified Supplier | Documents + physical | Address check, visit or reliable partner confirmation |
| Industry Verified | Licensed for claimed industry | DRAP-related manufacturing data where applicable; provincial food docs where applicable; other licences |
| Premium Verified | Physical audit | Structured audit notes |
| Certified Seller | Behavioural | Transaction/history standards (P2) |

Badges are **highly visible** on cards, profiles, quotes, and listings. Tooltip explains the level in plain language. Fake “blue ticks” for paying customers are forbidden unless they earned the level.

### 22.2 Pharma and food checks

- Pharmaceutical manufacturers: ops may cross-check appropriate **DRAP published manufacturing data** where applicable. The product must **not** display “DRAP approved” unless ops confirmed and the claim is accurate.  
- Food: provincial regulatory documentation where applicable.  

The product stores: document files, checklist ticks, ops confirmation, date, reviewer. It does not automatically scrape regulators in V1 (manual process).

### 22.3 Broader trust signals

| Signal | When |
| --- | --- |
| Verified business / documents / physical | Per levels |
| Response score | P1 (time to first quote/message) |
| Delivery score | P2 (needs reported outcomes) |
| Technical capability score | P2 |
| Years in business | From year established |
| Enquiries completed | P1 |
| Machinery: inspection / video / ownership / serial | Flags P1; certified P2 |

Reviews (P1) are allowed but **never** replace verification. No review buying.

### 22.4 Buyer trust (lighter)

Buyers can remain Registered. Optional Business Verified buyer (NTN) P1 — helps suppliers take RFQs seriously.

### 22.5 User stories — trust

**US-T1.** As Ahmed, I see Verified Supplier on a quote row and can open what that means.

**US-T2.** As ops, I upgrade a supplier from Registered to Business Verified after NTN upload; the badge changes on public profile immediately.

**US-T3.** Paying for Professional plan does not grant Industry Verified.

---

## 23. Matching and lead routing

### 23.1 V1 matching rules (deterministic)

A supplier is a **candidate** if **all** are true:

1. Public status = Approved  
2. Not suspended  
3. At least one of:  
   - Leaf category overlap with RFQ category, or  
   - Parent family overlap if RFQ category is “not sure” and admin set a family, or  
   - Admin manually added  
4. Industries served includes RFQ industry **or** admin override  
5. Optional city preference: same city **or** cities served includes RFQ city **or** nationwide (if supplier flagged as serving all Pakistan)  

**Ranking for who gets notified (V1):**

1. Admin-pinned matches  
2. Higher verification level  
3. Same city  
4. Profile completeness  
5. Recency of activity  

**Cap (P0 configurable, default):** notify **maximum 12** candidates, **target 6–10**, aiming for **3–5 quotes**. Admin can raise cap per RFQ.

**Do not** notify every supplier in “Machinery.”

### 23.2 P1 Supplier Match Score (weights)

| Factor | Weight |
| --- | --- |
| Category match | 30% |
| Location | 15% |
| Experience (years, listings) | 15% |
| Verification | 15% |
| Response rate | 10% |
| Ratings | 10% |
| Availability / not overloaded | 5% |

Better suppliers get better leads. If a supplier’s response rate is very low, down-rank (still allow admin force-include).

### 23.3 Long-term loop (behavioural, not AI in V1)

Buyer requirement → classification → matching → notification → quotations → comparison → deal (reported)

### 23.4 User stories — matching

**US-M1.** An RFQ in category Tablet Compression Machines does not notify a dairy-packaging-only supplier.

**US-M2.** Admin can add a fabricator who was missed by rules; they receive the same RFQ notification.

**US-M3.** If 40 suppliers match, only the top cap are notified unless admin expands.

---

## 24. Category taxonomy

Do not launch with thousands of categories. Controlled vocabulary; admin-owned.

### 24.1 Phase 1 — Pharmaceutical (launch)

**Machinery** (examples of types: tablet compression, capsule filling, coating, granulation, mixing/blending, fluid bed, packing/blister, liquid oral, ointment, RMG, etc. — start with ~15–30 types, not 500)

- Laboratory equipment  
- Packaging materials  
- Clean-room equipment  
- HVAC  
- Water systems  
- SS fabrication  
- Spare parts  
- Validation / calibration (service)  
- Maintenance (service)  
- Automation  
- Printing / serialization  

### 24.2 Phase 2 — Food & Beverage

Mixers, processing lines, filling machines, packaging, bakery, dairy, cold storage, refrigeration, conveyors, boilers, water treatment, laboratory equipment.

May appear in IA as soon as ops has suppliers; marketing wait until pharma loop exists.

### 24.3 Phase 3 — Expansion industries

Cosmetics, nutraceutical, chemical, textile, plastics, broader packaging, hospitals/laboratories, agriculture processing.

### 24.4 RFQ “Not sure”

Allowed. Admin must classify before Open, or Open with family-level matching only.

### 24.5 User story

**US-CAT1.** As admin, I add a leaf “Blister packing machines” under Pharmaceutical → Machinery without a deploy.

---

## 25. Content, language, and SEO

### 25.1 Language

- **V1 UI:** English  
- **P1:** bilingual English/Urdu for key CTAs and notifications (SME suppliers)  
- User-generated content: any language; no auto-translate in V1  

Open question in §29 remains: whether Urdu UI is required before SME field sales.

### 25.2 Tone

Industrial, direct, trustworthy. No consumer-marketplace slang. No fake scarcity (“22 people viewing”).

### 25.3 SEO (product/IA, not stack)

Public, indexable: home, categories, supplier profiles (approved), live used listings, product listings, how-it-works.

Not indexable: dashboards, RFQs, messages, admin, drafts.

**Intent pages (P1 templates)** — examples:

- tablet compression machine suppliers pakistan  
- hplc suppliers lahore  
- food filling machine pakistan  
- used blister machine pakistan  
- stainless steel tank manufacturer lahore  

Each intent page is a category/city/type landing with real suppliers, not a doorway of empty keywords.

### 25.4 Legal pages (P0)

Terms of use, privacy, (optional) acceptable use. Disclaimer: the platform does not sell the goods in V1; contracts are between buyer and supplier. Quotations are not purchase orders.

---

## 26. Business model (product implications)

### 26.1 Who pays

**Buyers = free** (demand engine)  
**Suppliers = freemium** (monetization engine)

Do not rely primarily on commissions at the start.

### 26.2 Pricing hypotheses (validate in interviews; not market data)

| Plan / product | Example price | Target |
| --- | --- | --- |
| Free | Rs 0 | New suppliers |
| Verified plan | Rs 7,500 / month | Small suppliers |
| Professional | Rs 15,000 / month | Established |
| Enterprise | Rs 30,000–50,000 / month | Large |
| Featured listing | Rs 3,000–10,000 | Promotion |
| Premium RFQ lead | Rs 500–3,000 | Lead monetization |
| Machinery inspection | Rs 15,000–75,000+ | Used equipment |
| Success fee | 1–3% | Selected machinery deals |

**V1:** all suppliers Free. Plan names may exist as internal flags only. Charging is offline.

**Must never:** paywall RFQ receipt in Year 1 in a way that leaves buyers with zero quotes. If a paid cap is introduced, Free suppliers still get *some* matched RFQs.

### 26.3 Illustrative flywheel (not a forecast)

5,000 suppliers × 10% paying × Rs 15,000 / month ≈ Rs 7.5 million monthly subscription, before ads, inspections, commissions. Point: **recurring subscriptions reduce dependence on take-rate.**

### 26.4 Company stages vs product

| Stage | Focus | Product |
| --- | --- | --- |
| Year 1 | Liquidity | Free registration; ops-heavy |
| Year 2 | Monetize | Memberships, featured, premium leads, inspection, ads |
| Year 3 | Transactions | Escrow, payments, logistics, financing, commissions |

---

## 27. Go-to-market product requirements

### 27.1 Do not launch empty

**Month 1 — Validation (interviews)**  
~20 pharma procurement managers, ~20 food buyers, ~30 suppliers, ~10 machinery dealers.

Buyer questions: how they find suppliers; hardest products; RFQs per month; trust; would they post online.  
Supplier questions: value of one qualified lead; lead sources; pay Rs 10k / 20k / 30k for qualified RFQs?

**Month 2 — Supply**  
100–200 verified-enough suppliers **before** heavy marketing. Product: admin-created profiles (§21.6).

**Month 3 — Demand**  
30–50 anchor procurement departments in Lahore, Karachi, Islamabad/Rawalpindi, Faisalabad, Multan, Gujranwala, Sialkot.

### 27.2 Acquisition channels (product support)

| Channel | Product need |
| --- | --- |
| Direct sales | Admin-created orgs, CRM notes |
| LinkedIn | Public how-it-works + easy buyer signup |
| Google SEO | Category and profile pages (§25.3) |
| Google Ads | Land on category or Post RFQ, not a blank home |
| WhatsApp | Notifications + sales |
| Associations / exhibitions | Fast signup, staffed admin approval |
| Email | RFQ and quote alerts |
| YouTube | Video fields on profiles/listings |
| Field sales | Mobile-usable supplier onboarding form |

### 27.3 Geographic cities (V1 filter list)

Must include at least: Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Gujranwala, Sialkot, plus Other / rest of Pakistan. Full list in Appendix §30.2.

---

## 28. Non-functional requirements

These are product constraints, not a stack choice.

### 28.1 Platforms

- **Primary:** web, desktop and mobile browsers  
- **V1:** usable on common Android Chrome and desktop Chrome/Edge; Safari acceptable  
- **Native apps:** out of V1 (see TECH_STACK.md)  
- **PWA install:** optional P1  

### 28.2 Performance (user-facing)

- Public pages: usable on a typical Pakistani 4G connection; compress images; avoid auto-play video  
- Forms: no data loss on refresh for drafts  
- Quote table: usable with 10 quotes  

### 28.3 Availability

- Business-hours ops is OK; the site should not require a deploy to approve an RFQ  
- Notification delay: email within a few minutes under normal load  

### 28.4 Security and abuse (product rules)

- Role isolation: suppliers cannot see other suppliers’ quotes on the same RFQ  
- Buyers cannot see unmatched suppliers’ private data  
- Rate-limit signup, messages, RFQ submit (exact numbers in tech spec)  
- Admin actions on verification and approval are audited (who, when, what)  
- Personal data: collect minimum; privacy policy; no selling of buyer lists in V1 positioning  
- File uploads: types allow-listed (PDF, common images); no executables  

### 28.5 Auditability

Ops can reconstruct: who was matched, who was notified, who quoted, who messaged. Required for disputes and for the moat.

### 28.6 Accessibility (practical V1)

- Keyboard submit on forms  
- Visible labels (not placeholder-only)  
- Contrast on badges and primary CTAs  
- Alt text for logos where easy  

### 28.7 Time and money

- Timezone display: Pakistan Standard Time  
- Currency: PKR, Rs formatting  
- Phone: +92 display  

### 28.8 Reliability of trust

Hiding or forging verification is a P0 defect.

---

## 29. Risks, assumptions, and open questions

### 29.1 Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Empty marketplace | Manual supply; 100–200 suppliers; anchor buyers |
| RFQ spam | Moderation; later allowlists |
| Suppliers ignore portal | Qualified RFQs; WhatsApp/email; free Year 1 |
| Fake sellers / bad used machines | Verification; listing bar; unpublish |
| Becomes a generic directory | IA and CTAs stay RFQ-first |
| Premature checkout | Non-goal |
| Category explosion | Admin taxonomy only |
| Brokers spam buyers | RFQ not public; phone reveal rules |
| Dual-role factories | P1; ops workaround in V1 |
| WhatsApp off-platform leak | Accept conversation; require enquiry creation first |

### 29.2 Assumptions

- Procurement managers will post RFQs if suppliers are real and response is fast  
- Ops can review RFQs within one business day at early volume  
- Email works as a guaranteed channel; WhatsApp is additive  
- English UI is enough to start with field-sales help  
- Pakistan city list + PKR is enough for V1  

### 29.3 Open questions (validate before locking)

1. Which 20–30 SKUs / machine types generate the most RFQs in Pakistani pharma and food plants?  
2. What makes a procurement manager trust a new supplier enough to post an RFQ online?  
3. What is a qualified lead worth to a typical machinery supplier? (pricing)  
4. Will buyers accept on-platform capture if WhatsApp remains the conversation channel?  
5. How much verification can ops complete in Month 2 (documents vs physical)?  
6. Public brand name — is “Pharmstore” too narrow?  
7. Language: English-only vs Urdu/English for SME suppliers before launch?  
8. Who owns used-machine inspection in Year 2 (in-house vs partners)?  
9. Should V1 RFQs always be moderated, or auto-open for named anchors?  
10. Dual-role (buyer factory selling used machines) needed at launch?  
11. Should supplier phone be visible to logged-in buyers always, or only after an RFQ?  
12. GST-inclusive quoting convention for the comparison table?  

---

## 30. Appendices

### 30.1 Brand architecture

Do not lock the public brand to pharma-only.

Direction: **procurement / industry**, not generic “market.”

Examples: Procure.pk, IndustryHub, SupplyHub, FactoryMart, ProcureX, TradeFactory, IndustryLink, SupplyBridge, PlantMarket, MachineMarket.

Illustrative lines:

- **ProcureX** — Pakistan’s Industrial Procurement Network  
- **IndustryHub** — Find. Source. Sell. Grow.  

Workspace name may remain Pharmstore until a brand is chosen. UI copy should stay manufacturing-broad.

### 30.2 Pakistani cities (V1 controlled list — starter)

Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Gujranwala, Sialkot, Peshawar, Quetta, Hyderabad, Sukkur, Bahawalpur, Sargodha, Sheikhupura, Gujrat, Rahim Yar Khan, Mardan, Abbottabad, Wah, Hub, Port Qasim / industrial areas as “Karachi,” Hattar, FIEDMC / “Faisalabad,” Other.

Admin can add cities without a full recategorisation.

### 30.3 File policies (product)

| Use | Allowed | Notes |
| --- | --- | --- |
| Images | JPEG, PNG, WebP | Machine photos; max dimensions in tech spec |
| Documents | PDF | Catalogues, quotes, licences, drawings |
| Video | URL (YouTube) in V1; file upload P1 | |
| Max attachments per RFQ | 10 | Ops can request more via message |

### 30.4 Prohibited listings (policy)

Weapons, illegal drugs, counterfeit branded machines presented as genuine, human biologicals outside normal lab-supply context as defined by ops, anything ops flags as not industrial procurement. Used equipment must not be listed if the seller cannot represent they have the right to sell (policy; ownership verified is P1).

### 30.5 Interview scripts (Month 1)

**Buyer (20 min)**  
1. Walk me through the last time you sourced a machine or critical spare.  
2. How many vendors did you contact? How?  
3. What is hardest to source?  
4. Roughly how many RFQs / serious sourcing events per month?  
5. How do you know a new supplier is real?  
6. Would you post that requirement on a specialist website if 5 verified vendors responded? What would stop you?  

**Supplier (20 min)**  
1. Where do qualified leads come from today?  
2. What is one serious lead worth (order value and what you would pay for it)?  
3. Would you pay Rs 10k / 20k / 30k per month for N matched RFQs? What is N?  
4. What would make you ignore a portal?  

### 30.6 End-to-end acceptance scenarios (launch checklist)

**Scenario A — Happy RFQ**  
Guest searches compression machine → opens supplier → Post RFQ → registers as buyer → submits RFQ → admin classifies and matches 8 suppliers → Open → 4 quotes → buyer compares and messages two → events logged.

**Scenario B — Manual supply**  
Admin creates 10 supplier profiles, approves, Business Verified two of them → they appear in search with badges.

**Scenario C — Used machine**  
Seller submits HPLC listing with 6 photos and specs → admin approves → buyer in Karachi finds it via Used → Laboratory → enquires → seller notified.

**Scenario D — Rejection**  
Spam RFQ rejected → no supplier notified → buyer sees reason.

**Scenario E — Guest privacy**  
Guest cannot see supplier mobile on search cards.

**Launch is not “pages exist.” Launch is Scenario A completable with real users.**

### 30.7 Traceability index (requirement IDs)

| ID | Area |
| --- | --- |
| US-D* | Discovery |
| US-S* | Supplier profiles |
| US-R* | RFQs |
| US-Q* | Quotations |
| US-U* | Used machinery |
| US-C* | Communications |
| US-B* | Buyer workspace |
| US-SE* | Seller workspace |
| US-A* | Admin |
| US-T* | Trust |
| US-M* | Matching |
| US-CAT* | Categories |

### 30.8 Document control

| Field | Value |
| --- | --- |
| Audience | Founders, design, ops, engineering |
| Related | TECH_STACK.md, future wireframes, interview notes |
| Next artefacts | IA wireframes; admin SOP; category seed list (20–30 launch types) |

---

*End of PRD v2.0*

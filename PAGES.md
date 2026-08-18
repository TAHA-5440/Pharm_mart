# Page redesign specification

**Product:** ProcureX (workspace: Pharmstore)  
**Document type:** Public and logged-in page map — what each area shows, where the marketplace lives, and how a listing opens  
**Version:** 1.0  
**Date:** 18 August 2026  
**Status:** Source of truth for the next UI pass. Implement this file; do not invent a new sitemap.  
**Aligned to:** [PRD.md](./PRD.md) v2.0 · [FRONTEND_DESIGN.md](./FRONTEND_DESIGN.md) · [TECH_STACK.md](./TECH_STACK.md)

This document answers: **what is the one-page story, where is the marketplace, what appears in every region, and what opens when someone clicks a product.**

---

## How to use this file

1. Build **routes and chrome** from §2–§3.  
2. Build each screen from its **region table** (top → bottom). If a region is not listed, do not add it.  
3. Sample photography: use the **Unsplash URLs in §16** (and keep `public/images/` as fallback if Unsplash 500s).  
4. Conversion stays **Request quotation / Post RFQ**. There is **no cart, no checkout, no “Buy now”**.

**Locked (do not reopen here)**

| Keep | Change |
| --- | --- |
| RFQ loop is how you buy | Home is no longer a mixed catalogue |
| Pharma + food first | Marketplace is its own page |
| Forest-green primary CTA (not yellow) | Product click opens a full spec + gallery page |
| Buyers free; no payments in V1 | Header: Home · Marketplace · How it works · Post RFQ |

---

## 1. Product in one paragraph (copy for Home)

ProcureX is Pakistan’s **verified industrial procurement network** for pharmaceutical and food plants. Buyers **find suppliers, browse machines and products, and post one RFQ** to receive **3–5 comparable quotations**. It is a **specification marketplace**, not an online shop: a tablet press is not added to a cart.

**What you can find**

1. **Verified suppliers** — workshops and manufacturers (Lahore, Karachi, Faisalabad, …).  
2. **Products & services** — vessels, lines, lab gear, HVAC, fabrication, spare parts, validation.  
3. **Used machinery** — specification-first listings (make, model, year, condition, city, price or on request).  
4. **A quotation desk** — one requirement, matched suppliers, comparison table.

---

## 2. Information architecture (new)

### 2.1 Public sitemap (implement these routes)

```
/                         Home — who we are, what you can find (NOT the catalogue)
/marketplace              Marketplace — all listings + search + filters
/marketplace?type=all
/marketplace?type=products
/marketplace?type=machines
/marketplace?type=suppliers
/marketplace?q=…
/marketplace?category=tablet-compression-machines
/products/[slug]          Product / service detail (gallery + specs)
/machines/[slug]          Used machine detail (gallery + specs)  [already exists — restyle]
/suppliers/[slug]         Supplier mini-website
/how-it-works             Process for buyers and suppliers
/rfq/new                  Post a requirement (auth wall)
/login  /register
/legal/terms  /legal/privacy
```

**Redirect:** `/search` → `/marketplace` (preserve `q`, `category`, `type`, `city` query params). Keep `/search` as an alias for one release so old links work.

### 2.2 Logged-in (unchanged paths; restyle later)

```
/buyer                    Buyer desk — my RFQs
/buyer/rfqs/[id]          Quote comparison
/seller                   Seller desk — matched RFQs + quote form
/admin                    Ops queues
```

### 2.3 What lives where (do not mix)

| Page | Job | Must not become |
| --- | --- | --- |
| **Home** `/` | Story + orientation. Make someone understand ProcureX in 15 seconds and choose Marketplace or Post RFQ. | A product grid, a search-results dump, or a SaaS feature list |
| **Marketplace** `/marketplace` | Work surface. See **all live products, used machines, and (tab) suppliers**. Search, filter, sort. Click a card → detail. | A marketing landing. Do not hide the RFQ CTA. |
| **Product** `/products/[slug]` | One SKU: photos, specs, supplier, enquire. | A checkout page |
| **Used machine** `/machines/[slug]` | One asset: gallery, datasheet specs, enquire. | A classifieds phone dump |
| **Supplier** `/suppliers/[slug]` | Company mini-site: about, products, used, certificates. | A Facebook page |

### 2.4 Primary user journeys

**A. Browse then enquire**

Home → Marketplace → (optional filters) → click product/machine → gallery + specs → **Request quotation** → `/rfq/new` with listing/supplier pre-filled.

**B. Already know the need**

Home or header → **Post RFQ** → form → submitted.

**C. Find a company**

Marketplace tab **Suppliers** → profile → Request quotation **or** open one of their products.

---

## 3. Global chrome (every public page)

### 3.1 Header (sticky)

Left → right. Always the same.

| Region | Content | Notes |
| --- | --- | --- |
| **Wordmark** | `ProcureX` → `/` | Serif / display. No tagline in the bar (tagline lives on Home). |
| **Primary nav** | `Marketplace` → `/marketplace` · `How it works` → `/how-it-works` | Current page: ink underline or hairline, not a pill. |
| **Search** | Desktop: compact field, placeholder `Search products, machines, suppliers…`, `GET /marketplace?q=` | Mobile: icon opens the same field under the bar or jumps to Marketplace with focus. |
| **Theme** | Three swatches: Grove / Dusk / Terra | Existing `data-theme`. |
| **Log in** | Ghost / outline button | Logged-in: first name → `/buyer` `/seller` `/admin` by role. |
| **Post RFQ** | Forest green (`mark`) | **Always visible.** Never yellow. Never buried in a menu. |

Do **not** put Categories as a top-level duplicate of Marketplace. Categories are **filters inside Marketplace**.

### 3.2 Footer

Four columns + legal row.

| Column | Show |
| --- | --- |
| Brand | ProcureX · one sentence: *Verified B2B procurement for Pakistan’s manufacturing industry.* |
| Find | Marketplace · Products · Used machinery · Suppliers · How it works |
| Industries | Pharmaceutical · Food & Beverage · Packaging · Laboratory · Machinery |
| Cities | Lahore · Karachi · Islamabad · Faisalabad · Multan · Gujranwala · Sialkot |
| Legal | Terms · Privacy · “Quotations are not purchase orders. Contracts stay between buyer and supplier.” |

---

## 4. Home `/` — the “who we are” page

**Goal:** Explain the product. Preview what exists. Send people to **Marketplace** or **Post RFQ**.  
**Visual:** Full-bleed industrial photograph + hairline bento overlays (Grove editorial).  
**Length:** One scroll on desktop (~2–3 screens). No infinite catalogue.

### 4.1 Region map (top → bottom)

```
[ HEADER ]
[ HERO PHOTO — full bleed ]
    eyebrow: Pakistan · Industrial procurement
    H1: Find trusted industrial suppliers
    deck: One requirement. Multiple verified quotations.
    [ Browse marketplace ]  [ Post an RFQ ]
    hairline stats: N suppliers · N product listings · N used machines
[ 01 WHAT YOU CAN FIND — 3 large photo tiles ]
    Products & services → /marketplace?type=products
    Used machinery      → /marketplace?type=machines
    Verified suppliers  → /marketplace?type=suppliers
[ 02 HOW PROCUREX WORKS — 3 steps ]
    Post → Matched quotes → Compare
    link: Full process → /how-it-works
[ 03 A SAMPLE FROM THE FLOOR — 4 live cards ]
    Mix of live products + used machines (real DB rows only)
    “See all in Marketplace →”
[ 04 IF YOU CANNOT FIND IT ]
    Copy + Post RFQ (forest green)
[ FOOTER ]
```

### 4.2 Hero — what to show

| Element | Exact job | Copy / data |
| --- | --- | --- |
| Background photo | Plant / stainless / process hall. Documentary, not a handshake. | §16 `IMG-HERO` |
| Dark veil | Keep white type readable | Gradient bottom-heavy |
| Eyebrow | Place and industries | `Pakistan · Pharma · Food · Machinery` |
| H1 | Promise | `Find trusted industrial suppliers` |
| Deck | Mechanism | `One requirement. Multiple verified quotations. Pakistan-first procurement for manufacturing plants.` |
| Primary | Enter the catalogue | Button **Browse marketplace** → `/marketplace` |
| Secondary | Skip browse | Forest green **Post an RFQ** → `/rfq/new` |
| Stats | Proof, not vanity | Count **live** `SupplierOrganisation` (approved), `ProductListing` (live), `UsedMachineListing` (live). Pad `03` style. If a count is 0, still show it honestly. |

**Do not** put the full search + filter UI in the hero. One optional search field that submits to `/marketplace?q=` is allowed; filters belong on Marketplace.

### 4.3 Section 01 — What you can find

Three equal tiles (photo + title + one line + count).

| Tile | Photo | Title | One line | Count | Click |
| --- | --- | --- | --- | --- | --- |
| A | `IMG-PRODUCTS` | Products & services | New equipment, vessels, lines, spares, services | live product count | `/marketplace?type=products` |
| B | `IMG-USED` | Used machinery | Make, model, condition, city, price or on request | live used count | `/marketplace?type=machines` |
| C | `IMG-SUPPLIERS` | Verified suppliers | Workshops with stamps, not a phone book | approved supplier count | `/marketplace?type=suppliers` |

Empty count: still show the tile; line becomes `None live yet — post an RFQ and we will match suppliers.`

### 4.4 Section 02 — How it works (short)

Do not duplicate the long How-it-works page.

| Step | Title | Body |
| --- | --- | --- |
| 01 | Post a requirement | Specs, quantity, city, timeline. |
| 02 | Matched suppliers quote | Target 3–5 comparable offers. |
| 03 | Compare and shortlist | Price, delivery, warranty, verification. |

Link: `Read the full process →` `/how-it-works`

### 4.5 Section 03 — Sample from the floor

**Exactly 4 cards** from the database (prefer 2 products + 2 used; if fewer products, fill with used).  
Each card = same component as Marketplace cards (§5.5).  
Row header: `A sample from the floor` + text link `Open Marketplace`.  
**Empty marketplace rule:** If zero live listings, **do not** invent trending products. Show one honest sentence + Post RFQ.

### 4.6 Section 04 — RFQ band

Headline: `Cannot find the exact spec?`  
Body: `Post once. Receive quotations from verified suppliers.`  
CTA: **Post RFQ**

### 4.7 Home must never show

- Full product grid (that is Marketplace)  
- Fake reviews, “22 people viewing”, logo marquees  
- Shopping cart, discounts, “Add to bag”  
- Purple/glow SaaS dashboards  

---

## 5. Marketplace `/marketplace` — the catalogue

**Goal:** See everything that can be sourced, search it, filter it, open a listing.  
**This is the page the user asked for:** marketplace where they see all the products and search.

### 5.1 Page anatomy

```
[ HEADER — search may duplicate the in-page search; both hit this page ]
[ TITLE BLOCK ]
    H1: Marketplace
    Deck: Products, used machinery, and verified suppliers for pharma and food plants.
[ TOOLBAR ]
    Tabs: All | Products | Used machinery | Suppliers
    Search field (q)
    Sort
    Result count  “24 listings”
[ BODY: two columns on desktop ]
    LEFT 240px: filters
    RIGHT: results (grid or table by tab)
[ ZERO STATE if needed ]
[ FOOTER ]
```

### 5.2 Title block

| Element | Content |
| --- | --- |
| H1 | `Marketplace` |
| Deck | `Search products, used machines, and suppliers. Open a listing for specifications and photographs. Request a quotation — do not check out.` |
| Chips | Active filters as removable nameplates: `Lahore ×` `Tablet compression ×` |

### 5.3 Tabs (`?type=`)

| Tab | `type` | Default view | Result objects |
| --- | --- | --- | --- |
| **All** | `all` (default) | Mixed **grid** | Live products + live used machines, newest first. Suppliers not mixed into this grid (they have a dedicated tab). |
| **Products** | `products` | Grid | `ProductListing` status live |
| **Used machinery** | `machines` | Grid | `UsedMachineListing` status live |
| **Suppliers** | `suppliers` | **Table** (desktop), stacked rows (mobile) | `SupplierOrganisation` publicStatus approved |

Query `q` searches:

- Products: name, shortDesc, specs, supplier displayName  
- Machines: title, manufacturer, model, city, description  
- Suppliers: displayName, about, city  

### 5.4 Filters (left rail desktop; sheet on mobile)

**Always**

| Filter | Control | Query |
| --- | --- | --- |
| Category | Leaf types (tablet compression, mixing, HVAC, lab, …) | `category=` slug |
| City | Checklist from `CITIES` | `city=` |
| Industry | Pharma / Food / Other (if tagged) | `industry=` |

**Products tab extra**

| Filter | Control |
| --- | --- |
| Price | On request / has PKR |
| Kind | Product / service (from `ProductListing.kind`) |

**Used tab extra**

| Filter | Control |
| --- | --- |
| Condition | Good / refurbished / … |
| Inspection available | Toggle |
| Manufacturer | Text or known makes |

**Suppliers tab extra**

| Filter | Control |
| --- | --- |
| Verification stamp | Minimum level |
| Category capabilities | Same leaf list |

**Footer of rail:** `Clear all` · sticky **Post RFQ** (small).

### 5.5 Product / used card (grid)

Photo 4:3. Hover: photo brightens slightly; hairline, no bounce.

| Zone | Products | Used machines |
| --- | --- | --- |
| Image | `imageUrl` or Unsplash fallback §16 | First of `photoUrls` |
| Stamps | `PRODUCT` or `SERVICE` | Condition + `INSPECTION` if true |
| Title | `name` | `title` |
| Meta | Supplier displayName · city | `manufacturer` `model` · city |
| Price | `On request` or `Rs …` | Same |
| Click | `/products/[slug]` | `/machines/[slug]` |

Card is the whole hit target. Do not put Call on the card.

### 5.6 Supplier row (table)

Columns: Stamp · Name · City · Industries / categories · **Request quotation**.  
Click name → `/suppliers/[slug]`.  
Guests: no phone in the HTML.

### 5.7 Toolbar

- Result count: `24 listings` / `3 suppliers`  
- Sort: Newest · Relevance (when `q` set)  
- Products/used: grid only in V1 (table later)  
- Suppliers: table only on desktop  

### 5.8 Zero results

One sentence: `No listings match these filters.`  
Actions: **Clear filters** · **Post an RFQ**  
Suggestions: drop city, related category names as links.

### 5.9 Empty marketplace (no live listings in DB)

Do not show dummy Alibaba-style products.  
Show: `The catalogue is being filled. Post an RFQ and we will match verified suppliers.` + CTA.

### 5.10 Pagination

24 per page. `Load more` or numbered pages. URL `?page=`.

---

## 6. Product detail `/products/[slug]`

**Goal:** After a Marketplace click, show **photographs + specifications + who sells it + enquire**.  
**Layout (desktop):** 7 / 5. Gallery left, sticky enquire right.  
**404** if not live.

### 6.1 Region map

```
[ HEADER ]
[ BREADCRUMB ]  Marketplace / {Category} / {Product name}
[ GALLERY 7 ]                 [ RAIL 5 ]
  main photo                    stamps: PRODUCT · verification of seller
  thumb strip (up to 6)         H1 name
                                supplier name → profile
                                city · lead time
                                price or On request
                                [ Request quotation ]
                                [ Message ] (login)
                                [ Call ] (login + rules)
[ BELOW GALLERY, FULL WIDTH LEFT COL ]
  Short description
  Specifications table (dt/dd)
  Long description
  “More from this supplier” (up to 4 cards)
[ FOOTER ]
```

### 6.2 Gallery

| Rule | Detail |
| --- | --- |
| Main | Largest image, 16:10, object-cover |
| Thumbs | Remaining images; click swaps main (120ms fade, no cube) |
| Missing images | Use category Unsplash from §16 — never a broken gray box |
| Alt text | `{name} — {angle n}` |
| Lightbox | Optional P1: click main to enlarge; Esc closes |

**V1 data:** `ProductListing.imageUrl` is often a single URL. **Show at least 3 frames** on the page: primary + two category-consistent Unsplash extras labelled as *Reference process photography (not this serial number)* if they are not seller uploads. Prefer real seller photos when `imageUrl` and future `photoUrls` exist.

### 6.3 Specification block (required)

Render `specs` plus structured fields. If `specs` is empty, still show the structured rows.

| Row | Source |
| --- | --- |
| Product | `name` |
| Type | `kind` (product / service) |
| Category | category name |
| Supplier | displayName (link) |
| City | supplier city |
| Price | PKR or On request |
| Lead time | `{leadDays} days` or — |
| Description | `shortDesc` |

Long text: `longDesc` as paragraphs under the table.

If `specs` is a newline or `key: value` string, parse into extra rows. Example for seed **SS316 mixing vessels**:

| Spec | Value |
| --- | --- |
| Material | SS316 |
| Volume range | 200–2000 L |
| Finish | cGMP |
| Jacket | Yes (as copy in shortDesc) |
| Use | Pharma / food mixing |

### 6.4 Enquire rail

**Request quotation** → `/rfq/new?product={slug}` (or `?supplier=`).  
Pre-fill RFQ title with product name; attach listing id when schema allows.  
Guest: same button → login/register as buyer, then return.

Never: Add to cart, Buy, Pay.

### 6.5 More from this supplier

Up to 4 other live products/machines. Same cards as Marketplace.

---

## 7. Used machine detail `/machines/[slug]`

Same **template language** as product detail so the marketplace feels one. Extra industrial fields.

### 7.1 Gallery (contact sheet)

- Main 16:10  
- Thumbs from `photoUrls` split by comma (seed has 5 for HPLC)  
- If only one URL, pad with §16 `IMG-LAB`, `IMG-LINE`, `IMG-TANKS` as *Reference plant photography*  
- Stamps on image: condition, `INSPECTION`, `INSTALLATION`, `VIDEO` if `videoUrl`

### 7.2 Datasheet (definition list)

| Spec | Field |
| --- | --- |
| Title | `title` |
| Manufacturer | `manufacturer` |
| Model | `model` |
| Year | `year` |
| Condition | `condition` |
| Serial | `serialNumber` or — |
| Location | `city` |
| Price | PKR or On request |
| Warranty | `warranty` |
| Installation | Yes / No |
| Inspection | Yes / No |
| Description | `description` |

Canonical example (already in seed): **HPLC System — Waters Alliance e2695** · 2018 · Refurbished · Lahore · Rs 4,850,000 · 3 months warranty · installation + inspection.

### 7.3 Rail

Same as product: **Request quotation** `/rfq/new?machine={slug}` · Message · Call (rules).  
Seller name → `/suppliers/[slug]`.

---

## 8. Supplier profile `/suppliers/[slug]`

Keep as **company mini-website**, not a product.

| Region | Show |
| --- | --- |
| Header | Logo/placeholder, displayName, verification stamp, city, established, industries |
| Rail | Request quotation, Call, Message, catalogue if file |
| About | `about` |
| Products | Grid of their live `ProductListing` → `/products/[slug]` |
| Used | Their live machines → `/machines/[slug]` |
| Certificates | Document thumbs or empty honest line |
| Cities served | Text |

Pending suppliers: not public.

---

## 9. How it works `/how-it-works`

Longer story than Home §02. Two columns: **For buyers** | **For suppliers**.

**Buyers:** 01 Post → 02 We match 3–5 → 03 Compare quotes → 04 Message or call. Contracts stay off-platform.  
**Suppliers:** Complete profile → get matched RFQs → submit price, delivery, warranty, PDF.  
**Not a cart** callout.  
CTAs: Browse marketplace · Post RFQ · Register as supplier.

Photo strip: `IMG-HERO` half-width.

---

## 10. Post RFQ `/rfq/new`

Keep the four-step title block from FRONTEND_DESIGN §8.5.

| Step | Title |
| --- | --- |
| 01 What | Title, type, industry, category (or not sure), description, files |
| 02 Quantity & when | Qty, city, needed-by, closing |
| 03 Optional | Budget hidden by default, used allowed, installation, warranty |
| 04 Review | Preview + submit |

If arrived from a product/machine: show a **context chip** at top: `Regarding: SS316 mixing vessels` with thumbnail.  
Auth wall: buyer only.

---

## 11. Auth `/login` `/register`

Photo left (`IMG-WORKSHOP` login, `IMG-HERO` register). Form right.  
Register: two large sheets **Buyer organisation** | **Supplier organisation**, not a dropdown.  
Demo hint can stay in local: `maria.s@example.com` / `password123`.

---

## 12. Buyer / seller / admin (logged-in)

Do not turn these into marketing pages. Restyle tokens only (forest green, Grove/Dusk/Terra).

| Page | Show |
| --- | --- |
| `/buyer` | Open RFQs, quote counts, Post RFQ |
| `/buyer/rfqs/[id]` | Status stamp, spec summary, comparison table, message/call |
| `/seller` | Matched RFQ list, quote form, completeness |
| `/admin` | Supplier approve queue, RFQ classify + open + match |

---

## 13. Legal `/legal/terms` `/legal/privacy`

Keep. Add one line matching Home: platform does not sell the goods; quotations are not POs.

---

## 14. Component inventory for this pass

Reuse restyled shadcn: Button (mark = forest green), Input, Card, Badge/Stamp.  
New / shared:

| Component | Used on |
| --- | --- |
| `ListingCard` | Home sample, Marketplace grid, “more from supplier” |
| `MarketplaceFilters` | Marketplace rail / mobile sheet |
| `SpecList` | Product + machine datasheet (`dt`/`dd`) |
| `Gallery` | Product + machine |
| `RfqContextChip` | RFQ form when linked to a listing |

Motion: 180–240ms fade-up, no Lottie, no scroll-jacking.

---

## 15. Header vs Home vs Marketplace (anti-confusion)

| User wants to… | Send them |
| --- | --- |
| Understand ProcureX | `/` |
| See all products and search | `/marketplace` |
| Open specs and images | `/products/[slug]` or `/machines/[slug]` |
| Vet a company | `/suppliers/[slug]` |
| Ask for quotes without browsing | **Post RFQ** |
| Learn the loop | `/how-it-works` |

If a designer puts a 40-card grid on Home, that is **wrong**. Home previews **four** live cards max.

---

## 16. Sample images (Unsplash)

Use `next/image` with `images.unsplash.com` already allowed in `next.config.ts`.  
If a URL 500s, fall back to `/images/*.jpg` in `public/images/`.

Pattern: `https://images.unsplash.com/{id}?auto=format&fit=crop&w={W}&q=80`

| Token | Unsplash photo id | Use |
| --- | --- | --- |
| `IMG-HERO` | `photo-1565043666747-69f6646db940` | Home hero, register, how-it-works strip — process hall / plant |
| `IMG-TANKS` | `photo-1581093458791-9d42e3c7e933` | Mixing / vessels / product fallback |
| `IMG-LINE` | `photo-1581094794329-cdc91c3232d2` | Machinery, blister/capsule, used surplus |
| `IMG-LAB` | `photo-1576086213369-97a306d36557` | Laboratory, HPLC gallery extras |
| `IMG-WORKSHOP` | `photo-1504328345606-18bbc8c9d7d1` | Login, SS fabrication, suppliers tile |
| `IMG-HVAC` | `photo-1504328345606-18bbc8c9d7d1` | HVAC / utilities (same workshop until a dedicated still is licensed) |
| `IMG-FOOD` | `photo-1560493676-04071c5f467b` | Food & beverage category colour |
| `IMG-PACK` | `photo-1586528116311-ad8dd3c8310d` | Packaging / warehouse |
| `IMG-PRODUCTS` | `photo-1581091226825-a6a2a5aee158` | Home tile “Products & services” |
| `IMG-USED` | `photo-1565043666747-69f6646db940` | Home tile “Used machinery” |
| `IMG-SUPPLIERS` | `photo-1504328345606-18bbc8c9d7d1` | Home tile “Verified suppliers” |
| `IMG-SCOPE` | `photo-1576086213369-97a306d36557` | Validation / lab instruments |

**Category → image map** (Marketplace cards and empty product galleries)

| Category slug | Token |
| --- | --- |
| tablet-compression-machines | `IMG-LINE` |
| mixing-and-blending | `IMG-TANKS` |
| blister-packing-machines | `IMG-PACK` |
| capsule-filling | `IMG-LINE` |
| liquid-oral-manufacturing | `IMG-TANKS` |
| laboratory-equipment | `IMG-LAB` |
| hvac | `IMG-HVAC` |
| water-systems | `IMG-TANKS` |
| ss-fabrication | `IMG-WORKSHOP` |
| spare-parts | `IMG-LINE` |
| validation-calibration | `IMG-SCOPE` |
| used-machinery | `IMG-USED` |

**Seed content (already in DB — must appear in Marketplace)**

| Kind | Name | Detail URL | Photos |
| --- | --- | --- | --- |
| Product | SS316 mixing vessels | `/products/ss316-mixing-vessels` | `IMG-TANKS` + extras `IMG-HERO`, `IMG-LINE` |
| Used | HPLC System — Waters Alliance e2695 | `/machines/hplc-waters-alliance-e2695-lahore` | seed `photoUrls` + pad with `IMG-LAB` |
| Used | 500 L SS316 mixing vessel | `/machines/500l-ss316-vessel-faisalabad` | `IMG-TANKS` + pad |

**Alt-text rule:** describe the industrial subject. Never “image 1”. Example: `Jacketed stainless mixing vessels in a process hall`.

**Do not use:** Unsplash handshakes, laptops, shopping bags, neon server rooms.

---

## 17. Copy deck (approved strings)

| Place | String |
| --- | --- |
| Home H1 | Find trusted industrial suppliers |
| Home deck | One requirement. Multiple verified quotations. Pakistan-first procurement for manufacturing plants. |
| Marketplace H1 | Marketplace |
| Marketplace deck | Search products, used machines, and suppliers. Open a listing for specifications and photographs. |
| Product CTA | Request quotation |
| Header CTA | Post RFQ |
| Zero listings | The catalogue is being filled. Post an RFQ and we will match verified suppliers. |
| Zero search | No listings match these filters. |
| Legal one-liner | Quotations are not purchase orders. Contracts stay between buyer and supplier. |

Tone: industrial, direct. No “Unlock the future.” No “Shop now.”

---

## 18. Responsive

| Breakpoint | Home | Marketplace | Detail |
| --- | --- | --- | --- |
| Mobile | Hero stacked; 3 “what you can find” tiles 1-col; Post RFQ sticky | Filters in a sheet; 1–2 col grid | Gallery then rail; sticky Request bar |
| Desktop | Bento on photo | 240px filter + grid/table | 7 / 5 gallery + rail |

---

## 19. SEO and indexation

**Index:** `/`, `/marketplace`, `/products/[slug]`, `/machines/[slug]`, `/suppliers/[slug]`, `/how-it-works`, legal.  
**Noindex:** `/buyer/*`, `/seller/*`, `/admin`, `/rfq/*`, drafts.  
Titles: `SS316 mixing vessels · ProcureX` · `Marketplace · ProcureX`.

---

## 20. Implementation order (when building this spec)

1. Routes: `/marketplace`, `/products/[slug]`; redirect `/search` → `/marketplace`.  
2. Header nav swap (Marketplace + How it works; search → marketplace).  
3. Home restyle to story layout (§4) — **no full grid**.  
4. Marketplace filters + `ListingCard` for products and used.  
5. Product detail gallery + `SpecList`.  
6. Restyle machine detail to match product template.  
7. Seed extra Unsplash frames if a listing has only one photo.  
8. Empty and zero-result states.

Do not start payments, Expo, or WhatsApp-before-RFQ while doing this.

---

## 21. Acceptance checklist

A reviewer should be able to:

- [ ] Open `/` and explain what ProcureX is without seeing a full catalogue  
- [ ] Click **Browse marketplace** and land on a searchable catalogue of **all live products and used machines**  
- [ ] Search `HPLC` or `mixing` and see matching cards  
- [ ] Click a card and see **images + a spec table + Request quotation**  
- [ ] Switch tabs to Suppliers and open a profile  
- [ ] See forest green Post RFQ in the header on every public page  
- [ ] See no yellow primary buttons and no cart  
- [ ] See Unsplash (or local fallback) images, never gray empty frames  
- [ ] Post RFQ from a product with that product named in the form context  

---

## 22. Related files

| File | Role |
| --- | --- |
| This file | **What each page shows** |
| [PRD.md](./PRD.md) | Fields, statuses, RFQ rules |
| [FRONTEND_DESIGN.md](./FRONTEND_DESIGN.md) | Visual language (tokens, motion, anti-SaaS) |
| [AGENT_HANDOFF.md](./AGENT_HANDOFF.md) | Current build status |
| [STEPS.md](./STEPS.md) | Engineering order (messaging still Step 13) |

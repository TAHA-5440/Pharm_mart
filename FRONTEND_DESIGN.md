# Frontend design specification

**Product:** Pharmstore (working name)  
**Document type:** Visual language, layout types, responsive behaviour, motion, and UI inventory  
**Aligned to:** [PRD.md](./PRD.md) v2.0 · [TECH_STACK.md](./TECH_STACK.md)  
**Version:** 1.1  
**Date:** 18 August 2026  
**Platform:** Web first (desktop + tablet + mobile browser). Native apps are out of this document.

This file is the frontend source of truth for **how the product should look and feel**. It is written so design and engineering do not default to the generic “AI SaaS” look that currently floods Dribbble and generated UIs.

**v1.1:** Public UI must be **visually attractive** — editorial, photographic, and memorable — not a gray wireframe and not a decorated template. Dashboards stay calm and precise; the marketplace face must still make someone want to stay.

---

## Table of contents

1. [Intent](#1-intent)
1A. [Attractiveness bar](#1a-attractiveness-bar)
2. [What we studied](#2-what-we-studied)
3. [What we refuse (the AI look)](#3-what-we-refuse-the-ai-look)
4. [Chosen design direction](#4-chosen-design-direction)
5. [Design types in this product](#5-design-types-in-this-product)
6. [Brand materials: colour, type, grid, surface](#6-brand-materials-colour-type-grid-surface)
7. [Imagery, iconography, and verification](#7-imagery-iconography-and-verification)
8. [Layout recipes by screen](#8-layout-recipes-by-screen)
9. [Responsive system](#9-responsive-system)
10. [Motion and animation](#10-motion-and-animation)
11. [Component inventory and states](#11-component-inventory-and-states)
12. [Forms, tables, and density](#12-forms-tables-and-density)
13. [Frontend craft (implementation constraints)](#13-frontend-craft-implementation-constraints)
14. [Accessibility and performance](#14-accessibility-and-performance)
15. [Do / don’t gallery (verbal)](#15-do--dont-gallery-verbal)
16. [Reference index](#16-reference-index)

---

## 1. Intent

Procurement managers and factory owners must feel they are in a **serious industrial catalogue and RFQ desk**, not a startup landing page and not a classifieds site.

The interface should feel like:

- A printed machinery catalogue you can actually work in  
- An engineering datasheet  
- A buyer’s comparison spreadsheet that someone finally designed  
- A supplier “house magazine” (mini-website) with real plant photos  

It should **not** feel like:

- Linear / Vercel / Stripe clone  
- Alibaba clone with banners and flashing badges  
- Crypto dashboard  
- “Smart factory 4.0” neon control room  
- Airbnb for machines  

**Creative, but grounded.** Craft comes from typography, photography, paper-like structure, and precise motion — not from decoration.

The wireframe canvas is **structure only**. The shipped site must look like a **high-end industrial magazine you can work in**, not like that canvas and not like an ERP.

---

## 1A. Attractiveness bar

**Required.** “Industrial” is not permission to be dull. A procurement manager should open the homepage and think the product is **worth trusting and worth looking at**.

Attractive here means **desire + craft**, not stickers.

### What attractive means on this product

| Attractive | Not attractive |
| --- | --- |
| One huge, sharp plant photograph with a paper search panel overlapping it | A form on a blank beige page |
| Large serif headline with real rhythm (optical sizes, tight leading) | 16px gray UI everywhere, including the home hero |
| Category tiles that are **cropped machine photos** (steel, glass, blister foil) | Icon fonts in rounded squares |
| Used-machine contact sheet that feels like a dealer’s light table | Identical cards with stock thumbnails |
| Yellow **Post RFQ** as a single bright object on quiet paper | Yellow used as a theme colour / page background |
| Hover: photo slightly brightens, hairline draws, stamp feels pressed | Scale-bounce cards, glow, glass |
| Quote table that looks like a **designed instrument** (mono headers, ink rules) | Default shadcn table |

### Public vs logged-in

- **Public (home, category, supplier, used machine):** magazine energy. Full-bleed image, generous type, one dramatic crop per page. This is where attractiveness is non-negotiable.
- **RFQ wizard:** still handsome — numbered title block, quiet paper, one small photo strip — not a marketing landing.
- **Buyer / seller / admin:** attractive through **clarity and materials** (type, stamps, numbers), not through heroes. No fake charts to “look premium.”

### Seven moves that create beauty without the AI look

1. **Photography is the brand.** If a public page has no real (or realistically commissioned) image, it is unfinished. Budget for a shoot or licensed industrial stills that match Pakistan / pharma / food — not Unsplash handshakes.
2. **One hero idea per page.** Home = find suppliers on a factory. Machine = this HPLC. Supplier = this workshop. Do not stack five competing visuals.
3. **Type contrast.** Display serif at 48–56px against 13px mono labels. That contrast *is* the luxury.
4. **Asymmetry and overlap.** Photo 62% / panel 38%, panel overlapping the image by 24–40px. Centered stacks look generated.
5. **Material, not skin.** Warm paper, mill steel, ink rules, a hint of grain on certificates. No mesh gradient.
6. **Light.** Photos a little underexposed and tactile; UI paper slightly warm. Avoid icy #F8FAFC chrome.
7. **Motion as polish.** 180ms hairline draw, gallery fade, sticky header shrink. Enough to feel alive; not a showreel.

### Attractiveness anti-patterns (still forbidden)

Pretty-but-fake is worse than plain:

- Gradient mesh, glass, 3D blobs, neon “Industry 4.0”
- Inter + purple + floating dashboard
- Lottie on the hero
- Fake 3D machines
- Beauty that hides specs (price, city, verification must stay obvious)

### Bar for design review

Reject a public mock / page if any is true:

- It could pass as a generic “B2B SaaS landing” from 2025
- It looks like the Cursor wireframe canvas (boxes and “PHOTO” labels)
- There is no photograph-scale visual on first screen
- The headline is smaller or weaker than the nav
- Post RFQ is a ghost button lost in the header

Pass if: someone would screenshot the homepage, and a buyer can still post an RFQ in one glance.

---

## 2. What we studied

Reviewed Dribbble shots, industrial case studies, and live B2B products. Steal *principles*, not skins.

### 2.1 Dribbble — take these ideas

| Shot / studio | URL | Steal | Leave |
| --- | --- | --- | --- |
| **Matta mobile — Lazarev.** B2B chemical marketplace | [dribbble.com/shots/22133095](https://dribbble.com/shots/22133095-Mobile-design-details-for-a-B2B-chemical-marketplace-Lazarev) | Category tiles with **counts** (products / subcategories). Manufacturer row = **real logos + copy**, no decorative icons. | Over-vibrant consumer colour if it fights industrial trust. |
| **Caub — dealership inventory** | [dribbble.com/shots/27449216](https://dribbble.com/shots/27449216-Caub-Modern-Car-Dealership-Web-Experience) | Inventory browsing: filters, structured cards, **detail + enquiry** as one flow. Used-machine analogue. | Automotive chrome / lifestyle gloss. Our machines are stainless, dusty, real. |
| **Lapalma product page — LAIN** | [dribbble.com/shots/25920328](https://dribbble.com/shots/25920328-Lapalma-Elegant-Modern-Furniture-Company-Website-Product-Page) | **Editorial catalogue:** full-bleed photo + modular spec blocks. Feels like flipping a printed book. | Furniture softness. We keep the editorial *structure*, harder materials. |
| **CARBO — industrial manufacturer site** | [dribbble.com/shots/25656608](https://dribbble.com/shots/25656608-CARBO-Industrial-Grade-Design-Web-Solution-for-Bead-Manufact) | Motion that **explains capability**, not ornaments. Responsive industrial IA. | “High-tech for its own sake” if it becomes sci-fi. |
| **Secespol product page** | [dribbble.com/shots/13875805](https://dribbble.com/shots/13875805-Secespol-Product-Page-a-leading-manufacturer-of-heat-exchanger) | Data-heavy manufacturer page that stays **elegant**. Huge spec sets without clutter. | — |
| **Sentient manufacturing catalogue** | [dribbble.com/shots/23160338](https://dribbble.com/shots/23160338-E-Commerce-Website-for-a-Manufacturing-Company) | Site as **digital catalogue + quote**, not a cart. Sharp, durable geometry. | Their green brand; we are ink + steel. |
| **Expandable table rows** | [dribbble.com/shots/21642733](https://dribbble.com/shots/21642733-Filterable-Grid-with-Expandable-Table-Data) | Quote comparison: compact row, **expand for PDF / notes / warranty**. | Over-styled table chrome. |
| **i2B procure-to-pay landing** | [dribbble.com/shots/17184778](https://dribbble.com/shots/17184778-i2B-Procure-To-Pay-e-Procurement-Platform-SaaS-Landing-Page) | Human supply-chain story, not “AI platform” rhetoric. | Generic SaaS hero + floating dashboard mockup. |
| **Wholex wholesale mobile** | [dribbble.com/shots/27019538](https://dribbble.com/shots/27019538-Wholex-Mobile-App-UI-UX-Design) | High-density list vs card toggle; comparison-first mobile. | AI-alert theatre; escrow phases (out of V1). |

### 2.2 Dribbble / trend — do **not** copy

| Shot type | Why it fails here |
| --- | --- |
| **Terafab-style “smart factory” dashboards** ([example](https://dribbble.com/shots/27457368-Terafab-AI-Smart-Factory-Dashboard-Robotics-Monitoring)) | Futuristic glass, robotics hero art, neon charts. Looks generated. Our users run tablet presses in Lahore, not a sci-fi plant. |
| Gradient-mesh SaaS homepages with a 12° tilted dashboard | 2023–2026 default. Zero industrial memory. |
| 3D clay blobs, isometric “logistics” illustrations | Stock-AI texture. |
| Dark mode cyber industrial | Looks like a game HUD. Daylight factories + fluorescent offices are our context. |

### 2.3 Live products — steal behaviour

| Product | Steal |
| --- | --- |
| **Machinio** | Spec filters (make, model, year, location). Photo-forward used listings. Price or ask. Seller dashboard for leads. |
| **Thomasnet / Kompass-type directories** | Industry drill-down. Capability language. (Improve: verification as a real object, not a tiny icon.) |
| **Alibaba RFQ** | One requirement, many quotes. (Improve: quality cap 3–5 quotes, comparable columns, not a bazaar.) |
| **Xometry-style manufacturing sites** | Spec-first catalogue, certifications on supplier, RFQ as the conversion. |
| **RS Components / Baymard B2B research** | On **desktop**, spec-heavy results as a **product table**, not only pretty cards. Mobile: list with the same key columns stacked. |
| **Siemens Industrial Experience (IX)** | Density, technical labels, industrial seriousness. (Do not clone Siemens chrome; take the discipline.) |

### 2.4 How to keep using Dribbble

Search these, skip the first page of purple dashboards:

- `industrial catalogue website`  
- `manufacturer product page specs`  
- `used equipment listing`  
- `editorial product page photography`  
- `B2B marketplace mobile categories`  
- `data table expandable row`  
- `procurement comparison matrix`  

Ignore: `SaaS landing dashboard mockup`, `AI platform hero`, `web3`, `nft`, `crypto exchange`.

---

## 3. What we refuse (the AI look)

If a screen could have been generated from “modern SaaS marketplace UI” it is **wrong**.

| Trap | Why it reads as fake | Our replacement |
| --- | --- | --- |
| Inter / Poppins / Geist everywhere | Default of every generated UI | Editorial serif + industrial sans (§6) |
| Indigo/violet gradient, mesh blobs | Midjourney/ChatUI cliché | Ink, paper, mill-scale, one safety accent |
| 16px rounded cards, identical drop shadows | shadcn default skin | 2–4px radius, hairline borders, almost no shadow |
| Floating 3D dashboard in the hero | Agency template 2024 | Asymmetric photo + search + Post RFQ |
| Fake activity (“12 people viewing”) | Consumer marketplace | Real match counts, real quote counts |
| Cute empty-state illustrations | Startup onboarding | Empty state = Post RFQ + one honest sentence |
| Glassmorphism, blurry panels | Decorative, slow on 4G | Opaque paper surfaces |
| Unsplash handshake / laptop | Not our world | Plant, SS316, blister line, HPLC, workshop |
| Infinite logo marquee | Every agency site | Static “industries we cover” or nothing |
| Scroll-jacking, text scramble, magnetic buttons | Portfolio, not work tool | Short, useful motion only |
| Perfect 8-column card grids of nothing | Looks generated | Mixed: table + editorial + one featured photo row |
| “Unlock the future of procurement” | Empty | PRD copy: *One requirement. Multiple verified quotations.* |

**shadcn/ui warning:** the library is fine as a *behaviour* kit. Default zinc + rounded-md + Inter **is** the AI look. Tokens, radius, type, and borders must be restyled before the first screen ships.

---

## 4. Chosen design direction

**Name:** Workshop editorial  

**One sentence:** A Pakistani industrial catalogue designed like a well-printed engineering brochure: serif headlines, ink rules, documentary plant photography, and dense tools (tables, RFQs, quotes) that still feel considered.

**Personality**

| Axis | We sit here |
| --- | --- |
| Consumer ↔ Industrial | Industrial |
| Playful ↔ Serious | Serious, not grim |
| Airy SaaS ↔ Dense tools | Dense where work happens; generous on public heroes |
| Generic ↔ Local | Local materials and cities, international craft |
| Decorative ↔ Functional | Functional, with one memorable editorial moment per key page |

**Mood references (physical, not UI)**

- Stainless tanks and mill finish (not chrome car paint)  
- FDA/GMP white rooms vs oily workshop floors — both honest  
- Pakistani industrial print ads and exhibition banners (Lahore Expo, food-tech fairs) — we take the **directness**, not the clip-art  
- ISO datasheet + a good architecture magazine layout  

**Creative signature (do these consistently so it does not look like a template)**

1. **Hairline rules** instead of fat cards — like a drawing title block.  
2. **Section numbers** on public pages (`01 Find`, `02 Request`, `03 Compare`) like a spec index.  
3. **Stamp-like verification** (inked mark, not a social-media tick).  
4. **Asymmetric heroes** (photo occupies ~55–62% width on desktop; search stack sits on paper).  
5. **Tabular figures** for PKR, days, years.  
6. **One accent only:** safety yellow used like floor marking — CTAs and “Post RFQ”, never backgrounds.

---

## 5. Design types in this product

The product is **four visual systems** sharing one token set. Do not design every page as a card grid.

### Type A — Editorial marketplace (public)

**Where:** Home, category, how-it-works, trust page.  
**Inspired by:** Lapalma editorial flow, CARBO industrial sites, Sentient catalogue.  
**Layout:** Full-bleed documentary photo, overlapping paper panel, numbered sections, category “index” not app icons.  
**Creative move:** Hero search sits *on* a paper sheet over a real factory photograph (not a cutout dashboard). Industry chips are set like metal tags (small, tracked-out labels).

**Attractiveness:** This is the beauty surface of the product. Full-viewport crop, serif display, overlapping sheet, category tiles as **photo index**. If home is bland, the whole brand is bland.

### Type B — Spec directory (search & listings)

**Where:** Search results, category supplier lists, product indexes.  
**Inspired by:** Baymard B2B product tables, Machinio filters, Matta category counts.  
**Desktop:** Default **table/list hybrid** — photo thumb (64–72px), name, city, badge, industries, one spec, CTA. Toggle to grid for used machines (photo-led).  
**Mobile:** Stacked rows; same fields; filters in a bottom sheet.  
**Creative move:** Filter chips look like **dymo / nameplate labels** (mono, slight tracking), not pastel pills.

### Type C — Dossier (supplier profile & used machine)

**Where:** Supplier mini-website, used-machine detail, certificate viewers.  
**Inspired by:** Secespol / manufacturer product pages, Caub detail+enquiry, Machinio photo galleries.  
**Layout:** Gallery is a **contact sheet** (real frames, not identical rounded squares). Specs in a two-column definition list (`dt`/`dd`) like a datasheet. Sticky enquire column on desktop.  
**Creative move:** Cover image can be full-bleed and slightly imperfect (workshop lighting). Certificates as **document thumbnails with paper grain**, not icon-in-a-circle.

### Type D — Procurement OS (logged-in work)

**Where:** Buyer RFQ, quote comparison, seller inbox, admin queues.  
**Inspired by:** Expandable comparison tables, J.R. Merritt-style 3-step RFQ (Request → Compare → Approve), Siemens density.  
**Layout:** App shell: slim sidebar or top utility bar, **work canvas**, not marketing chrome. Quote matrix with frozen first column.  
**Creative move:** Status as **title-block stamps** (OPEN, CLOSING 20 AUG) rather than candy badges. Quote table rows expand like a drawing revision, not an accordion from a FAQ.

### Type E — Quiet auth and empty

**Where:** Login, register, pending approval, zero quotes.  
**Layout:** Narrow paper form, one plant photo strip, no illustration characters.  
**Copy:** Direct. “Your RFQ is with our team. Matching suppliers are not notified until it is open.”

---

## 6. Brand materials: colour, type, grid, surface

### 6.1 Colour

Named after materials, not “Primary-600”.

| Token | Hex (start) | Use |
| --- | --- | --- |
| `ink` | `#12141A` | Text, rules, logo |
| `ink-soft` | `#3A3F4B` | Secondary text |
| `paper` | `#F4F1EA` | Page background (warm, not #F8FAFC cool gray) |
| `sheet` | `#FFFcf7` | Cards, tables, forms |
| `rule` | `#D4D0C8` | Hairlines |
| `mill` | `#5C6570` | Icons, meta |
| `steel` | `#1F4B5A` | Links, focus, verified-adjacent (deep teal-steel, **not** indigo) |
| `mark` | `#E3B341` | Safety yellow — **Post RFQ**, key CTA only |
| `mark-ink` | `#1A1508` | Text on yellow |
| `live` | `#2F6B4F` | Success, approved (muted forest, not neon green) |
| `hold` | `#B4532A` | Warning, pending (oxide, not orange gradient) |
| `stop` | `#8F2D2D` | Error, rejected |

**Dark mode:** not on public V1. Admin may use a denser `sheet` (`#EFEBE3`) but not #0B0B0F dark UI.

**Colour usage rule:** 90% ink/paper/steel. Yellow is a floor stripe. If a mockup has yellow backgrounds, it is wrong.

### 6.2 Typography

**Display (headlines, home, category H1):** a real serif with optical sizes — **Newsreader** or **Source Serif 4**. Slightly tight leading. This is the anti-Inter move. On **public heroes, use the top of the scale (48–56px desktop)** — small headlines are why industrial sites look cheap.

**UI / body / tables:** **IBM Plex Sans** (designed for technical products). Tabular lining figures **on** for prices and dates.

**Mono / spec labels / badges / filters:** **IBM Plex Mono** at small size (11–12px), tracked +4–8%. Datasheet vibe.

**Scale (desktop)**

| Role | Size / line | Font |
| --- | --- | --- |
| Display | 40–56 / 1.15 | Serif, weight 400–500 (not ultra-black) |
| Page title | 28–32 / 1.2 | Serif |
| Section | 20–22 | Sans medium |
| Body | 16 / 1.5 | Sans |
| Table | 13–14 / 1.4 | Sans, tabular nums |
| Meta / stamp | 11–12 | Mono |

**Mobile:** display 32–36. Do not keep 56px heroes on a phone.

**Avoid:** oversized 72px Inter hero, gradient text, fake 3D letters.

### 6.3 Grid and spacing

- **Public desktop:** 12 columns, max width **1280px**, side margins 24–40. Hero may **break out** (full viewport photo).  
- **App shell:** max **1440px** canvas; sidebar 220–240px.  
- **Baseline:** 8px. Prefer 12/16/24/40 over random 18/22.  
- **Density:** public pages airy in the hero, then tighter. Dashboards compact (table padding 8–10px).  

**Asymmetry:** Left-weighted titles. Do not center-align entire homepages.

### 6.4 Shape and elevation

- Radius: **2px** controls, **4px** sheets, **0px** stamps and rules.  
- Shadow: none, or `0 1px 0 rgba(18,20,26,0.06)` at most. Separation = **1px `rule`**.  
- Focus: 2px `steel` ring, offset 2px, not glow.

### 6.5 Logo and chrome

Until brand is chosen: wordmark in serif + a small **registration-style mark** (circle stamp), not a gradient geometric “P”. Header: paper/sheet, hairline bottom, **Post RFQ** as yellow rectangular button (not pill).

---

## 7. Imagery, iconography, and verification

### 7.1 Photography direction

Commission or shoot (even phone + good light is better than stock):

- Tablet compression, SS mixing vessels, blister lines, HVAC plant rooms, HPLC benches  
- Pakistani plants: Sundar, Korangi, FIEDMC, Hub — people at work, PPE, real mess at edges  
- Used machines: 5+ angles, nameplate close-up, control panel, wear, overall  

**Treatment:** slight film/documentary. No HDR crunch, no teal-orange, no fake bokeh. Crop with courage (detail of a weld, not always the whole hall).

**Never:** generated “photoreal” machines, Unsplash factory with European signage only, smiling handshake.

### 7.2 Icons

Custom **1.5px stroke**, 24px grid, squared ends — closer to drawing symbols than Lucide’s round consumer set. Use icons only when they decode faster than text (call, PDF, WhatsApp). Categories on home: **small photos or monochrome equipment silhouettes**, not colourful app icons.

### 7.3 Verification as an object

Do not use a Twitter-style blue tick.

**Stamp component:** rounded-rect or circle, 1.5px ink stroke, mono label `BUSINESS VERIFIED` / `INDUSTRY VERIFIED`. Fill: paper. Ink colour = `steel` or `ink`. Tooltip: one plain sentence from the PRD.

On quote rows the stamp sits **before** the company name, small but legible.

---

## 8. Layout recipes by screen

Wireframe-level. Designers expand; engineers should not invent a fifth layout.

### 8.1 Homepage (Type A)

```
[ wordmark | search | Post RFQ | Log in ]
[ PHOTO 62%  |  paper panel 38% ]
             |  Display: Find trusted
             |  industrial suppliers
             |  Pharma · Food · Packaging · Lab · Machinery
             |  [ Search suppliers, products or machines ]
             |  [ Search suppliers ]  [ Post an RFQ ]
[ 01 Categories — 5+5 tiles, photo + name + count ]
[ 02 Can't find it? full-width rule + Post RFQ ]
[ 03 How it works — three numbered steps, no icons-in-circles ]
[ 04 Used this week — horizontal contact-sheet, not a fake carousel of 40 ]
[ footer: industries, cities, legal ]
```

Sticky header on scroll: compact, Post RFQ always visible.

**Visual finish (not in the canvas):** hero photo is a real filling line or SS hall, slightly documentary; paper panel casts no heavy shadow — it **overlaps** the photo; yellow Post RFQ is the only saturated object; category row is five rich crops, not icons. Mobile: photo 200–240px tall, then the same panel stacked; Post RFQ sticky.

### 8.2 Search / category (Type B)

Desktop: **left filter rail (240px)** + results. Results toolbar: count, sort, view toggle (table | grid).  
Used-machine **grid** is photo-first (4:3), specs under (make, year, city, price).  
Supplier **table**: logo 40px, name+stamp, city, industries, CTA.

Zero results: one line + Post RFQ. No sad illustration.

### 8.3 Supplier profile (Type C)

Desktop two columns: 7 / 5.

- Left: about, products, used machines, certificates (document row)  
- Right sticky: stamp, city, established, **Request quotation**, Call, Message, catalogue download  

Mobile: CTAs **sticky bottom bar** (Request | Call).

### 8.4 Used machine (Type C)

- Contact-sheet gallery (main + thumbs). Lightbox with keyboard.  
- Title block: manufacturer, model, year, condition, city, price or “Request price”.  
- Definition-list specs. Flags as stamps: `INSPECTION`, `INSTALLATION`, `VIDEO`.  
- Enquire form in sticky rail (creates RFQ linked to listing).

### 8.5 Post RFQ (Type D, but public-adjacent)

Four steps as a **vertical title block**, not a carnival stepper with balloons.

`01 What` → `02 Quantity & when` → `03 Optional` → `04 Review`

Progress = numbered rules, current step ink, others mill. Draft autosave indicator in mono: `DRAFT SAVED 14:32`.

### 8.6 RFQ detail + quote comparison (Type D)

```
[ Title block: RFQ name | status stamp | closing | match count ]
[ Spec summary — 2 col definition list ]
[ Comparison table — freeze Supplier column ]
   expand row → notes, PDF, warranty, Message / Call
[ Thread panel optional split on xl ]
```

Mobile: table becomes **stacked quote cards** with the same fields in a fixed order (price, delivery, warranty, stamp). Horizontal scroll table is allowed **with** frozen supplier name and a hint `Swipe to compare`. Prefer cards if more than 4 columns.

### 8.7 Seller / buyer dashboards (Type D)

Not a chart zoo. **Work queue.**

Seller: `New RFQs` list, completeness checklist, three numbers (views / RFQs / quotes) as **big tabular figures**, not pie charts.

Buyer: open RFQs with quote-count stamps.

Admin: queues with oxide `hold` on pending counts. Looks like a newsroom inbox, not Mixpanel.

### 8.8 Auth

Single column, max 420px, paper on mill-steel leftover photo. Buyer vs supplier as **two large selectable sheets**, not a tiny dropdown.

---

## 9. Responsive system

**Breakpoints (named)**

| Name | Width | Behaviour |
| --- | --- | --- |
| `sm` | 0–639 | One column, sticky RFQ/CTA, bottom sheets |
| `md` | 640–1023 | Two columns where it helps; filters as sheet still OK |
| `lg` | 1024–1279 | Filter rail + table; sticky profile rail |
| `xl` | 1280+ | Full recipes in §8 |

### 9.1 Principles

1. **Same information, different geometry.** Do not hide warranty on mobile.  
2. **Thumb-first primary actions.** Post RFQ, Request quote, Submit quote: bottom-sticky or large in-flow buttons (48px min height).  
3. **Desktop earns tables; mobile earns cards** — except comparison, which may swipe.  
4. **Filters:** desktop rail; mobile **full-screen sheet** with Apply / Clear, chip summary on the page (`Lahore · Verified · 3 filters`).  
5. **Navigation:** desktop header links. Mobile: hamburger **or** bottom nav for logged-in (`Home / RFQs / Inbox / Account`). Public mobile: header + hamburger; Post RFQ visible.  
6. **Images:** `srcset`; hero max ~200kb on 4G; blur placeholder from dominant mill colour, not rainbow.  
7. **Hover is extra.** Every hover action has a click/tap equivalent (row expand, call).  
8. **Landscape phones:** do not force desktop table; still use `sm`/`md` rules.  
9. **Safe areas:** iOS home indicator padding on sticky bars.  
10. **PWA:** when added, use the same chrome; standalone should not lose the sticky Post RFQ.

### 9.2 Touch and Pakistan field use

- Outdoor brightness: contrast on stamps and yellow CTA must pass WCAG AA.  
- Fat-finger: table row expand target ≥ 44px.  
- Quote submit on phone must be completable without pinch-zooming inputs.  
- Click-to-call uses `tel:`; WhatsApp deep link only after enquiry exists (PRD).

### 9.3 Responsive patterns (copy these)

| Pattern | Desktop | Mobile |
| --- | --- | --- |
| Header | Full nav + search | Logo, search icon, Post RFQ, menu |
| Category tiles | 5 across | 2 across, photo still visible |
| Supplier results | Table | List rows, 72px photo |
| Used results | Grid 3 | Grid 1–2, large photo |
| Profile | 7/5 split, sticky CTA | Stack, sticky bottom CTA |
| Comparison | Frozen-column table | Cards + optional swipe table |
| RFQ wizard | Wide sheet 720 | Full width, one question group per screen |
| Dashboard | Sidebar | Bottom nav + top title |
| Admin queues | Wide table | Card per item, key fields, Approve/Reject |

### 9.4 What not to do when “going responsive”

- Scale the whole desktop down.  
- Hide Post RFQ behind a menu.  
- Turn the quote table into “tap to open PDF only”.  
- Hamburger-only with 12 items and no search.

---

## 10. Motion and animation

Motion is **orientation and feedback**, like a well-oiled machine — not a showreel.

### 10.1 Principles

1. If it does not help a task, it does not ship.  
2. Duration short. Public: 180–280ms. UI: 120–180ms.  
3. Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)` ( mechanised, not bounce). **No springy overshoot** on tables.  
4. `prefers-reduced-motion: reduce` → instant states, no hero Ken Burns, no staggered lists.  
5. Never block input with animation.  
6. One motion language across web (and later PWA).  

### 10.2 Token set

| Token | Value | Use |
| --- | --- | --- |
| `motion-fast` | 120ms | Hover, chips, focus |
| `motion-ui` | 180ms | Panels, row expand, sheets |
| `motion-page` | 240ms | Page fade, hero settle |
| `ease-machine` | 0.2, 0.8, 0.2, 1 | Default |
| `ease-out` | 0.16, 1, 0.3, 1 | Exit |

### 10.3 Allowed motion (ship)

| Interaction | Motion |
| --- | --- |
| Page change | 8px fade-up of main canvas, 240ms. Header stays. |
| Hero photo | Very slow ken-burns **optional** (20s, 3% scale). Disable if it looks cinematic-AI. Prefer **static**. |
| Filter apply | Results crossfade; count ticks with tabular numbers (no slot-machine). |
| Chip on/off | Background 120ms; no bounce. |
| Row expand (quotes, RFQ) | Height ease 180ms; chevron rotate 120ms. |
| Sticky header | Hairline + height 64→52, 180ms. |
| Bottom sheet (filters) | Translate Y + dim 40% ink at 20% opacity. |
| Toast / “draft saved” | Slide from top 160ms, auto-dismiss. |
| Stamp appear (after verify) | Ink “press” — scale 0.94→1, 180ms, once. |
| Image gallery | Instant swap or 120ms fade; no cube rotate. |
| Button | Background 120ms; **no** scale(1.05). Yellow CTA: tiny rule underline or fill darken. |
| Skeleton load | Paper → slightly darker shimmer **horizontal**, slow, low contrast. Not rainbow. |
| Match count | When RFQ opens, number fades in (not confetti). |

### 10.4 Creative but realistic signature motions

Use **at most two** so they stay special:

1. **Title-block draw:** on homepage and RFQ detail, the hairline under the H1 draws left-to-right 300ms on first paint.  
2. **Contact-sheet:** gallery thumbs do not stagger-fade like a template; they are present. Lightbox only fades the overlay.

That is enough personality.

### 10.5 Forbidden motion

- Cursor-follow, magnetic buttons, circular text  
- Scroll-jacking / pinned 100vh stories  
- Lottie blobs, 3D tilt on cards (`transform: perspective`)  
- Logo infinite marquee  
- Text scramble / typewriter headlines  
- Confetti on quote submit  
- Parallax layers on dashboards  
- Auto-playing decorative video behind forms  
- Staggered 40ms fade-in of every table row (looks generated)

### 10.6 Animation ownership in code

- CSS for hover, expand, sheets, header.  
- One small library only if needed for shared layout (e.g. view transitions on app routes). Prefer the View Transitions API **lightly** (fade), not morphing every card.  
- No animation on server-rendered SEO content that shifts CLS. Images must have width/height.

---

## 11. Component inventory and states

Build a small system. Names should sound like a workshop, not “CardDefault”.

| Component | Notes |
| --- | --- |
| `TitleBlock` | Number, serif title, hairline, meta mono |
| `Stamp` | Verification / status |
| `MarkButton` | Yellow primary (Post RFQ, Submit quote) |
| `InkButton` | Secondary, outlined |
| `GhostButton` | Tertiary |
| `Nameplate` | Filter chip / tag |
| `Sheet` | Paper surface, 1px rule |
| `DataTable` | Frozen column, expand row, tabular nums |
| `QuoteCard` | Mobile comparison |
| `ContactSheet` | Gallery |
| `DefinitionList` | Specs |
| `SearchField` | Large on home, compact in header |
| `Stepper` | RFQ 01–04 |
| `QueueItem` | Admin / inbox |
| `StickyActions` | Mobile bottom bar |
| `EmptyDesk` | Honest empty + CTA |
| `Notice` | Hold/stop/live banners |
| `DocumentThumb` | PDF/catalogue |

### 11.1 Control states (every interactive)

Default · Hover (desktop) · Active · Focus-visible · Disabled · Loading · Error · Success.

Loading on Submit: button shows `SENDING` in mono, no spinner-only.

### 11.2 Content states

| State | Treatment |
| --- | --- |
| Empty RFQs | TitleBlock + one sentence + MarkButton |
| Empty quotes | “Waiting for quotations” + match count, no animation loop |
| Pending supplier | Watermark stamp `UNDER REVIEW` on preview |
| Rejected | Oxide notice + reason |
| Sold machine | Photo desaturated 20%, stamp `SOLD`, enquire hidden |
| Offline | Banner; drafts stay local if possible |

### 11.3 Notification UI

In-app: small ink list, not red dots everywhere. Unread = steel rule on the left of the row. Do not use bouncing badges.

---

## 12. Forms, tables, and density

### 12.1 Forms

- Labels **above** fields, always visible (no placeholder-only).  
- Help text in `ink-soft`.  
- Errors in `stop`, under the field, sentence case.  
- File drop: dashed **rule** rectangle, “PDF or photos”, not a cloud illustration.  
- RFQ long description: 6-row textarea, spec-friendly mono optional toggle later.  

### 12.2 Tables (core craft)

Desktop quote/search tables:

- Header: mono 11px, tracked, `mill`  
- Row hover: `paper` fill, not shadow  
- Selected/expanded: 2px `steel` left bar  
- Numbers right-aligned, PKR with tabular lining  
- Sticky header under app chrome  

### 12.3 Density modes

V1: one density (comfortable-compact). Do not ship a “comfortable vs compact” toggle until sellers ask.

---

## 13. Frontend craft (implementation constraints)

Aligned with TECH_STACK (Next.js + Tailwind + restyled shadcn) without turning this into a stack doc.

| Topic | Rule |
| --- | --- |
| Tokens | CSS variables for colour, type, radius, motion. Tailwind maps to those — do not scatter hex in JSX. |
| shadcn | Replace radius, colours, font. Kill default shadow-sm on Card. |
| Layout | CSS Grid for public; app shell flex + main scroll. |
| SEO pages | Real HTML headings, no client-only hero text. |
| Images | `next/image`, explicit sizes, contact-sheet `object-cover` with consistent aspect. |
| Fonts | Subset; `font-display: swap`; prevent Inter from loading as a fallback chain that reflows. |
| Scroll | Document scroll on public; app main pane scroll in dashboards. |
| Z-index | Header 40, sheet 50, lightbox 60, toast 70. |
| RTL | Not V1; do not hard-mirror with hacks that break tables. Urdu P1 may be mixed — keep forms LTR for specs. |

---

## 14. Accessibility and performance

- Contrast: ink on paper, mark-ink on yellow, steel links underlined in body text (not only colour).  
- Focus visible always (keyboard RFQ).  
- Tables: `th` scope, expand button named “Show quote details, ABC Engineering”.  
- Galleries: alt = manufacturer + model + angle, not “image”.  
- Motion: respect reduced motion.  
- Target size 44px.  
- Performance budget (public LCP): hero image or title, not a JS dashboard. Aim LCP &lt; 2.5s on mid Android 4G.  
- No layout shift: stamps reserved width, image dimensions set.  

---

## 15. Do / don’t gallery (verbal)

**Home**  
Do: documentary wide shot of a filling line; paper panel; serif “Find trusted industrial suppliers”; yellow Post RFQ.  
Don’t: gradient mesh; 3D dashboard; “Empower your supply chain with AI”.

**Supplier card**  
Do: real logo or letterform in a square, stamp, Lahore, Pharma / SS fabrication.  
Don’t: random avatar faces; five-star reviews as the first trust signal.

**Used HPLC**  
Do: six real photos including nameplate; datasheet list; `REFURBISHED` stamp; PKR or Request price.  
Don’t: one generated glossy render; heart icon; “Similar products” carousel of unrelated mixers.

**Quote table**  
Do: three rows, stamps, expand to PDF.  
Don’t: rainbow “best deal” banner; gamified medals.

**Mobile**  
Do: sticky Request | Call; swipe hint on compare.  
Don’t: desktop table squeezed to 12px type.

---

## 16. Reference index

Keep this list next to Figma. Open the Dribbble links before any new screen.

**Dribbble (structure / craft)**  
- [Matta B2B chemical — mobile categories (Lazarev.)](https://dribbble.com/shots/22133095-Mobile-design-details-for-a-B2B-chemical-marketplace-Lazarev)  
- [Caub inventory + enquiry](https://dribbble.com/shots/27449216-Caub-Modern-Car-Dealership-Web-Experience)  
- [Lapalma editorial product page](https://dribbble.com/shots/25920328-Lapalma-Elegant-Modern-Furniture-Company-Website-Product-Page)  
- [CARBO industrial + motion](https://dribbble.com/shots/25656608-CARBO-Industrial-Grade-Design-Web-Solution-for-Bead-Manufact)  
- [Secespol spec-heavy manufacturer page](https://dribbble.com/shots/13875805-Secespol-Product-Page-a-leading-manufacturer-of-heat-exchanger)  
- [Sentient digital catalogue / quote](https://dribbble.com/shots/23160338-E-Commerce-Website-for-a-Manufacturing-Company)  
- [Expandable table data](https://dribbble.com/shots/21642733-Filterable-Grid-with-Expandable-Table-Data)  
- [i2B procurement landing (tone, not template)](https://dribbble.com/shots/17184778-i2B-Procure-To-Pay-e-Procurement-Platform-SaaS-Landing-Page)  
- [Wholex dense wholesale mobile](https://dribbble.com/shots/27019538-Wholex-Mobile-App-UI-UX-Design)  

**Live / research**  
- Machinio listing + filters  
- Baymard: product **tables** for B2B machinery on desktop  
- Xometry / industrial RFQ sites (spec-first)  
- Siemens IX (density discipline)

**Anti-references**  
- [Terafab-style neon factory dashboards](https://dribbble.com/shots/27457368-Terafab-AI-Smart-Factory-Dashboard-Robotics-Monitoring)  
- Default shadcn dashboard templates  
- Generic “SaaS marketplace kit” on Dribbble

---

## 17. Definition of done (frontend)

A screen is done only if:

1. It matches **Workshop editorial** (serif + IBM Plex + paper/ink + yellow CTA).  
2. It uses one of Types A–E, not a new random card grid.  
3. Responsive recipes in §9 are applied.  
4. Motion is only from §10.3–10.4.  
5. It would still look credible printed in grayscale on a factory noticeboard.  
6. A procurement manager would not think it was a crypto or AI toy.  
7. **Public screens pass §1A:** photograph-scale visual, strong serif, overlap/asymmetry, Post RFQ as the bright object. A screenshot of home should look worth keeping.

---

*End of frontend design spec v1.1*

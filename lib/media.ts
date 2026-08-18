export const PHOTOS = {
  hero: "/images/hero.jpg",
  heroLive: "/images/hero-live.jpg",
  workshop: "/images/workshop.jpg",
  lab: "/images/lab.jpg",
  gears: "/images/gears.jpg",
  line: "/images/line.jpg",
  tanks: "/images/tanks.jpg",
  hvac: "/images/hvac.jpg",
  scope: "/images/scope.jpg",
} as const;

export const UNSplash = {
  hero: "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=2000&q=80",
  tanks: "https://images.unsplash.com/photo-1581093458791-9d42e3c7e933?auto=format&fit=crop&w=1200&q=80",
  line: "https://images.unsplash.com/photo-1581094794329-cdc91c3232d2?auto=format&fit=crop&w=1200&q=80",
  lab: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80",
  workshop: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80",
  food: "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=80",
  pack: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
} as const;

export const CATEGORY_PHOTOS: Record<string, string> = {
  "tablet-compression-machines": PHOTOS.gears,
  "mixing-and-blending": PHOTOS.tanks,
  "blister-packing-machines": PHOTOS.line,
  "capsule-filling": PHOTOS.line,
  "liquid-oral-manufacturing": PHOTOS.tanks,
  "laboratory-equipment": PHOTOS.lab,
  hvac: PHOTOS.hvac,
  "water-systems": PHOTOS.tanks,
  "ss-fabrication": PHOTOS.workshop,
  "spare-parts": PHOTOS.gears,
  "validation-calibration": PHOTOS.scope,
  "used-machinery": PHOTOS.hero,
};

const UNSPLASH_MAP: Record<string, string> = {
  "1565043666747": PHOTOS.hero,
  "1581093458791": PHOTOS.tanks,
  "1581094794329": PHOTOS.line,
  "1576086213369": PHOTOS.lab,
  "1504328345606": PHOTOS.workshop,
  "1560493676": PHOTOS.tanks,
  "1586528116311": PHOTOS.line,
  "1581091226825": PHOTOS.workshop,
};

export function resolvePhoto(src?: string | null, fallback = PHOTOS.hero) {
  if (!src) return fallback;
  const first = src.split(",")[0]?.trim() ?? "";
  if (!first) return fallback;
  if (first.startsWith("/")) return first;
  for (const [id, local] of Object.entries(UNSPLASH_MAP)) {
    if (first.includes(id)) return local;
  }
  return first;
}

export function categoryPhoto(slug: string) {
  return CATEGORY_PHOTOS[slug] ?? PHOTOS.workshop;
}

export function listingGallery(primary?: string | null, extraCsv?: string | null) {
  const fromCsv = (extraCsv ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => resolvePhoto(s));
  const first = resolvePhoto(primary || fromCsv[0], PHOTOS.hero);
  const rest = fromCsv.filter((u) => u !== first);
  const pad = [PHOTOS.tanks, PHOTOS.line, PHOTOS.lab, PHOTOS.workshop];
  const out = [first, ...rest];
  for (const p of pad) {
    if (out.length >= 4) break;
    if (!out.includes(p)) out.push(p);
  }
  return out;
}

export function parseSpecs(raw?: string | null): Array<[string, string]> {
  if (!raw?.trim()) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return ["Detail", line] as [string, string];
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()] as [string, string];
    });
}

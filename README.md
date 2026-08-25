# Digital Print Pricer

A React + TypeScript + Vite app that prices digital print products.

The flow is three stages — **Produs** (category → product), **Configurare**
(media, size, printing, and finishing behind an "Opțiuni avansate" disclosure),
and **Ofertă** (preview, assembly summary, email handoff). A persistent price
panel follows the user through all three: it holds the quantity stepper and
re-prices automatically, debounced 400 ms, whenever the selection changes.

## Development

```bash
npm run dev        # start the dev server (Vite + HMR)
npm run build      # typecheck + production build
npm run test       # run the test suite (vitest, watch)
npm run test:run   # run once
npm run lint       # eslint
```

---

# Configuration

Everything the configurator renders comes from a single JSON-serializable
`Catalog` object. In standalone dev it is `MOCK_CATALOG` (assembled from
`src/data/mockData.ts`); a host app injects an equivalent object fetched from its
endpoint.

```jsonc
Catalog = {
  "products":   [ /* Product[] — the base items and their elementals */ ],
  "config":     { /* Record<productId, ProductConfig> — the settings below */ },
  "categories": [ /* ProductCategory[] */ ],
  "media":      [ /* Media[] — papers + stickers */ ],
  "sizes":      [ /* Size[] */ ],
  "machines":   [ /* Machine[] — printing machines, referenced by config.machineId */ ]
}
```

**`config` is where you control what a user sees and may choose.** It maps each
product id to a `ProductConfig`. Everything below is a field of that object.

## Media & size

| Setting | Type | Effect |
|---|---|---|
| `allowedMediaIds` | `string[]` | **Required.** Only these media appear in the media selector. |
| `allowedSizeIds` | `string[]` | **Required.** Only these sizes appear in the size selector. |
| `recommendedMediaId` | `string` | Media id highlighted as "recomandat" (must be inside `allowedMediaIds`). |
| `recommendedSizeId` | `string` | Size id highlighted as "recomandat" (must be inside `allowedSizeIds`). |
| `sharedSize` | `boolean` | For multi-element products, whether all elements share one size. Defaults to `true` when a product has more than one element; set `false` to allow a size per element. |
| `machineId` | `string` | Which `Catalog.machines` entry this product's size is bound by. **Omit → no ceiling enforced** (a host catalog that predates this field just doesn't restrict size; `warnIfCatalogPredatesMachine` flags the drift in dev). |

Built-in media ids: `p1` 90g Silk, `p2` 120g Lucios, `p3` 150g Mat, `p4` 200g
Soft-touch, `p5` 250g Lucios, `p6` 350g Mat, `p7`–`p10` stickers.
Size ids: `s0` A3, `s1` A4, `s2` A5, `s3` Letter, `s4` 1/3 A4, `s5`/`s6` business
cards, `s7` A3+, `s8` A6, and `s9`–`s20` the small label formats.

A `Machine` is `{ id, label, maxWidthMm, maxHeightMm }` — the physical ceiling
a print can't exceed, whatever a product's config otherwise allows. Sizes above
it are filtered out of the size-preset selector, and the exact-dimensions
inputs (`CustomSizeControl`) clamp to it as the user types or steps. Built-in:
`m1` — 320×450mm, matching the largest preset (A3+).

## Printing

| Setting | Type | Effect |
|---|---|---|
| `allowedPrintingFronts` | `('color' \| 'black' \| 'none')[]` | Restricts the **front** print buttons. Omit → all offered. |
| `allowedPrintingBacks` | `('color' \| 'black' \| 'none')[]` | Restricts the **back** print buttons. Set to `['none']` to force single-sided. |
| `elementalPrintingFronts` | `Record<elementalId, (...)[]>` | Per-element override of `allowedPrintingFronts`. |
| `elementalPrintingBacks` | `Record<elementalId, (...)[]>` | Per-element override of `allowedPrintingBacks`. |

## Page count

| Setting | Type | Effect |
|---|---|---|
| `elementalPageCounts` | `Record<elementalId, constraint>` | Per-element page-count rule. |
| `allowedPageCount` | `constraint` | Product-wide fallback, used for any element `elementalPageCounts` doesn't cover — notably elements the user adds at runtime, whose ids no catalog can predict. Same relationship as `allowedPrintingFronts` → `elementalPrintingFronts`. |

`constraint` is one of:

```jsonc
{ "kind": "fixed",    "value": 24 }                    // locked, no control shown
{ "kind": "multiple", "of": 4, "min": 8, "max": 48 }   // a stepper IS shown
{ "kind": "derived" }                                  // computed from the fold type
```

The page-count control is **only visible** for `kind: "multiple"`.

## Folding

| Setting | Type | Effect |
|---|---|---|
| `allowedFoldTypes` | `string[]` | **Required.** Which fold options the folding control offers. |

Values: `none`, `half-fold`, `tri-fold`, `z-fold`, `gate-fold`, `custom`.

## Elements

| Setting | Type | Effect |
|---|---|---|
| `allowElementEditing` | `boolean` | **Opt-in.** Lets the user add and remove elements in Configurare ("Adaugă element" / "Șterge elementul"). Omit and the product keeps exactly the parts the catalog gave it. The last element can never be removed. |

An added element gets a generated id, a `Element N` label, and media/size seeded
from `recommendedMediaId`/`recommendedSizeId` (`blankElemental` in
`src/lib/elementals.ts`). Because its id is not in the catalog, per-element
records (`elementalPageCounts`, `elementalPrinting*`) can't cover it — the
product-wide fields are what apply, which is why `allowedPageCount` exists.
Reverting the product ("personalizat" pill) drops added elements, since revert
restores the catalog's element list wholesale.

## Finishing — staple, lamination sides, creasing, rounded corners, binding

| Setting | Type | Effect |
|---|---|---|
| `allowedStaple` | `{ hole: boolean, staple: boolean }` | **Opt-in.** Omit → the staple control is **hidden**. Include it → the control appears with the given options enabled. |
| `allowedLaminationSides` | `('front' \| 'back' \| 'both')[]` | Restricts which lamination sides are offered. **Omit → all three.** A blank/unprinted back can still be laminated, so this is a product decision, *not* derived from what is printed. Disallowed sides render greyed/disabled. |
| `allowedCreasingCounts` | `number[]` | Restricts the creasing counts (0–5) offered. **Omit → everything the stock allows.** `[]` rules creasing out; a single value fixes it structurally (a folder cover is always creased). Intersected with the media ceiling below — a config cannot crease stock that won't hold one. |
| `allowedRoundedCorners` | `(1 \| 2 \| 3 \| 4)[]` | Restricts which **corner positions** may be rounded — `1` top-left, `2` top-right, `3` bottom-left, `4` bottom-right. **Omit → all four wherever the media allows.** `[]` rules rounding out for shapes that never get it whatever the weight (Afiș, Mapă de Prezentare). Intersected with the media ceiling below. The whole control disappears when the result is empty; a partial set renders the remaining corners greyed. |
| `binding` | `{ type: 'spiral', allowedColors?: ('white' \| 'black')[] }` | Enables the binding tab/control for the product. The control also offers **Fără**, which writes `{ type: 'none' }` and is omitted from the price payload — so a spiral is never a one-way choice. |

## Copy

| Setting | Type | Effect |
|---|---|---|
| `explanation` | `string` | Tooltip/badge text shown for the product. |

## Essentials vs. advanced

The configuration stage shows only what every job needs — material, size preset,
printing, and page count where it applies. Exact dimensions, all finishing, and
the product-wide accessories (spiral binding, folder pocket) live inside the
**Opțiuni avansate** disclosure.

The disclosure opens automatically when any setting inside it differs from the
catalog default, and when it is collapsed those settings are listed as chips on
its header. Collapsing therefore never hides a choice the user made.

## Seen vs. disabled

Not every restriction hides its control — some grey it out instead:

- **Hidden entirely when not allowed:** staple (`allowedStaple`) and binding
  (`binding`) when not configured; the page-count stepper (unless
  `kind: "multiple"`); and **biguitură (creasing)** and **colțuri rotunjite
  (rounded corners)** whenever the media disallows them.
- **Shown but greyed/disabled when a choice isn't allowed:** lamination type
  (only "Fără" when the media forbids lamination) and lamination sides.

Afiș uses `allowedLaminationSides: ['front']`, so posters offer front-or-none
lamination, and `allowedCreasingCounts: []` / `allowedRoundedCorners: []`, so
neither of those controls is drawn at all — a poster hangs flat and is trimmed
square.

## Full example

```jsonc
"config": {
  "prod0a": {
    "allowedMediaIds": ["p2", "p3", "p4", "p5", "p6"],
    "allowedSizeIds": ["s0", "s1"],
    "machineId": "m1",
    "recommendedMediaId": "p2",
    "recommendedSizeId": "s0",
    "allowedFoldTypes": ["none"],
    "allowedCreasingCounts": [],
    "allowedRoundedCorners": [],
    "allowedPrintingFronts": ["color"],
    "allowedPrintingBacks": ["none"],
    "allowedLaminationSides": ["front"],
    "explanation": "Coală A3 tipărită color pe o față."
  }
}
```

---

## Produs generic — the catch-all

`Produs generic` (category `generic`, product `prodGa`) is the one product that
presets nothing. Its config opens every field rather than narrowing it, so the
whole control surface is on screen at once, and `allowElementEditing` lets the
user build up however many parts the job has.

Two things about it are easy to get wrong when editing:

- **The omissions are load-bearing.** `allowedCreasingCounts`,
  `allowedRoundedCorners` and `allowedLaminationSides` mean *none* when set to
  `[]` and *everything the stock allows* when left out. They are deliberately
  absent from `GENERIC_CATEGORY_CONFIG` — setting any of them to `[]` silently
  removes that control.
- **The media ceilings still apply.** Lamination and rounded corners need paper
  ≥ 170 GSM and creasing ≥ 200 GSM (see the table below); no config field
  overrides that. The product therefore defaults to `p4` (200 GSM), the lightest
  stock that clears all three, and those controls correctly disappear if the user
  switches to lighter paper or a sticker.

It also sets `pocketEnabled: false` on the product literal: the config offers a
pocket so the control is there, but `pocketEnabled ?? true` would otherwise price
a pocket into every generic job by default.

The price endpoint receives `productId: "prodGa"` like any other product — a host
that prices from a known preset id rather than from the payload's parts list will
need to handle it.

---

## Settings that live in code, not JSON

Three finishing dimensions have a **physical ceiling** derived from the media
(weight/kind) in `src/lib/finishingRules.ts`, not from `config`. To move a
threshold, edit that file:

| Finishing | Media ceiling |
|---|---|
| Lamination **type** (Lucios/Mat/Soft-touch) | Paper ≥ 170 GSM. Never for stickers — below the threshold only "Fără" shows. |
| **Biguitură** (creasing) | Paper ≥ 200 GSM. Never for stickers. |
| **Colțuri rotunjite** (rounded corners) | Paper ≥ 170 GSM. Never for stickers, which are die-cut to shape already. |

The ceiling is the *most* a product can offer. `allowedCreasingCounts` and
`allowedRoundedCorners` narrow it from there and are intersected with it, so a
config can never exceed what the stock will hold. A product whose **shape** rules
a finishing out regardless of weight — Afiș, Mapă de Prezentare — says so with an
empty list in its config.

Precedence for creasing is **media > element > product**. A single part can carry
its own cap as `finishing.creasing.max` on the elemental — an inclusive maximum
(`2` offers 0, 1 or 2) that replaces `allowedCreasingCounts` for that part alone,
while the media floors both. It lives on the elemental rather than in an
id-keyed record here so it is authored where the part is defined:

```jsonc
"finishing": {
  "creasing": { "count": 0, "max": 1 }   // cover folds back over the spiral
}
```

`count` is the customer's choice; `max` is the catalog's constraint on it. They
are separate fields deliberately — see the note at the end of this section.

Because `max` sits on the elemental, it is part of what standalone dev caches in
localStorage. Constraints are therefore refreshed from the catalog on every load
(`withCatalogConstraints` in `src/hooks/useProducts.ts`), so editing a `max` takes
effect immediately while the user's own selections survive. **Any future
constraint added to the Elemental must be listed there too**, or a stale cache
will silently ignore it.

There are **no hardcoded catalog ids** in `finishingRules.ts`. Availability is
either a media fact (the table above) or catalog data (the config fields). Where a
rule is per-element, it is carried by the element itself (`finishing.creasing.max`)
— never by a list of ids baked into the code; such lists silently went wrong
whenever a host catalog used different ids or added a product.
Lamination **type** is the one dimension still decided by media alone; lamination
**sides** is fully JSON-driven via `allowedLaminationSides`.

All of this decides what is **offered**. The chosen value (`finishing.creasing.count`)
is never read when computing the menu — the range a value was picked from must not
depend on which value was picked, or every choice would narrow the next one. Note
`max` is a catalog constraint and is stripped from the price payload; only `count`
is sent.

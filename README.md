# Digital Print Pricer

A React + TypeScript + Vite app that prices digital print products. Users pick a
category and product, then customize it in the **Personalizare** step (media, size,
printing, finishing) and get a price.

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
  "sizes":      [ /* Size[] */ ]
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

Built-in media ids: `p1` 90g Silk, `p2` 120g Lucios, `p3` 150g Mat, `p4` 200g
Soft-touch, `p5` 250g Lucios, `p6` 350g Mat, `p7`–`p10` stickers.
Size ids: `s0` A3, `s1` A4, `s2` A5, `s3` Letter, `s4` 1/3 A4, `s5`/`s6` business cards.

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

## Finishing — staple, lamination sides, binding

| Setting | Type | Effect |
|---|---|---|
| `allowedStaple` | `{ hole: boolean, staple: boolean }` | **Opt-in.** Omit → the staple control is **hidden**. Include it → the control appears with the given options enabled. |
| `allowedLaminationSides` | `('front' \| 'back' \| 'both')[]` | Restricts which lamination sides are offered. **Omit → all three.** A blank/unprinted back can still be laminated, so this is a product decision, *not* derived from what is printed. Disallowed sides render greyed/disabled. |
| `binding` | `{ type: 'spiral', allowedColors?: ('white' \| 'black')[] }` | Enables the binding tab/control for the product. |

## Copy

| Setting | Type | Effect |
|---|---|---|
| `explanation` | `string` | Tooltip/badge text shown for the product. |

## Seen vs. disabled

Not every restriction hides its control — some grey it out instead:

- **Hidden entirely when not allowed:** staple (`allowedStaple`) and binding
  (`binding`) when not configured; the page-count stepper (unless
  `kind: "multiple"`); and **biguitură (creasing)** and **colțuri rotunjite
  (rounded corners)** whenever the media disallows them.
- **Shown but greyed/disabled when a choice isn't allowed:** lamination type
  (only "Fără" when the media forbids lamination) and lamination sides.

Afiș uses `allowedLaminationSides: ['front']`, so posters offer front-or-none
lamination.

## Full example

```jsonc
"config": {
  "prod0a": {
    "allowedMediaIds": ["p2", "p3", "p4", "p5", "p6"],
    "allowedSizeIds": ["s0", "s1"],
    "recommendedMediaId": "p2",
    "recommendedSizeId": "s0",
    "allowedFoldTypes": ["none"],
    "allowedPrintingFronts": ["color"],
    "allowedPrintingBacks": ["none"],
    "allowedLaminationSides": ["front"],
    "explanation": "Coală A3 tipărită color pe o față."
  }
}
```

---

## Settings that live in code, not JSON

Some finishing availability is derived from the **media** (weight/kind) in
`src/lib/finishingRules.ts`, not from `config`. To change these, edit that file:

| Finishing | Rule |
|---|---|
| Lamination **type** (Lucios/Mat/Soft-touch) | Stickers: always. Paper: only ≥ 170 GSM — below that only "Fără" shows. |
| **Biguitură** (creasing) | Paper only, ≥ 200 GSM. Never for stickers. |
| **Colțuri rotunjite** (rounded corners) | Stickers: always. Paper: only ≥ 170 GSM. |

Each of these also has a per-element **blocklist by id** in `finishingRules.ts`
(e.g. afis elements opt out of creasing and rounded corners regardless of weight).
Lamination **sides**, by contrast, is fully JSON-driven via `allowedLaminationSides`
above.

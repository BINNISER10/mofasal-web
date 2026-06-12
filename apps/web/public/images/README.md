# صور منصة مفصل — MUFASAL Images

> **AI/Developer:** Read `sections/MANIFEST.json` and `src/components/home/homeImages.ts`  
> **Full guide:** `AUTOCORE SYSTEM FILES/IMAGES-GUIDE-DEVELOPERS.md`

## Structure

```
public/images/
├── sections/          ← Section images (hero, tailoring, fabric, products)
│   └── MANIFEST.json  ← Machine-readable map (groups, keys, components)
├── fashion/           ← Lookbook gallery (model-1 … model-20)
├── logo.svg
└── logo.png
```

## Quick reference

| Group | Files | Code key |
|-------|-------|----------|
| Hero | `sections/hero.png` | `HOME_IMAGES.hero` |
| Tailoring | 7 files in `sections/` | `HOME_IMAGES.tailoring`, `.shops`, `.craftsmanship`, `.workshop[]` |
| Fabric | 11 files in `sections/` | `HOME_IMAGES.fabric`, `.marketplace`, `.fabrics[]`, `.products[]` |
| Lookbook | `fashion/model-*.png` (5 active) | `HOME_MEDIA.lookbookImage(i)` |

## Adding an image

1. Save to `sections/<approved-name>.png`
2. Update `apps/web/src/components/home/homeImages.ts`
3. Update `sections/MANIFEST.json`
4. Do **not** push until user says «انشر» (see `.cursor/rules/budget-control.mdc`)

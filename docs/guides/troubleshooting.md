---
title: Troubleshooting and FAQ
section: troubleshooting
order: 9
description: Explain missing resources, nullable geometry, code joins and browser cleanup.
---

## Interpret missing results

| Result | Meaning and next step |
| --- | --- |
| `loadCountry` / `loadDivisions` → `null` | No built-in resource for that code; check the corresponding code list. |
| `loadFeatures` → `null` | No built-in layer for this map id. Keep the base map. |
| `countryByCode` → `undefined` | The names table has no such code. |
| `focusRegionFit` / `regionCentre` → `null` | The code is null or absent from this map. |
| `insetFor` → `null` | The region has no inset; it is normally drawn in place. |
| `wrapIntoBox` → `null` | This window shows no horizontally wrapped copy of the point. |
| `landAnchor` / `mainlandBounds` → `null` | No outline ring exists to choose or frame. |
| `findQuestion` → `null` | The target is unknown or explicitly unnamed. |
| `projectPoint` / `unprojectPoint` → `null` | The projection cannot be reversed by these helpers. |
| `readMapData` / `readMapColors` → `null` | Attribute input is absent or invalid according to its parser. |

## A code or feature does not show

Check which canvas the code belongs to. `JP` selects Japan on the world; `13` selects Tokyo on Japan’s prefecture map. A feature layer must name the same map id. An unmatched layer is not reprojected onto another map. Map labels use available upstream names; an omitted Japanese reading is not a broken load.

## Browser setup and cleanup

Create elements only in a browser, and wait for asynchronous data before reading loaded results. Handle native load/error events. Module mounts need a real HTMLElement and `destroy()` when removed. A resource import failure is an exception even though an unsupported code returns `null`. For images, include the style or supply the documented external style.

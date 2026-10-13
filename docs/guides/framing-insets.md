---
title: Frame regions and insets
section: how-to
order: 3
description: Fit native region codes while keeping geographic points separate from drawn inset positions.
---

## Fit a selection

```ts
import JAPAN from "@johnmorrisdotca/chizu/divisions/jp";
import { focusRegionFit, regionCentre, wholeMapBox, boxToViewBox } from "@johnmorrisdotca/chizu";
console.log(focusRegionFit(JAPAN,"47")?.zoom,regionCentre(JAPAN,"47"));
console.log(boxToViewBox(wholeMapBox(JAPAN)),focusRegionFit(JAPAN,"unknown"));
```

Okinawa and other outlying islands are drawn in inset boxes. The framing helpers follow where a region is drawn, so a selected inset stays in view. `focusRegionFit` and `regionCentre` return `null` for a null or unknown region code. `focusBox` and `zoomToFit` fall back to the whole map when nothing matches; that is a useful reset, not evidence that the input code matched.

## Pan a wrapping world

`MAP_ZOOM_LEVELS` is a ten-step ladder. `stepMapZoom` clamps at its ends. The world’s east/west edge wraps, so `zoomBox` can overhang its horizontal seam; `wrapOffsets` describes the copies needed for the window. Country maps are clamped by default. Geographic longitude/latitude uses `projectPoint` and `unprojectPoint`; inset positions describe the drawing instead.

The detailed [framing reference](../framing-a-map.md) retains the geometry and fit examples.

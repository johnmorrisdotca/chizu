---
title: Shade and label a map
section: how-to
order: 4
description: Use native codes, safe colours, tones and display names in a choropleth.
---

## Colour native regions

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu, isChizuColour } from "@johnmorrisdotca/chizu/draw";
console.log(isChizuColour("rgb(20, 80, 140)"),isChizuColour("red;position:fixed"));
const svg=drawChizu(WORLD,{colors:{JP:"#2f6b4f",CA:"#8a3b3b"},labels:["JP","CA"],language:"ja",style:true});
console.log(svg.includes('data-code="JP"'));
```

Drawing keys are the map’s native region codes. Japanese prefectures use `13` for Tokyo; the ISO join uses `JP-13`. Resolve a host’s ISO codes before passing them directly to drawing. The element/builder colour parser supports ISO joins where documented by the embed contract. Use finite numeric `data` figures for its choropleth, and `colors` for explicit region colours.

## Preserve accessible names

`nameOf` chooses the display name, including everyday short Japanese names where supplied. Labels and accessible region names share the selected language. A host can define extra tone classes through the documented CSS variables/classes. Colour fill overrides a region’s tone fill; a selected outline still remains distinguishable. Check your chosen colours against both cloth schemes.

The [colour API](../colours.md), [ISO joins](../iso-codes.md) and [embed colour controls](../embed-colours-ja.md) retain their complete contracts.

---
title: Draw and search physical features
section: how-to
order: 7
description: Pair a feature layer with its own canvas and select water, capitals or native kinds.
---

## Keep the layer and map together

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { loadFeatures } from "@johnmorrisdotca/chizu/load";
import { findFeatures, featureMap } from "@johnmorrisdotca/chizu";
const layer=await loadFeatures(WORLD);
if(layer){
 console.log(layer.map,findFeatures(layer.features,"Caspian").map(one=>one.name));
 console.log(featureMap(WORLD,layer,["water"]).regions.length);
}
```

`drawChizu` draws a layer only when its map id matches the current map. Choose groups or kinds through `features`: `water`, `all`, `marine`, `lakes`, `rivers`, `peaks`, `capitals`, or a particular native kind. Native drawing defaults to no extra features; the embed builder’s capital switch supplies its own explicit default.

## Search names without altering the source

Feature lookup accepts English/Japanese names, readings and codes. Some upstream features have no Japanese label or reading; retain the native fallback and do not invent names. `featureMap` lets the framing, quiz and pasted-name tools operate on selected features using the same canvas.

The complete [physical feature source and naming reference](../features.md) and [known upstream issues](../upstream-name-issues.md) remain preserved.

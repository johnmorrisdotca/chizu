---
title: Getting started
section: tutorial
order: 1
description: Draw one native map and keep the engine, data and browser mounting imports separate.
---

## Draw a map without a page

Chizu’s engine accepts plain map data. Drawing returns SVG text, so it works in a server response or a build step. The world, country outlines, subdivision maps and physical-feature layers each have their own import. Importing the engine alone does not fetch the map data.

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";
const svg = drawChizu(WORLD, {language:"ja",style:true,colors:{JP:"#2f6b4f"}});
console.log(WORLD.id, WORLD.regions.length, svg.startsWith("<svg"));
```

`style:true` carries the native drawing styles inside an image. Interactive mounting supplies its own scoped styles. Map-unit coordinates describe this map’s canvas; longitude and latitude are geographic coordinates and go through the projection helpers.

## Put it in a page

```ts no-run
import WORLD from "@johnmorrisdotca/chizu/world";
import { mountChizu } from "@johnmorrisdotca/chizu/mount";
const host=document.createElement("div");
document.body.append(host);
const mounted=mountChizu(host,{map:WORLD,onSelect:code=>console.log(code)});
mounted.select("JP");
console.log(mounted.view().zoom);
mounted.destroy();
```

Call `destroy()` when removing the host. Continue with [loading](loading-maps.md), [framing](framing-insets.md) or the [framework examples](../frameworks.md).

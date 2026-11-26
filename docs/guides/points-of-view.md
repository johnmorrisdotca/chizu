---
title: Draw a disputed place as one country has it
section: how-to
order: 19
description: Natural Earth's lines show who holds a place today. A point of view draws Crimea in Ukraine, or the Northern Territories in Japan, instead, on the maps it changes.
---

## What the default is

Every map is Natural Earth's **de facto** lines: a place is in the country that holds it today. That puts Crimea and Sevastopol in Russia, and Etorofu, Kunashiri, Shikotan and the Habomai islets (the Northern Territories, 北方領土) in Russia too. The UN General Assembly (resolution 68/262) and ISO 3166 have Crimea in Ukraine, and Japan's government has the Northern Territories in Japan. Chizu draws the default unless a page asks for a point of view, and never takes a side by itself.

## Two points of view

| Id | Name | What it changes |
| --- | --- | --- |
| `ukr` | Ukraine's point of view (ウクライナの立場) | Crimea and Sevastopol are Ukraine's, on the world, the finer world, Ukraine's own map and Russia's own map; Russia's regions map loses `UA-40` and `UA-43` |
| `jpn` | Japan's point of view (日本の立場) | the Northern Territories are Japan's, on the finer world and on Japan's and Russia's own maps; the 1:110m world is unchanged, the islands being too small to draw at that scale |

A view moves pieces of the default outline and changes nothing else: the same codes, names, groups and neighbours, and the same canvas (but Ukraine's and Japan's own maps, which are made larger to hold the pieces that join them). The pieces are found with Natural Earth's own point-of-view files as a ruler (`ne_10m_admin_0_countries_ukr` and `_jpn`), and the outlines moved are the default ones, so a view never draws a coast the default does not. The regions maps of Japan and the rest are unchanged.

## On a mounted map

`view` on `mountChizu` fetches the view's outlines, as a chunk of its own, the first time it is asked for. The map is drawn at once as it is, and again with the view when it arrives; `set({ view: null })` goes back.

```ts no-run
import WORLD from "@johnmorrisdotca/chizu/world";
import { mountChizu } from "@johnmorrisdotca/chizu/mount";
import { CHIZU_VIEWS } from "@johnmorrisdotca/chizu/views";

const mount = mountChizu(document.querySelector("#map")!, { map: WORLD, view: "ukr" });
console.log(CHIZU_VIEWS.map((view) => view.name)); // for a picker; each has a note in English and Japanese
mount.set({ view: null });
```

## To draw an SVG

`withView(map, view)` is the map as the view draws it, for `drawChizu` or any function of the engine; `loadView(id)` fetches the view.

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";
import { loadView, withView } from "@johnmorrisdotca/chizu/views";

const ukraine = withView(WORLD, await loadView("ukr"));
const svg = drawChizu(ukraine, { style: true });
console.log(svg.includes('data-code="UA"'), ukraine.regions.length === WORLD.regions.length);
// true true
```

A page tells its readers which view it draws: each view has a `note` and a `noteJa`, written to be shown beside the map. The demo's "Point of view" row is the example.

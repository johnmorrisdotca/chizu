---
title: Draw lines, marks and shaded areas from latitude and longitude
section: how-to
order: 18
description: Hand the world map numbers, a track, a place, the night side, and it draws them over the land, small enough for an inset.
---

## Hand the map numbers

`drawChizu`'s `overlays` takes a list of shapes given as `[latitude, longitude]` in degrees. Chizu knows nothing of what they mean: a satellite's track, a city, the night side are numbers some other code works out. There are three kinds:

- `line`: `points`, in order. It is split where it crosses the date line (a step of more than 180 degrees of longitude), so a track that goes round the world is never drawn across it. Give each part its own line for a colour of its own (the part flown, and the part to come).
- `mark`: a dot `at` a point, with an optional `label`.
- `area`: a `ring` of points, filled. It is drawn as given: a ring round a pole runs along its edge from -180 to 180 and back along the pole.

Colours are CSS colours or `var(--name)`; `width` and `size` are in pixels, so a map 240 pixels wide reads as well as a large one. An `id` is kept as `data-id` on the shape.

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";

const svg = drawChizu(WORLD, {
  style: true,
  overlays: [
    { kind: "area", ring: [[66, -180], [-66, 0], [66, 180], [-90, 180], [-90, -180]], opacity: 0.35 },
    { kind: "line", points: [[0, 150], [20, 175], [30, -160]], color: "#c0392b", width: 2 },
    { kind: "mark", at: [35.68, 139.69], label: "Tokyo", id: "here" },
  ],
});
console.log(svg.includes('class="cz-overlays"'), svg.includes('data-id="here"'));
// true true
```

## On a mounted map, replace them

A map from `mountChizu`, or a `<chizu-map>` element through its `options`, takes the same `overlays`. Setting `overlays` alone draws only them again, not the land, so a track can move every few seconds.

```ts no-run
import WORLD from "@johnmorrisdotca/chizu/world";
import { mountChizu } from "@johnmorrisdotca/chizu/mount";

const map = mountChizu(document.querySelector("#inset")!, { map: WORLD, controls: false, selectable: false });
map.set({ overlays: [{ kind: "mark", at: [51.6, -0.1], size: 10 }] });
```

## A small inset

At 240 by 120 pixels a world map shows its land and sea: country names are drawn only when `labels` asks for them. Turn off the zoom buttons (`controls: false`) and the choosing (`selectable: false`) for a map that only shows where something is.

---
title: Name the cities on a map
section: how-to
order: 17
description: Draw dots and names for the world's cities from kuni, more as the map is zoomed in, with no name over another.
---

## Hand the cities to the drawing

Chizu has no city data of its own. `drawChizu`'s `cities` takes a list, each city with an `id`, a `name` (`en`, and `ja` where known), `lat`, `lon` and `population`. A `capital` of `national` draws a ring round the dot, and a `country` code lets a map of one country alone name only its own cities.

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";

const cities = [
  { id: "Q1490", name: { en: "Tokyo", ja: "東京都" }, lat: 35.69, lon: 139.69, population: 14_000_000, capital: "national", country: "JP" },
  { id: "Q35765", name: { en: "Osaka", ja: "大阪市" }, lat: 34.69, lon: 135.5, population: 2_750_000, country: "JP" },
];
const svg = drawChizu(WORLD, { cities, language: "ja", style: true });
console.log(svg.includes('data-city="Q1490"'));
// true
```

## Use kuni's cities

`@johnmorrisdotca/chizu/cities` loads the cities of kuni 国 (`@johnmorrisdotca/kuni` 1.6.0 or later, an optional peer: install it beside Chizu). `loadKuniCities()` gives every capital and every city of 100,000 people or more, about 9,000; pass the tiers you want (`"capitals"`, `"1m"`, `"100k"`, `"15k"`) for fewer or more. Each tier is a file of its own, fetched the first time it is asked for.

```ts no-run
import WORLD from "@johnmorrisdotca/chizu/world";
import { mountChizu } from "@johnmorrisdotca/chizu/mount";
import { loadKuniCities } from "@johnmorrisdotca/chizu/cities";

// Called once, the first time the map is drawn; more cities are named as it is zoomed in.
mountChizu(document.querySelector("#map")!, { map: WORLD, cities: loadKuniCities });
```

On `<chizu-map>`, set `options.cities` the same way. The embed builder has no city control yet: it loads no city data of its own.

## What is named, and where

- **More as you zoom in.** A window that shows the whole world names cities of five million people or more; the floor falls with the ground the window shows, to 15,000 at 400 km across. `cityOptions.minPopulation` fixes it instead.
- **The biggest first.** Cities are placed in order of population, a country's capital counted double, and each name goes to the right of its dot, else the left, above or below. A city whose name fits on no side is left out, dot and all, so no name covers another name or a dot, and no two dots touch.
- **English or Japanese**, with the drawing's `language`. A city with no Japanese name is named in English on a Japanese page; nothing is made up.
- **Where a point can be placed.** The world, a country alone and a local map name cities. A map of a country's regions was fitted with a projection that cannot be read back, so it names none.
- **The features' capitals.** With `cities` given, the cities name the capitals, and the features' `capitals` group is not drawn as well.

`placeCities`, `cityPopulationFloor` and `windowKilometres` in `@johnmorrisdotca/chizu` give the same choices without drawing, for a list beside the map or a test of your own.

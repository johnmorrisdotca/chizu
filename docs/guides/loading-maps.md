---
title: Load only the maps you need
section: how-to
order: 2
description: Select the correct country, subdivision and feature resources without joining unrelated canvases.
---

## Select a resource

`/countries/jp` is Japan’s outline as one region. `/divisions/jp` is its prefectures. Their codes, canvas sizes, projection and insets serve different jobs. The world has coarse outlines; the loader can fetch finer world geometry for interactive zooming. Names and groups are available independently from `/names`.

```ts
import { loadCountry, loadDivisions, loadFeatures, COUNTRY_CODES, DIVISIONS_CODES } from "@johnmorrisdotca/chizu/load";
const country=await loadCountry("JP");
const divisions=await loadDivisions("jp");
const features=divisions?await loadFeatures(divisions):null;
console.log(COUNTRY_CODES.length,DIVISIONS_CODES.length,country?.id,divisions?.regions.length,features?.map);
```

Codes are case-insensitive in the country/division loaders. Unknown resources return `null`; a failed dynamic import is an error to handle at your application boundary. `FEATURE_MAPS` lists existing layer ids. A feature layer belongs to the map named by its `map` field.

## The United Kingdom: gb and gb-2025

The United Kingdom has two maps of regions. `gb-2025` (`/divisions/gb-2025`, `loadDivisions("gb-2025")`) is the current one: England's, Scotland's and Wales's councils of 2025 from the Office for National Statistics, among them Cumberland, Westmorland and Furness, North and West Northamptonshire and Bournemouth, Christchurch and Poole, with Northern Ireland drawn as on `gb`. `gb` (`/divisions/gb`) is Natural Earth's, with the councils as they were before the reforms of 2019 to 2023, and stays exactly as it was so that no region code disappears from it. At the next major release the default flips: `gb` becomes the councils of 2025.

```ts
import { loadDivisions, DIVISIONS_CODES } from "@johnmorrisdotca/chizu/load";
const uk=await loadDivisions("gb-2025");
console.log(DIVISIONS_CODES.includes("GB-2025"),uk?.id,uk?.regions.some((region)=>region.name==="Cumberland"));
```

Its regions in degrees are `/divisions-geo/gb-2025`, its features `/features/divisions-gb-2025`. Its two councils that ISO 3166-2 has not coded have their ONS codes (`E06000063`, `E06000064`) and no `iso`.

## Fixed imports or dynamic loaders

Use a fixed resource import when the page always draws it. Use `loadCountry`, `loadDivisions` and `loadFeatures` when the visitor chooses. The explicit named resource exports document the same paths supported by the wildcard exports; their data and order are unchanged.

## Vietnam: the 63 provinces and the 34 of 2025

Vietnam has two maps of its regions. `/divisions/vn` is Natural Earth's 63 provinces and cities, as they were until 30 June 2025. `/divisions/vn-2025` is the 34 provinces and cities of Resolution 202/2025/QH15, which is current law: their governments began work on 1 July 2025. It is drawn from the same outlines, joined along the old borders, so the two maps share a canvas and a projection.

```ts
import { loadDivisions } from "@johnmorrisdotca/chizu/load";
const now = (await loadDivisions("vn-2025"))!;
const before = (await loadDivisions("vn"))!;
console.log(now.regions.length, before.regions.length);
// 34 63
```

`vn` stays the 63 until the next major version, when it becomes the 34. ISO 3166-2 still lists the 63, so 23 of the 34 (the merged ones) have no `iso` until it is updated, and a figure keyed by ISO code does not colour them: key such figures by `code`. Each merged unit keeps the code of the old province whose name it took (Tuyên Quang is `07`). [ISO codes](../iso-codes.md) lists them.

See [map data](../map-data.md), [ISO codes](../iso-codes.md) and [the country naming rules](../names.md).

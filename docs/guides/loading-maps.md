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

## Fixed imports or dynamic loaders

Use a fixed resource import when the page always draws it. Use `loadCountry`, `loadDivisions` and `loadFeatures` when the visitor chooses. The explicit named resource exports document the same paths supported by the wildcard exports; their data and order are unchanged.

See [map data](../map-data.md), [ISO codes](../iso-codes.md) and [the country naming rules](../names.md).

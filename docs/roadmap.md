# Roadmap

Not here yet, and each welcome as an [issue](https://github.com/johnmorrisdotca/chizu/issues):

- **More named water**: Natural Earth's regional supplements of lakes and rivers, and the bays and rivers it does not draw at 1:10m (Tokyo Bay, the Shinano).
- **Names in Spanish, German and Chinese**, beside English and Japanese for the countries and regions. Planned, not started.
- **Readings for the regions outside Japan**, when kuni has them.
- A **US-style composite** (Albers USA) as an alternative to the two boxes.

Shipped, from the list that was here:

- **The outlines as longitude and latitude**, each an entry of their own, with no projection: `@johnmorrisdotca/chizu/world-geo` in 1.6.0 (the world at 1:110m, `src/world-geo-entry.ts:10`), and in 1.12.0 `@johnmorrisdotca/chizu/world-geo-detail` (the 1:50m world, `src/world-geo-detail-entry.ts:11`) and `@johnmorrisdotca/chizu/divisions-geo` (the regions of the 32 countries, `DIVISIONS_GEO_CODES` at `src/divisions-geo-entry.ts:23`, `loadDivisionsGeo` at line 44).
- **Cities on the maps**, in 1.9.0: `drawChizu` takes `cities`, and each city is projected on the canvas it is drawn on (`placeCities`, `src/cities.ts:228`); a map of one country names only its own cities. They are kuni's cities, from `@johnmorrisdotca/chizu/cities` (`loadKuniCities`, `src/cities-entry.ts:43`), not Natural Earth's populated places. A town of your own is pinned by coordinates, since 1.5.0.
- **A tag**, `<chizu-map>`, beside `mountChizu`, in 1.5.0 (`ChizuMapElement`, `src/element.ts:33`; `defineMap`, `src/element.ts:435`), with `<chizu-locator>` and `<chizu-quiz>`.

Left out on purpose: population, area, mottos and "famous for" facts. They are claims, and a map should not make them without a source for each; where kuni carries one with its source, Chizu reads it at build time.


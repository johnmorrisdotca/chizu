# Airports and harbours

`drawChizu` and `mountChizu` take `ports`, a list of airports and harbours to mark on the map. The lists are two entries of their own, so a page that marks none loads none of the data.

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";
import { AIRPORTS } from "@johnmorrisdotca/chizu/airports";
import { HARBOURS } from "@johnmorrisdotca/chizu/harbours";

const svg = drawChizu(WORLD, { ports: [...AIRPORTS, ...HARBOURS], language: "ja" });
console.log(AIRPORTS.length, HARBOURS.length, svg.includes('data-port="hnd"'));
// 600 1081 true
```

## What there is

| Entry | Holds | Made from | Size (minified, gzipped) |
| --- | --- | --- | --- |
| `@johnmorrisdotca/chizu/airports` | the 600 airports with the most passengers a year, busiest first | Wikidata's passengers per year (P3872), figures of 2015 or later | 149 kB, 31 kB |
| `@johnmorrisdotca/chizu/harbours` | 1,081 harbours, largest first | Natural Earth 5.1.2 ports at 1:10m | 157 kB, 33 kB |

A place is `{ id, kind, code?, name: { en, ja? }, country, lat, lon, tier }`. An airport's `id` is its lower-case IATA code (`hnd`), else its ICAO code; a harbour's is its name as a slug (`yokohama`), with the country added where two share one. `code` is an airport's IATA code, else its ICAO code. `country` is the ISO 3166-1 alpha-2 code of the Natural Earth country that holds the point (`SOL` for Somaliland and `CYN` for Northern Cyprus, as in `world-geo`). An airport also has `passengers` and its `year`.

The Japanese name is Wikidata's Japanese label, and `ja` is absent where Wikidata has none: a Japanese page then prints the English name (`portName(place, "ja")`), and nothing is translated by machine. 599 of the 600 airports and 838 of the 1,081 harbours have one.

## Tiers

Each place has a tier, 1 the largest. An airport's tiers end at its 150th, 300th and 600th by passengers; a harbour's are Natural Earth's size ranks 3 and 4 (143 harbours), 5 (150) and the rest (788). A window shows tier 1 across more than 3,000 km, tiers 1 and 2 across more than 1,000 km and all three below that (`portTierFor`); `portOptions: { tier: 3 }` shows every tier at every zoom, and `portOptions: { kinds: ["harbour"] }` only one kind. Places are marked in the list's order, so the larger come first, and a mark is left out where it would sit on one already marked. On a map of one country alone only that country's places are marked; on a country's regions, whose canvas cannot be read back to longitude and latitude, none.

An airport is a diamond (`--cz-airport`) and a harbour a ring (`--cz-harbour`). Neither prints its name, which is its `<title>`, so the map's city names stay clear; the marks do not take the pointer.

## Credit

Show `AIRPORTS_CREDIT` and `HARBOURS_CREDIT` (`{ en, ja }`) where the marks are shown. The sources and what each one's terms say are in [NOTICE.md](../NOTICE.md).

## Making the data again

The data is written by a script, never by hand, and the script is run on purpose when it should be brought up to date:

```sh
pnpm data:ports-wikidata   # asks Wikidata (CC0), writes scripts/data-wikidata-ports.json
pnpm data:ports            # reads that file and Natural Earth's ports, writes src/ports-data/
```

`data:ports-wikidata` sends a handful of queries to Wikidata's public query service and downloads about 10 MB of answers in all; it keeps only what the build reads. `data:ports` downloads Natural Earth's ports file (280 kB) and its 1:50m countries once into `.cache/` (or `CHIZU_CACHE`), checked against a SHA-256, and makes the same bytes every time.

## Left out, and why

- **Runways.** The picture a runway has to match is the satellite's, which needs both ends of each runway as measured points, and no source of them was usable: OurAirports is the one public-domain list of them, and its terms page could not be read on 2026-11-18 (an expired certificate), so none of its files is used. The marks are points.
- **The World Port Index's size classes.** NGA's page answered 503 on 2026-11-18, so its terms were not read and none of its data is used; a harbour's size is Natural Earth's rank.
- **OpenStreetMap and any share-alike or non-commercial list.**

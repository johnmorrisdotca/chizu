# Airports and harbours

`drawChizu` and `mountChizu` take `ports`, a list of airports and harbours to mark on the map, and `runways`, the runways of those airports. The lists are three entries of their own, so a page that marks none loads none of the data.

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
| `@johnmorrisdotca/chizu/runways` | the open runways of 575 of the airports, 1,057 in all, by airport `id` | OurAirports (the Unlicense), runways with both ends measured | 46 kB, 19 kB |

A place is `{ id, kind, code?, name: { en, ja? }, country, lat, lon, tier }`. An airport's `id` is its lower-case IATA code (`hnd`), else its ICAO code; a harbour's is its name as a slug (`yokohama`), with the country added where two share one. `code` is an airport's IATA code, else its ICAO code. `country` is the ISO 3166-1 alpha-2 code of the Natural Earth country that holds the point (`SOL` for Somaliland and `CYN` for Northern Cyprus, as in `world-geo`). An airport also has `passengers` and its `year`.

The Japanese name is Wikidata's Japanese label, and `ja` is absent where Wikidata has none: a Japanese page then prints the English name (`portName(place, "ja")`), and nothing is translated by machine. 599 of the 600 airports and 838 of the 1,081 harbours have one.

## Tiers

Each place has a tier, 1 the largest. An airport's tiers end at its 150th, 300th and 600th by passengers; a harbour's are Natural Earth's size ranks 3 and 4 (143 harbours), 5 (150) and the rest (788). A window shows tier 1 across more than 3,000 km, tiers 1 and 2 across more than 1,000 km and all three below that (`portTierFor`); `portOptions: { tier: 3 }` shows every tier at every zoom, and `portOptions: { kinds: ["harbour"] }` only one kind. Places are marked in the list's order, so the larger come first, and a mark is left out where it would sit on one already marked. On a map of one country alone only that country's places are marked; on a country's regions, whose canvas cannot be read back to longitude and latitude, none.

An airport is a diamond (`--cz-airport`) and a harbour a ring (`--cz-harbour`). Neither prints its name, which is its `<title>`, so the map's city names stay clear; the marks do not take the pointer.

## Runways

```ts
import { localMap, wholeMapBox } from "@johnmorrisdotca/chizu";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";
import { AIRPORTS } from "@johnmorrisdotca/chizu/airports";
import { RUNWAYS } from "@johnmorrisdotca/chizu/runways";

const haneda = AIRPORTS.find((airport) => airport.id === "hnd")!;
const map = localMap({ centre: [haneda.lon, haneda.lat], widthMetres: 12000 });
const svg = drawChizu(map, { ports: [haneda], runways: RUNWAYS });
console.log(RUNWAYS.hnd!.length, svg.match(/class="cz-runway"/g)!.length);
// 4 4
```

A runway is `[lon1, lat1, lon2, lat2, widthMetres]`: its two ends as measured in OurAirports' data, to five places of a degree (about a metre), and its width in metres (0 where there is none, drawn as a hairline). It is drawn as a line between the two ends, as wide on the ground as the runway is, so on a local map (true metres) it lies where it does in a satellite picture; on a window of a country or more it is the same line, never thinner than a hairline. A runway is drawn once it is at least 1.2% of the window's width long, so none shows until the window is a few hundred kilometres across or less, and only for the airports in `ports` whose tier the window shows. Only an open runway with both ends measured is kept (1,057 at 575 of the 600 airports): a runway with no ends is left out, never worked out from its heading. A runway takes the pointer no more than a mark does, and is coloured by `--cz-runway`.

## Credit

Show `AIRPORTS_CREDIT`, `HARBOURS_CREDIT` and `RUNWAYS_CREDIT` (`{ en, ja }`) where the marks are shown. The sources and what each one's terms say are in [NOTICE.md](../NOTICE.md).

## Making the data again

The data is written by a script, never by hand, and the script is run on purpose when it should be brought up to date:

```sh
pnpm data:ports-wikidata   # asks Wikidata (CC0), writes scripts/data-wikidata-ports.json
pnpm data:ports            # reads that file, Natural Earth's ports and OurAirports' runways, writes src/ports-data/
```

`data:ports-wikidata` sends a handful of queries to Wikidata's public query service and downloads about 10 MB of answers in all; it keeps only what the build reads. `data:ports` downloads Natural Earth's ports file (280 kB) and its 1:50m countries, and OurAirports' `airports.csv` (13 MB) and `runways.csv` (4 MB) at the commit `OURAIRPORTS` in `scripts/ports-config.mjs` names, once into `.cache/` (or `CHIZU_CACHE`, which keeps them out of the repository), each checked against a SHA-256, and makes the same bytes every time.

## Left out, and why

- **The World Port Index's size classes.** NGA's page answered 503 on 2026-11-18, so its terms were not read and none of its data is used; a harbour's size is Natural Earth's rank.
- **OpenStreetMap and any share-alike or non-commercial list.**

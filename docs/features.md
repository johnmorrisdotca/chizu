# Seas, lakes, rivers, landforms, peaks and capitals

Every map in Chizu can draw the named features on it: the oceans, seas, bays and straits on its coasts, the lakes,
reservoirs and rivers on its land, its deserts, mountain ranges, plains and peninsulas, its peaks, and its capitals.
They are a layer the caller turns on, so a map without them is drawn exactly as it always was, and each map's
features are a file of their own, fetched only when asked for.

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";
import { loadFeatures } from "@johnmorrisdotca/chizu/load";
import { featureMap, findFeatures, findQuestion, seededRandom } from "@johnmorrisdotca/chizu";

const layer = await loadFeatures("world");                         // or "divisions-jp", "country-fr", any map's id
const caspian = findFeatures(layer.features, "カスピ")[0];             // the Caspian Sea, by English, Japanese or kana
drawChizu(WORLD, { features: ["water"], featureLayer: layer, tones: { [caspian.code]: "selected" } });
findQuestion(featureMap(WORLD, layer, ["rivers"]), "Q3392", seededRandom(1)); // which river is this? the Nile among three
```

## What there is

A feature is one of six groups, and each group is a few kinds. What a caller turns on is `water` (seas, lakes and
rivers), `all`, a group or a single kind: `features: ["water"]`, `["lakes", "peaks"]`, `["strait"]`.

| Group | Kinds | From | Drawn |
| --- | --- | --- | --- |
| `marine` | `ocean`, `sea`, `gulf`, `bay`, `strait`, `channel`, `sound`, `fjord`, `inlet`, `lagoon`, `reef` | Natural Earth's marine areas (`ne_10m_geography_marine_polys`) | under the land, in the sea's own colour, darker under the pointer and blue when chosen; the name in italics, in the sea |
| `lakes` | `lake`, `reservoir` | Natural Earth's lakes (`ne_10m_lakes`) | on the land, in water's colour |
| `rivers` | `river` | Natural Earth's rivers (`ne_10m_rivers_lake_centerlines`) | a line whose width follows the river's rank, the same on the screen at every zoom; the name along it |
| `landforms` | `desert`, `range`, `plateau`, `plain`, `peninsula`, `cape`, `basin`, `delta`, `valley`, `wetland`, `tundra`, `isthmus`, `depression`, `lowland`, `gorge`, `foothills` | Natural Earth's geographic regions (`ne_10m_geography_regions_polys`) | only its name, spaced out, until it is chosen or toned, when its outline is drawn |
| `peaks` | `peak` | Natural Earth's elevation points (`ne_10m_geography_regions_elevation_points`), with each peak's height in metres | a small triangle and its name |
| `capitals` | `capital`, `seat` | kuni 国 1.1.0's `/facts` (a country's capital) and `/subdivision-facts` (the seat of each of its regions) | a ring round a dot for a capital, a dot for a seat, and the name |

Left out, with the reason (`FEATURE_FILES` in `scripts/features-config.mjs`): Natural Earth's unnamed pieces of sea;
the three river mouths it draws as sea and names as the river (the Amazon, the Yangtze, the Columbia), which the
rivers file draws; the centre-lines it runs through lakes; islands and island groups, which the maps already draw as
land; the continents, which are the world's own groups; stretches of coast and historical regions (Brittany,
Karelia), which are not physical features; and spot heights with no name. Natural Earth's regional supplements (more
lakes and rivers in North America and Europe, ranked 10 to 12) are not read: they are for maps zoomed in further than
these, and most of their names have no Japanese.

### Which map has which

- **The world** takes the top of each list, by Natural Earth's own rank (`scalerank`, 0 for an ocean): seas ranked
  0 to 2, lakes 0 to 2, rivers 0 to 3, landforms 0 to 1, peaks 0 to 3, and the capital of every country the world
  draws.
- **A country's map** (alone or by its regions) takes the seas that touch its coast and the lakes, rivers, landforms
  and peaks on its own land, as far down the ranks as are big enough to see on its canvas (6 square units for an area
  and 14 units for a river, of a canvas 1,000 across), at most 50 seas, 70 lakes, 100 rivers, 40 landforms and 40
  peaks, the highest ranked first; its own capital; and on a map of its regions, the seat of each region.
- Everything is decided on the map's own canvas, from its own outlines: a lake or a river is the country's when at
  least three tenths of it lies on the country's land, a sea when it comes within 1.5% of the canvas of the coast.

| Map | Seas | Lakes | Rivers | Landforms | Peaks | Capitals | Japanese name | Reading | Size (gzipped) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| world | 50 | 24 | 47 | 25 | 22 | 173 | 340 of 341 | 339 of 341 | 203 kB (66 kB) |
| divisions-jp | 10 | 1 | 3 | 1 | 8 | 47 | 70 of 70 | 70 of 70 | 29 kB (10 kB) |
| country-jp | 10 | 1 | 3 | 1 | 8 | 1 | 24 of 24 | 24 of 24 | 19 kB (8 kB) |
| divisions-us | 18 | 64 | 100 | 40 | 39 | 49 | 290 of 310 | 279 of 310 | 227 kB (78 kB) |
| divisions-gb | 7 | 4 | 5 | 2 | 2 | 150 | 162 of 170 | 161 of 170 | 56 kB (16 kB) |
| divisions-fr | 7 | 1 | 16 | 6 | 4 | 92 | 122 of 126 | 121 of 126 | 58 kB (19 kB) |
| divisions-de | 4 | 3 | 8 | 5 | 5 | 15 | 39 of 40 | 39 of 40 | 37 kB (14 kB) |
| divisions-cn | 9 | 48 | 99 | 36 | 40 | 31 | 217 of 263 | 92 of 263 | 166 kB (58 kB) |
| divisions-ca | 50 | 70 | 75 | 27 | 29 | 13 | 242 of 264 | 235 of 264 | 261 kB (91 kB) |
| divisions-ru | 36 | 46 | 100 | 40 | 37 | 82 | 318 of 341 | 306 of 341 | 249 kB (85 kB) |

268 maps have a file of features, 5.9 MB in all; the largest is Canada alone's, 280 kB. A test holds the world's to
210 kB and every other to 300 kB. None of it is in the default import: `@johnmorrisdotca/chizu/world` is unchanged.

**Japan's prefectures** have the Pacific Ocean, the Sea of Japan, the Philippine Sea, the Sea of Okhotsk, the East
China Sea, the Korea Strait (対馬海峡), the Seto Inland Sea (瀬戸内海), Uchiura Bay, the La Pérouse Strait (宗谷海峡)
and the Tsugaru Strait; Lake Biwa (琵琶湖); the Ishikari, Tone and Mogami Rivers; the Noto Peninsula; Mount Fuji and
seven more peaks; Tokyo, and the seats of the other 46 prefectures, Naha drawn in Okinawa's box. Natural Earth at
1:10m has no Tokyo Bay, no Shinano River and no lake but Biwa in Japan, so neither has Chizu: a feature is here when
the source draws it.

## The names

- **English.** A sea's, a landform's and a peak's are Natural Earth's (`name_en`). A lake's and a river's are
  Wikidata's label: Natural Earth writes only their stems ("Erie", "Ishikari").
- **Japanese.** Natural Earth's own `name_ja` where it has one; else Wikidata's Japanese label, by the feature's
  Wikidata item; else none (the feature is named in English in both languages), never a guess. Natural Earth's river
  file carries no Wikidata item and no Japanese, so each river is matched to Wikidata by its name (or its name and
  "River") and its place: the item whose coordinates lie within 120 km of the river's line, or within 600 km for a
  river with forty Wikipedia articles or more, the most-written-about first. Rivers Natural Earth names another way
  (Rhein, Huang, Firat, Chang Jiang) are given their Wikidata label in `RIVER_LABELS`. 851 of the 1,131 rivers are
  matched; the rest keep Natural Earth's name and have no Japanese.
- **Capitals** are named as kuni names them (English from countries-list, Japanese from Wikidata), with kuni's
  readings for the seats of Japan's prefectures.
- **Readings**, in this order: a name in kana is its own reading; Wikidata's name in kana (P1814); the table
  `FEATURE_READINGS` in `scripts/features-config.mjs`, written for this package; a Japanese alias in hiragana alone on
  Wikidata; or kana followed by a known ending, read as the kana and the ending (カスピ海, かすぴかい; メキシコ湾,
  めきしこわん; a direction before it, 南シナ海, みなみしなかい). A name in kanji none of these reads has no reading:
  most are Chinese and Korean places, whose Japanese readings vary.
- **Disputed names** are the sources' own, and the package takes no side: the sea between Japan and Korea is "Sea of
  Japan" (日本海) in Natural Earth and on Wikidata, and Korea calls it the East Sea (東海).

Of every feature the build reads (all maps), 2,135 Japanese names are Natural Earth's, 656 Wikidata's and 1,365 kuni's,
and 508 have none. The Wikidata answers are kept in `scripts/data-wikidata.json`, so `pnpm data` needs no network for
them and makes the same files every time; `pnpm data:wikidata` asks again, in a few large queries.

## The shape of a feature

A feature has the fields of a region the engine reads, so `featureMap(map, layer)` makes a layer a map of its own and
every function that takes a map takes it:

| Field | What it is |
| --- | --- |
| `code` | its Wikidata item (`Q200239`, Lake Biwa) where it has one, else `ne-…` (Natural Earth's id), `ne-river-…`, `capital-JP` or `seat-JP-13` |
| `kind`, `group` | what it is, as above |
| `name`, `nameJa`, `reading` | as above |
| `rank` | Natural Earth's `scalerank`: 0 for an ocean, up to 10 |
| `elevation` | a peak's height, in metres |
| `path` | closed rings for an area, open lines for a river, empty for a point |
| `bbox`, `centroid` | the box round it, and where its name goes: the point of an area farthest from its edges (kept out of the map's boxes), a point half way along a river, a peak or a capital itself |
| `angle` | the angle a river's name is written at, to run along it |
| `neighbors` | the water it touches on this map: a sea's neighbouring seas, a river's tributaries, the lakes it runs through |

The shapes are projected onto the map's canvas in the map's own projection, cut to the canvas, simplified (by up to a
quarter of a unit for a lake or a river on a country, an eighth on the world, more for seas and landforms, whose
edges are under land or not drawn) and rounded to a tenth of a unit. On a map with boxes, a sea is drawn where it is
and the boxes are given the plain sea over it; a seat is carried into its region's box (Naha into Okinawa's), and the
seat of a region drawn whole in a box of its own and a projection of its own (Honolulu in Hawaii's, Juneau in Alaska's)
is projected by that region's projection and seated in its box the way the region is. Juneau is written in the build
(`SEATS_KUNI_LACKS`) because kuni has no capital for Alaska: see [upstream-name-issues.md](./upstream-name-issues.md).

### What a seat is called

A seat's kind is `seat`: Seat of government and 行政の中心地. On a map of Japan's prefectures it is a prefectural capital,
県庁所在地, which is the word the country uses (`kind.seat.JP` in `CHIZU_STRINGS`). A kind may have a word of its own in
one country, written `kind.<kind>.<COUNTRY>` and read from the country in a seat's code (`seat-JP-47`): `featureKindOf(feature, language)`
gives it, and `featureKindName(kind, language)` is the country-free word. The screen-reader label of a seat on the map
and the demo's feature card and list use `featureKindOf`.

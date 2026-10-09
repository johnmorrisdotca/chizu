# The canvas, place codes and ISO joins

### The canvas and the codes

A map's canvas is `0 0 width height`, `viewBox` says so, and a region's `path` is `M x,y L x,y … Z` with one piece for each part (an island is a piece), to two decimals. A region's `code` is its ISO 3166-1 alpha-2 code on the world, and on a country's regions the code Natural Earth gives (a postal code, the ISO 3166-2 part, or a number), or the prefecture number in Japan. On a country's regions, `iso` is the full ISO 3166-2 code (`CA-ON`), the one kuni has: see [ISO codes](#iso-codes) below. `neighbors` lists the regions that share a border point with it. `group` is the continent on the world and the larger part of the country on a map of regions, and is what quiz distractors use.

### ISO codes

Every region of a country carries `iso`, its ISO 3166-2 code from kuni, the current one where Natural Earth's is out of date (Paris is `FR-75C`, Silesia `PL-24`); where Natural Earth draws one ISO subdivision as several regions, each carries the code of the one it lies in (County Dublin's four councils are all `IE-D`). [docs/iso-codes.md](https://github.com/johnmorrisdotca/chizu/blob/main/docs/iso-codes.md) says how each code is chosen. Norway's counties, drawn as they were before 2020, carry the codes of the counties of 2024 they lie in. 7 of the 1,342 regions have no code: a county split since (Northamptonshire), a territory with none (Jervis Bay), and a few more. [docs/iso-codes.md](https://github.com/johnmorrisdotca/chizu/blob/main/docs/iso-codes.md) lists every one with the reason.

A region that is exactly one ISO subdivision takes kuni's names, so a map and a form name a place alike. The rest keep Natural Earth's names, and no two regions of one map share a name in either language. [docs/names.md](https://github.com/johnmorrisdotca/chizu/blob/main/docs/names.md) lists every name the map prints that is not kuni's, with the reason.


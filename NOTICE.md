# Notice: the maps' licences

The code of this package is under the MIT licence (see [LICENSE](LICENSE)). The
maps in `src/data/` (and `dist/data/`) are data, made from other people's work
under its terms, which travel with it. Each data file opens with a line saying
what it was made from.

| Entry point | Made from | Terms |
| --- | --- | --- |
| `world` | Natural Earth 5.1.2, admin-0 countries at 1:110m (`ne_110m_admin_0_countries`) | Public domain |
| `countries/<code>`, `names` | Natural Earth 5.1.2, admin-0 countries at 1:50m, and at 1:10m for countries under 60,000 km² (`ne_50m_admin_0_countries`, `ne_10m_admin_0_countries`) | Public domain |
| `divisions/<code>`, Japan's prefectures among them | Natural Earth 5.1.2, admin-1 states and provinces at 1:10m (`ne_10m_admin_1_states_provinces`) | Public domain |
| The countries' names in English and Japanese, their everyday short names (アメリカ for アメリカ合衆国), their readings in kana, continents and three-letter codes; the regions' ISO 3166-2 codes; the names of the regions that are exactly one ISO subdivision; Japan's prefectures' names and readings | kuni 国 (`@johnmorrisdotca/kuni` 1.0.0, read at build time), whose names are Unicode CLDR 48.2's and Wikidata's | kuni: MIT. CLDR: Unicode-3.0, below. Wikidata: CC0 |
| The other regions' names in English and Japanese | Natural Earth's name columns, which are Wikidata's | CC0 |
| The readings of the three places kuni does not have, the names that tell two regions of one map apart (Cork City), and the table of which ISO code a region has when Natural Earth's is out of date | Written for this package, in `scripts/data-config.mjs` | MIT |

## kuni and Unicode CLDR

The names, readings, continents and ISO codes are read from kuni 国
(https://github.com/johnmorrisdotca/kuni, `@johnmorrisdotca/kuni` on npm, MIT © John Morris) at build time, by
`scripts/build-data.mjs`, at the version pinned in `package.json` and in `scripts/data-config.mjs`. kuni is a
development dependency of the build script only: the package carries none of its code and imports nothing of it.
kuni's names are from the Unicode Common Locale Data Repository (https://cldr.unicode.org/), whose licence
(https://www.unicode.org/license.txt) asks that this notice appear with all copies of the data or in its
documentation, and from Wikidata, which is CC0 (see kuni's own NOTICE.md for the files it was made from):

```text
UNICODE LICENSE V3

COPYRIGHT AND PERMISSION NOTICE

Copyright © 2004-2026 Unicode, Inc.

NOTICE TO USER: Carefully read the following legal agreement. BY
DOWNLOADING, INSTALLING, COPYING OR OTHERWISE USING DATA FILES, AND/OR
SOFTWARE, YOU UNEQUIVOCALLY ACCEPT, AND AGREE TO BE BOUND BY, ALL OF THE
TERMS AND CONDITIONS OF THIS AGREEMENT. IF YOU DO NOT AGREE, DO NOT
DOWNLOAD, INSTALL, COPY, DISTRIBUTE OR USE THE DATA FILES OR SOFTWARE.

Permission is hereby granted, free of charge, to any person obtaining a
copy of data files and any associated documentation (the "Data Files") or
software and any associated documentation (the "Software") to deal in the
Data Files or Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, and/or sell
copies of the Data Files or Software, and to permit persons to whom the
Data Files or Software are furnished to do so, provided that either (a)
this copyright and permission notice appear with all copies of the Data
Files or Software, or (b) this copyright and permission notice appear in
associated Documentation.

THE DATA FILES AND SOFTWARE ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF
THIRD PARTY RIGHTS.

IN NO EVENT SHALL THE COPYRIGHT HOLDER OR HOLDERS INCLUDED IN THIS NOTICE
BE LIABLE FOR ANY CLAIM, OR ANY SPECIAL INDIRECT OR CONSEQUENTIAL DAMAGES,
OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION,
ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THE DATA
FILES OR SOFTWARE.

Except as contained in this notice, the name of a copyright holder shall
not be used in advertising or otherwise to promote the sale, use or other
dealings in these Data Files or Software without prior written
authorization of the copyright holder.

SPDX-License-Identifier: Unicode-3.0
```

**Which names, and what was changed.** A country takes kuni's English and Japanese names, its everyday short
Japanese name (except the United Kingdom's 英国, CLDR's written abbreviation, where イギリス is kept), its reading,
continent and three-letter code. A region of a country takes its ISO 3166-2 code from Natural Earth when kuni has
the same code, or from the table `ISO_JOIN` in `scripts/data-config.mjs`, which says for each of the rest what the
code is now or why there is none. A region that is exactly one ISO subdivision takes kuni's names, but for the few
listed in `KUNI_NAMES_KEPT_FROM_NATURAL_EARTH` with the reason; `NAME_FIXES` tells apart two regions of one map that
would otherwise share a name. Japan's prefectures take kuni's names and readings.

## Natural Earth

The outlines and the names are from [Natural Earth](https://www.naturalearthdata.com/),
made by volunteers and supported by the North American Cartographic Information
Society. Its terms of use (https://www.naturalearthdata.com/about/terms-of-use/,
read on 2026-10-01) say:

> All versions of Natural Earth raster + vector map data found on this website
> are in the public domain. You may use the maps in any manner, including
> modifying the content and design, electronic dissemination, and offset
> printing. The primary authors, Tom Patterson and Nathaniel Vaughn Kelso, and
> all other contributors renounce all financial claim to the maps and invite you
> to use them for personal, educational, and commercial purposes.
>
> No permission is needed to use Natural Earth. Crediting the authors is
> unnecessary.

And of the names: "The authors' used name data for more than 20 languages from
Wikidata which is under a CC0 (public domain) license."

Crediting the authors is unnecessary, and is done here anyway: the README's
Licence section names Natural Earth, and so does the footer of the demo.

**Exactly which files, and which release.** The release is 5.1.2, read from the
project's own repository at that tag
(https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2), on 2026-10-01.
`scripts/build-data.mjs` checks each file against the SHA-256 below before it
reads it, so it makes the same maps from the same files every time:

| File | SHA-256 |
| --- | --- |
| `geojson/ne_110m_admin_0_countries.geojson` | `6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f` |
| `geojson/ne_50m_admin_0_countries.geojson` | `3e458fc036ad0a66411f2c1e6cac49c5d7bfb81cb1123bc513b22511a2b7fdeb` |
| `geojson/ne_10m_admin_0_countries.geojson` | `239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255` |
| `geojson/ne_10m_admin_1_states_provinces.geojson` | `22d0e3ad85eb3e27f17cabf8ba2d50e554fbc27a87796ff891d958185da62fb5` |

**What was changed.** The outlines are projected onto a fixed canvas, rounded to
two decimals and drawn as `M`/`L`/`Z` paths. For a country alone, only its
largest piece and the pieces within 9° of it are kept. Natural Earth draws the
Amami Islands (Amami Ōshima, Kikai, Tokunoshima, Okinoerabu and Yoron) inside
Okinawa; they are Kagoshima's, and the build moves them there. The names, the codes and
the neighbours (regions that share a border point) are Natural Earth's own, with
a few Natural Earth codes made unique where two entries claim one. Natural
Earth's disputed-territory choices are its own and are not this package's.

## Not carried

Japan's prefectures were first drawn, in the study app this package came from, from the `japan.geojson` of
dataofjapan/land (https://github.com/dataofjapan/land), whose README says it is made from the Geospatial
Information Authority of Japan's Global Map (地球地図日本) and asks, for commercial use, both a credit and a report
of the use to the copyright holder; the repository has no licence file. A condition that travels to every user of
this package is not one an MIT package can carry, so those outlines are not here: Japan's prefectures are drawn from
Natural Earth's admin-1 file like every other country's regions, in the same framing. No population, area, capital,
currency or other fact about a country is carried either, so no database with a share-alike condition is.

## Made with

`scripts/build-data.mjs` uses d3-geo (ISC, Mike Bostock) to project the outlines.
It is a development dependency of the build script only: the package carries none
of its code and depends on nothing.

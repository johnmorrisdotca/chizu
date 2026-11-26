# Notice: the maps' licences

The code of this package is under the MIT licence (see [LICENSE](LICENSE)). The
maps in `src/data/` (and `dist/data/`) are data, made from other people's work
under its terms, which travel with it. Each data file opens with a line saying
what it was made from.

| Entry point | Made from | Terms |
| --- | --- | --- |
| `world` | Natural Earth 5.1.2, admin-0 countries at 1:110m (`ne_110m_admin_0_countries`) | Public domain |
| `views/<id>`, `withView`: which pieces of Russia's outline belong to Ukraine (Crimea) or to Japan (the Northern Territories) in each view | Natural Earth 5.1.2's point-of-view files for Ukraine and Japan (`ne_10m_admin_0_countries_ukr`, `ne_10m_admin_0_countries_jpn`), used only to say which pieces of the default outlines move; the outlines drawn are the default files' own | Public domain |
| `countries/<code>`, `names` | Natural Earth 5.1.2, admin-0 countries at 1:50m, and at 1:10m for countries under 60,000 km² (`ne_50m_admin_0_countries`, `ne_10m_admin_0_countries`) | Public domain |
| `countries/<code>` for the fifteen ISO codes that had no map of their own (AQ, BQ, BV, CC, CX, GF, GI, GP, MQ, RE, SJ, TF, TK, UM, YT) | Natural Earth 5.1.2, admin-0 map units at 1:50m and 1:10m (`ne_50m_admin_0_map_units`, `ne_10m_admin_0_map_units`), and admin-0 countries for AQ, GI, TF and UM. Credit, as Natural Earth suggests it: "Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com." | Public domain |
| `divisions-geo/<code>`, `world-geo-detail` | The same Natural Earth 5.1.2 files, admin-1 states and provinces at 1:10m and admin-0 countries at 1:50m, as longitude and latitude, rounded to 0.01 degree and simplified to 0.7 km (regions) and 0.3 km (world) by `scripts/build-data/geo.mjs` | Public domain |
| `divisions/<code>`, Japan's prefectures among them | Natural Earth 5.1.2, admin-1 states and provinces at 1:10m (`ne_10m_admin_1_states_provinces`) | Public domain |
| `divisions/vn-2025`, `divisions-geo/vn-2025`, `features/divisions-vn-2025`: which of Vietnam's 63 old provinces make up each of its 34 provinces and cities of 2025, and that Huế is a city | Resolution 202/2025/QH15 of the National Assembly of Viet Nam, Article 1, and Resolution 175/2024/QH15 (see [Vietnam's provinces of 2025](#vietnams-provinces-of-2025)); written out in `scripts/data-config/vietnam.mjs` | Not under copyright: a legal document (Law on Intellectual Property 50/2005/QH11, Art. 15(2)) |
| `divisions/gb-2025`, `divisions-geo/gb-2025`: the United Kingdom's councils of 2025, beside `divisions/gb` (which is Natural Earth's, as in the row above); its regions of England, Scotland and Wales (207 councils) | The Office for National Statistics' "Counties and Unitary Authorities (December 2025) Boundaries UK BGC", simplified to 0.7 km by `scripts/build-data/geo.mjs` (see [The ONS](#the-ons) below). Northern Ireland's 26 regions in the same files are Natural Earth's, as on `divisions/gb` | Open Government Licence v3.0: "Source: Office for National Statistics licensed under the Open Government Licence v.3.0" and "Contains OS data © Crown copyright and database right 2025" |
| `features/<map>`: the seas, lakes, rivers, landforms and peaks of each map | Natural Earth 5.1.2's physical vectors at 1:10m: marine areas, lakes, rivers and lake centre-lines, geographic regions and elevation points (`ne_10m_geography_marine_polys`, `ne_10m_lakes`, `ne_10m_rivers_lake_centerlines`, `ne_10m_geography_regions_polys`, `ne_10m_geography_regions_elevation_points`) | Public domain |
| The features' Japanese names where Natural Earth has none, the English names of lakes and rivers, the readings Wikidata gives (its "name in kana", P1814, and aliases in hiragana), and which Wikidata item each of Natural Earth's rivers is | Wikidata (https://www.wikidata.org/), asked by `scripts/wikidata.mjs` and kept in `scripts/data-wikidata.json` | CC0 |
| `features/<map>`: the capitals of the countries and the seats of their regions, with their names, readings and places | kuni 国 1.6.0's `/facts` and `/subdivision-facts`, whose figures are Wikidata's | kuni: MIT. Wikidata: CC0 |
| The readings of feature names no source reads, and the river names Natural Earth spells otherwise (Rhein for the Rhine) matched to their Wikidata items | Written for this package, in `scripts/features-config.mjs` | MIT |
| The countries' names in English and Japanese, their everyday short names (アメリカ for アメリカ合衆国), their readings in kana, continents and three-letter codes; the regions' ISO 3166-2 codes; the names of the regions that are exactly one ISO subdivision; Japan's prefectures' names and readings | kuni 国 (`@johnmorrisdotca/kuni` 1.6.0, read at build time), whose names are Unicode CLDR 48.2's and Wikidata's | kuni: MIT. CLDR: Unicode-3.0, below. Wikidata: CC0 |
| The other regions' names in English and Japanese | Natural Earth's name columns, which are Wikidata's | CC0 |
| `airports`: the 600 busiest airports, their tiers, codes, points and names | Wikidata (https://www.wikidata.org/), asked by `scripts/wikidata-ports.mjs` and kept in `scripts/data-wikidata-ports.json`: each airport's passengers a year (P3872) of 2015 or later, its IATA and ICAO codes, point, and English and Japanese labels. The country is the Natural Earth 1:50m country that holds the point | CC0 |
| `runways`: the open runways of those airports, each from its two measured ends, with its width | OurAirports' `airports.csv` and `runways.csv` (https://github.com/davidmegginson/ourairports-data) at commit `13c732d99cd8a0147f3a42533bff671bcb8000cf`, read 2026-11-18, kept to the airports shipped; the airport is matched by its ICAO code (else IATA) and a point within 15 km of Wikidata's | The Unlicense (public domain) |
| `harbours`: the 1,081 harbours, their tiers and places | Natural Earth 5.1.2 ports at 1:10m (`ne_10m_ports`), whose size rank (`scalerank`) gives the tier; the country is the Natural Earth 1:50m country that holds the point | Public domain |
| `harbours`: the Japanese names | Wikidata, asked by `scripts/wikidata-ports.mjs` and kept in `scripts/data-wikidata-ports.json` | CC0 |
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
code is now or why there is none. A region that is exactly one ISO subdivision takes kuni's names (with kuni 1.6.0 the only exceptions in
`KUNI_NAMES_KEPT_FROM_NATURAL_EARTH` are four India names that kuni writes with macrons); `NAME_FIXES` tells apart two regions of one map that
would otherwise share a name; `TYPE_FIXES` gives the kind (state) of the two Indian states whose Natural Earth type is wrong or empty. Japan's prefectures take kuni's names and readings, and their eight regions are kuni's
grouping `jp-regions-8`.

## The ONS

This section is for `gb-2025`, the United Kingdom's map of its councils of 2025 (`divisions/gb-2025`,
`divisions-geo/gb-2025`, and its features, `features/divisions-gb-2025`, which are Natural Earth's). Its regions of
England, Scotland and Wales are the only outlines in this package that are not Natural Earth's. Natural Earth draws
Great Britain's councils as they were before the reforms of 2019 to 2023 (Dorset and Bournemouth, Christchurch and
Poole; Buckinghamshire; Northamptonshire, now North and West Northamptonshire; Cumbria, now Cumberland and Westmorland
and Furness; North Yorkshire; Somerset), so on `gb-2025` all 207 of them are drawn instead from the Office for
National Statistics' "Counties and Unitary Authorities (December 2025) Boundaries UK BGC" (generalised to 20 m,
clipped to the coast at mean high water), on its Open Geography Portal
(https://geoportal.statistics.gov.uk/datasets/ac443ef4c1de497a9675a6e72290f9cc). The United Kingdom's default map,
`divisions/gb`, is still Natural Earth's alone, as it was; `gb-2025` takes its place at the next major release.

Source: Office for National Statistics licensed under the Open Government Licence v.3.0

Contains OS data © Crown copyright and database right 2025

Those two lines are also `CHIZU_SOURCE.ons.attribution` (from `@johnmorrisdotca/chizu/names`), beside the office's Japanese name 英国国家統計局.

The ONS supplies its digital boundaries under the Open Government Licence v3.0
(https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/), whose one condition is the
acknowledgement above; the two lines also travel with the data, in the `source` of both files.

**Northern Ireland is not from the ONS.** Its 26 regions on `gb-2025` are Natural Earth's, as on `gb` (its districts
from before 2015, each with the ISO code of the district it lies in now), until there is a decision on Land and
Property Services' terms for the 11 districts of today; the ONS's 11 (codes `N09…`) are left out of the build.

**Exactly which file.** The ONS's feature service, asked on 2026-11-18 for every unit with its code and names, in
longitude and latitude, as GeoJSON:

```text
https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Counties_and_Unitary_Authorities_December_2025_Boundaries_UK_BGC/FeatureServer/0/query?where=1%3D1&outFields=CTYUA25CD%2CCTYUA25NM%2CCTYUA25NMW&orderByFields=CTYUA25CD&outSR=4326&f=geojson
```

`scripts/build-data.mjs` keeps the answer in its cache as `ons_ctyua_dec_2025_uk_bgc.geojson` and checks it
against the SHA-256 in `scripts/data-config/ons.mjs` before it reads it:
`23269639209d1425df0a3fc052dec4d9c0dc04922d7ae641ca9ebe8e4dbc91cd`.

**What was changed.** The 11 units of Northern Ireland are left out. Nottingham's hole in Nottinghamshire, which the
file gives as a polygon of its own, is put back in Nottinghamshire. The outlines are simplified with the border two
councils share kept one line, on a grid of 0.0001 degree, to no more than 0.7 km from the ONS's line, and islands
under 2 km² are left out (a council's largest piece is kept); the files in longitude and latitude are then rounded and
simplified like every other country's. Each council's ISO 3166-2 code is kuni's subdivision of the same English name
(or, for the 13 the ONS names otherwise, the table `ONS_ISO`), and its names are kuni's; Cumberland and Westmorland
and Furness, which ISO 3166-2 has not coded, keep the ONS's English names and codes. The kinds (`type`) are the ONS's
entity names (unitary authority, metropolitan district, London borough, county, council area).

## Natural Earth

The outlines and the names, but for the regions of England, Scotland and Wales on `gb-2025` (above), are from [Natural Earth](https://www.naturalearthdata.com/),
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
| `geojson/ne_10m_geography_marine_polys.geojson` | `53f865e8ffa966cdd402145c82c5cd14ee7ce974cd0eb9a3f59f03a4cfd2d66c` |
| `geojson/ne_10m_lakes.geojson` | `2d036f53dedec578001c5c30c2959ee7d4eebc1306900fa4367c49929ec8f2d9` |
| `geojson/ne_10m_rivers_lake_centerlines.geojson` | `bb854a900ecbd3b408df46d5e16e3e0f974ba55993f9d8b5c26e855273c0905a` |
| `geojson/ne_10m_geography_regions_polys.geojson` | `b7b26e50ea917d3696aec87f932def2bf5f890f5770e441d59c162c6f4c92a77` |
| `geojson/ne_10m_geography_regions_elevation_points.geojson` | `f98a16867867146ec4146d6d4b18c823eeedb2825947de666116cf9a4e3f43cb` |
| `geojson/ne_50m_admin_0_map_units.geojson` | `b8d421aca6e9e08e8cdf09cc26af111cc3e0deba4fe915611d58ade71e8a4db0` |
| `geojson/ne_10m_admin_0_map_units.geojson` | `57da82be755f4afccd8f3b14251bb2752f5df1395f47d2d86f817470c4a48862` |
| `geojson/ne_10m_ports.geojson` | `c5a5028f5187a5e1b9fe7f0fab99804a8be7482099a2365d404fb7e9dd6b5457` |
| `geojson/ne_10m_admin_0_countries_ukr.geojson` | `28a1a17d7327cad576083d5122b867843f957468b1bb11168ded23fd5aea342e` |
| `geojson/ne_10m_admin_0_countries_jpn.geojson` | `11bc047064a5cf2db03efc2aece341e657df2dd59ad715a8221cc1575697df1b` |

The five physical files were read on 2026-10-09, and the two map-units files and the ports file on 2026-11-18, from
the same tag; the terms page above was read again on 2026-11-18. The two point-of-view files (`_ukr`, `_jpn`) were read on 2026-11-26 from the same tag.

**What was changed.** The outlines are projected onto a fixed canvas, rounded to
two decimals and drawn as `M`/`L`/`Z` paths. For a country alone, only its
largest piece and the pieces within 9° of it are kept; Antarctica's points along
the antimeridian and the pole are taken out, so its map has no line from the coast to the pole. Natural Earth draws the
Amami Islands (Amami Ōshima, Kikai, Tokunoshima, Okinoerabu and Yoron) inside
Okinawa; they are Kagoshima's, and the build moves them there. For Vietnam's map of 2025, its 63 provinces are joined
into the 34 of that year (above). The names, the codes and
the neighbours (regions that share a border point) are Natural Earth's own, with
a few Natural Earth codes made unique where two entries claim one. Natural
Earth's disputed-territory choices are its own and are not this package's.

The features are projected onto each map's canvas, cut to it, simplified (by at most a quarter of a unit, of a
canvas 1,000 across) and rounded to one decimal. Parts Natural Earth draws apart under one Wikidata item are joined
(the North and South Pacific are one Pacific Ocean). The names of seas are Natural Earth's, and so are their
disputes: the sea between Japan and Korea is "Sea of Japan" (日本海), Natural Earth's and Wikidata's English, which
Korea calls the East Sea (東海); the package takes no side and names it as its sources do.

## Vietnam's provinces of 2025

Vietnam's map of 2025 (`divisions/vn-2025`) is its 34 provinces and cities; `divisions/vn` is still Natural Earth's 63.
Resolution 202/2025/QH15 of the National Assembly
(Quốc hội), passed on 12 June 2025, merged the 63 provinces and cities into 34, whose governments began work on
1 July 2025 (Article 2). Each clause of its Article 1 merges the whole area of the provinces it names, so the build
joins Natural Earth's 63 outlines along their shared borders (`scripts/build-data/dissolve.mjs`) and draws no new
line. Only the facts are carried (which old province is in which new one, and the new unit's name), not the text.

- Official Gazette (Công báo): issue 773+774 of 23 June 2025,
  https://congbao.chinhphu.vn/van-ban/nghi-quyet-so-202-2025-qh15-45050.htm
- Signed text: https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/6/202qh.signed.pdf
- Government legal-documents portal: https://vanban.chinhphu.vn/?pageid=27160&docid=213930

Huế is one of the 6 cities: Resolution 175/2024/QH15 of the National Assembly, passed on 30 November 2024 and in
force from 1 January 2025, made the whole of Thừa Thiên Huế province the city of Huế (Article 1). Official Gazette
issue 1351+1352 of 17 December 2024, https://congbao.chinhphu.vn/van-ban/nghi-quyet-so-175-2024-qh15-43363.htm;
signed text https://datafiles.chinhphu.vn/cpp/files/vbpq/2024/11/175-qh15.signed.pdf.

Legal documents are not protected by copyright in Viet Nam: the Law on Intellectual Property 50/2005/QH11,
Article 15(2), lists "Legal documents, administrative documents and other documents in the judicial domain" among
the works it does not protect (English text on WIPO Lex, https://www.wipo.int/wipolex/en/text/449011). The portals ask that what is republished from them be credited, and it is:

> Province merges from Resolution 202/2025/QH15 of the National Assembly of Viet Nam (12 June 2025), vanban.chinhphu.vn. Shapes: Natural Earth (public domain).

ISO 3166-2 still lists Vietnam's 63 old codes, so on the map of 2025 the 23 merged units carry no ISO code until it
is updated (`docs/iso-codes.md`).

## Wikidata

The features' names that are not Natural Earth's are Wikidata's (https://www.wikidata.org/), which is in the public
domain under CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/): "You can copy, modify, distribute and
perform the work, even for commercial purposes, all without asking permission." They were asked of Wikidata's query
service on the day `scripts/data-wikidata.json` records, and are kept in that file so that the build makes the same
maps every time.

## Airports and harbours

The airports (`@johnmorrisdotca/chizu/airports`), their runways (`/runways`) and the harbours (`/harbours`) are made by
`scripts/build-ports.mjs` (`pnpm data:ports`) from three sources, and nothing else. The terms were read on 2026-11-18.

**Wikidata** (https://www.wikidata.org/wiki/Wikidata:Licensing): "All structured data (i.e. the main, Property, Lexeme,
and EntitySchema namespaces) is released into the public domain under Creative Commons Zero." The page does not ask for
a credit for structured data; the entries carry one anyway (`AIRPORTS_CREDIT`, `HARBOURS_CREDIT`). No Wikipedia text is
used, and no Wikidata item is carried but its codes, point, figure and labels. The airports are ranked by the highest
passengers-a-year figure (P3872) an airport has for 2015 or later, so a closed year such as 2020 does not rank it; a
figure that is a plan for an airport not yet open is left out (`NOT_TRAFFIC` in `scripts/ports-config.mjs`). A
Japanese name is Wikidata's Japanese label; where there is none the name is English, never machine-translated.

**Natural Earth** ports (https://www.naturalearthdata.com/about/terms-of-use/): public domain, as quoted above. Its file
has a name, a size rank and a point for each port, no country and no Japanese name; the country comes from the
Natural Earth countries already used here, and the Japanese name from Wikidata where an item of that name lies within
60 km (a port item) or 40 km (a place).

**OurAirports**, for the runways only (https://github.com/davidmegginson/ourairports-data, commit
`13c732d99cd8a0147f3a42533bff671bcb8000cf`, made 2026-11-18 02:53 UTC). Its repository's `LICENSE` at that commit
(SHA-256 `6b0382b16279f26ff69014300541967a356a666eb0b91b422f6862f6b7dad17e`) is the Unlicense and begins: "This is free
and unencumbered software released into the public domain. Anyone is free to copy, modify, publish, use, compile, sell,
or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or
non-commercial, and by any means." The Unlicense in that repository is taken as the terms of its data. The site's
own page (https://ourairports.com/data/) could not be read on 2026-11-18, an expired certificate, so what it adds is
not known and none of it is relied on. The build fetches `airports.csv` and `runways.csv` from that commit once into
the cache and checks each against its SHA-256 (`OURAIRPORTS` in `scripts/ports-config.mjs`), and refuses to run if the
`LICENSE` no longer says the words above. Of the files it keeps each open runway (not `closed`) that has both ends'
latitude and longitude, 1,057 runways at 575 of the 600 airports; the others are left out, not guessed from a heading.
The ends are rounded to five places of a degree (about a metre) and the width to the metre.

**Not used.**

- **The NGA World Port Index** (https://msi.nga.mil/Publications/WPI): the page answered 503 on 2026-11-18, so its
  terms were not read and no file of it is used. The harbours' size is Natural Earth's own rank, not the Index's classes.
- **OpenStreetMap** and any share-alike or non-commercial list: left out, whatever its quality.

## Not carried

Japan's prefectures were first drawn, in the study app this package came from, from the `japan.geojson` of
dataofjapan/land (https://github.com/dataofjapan/land), whose README says it is made from the Geospatial
Information Authority of Japan's Global Map (地球地図日本) and asks, for commercial use, both a credit and a report
of the use to the copyright holder; the repository has no licence file. A condition that travels to every user of
this package is not one an MIT package can carry, so those outlines are not here: Japan's prefectures are drawn from
Natural Earth's admin-1 file like every other country's regions, in the same framing. No population, area,
currency or other fact about a country is carried, so no database with a share-alike condition is; the capitals are
kuni's, whose figures are Wikidata's (CC0).

## Made with

`scripts/build-data.mjs` uses d3-geo (ISC, Mike Bostock) to project the outlines.
It is a development dependency of the build script only: the package carries none
of its code and depends on nothing.

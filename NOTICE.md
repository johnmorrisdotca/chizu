# Notice: the maps' licences

The code of this package is under the MIT licence (see [LICENSE](LICENSE)). The
maps in `src/data/` (and `dist/data/`) are data, made from other people's work
under its terms, which travel with it. Each data file opens with a line saying
what it was made from.

| Entry point | Made from | Terms |
| --- | --- | --- |
| `world` | Natural Earth 5.1.2, admin-0 countries at 1:110m (`ne_110m_admin_0_countries`) | Public domain |
| `countries/<code>`, `names` | Natural Earth 5.1.2, admin-0 countries at 1:50m, and at 1:10m for countries under 60,000 km² (`ne_50m_admin_0_countries`, `ne_10m_admin_0_countries`) | Public domain |
| `divisions/<code>` | Natural Earth 5.1.2, admin-1 states and provinces at 1:10m (`ne_10m_admin_1_states_provinces`) | Public domain |
| The names in Japanese and in other languages | Natural Earth's name columns, which are Wikidata's | CC0 |
| The everyday short names (アメリカ for アメリカ合衆国) and the readings in kana | Written for this package, in `scripts/data-config.mjs` | MIT |

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
largest piece and the pieces within 9° of it are kept. The names, the codes and
the neighbours (regions that share a border point) are Natural Earth's own, with
a few Natural Earth codes made unique where two entries claim one. Natural
Earth's disputed-territory choices are its own and are not this package's.

## Not carried

Japan's prefectures are not in this package: the data they were first drawn from
had no licence, and the maps wait on a source that says what it may be used for
(the Geospatial Information Authority of Japan's Global Map, or Natural Earth's
own admin-1 file). No population, area, capital, currency or other fact about a
country is carried either, so no database with a share-alike condition is.

## Made with

`scripts/build-data.mjs` uses d3-geo (ISC, Mike Bostock) to project the outlines.
It is a development dependency of the build script only: the package carries none
of its code and depends on nothing.

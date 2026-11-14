export { DIVISION_CONFIGS } from "./data-config/divisions.mjs";
export { ISO_JOIN } from "./data-config/iso-join.mjs";
export { AMAMI, JAPAN_GROUPING, JAPAN_OUTLYING, REGION_GROUPS } from "./data-config/japan.mjs";
export {
  CONTINENT_NAMES,
  CONTINENT_OVERRIDES,
  DISPLAY_NAMES,
  GROUP_READINGS,
  KANJI_READINGS,
  KUNI_NAMES_KEPT_FROM_NATURAL_EARTH,
  NAME_FIXES,
  SHORT_ENGLISH_NOT_FOR_MAPS,
  SHORT_NAME_READINGS,
  SHORT_NAMES_NOT_EVERYDAY,
} from "./data-config/names.mjs";

/** Where Natural Earth is read from: a release tag of its own repository, and the file's SHA-256 at that tag. */
export const NATURAL_EARTH = {
  version: "5.1.2",
  tag: "v5.1.2",
  repository: "https://github.com/nvkelso/natural-earth-vector",
  raw: "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson",
  /** The day these files were fetched, written here rather than read from a clock so that the data is made the same each time. */
  retrieved: "2026-10-01",
  files: {
    "ne_110m_admin_0_countries.geojson": "6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f",
    "ne_10m_admin_0_countries.geojson": "239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255",
    "ne_50m_admin_0_countries.geojson": "3e458fc036ad0a66411f2c1e6cac49c5d7bfb81cb1123bc513b22511a2b7fdeb",
    "ne_10m_admin_1_states_provinces.geojson": "22d0e3ad85eb3e27f17cabf8ba2d50e554fbc27a87796ff891d958185da62fb5",
    "ne_10m_geography_marine_polys.geojson": "53f865e8ffa966cdd402145c82c5cd14ee7ce974cd0eb9a3f59f03a4cfd2d66c",
    "ne_10m_lakes.geojson": "2d036f53dedec578001c5c30c2959ee7d4eebc1306900fa4367c49929ec8f2d9",
    "ne_10m_rivers_lake_centerlines.geojson": "bb854a900ecbd3b408df46d5e16e3e0f974ba55993f9d8b5c26e855273c0905a",
    "ne_10m_geography_regions_polys.geojson": "b7b26e50ea917d3696aec87f932def2bf5f890f5770e441d59c162c6f4c92a77",
    "ne_10m_geography_regions_elevation_points.geojson":
      "f98a16867867146ec4146d6d4b18c823eeedb2825947de666116cf9a4e3f43cb",
  },
};

/*
 * Left off every map. Antarctica is a continent and not a country (drawn whole it is a band the width of the
 * map); the French Southern Lands are uninhabited islands off it; Northern Cyprus and Somaliland are not on
 * the maps a school uses.
 */
export const EXCLUDED = new Set(["AQ", "TF", "CYN", "SOL"]);

/*
 * KUNI: WHO A PLACE IS. The names, readings, continents and ISO codes of the countries and their subdivisions are
 * read from kuni 国 (@johnmorrisdotca/kuni, MIT, its names from Unicode CLDR and Wikidata) at build time, so that the
 * two packages never disagree about a name. It is a development dependency of this script only, pinned to one
 * version: the package itself imports nothing of kuni's, and a newer kuni changes chizu's names only when this pin
 * and the data are moved together.
 */
export const KUNI = { package: "@johnmorrisdotca/kuni", version: "1.6.0" };

/**
 * How far the longitude-and-latitude files (`divisions-geo/<code>`, `world-geo-detail`) are simplified: the most, in
 * kilometres, a simplified line may lie from the Natural Earth line it came from (on top of the 0.01 degree grid the
 * points are rounded to, about 0.8 km at the most). Chosen from the size each costs: all 32 countries' regions under
 * 1.0 MB gzipped with no country over 200 kB, the world under 0.45 MB.
 */
export const GEO_TOLERANCE_KM = { divisions: 0.7, world: 0.3 };

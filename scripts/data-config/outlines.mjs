/*
 * THE ISO 3166-1 CODES NATURAL EARTH'S COUNTRIES DO NOT DRAW ALONE. Natural Earth's admin-0 countries draw France's
 * overseas departments inside France, Svalbard inside Norway, Christmas and Cocos as one polygon (IOA), and leave
 * Gibraltar, the US Minor Outlying Islands and Bouvet Island out at 1:50m. Each of these codes is cut from the file
 * named here, by the field and values given (map units by `GU_A3`, whose `ISO_A2` holds "FR-971" or "-99"; countries
 * by `ADM0_A3`), so that it has a `countries/<code>` file of its own. The file's scale follows the rule for every
 * country (1:50m, 1:10m under 60,000 km²), but where 1:50m lacks the place (Gibraltar, the Minor Outlying Islands,
 * Bouvet). Only the country files get them: the world, its quiz and EXCLUDED are as they were, so Antarctica and
 * the French Southern Lands are still off the world.
 */
const MAP_UNITS_50M = "ne_50m_admin_0_map_units.geojson";
const MAP_UNITS_10M = "ne_10m_admin_0_map_units.geojson";
const COUNTRIES_50M = "ne_50m_admin_0_countries.geojson";
const COUNTRIES_10M = "ne_10m_admin_0_countries.geojson";

export const CUT_OUTLINES = {
  AQ: { file: COUNTRIES_50M, field: "ADM0_A3", values: ["ATA"] },
  BQ: { file: MAP_UNITS_10M, field: "GU_A3", values: ["NLY"] },
  BV: { file: MAP_UNITS_10M, field: "GU_A3", values: ["BVT"] },
  CC: { file: MAP_UNITS_10M, field: "GU_A3", values: ["CCK"] },
  CX: { file: MAP_UNITS_10M, field: "GU_A3", values: ["CXR"] },
  GF: { file: MAP_UNITS_50M, field: "GU_A3", values: ["GUF"] },
  GI: { file: COUNTRIES_10M, field: "ADM0_A3", values: ["GIB"] },
  GP: { file: MAP_UNITS_10M, field: "GU_A3", values: ["GLP"] },
  MQ: { file: MAP_UNITS_10M, field: "GU_A3", values: ["MTQ"] },
  RE: { file: MAP_UNITS_10M, field: "GU_A3", values: ["REU"] },
  SJ: { file: MAP_UNITS_50M, field: "GU_A3", values: ["NSV", "NJM"] },
  TF: { file: COUNTRIES_10M, field: "ADM0_A3", values: ["ATF"] },
  TK: { file: MAP_UNITS_10M, field: "GU_A3", values: ["TKL"] },
  UM: { file: COUNTRIES_10M, field: "ADM0_A3", values: ["UMI"] },
  YT: { file: MAP_UNITS_10M, field: "GU_A3", values: ["MYT"] },
};

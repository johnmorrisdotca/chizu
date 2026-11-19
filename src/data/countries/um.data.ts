/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * U.S. Outlying Islands, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

/**
 * U.S. Outlying Islands, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.
 *
 * @example
 * ```ts
 * import map from "@johnmorrisdotca/chizu/countries/um";
 * console.log(map.id, map.kind, map.regions.length, map.viewBox);
 * // country-um country 1 0 0 350 1000
 * ```
 */
const map: ChizuMap = {
  id: "country-um",
  kind: "country",
  name: "U.S. Outlying Islands",
  nameJa: "合衆国領有小離島",
  regionName: "Country",
  regionNamePlural: "Countries",
  viewBox: "0 0 350 1000",
  width: 350,
  height: 1000,
  wraps: false,
  projection: {
    kind: "azimuthal-equal-area",
    centre: [-161.748349, 4.798375],
    scale: 8387.83,
    translate: [94.833, 241.119],
  },
  insets: [],
  source:
    "Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000",
  regions: [
    {
      code: "UM",
      name: "U.S. Outlying Islands",
      nameJa: "合衆国領有小離島",
      reading: "がっしゅうこくりょうゆうしょうりとう",
      group: "Oceania",
      groupJa: "オセアニア",
      iso3: "UMI",
      path: "M346.64,998.16L349.72,997.62L349.21,999.02L347.4,1000ZM49.32,81.71L49.8,82.4L49.29,83.73L47.54,84.32L44.91,83.99L44.44,83.44L44.97,83.52L45.51,83.02L47.25,81.96L46.8,81.97L46.14,82.15L45.47,82.2L44.52,81.91L43.58,81.82L43.09,81.51L43.37,81.26L47.79,81.28ZM0,0L2.17,0L2.17,2.18L0,2.18Z",
      neighbors: [],
      bbox: [0, 0, 349.72, 1000],
      centroid: [94.89, 241.27],
    },
  ],
};

export default map;

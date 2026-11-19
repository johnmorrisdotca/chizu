/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Bouvet Island, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

/**
 * Bouvet Island, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.
 *
 * @example
 * ```ts
 * import map from "@johnmorrisdotca/chizu/countries/bv";
 * console.log(map.id, map.kind, map.regions.length, map.viewBox);
 * // country-bv country 1 0 0 997 1000
 * ```
 */
const map: ChizuMap = {
  id: "country-bv",
  kind: "country",
  name: "Bouvet Island",
  nameJa: "ブーベ島",
  regionName: "Country",
  regionNamePlural: "Countries",
  viewBox: "0 0 997 1000",
  width: 997,
  height: 1000,
  wraps: false,
  projection: {
    kind: "azimuthal-equal-area",
    centre: [3.413151, -54.419264],
    scale: 695620.57,
    translate: [477.544, 474.982],
  },
  insets: [],
  source:
    "Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000",
  regions: [
    {
      code: "BV",
      name: "Bouvet Island",
      nameJa: "ブーベ島",
      reading: "ぶーべとう",
      group: "South America",
      groupJa: "南アメリカ",
      iso3: "BVT",
      path: "M789.54,120.63L934.45,201.76L997.07,266.04L982.59,373.73L945.12,468.54L892.63,675.98L861.55,743.14L682.83,824.05L261.74,839.86L134.32,1000L110.74,950.62L87.75,935.81L63.63,930.89L37.77,917.08L0,466.57L223.47,136.4L541.04,0Z",
      neighbors: [],
      bbox: [0, 0, 997.07, 1000],
      centroid: [477.54, 474.98],
    },
  ],
};

export default map;

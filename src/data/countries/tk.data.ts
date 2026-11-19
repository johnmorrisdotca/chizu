/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Tokelau, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

/**
 * Tokelau, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.
 *
 * @example
 * ```ts
 * import map from "@johnmorrisdotca/chizu/countries/tk";
 * console.log(map.id, map.kind, map.regions.length, map.viewBox);
 * // country-tk country 1 0 0 1000 629
 * ```
 */
const map: ChizuMap = {
  id: "country-tk",
  kind: "country",
  name: "Tokelau",
  nameJa: "トケラウ",
  regionName: "Country",
  regionNamePlural: "Countries",
  viewBox: "0 0 1000 629",
  width: 1000,
  height: 629,
  wraps: false,
  projection: {
    kind: "azimuthal-equal-area",
    centre: [-171.817642, -8.970105],
    scale: 44043.88,
    translate: [520.657, 327.666],
  },
  insets: [],
  source:
    "Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000",
  regions: [
    {
      code: "TK",
      name: "Tokelau",
      nameJa: "トケラウ",
      reading: "トケラウ",
      group: "Oceania",
      groupJa: "オセアニア",
      iso3: "TKL",
      path: "M996.21,625.01L992.55,620.62L989.38,615.74L986.73,610.6L984.76,605.47L990.9,609.61L995.7,615L998.75,621.45L1000,628.77L997.99,629.14L997.5,628.14L997.23,626.39ZM12.56,16.99L5.8,8.87L0,0L8.27,6.62L14.87,14.86L17.67,23.99L14.44,33.26L14.28,29.25Z",
      neighbors: [],
      bbox: [0, 0, 1000, 629.14],
      centroid: [520.66, 327.67],
    },
  ],
};

export default map;

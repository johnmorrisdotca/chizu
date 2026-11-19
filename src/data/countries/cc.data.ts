/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Cocos Islands, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

/**
 * Cocos Islands, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.
 *
 * @example
 * ```ts
 * import map from "@johnmorrisdotca/chizu/countries/cc";
 * console.log(map.id, map.kind, map.regions.length, map.viewBox);
 * // country-cc country 1 0 0 1000 754
 * ```
 */
const map: ChizuMap = {
  id: "country-cc",
  kind: "country",
  name: "Cocos Islands",
  nameJa: "ココス諸島",
  regionName: "Country",
  regionNamePlural: "Countries",
  viewBox: "0 0 1000 754",
  width: 1000,
  height: 754,
  wraps: false,
  projection: {
    kind: "azimuthal-equal-area",
    centre: [96.867294, -12.175902],
    scale: 588869.93,
    translate: [459.71, 507.09],
  },
  insets: [],
  source:
    "Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000",
  regions: [
    {
      code: "CC",
      name: "Cocos Islands",
      nameJa: "ココス(キーリング)諸島",
      nameShortJa: "ココス諸島",
      reading: "ここすしょとう",
      group: "Oceania",
      groupJa: "オセアニア",
      iso3: "CCK",
      path: "M417.87,567.06L480.82,630.62L238.02,730.99L90.84,548.68L18.85,250.93L0,0.01L68.69,0L68.71,100.37L83.44,184.01L137.42,349.61L98.18,461.69L147.25,570.41L262.54,623.1ZM810.29,754.43L711.37,712.6L684.39,680.82L672.95,625.62L789.05,618.94L878.99,570.43L934.59,482.62L950.96,362.18L1000,482.64L990.99,600.56L928.01,698.41Z",
      neighbors: [],
      bbox: [0, 0, 1000, 754.43],
      centroid: [459.71, 507.09],
    },
  ],
};

export default map;

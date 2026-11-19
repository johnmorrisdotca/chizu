/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Christmas Island, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

/**
 * Christmas Island, alone: Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.
 *
 * @example
 * ```ts
 * import map from "@johnmorrisdotca/chizu/countries/cx";
 * console.log(map.id, map.kind, map.regions.length, map.viewBox);
 * // country-cx country 1 0 0 967 1000
 * ```
 */
const map: ChizuMap = {
  id: "country-cx",
  kind: "country",
  name: "Christmas Island",
  nameJa: "クリスマス島",
  regionName: "Country",
  regionNamePlural: "Countries",
  viewBox: "0 0 967 1000",
  width: 967,
  height: 1000,
  wraps: false,
  projection: {
    kind: "azimuthal-equal-area",
    centre: [105.662522, -10.492523],
    scale: 423880.34,
    translate: [587.199, 456.307],
  },
  insets: [],
  source:
    "Natural Earth 5.1.2 admin-0 map units, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000",
  regions: [
    {
      code: "CX",
      name: "Christmas Island",
      nameJa: "クリスマス島",
      reading: "くりすますとう",
      group: "Oceania",
      groupJa: "オセアニア",
      iso3: "CXR",
      path: "M889.8,0L966.77,46.97L951.95,148.72L943.04,288.99L905.72,469.01L905.7,617.11L844.72,726.07L858.9,906.69L820.42,991.58L705.01,1000L667.13,874.77L621.56,757.97L598.48,648.4L490.74,608.66L337.42,577.97L168.72,585.82L23.11,632.81L0,547.32L76.35,500.35L129.6,367.88L90.51,265.54L90.49,171.62L184.63,204.11L329.69,281.76L529.21,288.97L636.37,187.82L752.43,70.42Z",
      neighbors: [],
      bbox: [0, 0, 966.77, 1000],
      centroid: [587.2, 456.31],
    },
  ],
};

export default map;

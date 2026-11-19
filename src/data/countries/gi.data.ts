/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Gibraltar, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

/**
 * Gibraltar, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.
 *
 * @example
 * ```ts
 * import map from "@johnmorrisdotca/chizu/countries/gi";
 * console.log(map.id, map.kind, map.regions.length, map.viewBox);
 * // country-gi country 1 0 0 517 1000
 * ```
 */
const map: ChizuMap = {
  id: "country-gi",
  kind: "country",
  name: "Gibraltar",
  nameJa: "ジブラルタル",
  regionName: "Country",
  regionNamePlural: "Countries",
  viewBox: "0 0 517 1000",
  width: 517,
  height: 1000,
  wraps: false,
  projection: {
    kind: "azimuthal-equal-area",
    centre: [-5.3467, 36.129463],
    scale: 1871177.69,
    translate: [308.229, 380.703],
  },
  insets: [],
  source:
    "Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000",
  regions: [
    {
      code: "GI",
      name: "Gibraltar",
      nameJa: "ジブラルタル",
      reading: "ジブラルタル",
      group: "Europe",
      groupJa: "ヨーロッパ",
      iso3: "GIB",
      path: "M0,0.35L517.29,0L487.2,368.78L509.77,564.11L431.44,1000L214.58,712.97Z",
      neighbors: ["ES"],
      bbox: [0, 0, 517.29, 1000],
      centroid: [308.23, 380.7],
    },
  ],
};

export default map;

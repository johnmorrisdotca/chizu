/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Guadeloupe (country-gp): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-gp.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-gp";
 * console.log(layer.map, layer.features.length);
 * // country-gp 3
 * ```
 */
const layer: ChizuFeatureLayer = {
  map: "country-gp",
  source:
    "Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-gp; names from Natural Earth and Wikidata",
  features: [
    {
      code: "Q1247",
      kind: "sea",
      group: "marine",
      name: "Caribbean Sea",
      nameJa: "カリブ海",
      reading: "かりぶかい",
      rank: 1,
      path: "M-1,-1L1001,-1L1001,859L-1,859ZM332.9,102.1L367.6,196.9L319.2,275.3L340.8,367.4L437,378.3L582.4,363.8L773.5,330.8L546.9,193.4L497.1,128.7L484,57.8L404.2,8L355.1,45.5ZM193.5,241.2L61.4,202.9L37.8,222L4.4,273.1L47.2,581.4L108.1,691.9L157.2,710.3L257.5,652.4L289.7,599.9L275.3,368.7L303.5,312.1L248.5,284.9Z",
      bbox: [-1, -1, 1001, 859],
      centroid: [741.4, 600.3],
      neighbors: [],
    },
    {
      code: "Q26544",
      kind: "peak",
      group: "peaks",
      name: "La Soufrière",
      nameJa: "スフリエール山",
      reading: "すふりえーるさん",
      rank: 9,
      elevation: 1467,
      path: "",
      bbox: [170.3, 609.6, 170.3, 609.6],
      centroid: [170.3, 609.6],
      neighbors: [],
    },
    {
      code: "capital-GP",
      kind: "capital",
      group: "capitals",
      name: "Basse-Terre",
      nameJa: "バステール",
      reading: "バステール",
      rank: 0,
      path: "",
      bbox: [83.6, 661.1, 83.6, 661.1],
      centroid: [83.6, 661.1],
      neighbors: [],
    },
  ],
};

export default layer;

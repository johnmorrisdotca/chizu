/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Bouvet Island (country-bv): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 0 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-bv.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-bv";
 * console.log(layer.map, layer.features.length);
 * // country-bv 1
 * ```
 */
const layer: ChizuFeatureLayer = {
  map: "country-bv",
  source:
    "Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-bv; names from Natural Earth and Wikidata",
  features: [
    {
      code: "Q618361",
      kind: "peak",
      group: "peaks",
      name: "Olavtoppen",
      nameJa: "オラフ峰",
      rank: 9,
      elevation: 780,
      path: "",
      bbox: [384.7, 482.4, 384.7, 482.4],
      centroid: [384.7, 482.4],
      neighbors: [],
    },
  ],
};

export default layer;

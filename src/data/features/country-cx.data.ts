/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Christmas Island (country-cx): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 0 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-cx.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-cx";
 * console.log(layer.map, layer.features.length);
 * // country-cx 1
 * ```
 */
const layer: ChizuFeatureLayer = {
  map: "country-cx",
  source:
    "Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-cx; names from Natural Earth and Wikidata",
  features: [
    {
      code: "Q524471",
      kind: "peak",
      group: "peaks",
      name: "Murray Hill",
      nameJa: "マーレー・ヒル",
      reading: "マーレーヒル",
      rank: 9,
      elevation: 356,
      path: "",
      bbox: [254.6, 405.3, 254.6, 405.3],
      centroid: [254.6, 405.3],
      neighbors: [],
    },
  ],
};

export default layer;

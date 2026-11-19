/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of U.S. Outlying Islands (country-um): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks, 0 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-um.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-um";
 * console.log(layer.map, layer.features.length);
 * // country-um 1
 * ```
 */
const layer: ChizuFeatureLayer = {
  map: "country-um",
  source:
    "Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-um; names from Natural Earth and Wikidata",
  features: [
    {
      code: "Q98",
      kind: "ocean",
      group: "marine",
      name: "Pacific Ocean",
      nameJa: "太平洋",
      reading: "たいへいよう",
      rank: 0,
      path: "M351,894.4L-1,895.7L-1,-1L351,-1ZM-1,895.7L351,894.4L351,1001L-1,1001Z",
      bbox: [-1, -1, 351, 1001],
      centroid: [175, 500],
      neighbors: [],
    },
  ],
};

export default layer;

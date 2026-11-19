/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Tokelau (country-tk): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks, 0 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-tk.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-tk";
 * console.log(layer.map, layer.features.length);
 * // country-tk 1
 * ```
 */
const layer: ChizuFeatureLayer = {
  map: "country-tk",
  source:
    "Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-tk; names from Natural Earth and Wikidata",
  features: [
    {
      code: "Q98",
      kind: "ocean",
      group: "marine",
      name: "Pacific Ocean",
      nameJa: "太平洋",
      reading: "たいへいよう",
      rank: 0,
      path: "M-1,-1L1001,-1L1001,630L-1,630Z",
      bbox: [-1, -1, 1001, 630],
      centroid: [500, 314.5],
      neighbors: [],
    },
  ],
};

export default layer;

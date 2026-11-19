/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Gibraltar (country-gi): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-gi.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-gi";
 * console.log(layer.map, layer.features.length);
 * // country-gi 3
 * ```
 */
const layer: ChizuFeatureLayer = {
  map: "country-gi",
  source:
    "Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-gi; names from Natural Earth and Wikidata",
  features: [
    {
      code: "Q199408",
      kind: "sea",
      group: "marine",
      name: "Alboran Sea",
      nameJa: "アルボラン海",
      reading: "あるぼらんかい",
      rank: 7,
      path: "M-1,-1L518,-1L518,1001L-1,1001Z",
      bbox: [-1, -1, 518, 1001],
      centroid: [258.5, 500],
      neighbors: [],
    },
    {
      code: "ne-1159105973",
      kind: "peak",
      group: "peaks",
      name: "Rock of Gibraltar",
      nameJa: "ジブラルタルの岩",
      rank: 9,
      elevation: 426,
      path: "",
      bbox: [485, 360.3, 485, 360.3],
      centroid: [485, 360.3],
      neighbors: [],
    },
    {
      code: "capital-GI",
      kind: "capital",
      group: "capitals",
      name: "Gibraltar",
      nameJa: "ジブラルタル",
      reading: "ジブラルタル",
      rank: 0,
      path: "",
      bbox: [221.2, 36.6, 221.2, 36.6],
      centroid: [221.2, 36.6],
      neighbors: [],
    },
  ],
};

export default layer;

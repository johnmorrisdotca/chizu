/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Réunion (country-re): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-re.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-re";
 * console.log(layer.map, layer.features.length);
 * // country-re 3
 * ```
 */
const layer: ChizuFeatureLayer = {
  map: "country-re",
  source:
    "Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-re; names from Natural Earth and Wikidata",
  features: [
    {
      code: "Q1239",
      kind: "ocean",
      group: "marine",
      name: "Indian Ocean",
      nameJa: "インド洋",
      reading: "いんどよう",
      rank: 0,
      path: "M-1,-1L1001,-1L1001,869L-1,869ZM590.2,31.3L357.7,6.1L136.2,73L38.8,240.9L12.1,336.5L135.3,606.8L218.6,702.2L528.6,846.3L684.8,865.3L909.1,814.2L948.7,709.6L975.2,472.6L817.3,273.1L693.8,76.4Z",
      bbox: [-1, -1, 1001, 869],
      centroid: [874.1, 126.4],
      neighbors: [],
    },
    {
      code: "Q1545452",
      kind: "peak",
      group: "peaks",
      name: "Piton des Neiges",
      nameJa: "ピトン・デ・ネージュ",
      reading: "ピトンデネージュ",
      rank: 6,
      elevation: 3069,
      path: "",
      bbox: [416.5, 414, 416.5, 414],
      centroid: [416.5, 414],
      neighbors: [],
    },
    {
      code: "capital-RE",
      kind: "capital",
      group: "capitals",
      name: "Saint-Denis",
      nameJa: "サン＝ドニ",
      reading: "サンドニ",
      rank: 0,
      path: "",
      bbox: [357, 31.7, 357, 31.7],
      centroid: [357, 31.7],
      neighbors: [],
    },
  ],
};

export default layer;

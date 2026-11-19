/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Caribbean Netherlands (country-bq): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-bq.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-bq";
 * console.log(layer.map, layer.features.length);
 * // country-bq 2
 * ```
 */
const layer: ChizuFeatureLayer = {
  map: "country-bq",
  source:
    "Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-bq; names from Natural Earth and Wikidata",
  features: [
    {
      code: "Q1301834",
      kind: "peak",
      group: "peaks",
      name: "Mount Scenery",
      nameJa: "シーナリー山",
      reading: "しーなりーさん",
      rank: 9,
      elevation: 870,
      path: "",
      bbox: [873.9, 3, 873.9, 3],
      centroid: [873.9, 3],
      neighbors: [],
    },
    {
      code: "capital-BQ",
      kind: "capital",
      group: "capitals",
      name: "Kralendijk",
      nameJa: "クラレンダイク",
      reading: "クラレンダイク",
      rank: 0,
      path: "",
      bbox: [23.7, 977.4, 23.7, 977.4],
      centroid: [23.7, 977.4],
      neighbors: [],
    },
  ],
};

export default layer;

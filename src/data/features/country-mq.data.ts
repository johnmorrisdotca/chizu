/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Martinique (country-mq): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-mq.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-mq";
 * console.log(layer.map, layer.features.length);
 * // country-mq 3
 * ```
 */
const layer: ChizuFeatureLayer = {
  map: "country-mq",
  source:
    "Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-mq; names from Natural Earth and Wikidata",
  features: [
    {
      code: "Q1247",
      kind: "sea",
      group: "marine",
      name: "Caribbean Sea",
      nameJa: "カリブ海",
      reading: "かりぶかい",
      rank: 1,
      path: "M-1,-1L865,-1L865,1001L-1,1001ZM18.8,154.2L180.2,479.4L256.6,544.9L448.9,586.8L285,740.2L288.2,783.1L340.6,874.6L679.5,859.9L757.1,961.4L809.6,937.7L830.3,815.7L740.5,561.8L701.1,495.2L608.3,407.3L639.9,302.2L622.4,259.4L570,257.1L416.1,108.1L208.8,3.1L98.6,10.9L32,60.5Z",
      bbox: [-1, -1, 865, 1001],
      centroid: [152.9, 660.3],
      neighbors: [],
    },
    {
      code: "Q76309",
      kind: "peak",
      group: "peaks",
      name: "Mount Pelée",
      nameJa: "プレー山",
      reading: "ぷれーさん",
      rank: 9,
      elevation: 1397,
      path: "",
      bbox: [114.3, 121.1, 114.3, 121.1],
      centroid: [114.3, 121.1],
      neighbors: [],
    },
    {
      code: "capital-MQ",
      kind: "capital",
      group: "capitals",
      name: "Fort-de-France",
      nameJa: "フォール＝ド＝フランス",
      reading: "フォールドフランス",
      rank: 0,
      path: "",
      bbox: [327.4, 590.7, 327.4, 590.7],
      centroid: [327.4, 590.7],
      neighbors: [],
    },
  ],
};

export default layer;

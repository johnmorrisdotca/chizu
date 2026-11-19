/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Mayotte (country-yt): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-yt.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-yt";
 * console.log(layer.map, layer.features.length);
 * // country-yt 3
 * ```
 */
const layer: ChizuFeatureLayer = {
  map: "country-yt",
  source:
    "Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-yt; names from Natural Earth and Wikidata",
  features: [
    {
      code: "Q165100",
      kind: "channel",
      group: "marine",
      name: "Mozambique Channel",
      nameJa: "モザンビーク海峡",
      reading: "もざんびーくかいきょう",
      rank: 2,
      path: "M-1,-1L709,-1L709,1001L-1,1001ZM129.3,910.8L213.9,988.2L393.2,963.6L390.3,797.9L473.3,587.4L461.2,517.8L515.7,307.4L331.4,192.8L263.6,180.4L142.7,16.5L0.9,158.9L145.9,406.4L130.9,548.7L76.6,726.8Z",
      bbox: [-1, -1, 709, 1001],
      centroid: [549.5, 826.9],
      neighbors: [],
    },
    {
      code: "Q210180",
      kind: "peak",
      group: "peaks",
      name: "Benara",
      nameJa: "ベナラ山",
      reading: "べならさん",
      rank: 9,
      elevation: 660,
      path: "",
      bbox: [278.2, 914.7, 278.2, 914.7],
      centroid: [278.2, 914.7],
      neighbors: [],
    },
    {
      code: "capital-YT",
      kind: "capital",
      group: "capitals",
      name: "Mamoudzou",
      nameJa: "マムズ",
      reading: "マムズ",
      rank: 0,
      path: "",
      bbox: [534.9, 388.3, 534.9, 388.3],
      centroid: [534.9, 388.3],
      neighbors: [],
    },
  ],
};

export default layer;

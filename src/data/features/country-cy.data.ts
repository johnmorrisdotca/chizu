/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Cyprus (country-cy): 1 seas, 0 lakes, 0 rivers, 0 landforms, 2 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-cy.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-cy";
 * console.log(layer.map, layer.features.length);
 * // country-cy 4
 * ```
 */
const layer: ChizuFeatureLayer = {
  map: "country-cy",
  source:
    "Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-cy; names from Natural Earth and Wikidata",
  features: [
    {
      code: "Q4918",
      kind: "sea",
      group: "marine",
      name: "Mediterranean Sea",
      nameJa: "地中海",
      reading: "ちちゅうかい",
      rank: 1,
      path: "M325.4,569L325.5,562.1L341.9,542L364.9,531.1L391.4,529.7L443.6,519.4L495.1,501.7L538.3,472.2L618.3,385.4L644,383.6L671.5,387.3L721,383.9L770,374.6L758.3,344.5L718.1,294.7L707.8,262L722.1,214.3L945.1,52.9L984.7,16L922.6,34.1L863.1,66.1L828.8,79.3L773.8,117.9L577.6,182.4L513.5,192.4L448.4,189.4L368.8,180.4L290.5,163.5L283.7,222.8L263.4,274.2L217,285.2L165.1,272.7L123.4,286.7L88.1,321.1L51.5,342.1L12.7,324.4L19.2,393.1L60.2,486L75.4,511.9L99.9,524.1L181.2,554.9L206.1,555.8L257,549.1L277.4,562.6L279.8,569L-1,569L-1,-1L1001,-1L1001,569Z",
      bbox: [-1, -1, 1001, 569],
      centroid: [137, 137],
      neighbors: [],
    },
    {
      code: "Q819979",
      kind: "peak",
      group: "peaks",
      name: "Mount Olympus",
      nameJa: "オリンポス山",
      reading: "おりんぽすさん",
      rank: 7,
      elevation: 1951,
      path: "",
      bbox: [260.8, 387.9, 260.8, 387.9],
      centroid: [260.8, 387.9],
      neighbors: [],
    },
    {
      code: "Q6578056",
      kind: "peak",
      group: "peaks",
      name: "Kyparissovouno",
      nameJa: "セルヴィリ山",
      reading: "せるゔぃりさん",
      rank: 9,
      elevation: 1023,
      path: "",
      bbox: [388.9, 200.7, 388.9, 200.7],
      centroid: [388.9, 200.7],
      neighbors: [],
    },
    {
      code: "capital-CY",
      kind: "capital",
      group: "capitals",
      name: "Nicosia",
      nameJa: "ニコシア",
      reading: "ニコシア",
      rank: 0,
      path: "",
      bbox: [475.3, 280.1, 475.3, 280.1],
      centroid: [475.3, 280.1],
      neighbors: [],
    },
  ],
};

export default layer;

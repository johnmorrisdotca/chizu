/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of French Southern Territories (country-tf): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-tf.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-tf";
 * console.log(layer.map, layer.features.length);
 * // country-tf 3
 * ```
 */
const layer: ChizuFeatureLayer = {
  map: "country-tf",
  source:
    "Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-tf; names from Natural Earth and Wikidata",
  features: [
    {
      code: "Q1239",
      kind: "ocean",
      group: "marine",
      name: "Indian Ocean",
      nameJa: "インド洋",
      reading: "いんどよう",
      rank: 0,
      path: "M-1,-1L1001,-1L1001,899L-1,899ZM112.4,881.2L141.8,888.8L202.1,884.6L248.8,843.6L282.2,748L343.4,757.7L382.9,773.6L445.9,815.5L514.1,841.9L548.8,835L581.4,803.8L610.4,813L621.3,837.3L668,872.1L746.4,887.9L771.1,884.8L813.2,854.3L818,826.3L839.6,804.7L864.3,791.4L834.5,749.9L793.3,733.1L746.7,739.3L741,794.8L702.6,788.8L636.8,759.2L598.8,717L583.1,683.7L588.8,670.5L618.2,676.4L640,662.9L660.7,638.7L667.9,607.1L707,604.4L794.4,603.9L831,626.4L860.8,667.9L881.3,676.4L905.4,675.8L918.5,657.9L907.9,622.3L956.5,593.7L983.5,545.5L993.6,495.9L981.7,445.5L958.5,404L919.1,385.8L875.2,383.3L857.2,397.1L817.7,442.4L742.8,442.5L703.4,460.8L637.2,508.1L594.7,528.5L541.8,541.6L513.6,542.3L478.6,534.5L409,476.8L424.8,432L494.1,435.7L530.7,426.7L501.7,391.3L504.7,313.1L475,315.5L362.6,418.1L337.9,425.6L296.9,421.2L229.1,399.7L218.9,350L252.6,287.6L254.9,258L271.2,227.9L263.8,153.8L237.7,143.6L248.5,121.4L242.3,86.4L230,68.8L201.7,72.7L179.3,98.4L149.9,162.4L115.4,219.4L118.4,279.5L98.3,333.2L85.1,388.5L95.9,417.6L109.6,442.1L128.5,446.9L143.7,464.9L108.4,486.6L101.1,517.1L123.2,558.9L111.9,612.1L134.1,641.9L139.8,682.2L128.1,725.5L109.2,764.8L100,803.6L96.1,843.5Z",
      bbox: [-1, -1, 1001, 899],
      centroid: [710.9, 222.2],
      neighbors: [],
    },
    {
      code: "Q1945447",
      kind: "peak",
      group: "peaks",
      name: "Mont Ross",
      nameJa: "ロス山",
      reading: "ろすさん",
      rank: 6,
      elevation: 1850,
      path: "",
      bbox: [463.4, 785.4, 463.4, 785.4],
      centroid: [463.4, 785.4],
      neighbors: [],
    },
    {
      code: "capital-TF",
      kind: "capital",
      group: "capitals",
      name: "Port-aux-Français",
      nameJa: "ポルトーフランセ",
      reading: "ポルトーフランセ",
      rank: 0,
      path: "",
      bbox: [822, 609.5, 822, 609.5],
      centroid: [822, 609.5],
      neighbors: [],
    },
  ],
};

export default layer;

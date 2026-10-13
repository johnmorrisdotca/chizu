/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Tonga (country-to): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-to.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-to";
 * console.log(layer.map, layer.features.length);
 * // country-to 3
 * ```
 */
const layer: ChizuFeatureLayer = {"map":"country-to","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-to; names from Natural Earth and Wikidata","features":[{"code":"Q98","kind":"ocean","group":"marine","name":"Pacific Ocean","nameJa":"太平洋","reading":"たいへいよう","rank":0,"path":"M-1,-1L319,-1L319,1001L-1,1001Z","bbox":[-1,-1,319,1001],"centroid":[159,500],"neighbors":[]},{"code":"Q1520405","kind":"peak","group":"peaks","name":"Kao","nameJa":"カオ島","rank":9,"elevation":1109,"path":"","bbox":[155.5,616.9,155.5,616.9],"centroid":[155.5,616.9],"neighbors":[]},{"code":"capital-TO","kind":"capital","group":"capitals","name":"Nuku'alofa","nameJa":"ヌクアロファ","reading":"ヌクアロファ","rank":0,"path":"","bbox":[138.7,821.1,138.7,821.1],"centroid":[138.7,821.1],"neighbors":[]}]};

export default layer;

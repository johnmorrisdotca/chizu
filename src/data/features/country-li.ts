/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Liechtenstein (country-li): 0 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-li.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-li";
 * console.log(layer.map, layer.features.length);
 * // country-li 1
 * ```
 */
const layer: ChizuFeatureLayer = {"map":"country-li","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-li; names from Natural Earth and Wikidata","features":[{"code":"capital-LI","kind":"capital","group":"capitals","name":"Vaduz","nameJa":"ファドゥーツ","reading":"ファドゥーツ","rank":0,"path":"","bbox":[142.9,583.7,142.9,583.7],"centroid":[142.9,583.7],"neighbors":[]}]};

export default layer;

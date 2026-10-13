/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of St. Kitts & Nevis (country-kn): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-kn.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-kn";
 * console.log(layer.map, layer.features.length);
 * // country-kn 2
 * ```
 */
const layer: ChizuFeatureLayer = {"map":"country-kn","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-kn; names from Natural Earth and Wikidata","features":[{"code":"ne-1159108295","kind":"peak","group":"peaks","name":"Mount Misery","nameJa":"ミザリー山","reading":"みざりーさん","rank":9,"elevation":1156,"path":"","bbox":[164.3,155.9,164.3,155.9],"centroid":[164.3,155.9],"neighbors":[]},{"code":"capital-KN","kind":"capital","group":"capitals","name":"Basseterre","nameJa":"バセテール","reading":"バセテール","rank":0,"path":"","bbox":[396.7,367.5,396.7,367.5],"centroid":[396.7,367.5],"neighbors":[]}]};

export default layer;

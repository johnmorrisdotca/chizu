/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Seychelles (country-sc): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-sc.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-sc";
 * console.log(layer.map, layer.features.length);
 * // country-sc 2
 * ```
 */
const layer: ChizuFeatureLayer = {"map":"country-sc","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-sc; names from Natural Earth and Wikidata","features":[{"code":"Q1579060","kind":"peak","group":"peaks","name":"Morne Seychellois","nameJa":"モルヌ・セシェロワ","reading":"モルヌセシェロワ","rank":9,"elevation":905,"path":"","bbox":[917.2,84.3,917.2,84.3],"centroid":[917.2,84.3],"neighbors":[]},{"code":"capital-SC","kind":"capital","group":"capitals","name":"Victoria","nameJa":"ヴィクトリア","reading":"ヴィクトリア","rank":0,"path":"","bbox":[918.2,83.1,918.2,83.1],"centroid":[918.2,83.1],"neighbors":[]}]};

export default layer;

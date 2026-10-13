/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Turks & Caicos Islands (country-tc): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-tc.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-tc";
 * console.log(layer.map, layer.features.length);
 * // country-tc 2
 * ```
 */
const layer: ChizuFeatureLayer = {"map":"country-tc","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-tc; names from Natural Earth and Wikidata","features":[{"code":"Q3492008","kind":"peak","group":"peaks","name":"Blue Hills","nameJa":"ブルーヒルズ","reading":"ブルーヒルズ","rank":9,"elevation":49,"path":"","bbox":[134.3,126.2,134.3,126.2],"centroid":[134.3,126.2],"neighbors":[]},{"code":"capital-TC","kind":"capital","group":"capitals","name":"Cockburn Town","nameJa":"コックバーンタウン","reading":"コックバーンタウン","rank":0,"path":"","bbox":[991.8,395.6,991.8,395.6],"centroid":[991.8,395.6],"neighbors":[]}]};

export default layer;

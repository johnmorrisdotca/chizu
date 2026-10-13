/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of British Virgin Islands (country-vg): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-vg.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-vg";
 * console.log(layer.map, layer.features.length);
 * // country-vg 2
 * ```
 */
const layer: ChizuFeatureLayer = {"map":"country-vg","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-vg; names from Natural Earth and Wikidata","features":[{"code":"Q6357023","kind":"peak","group":"peaks","name":"Mount Sage","nameJa":"セージ山","reading":"せーじさん","rank":9,"elevation":521,"path":"","bbox":[239.7,690.8,239.7,690.8],"centroid":[239.7,690.8],"neighbors":[]},{"code":"capital-VG","kind":"capital","group":"capitals","name":"Road Town","nameJa":"ロードタウン","reading":"ロードタウン","rank":0,"path":"","bbox":[306.2,663,306.2,663],"centroid":[306.2,663],"neighbors":[]}]};

export default layer;

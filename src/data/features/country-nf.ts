/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Norfolk Island (country-nf): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-nf.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-nf";
 * console.log(layer.map, layer.features.length);
 * // country-nf 2
 * ```
 */
const layer: ChizuFeatureLayer = {"map":"country-nf","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-nf; names from Natural Earth and Wikidata","features":[{"code":"Q1361458","kind":"peak","group":"peaks","name":"Mount Bates","nameJa":"ベイツ山","reading":"べいつさん","rank":9,"elevation":319,"path":"","bbox":[504.7,458.2,504.7,458.2],"centroid":[504.7,458.2],"neighbors":[]},{"code":"capital-NF","kind":"capital","group":"capitals","name":"Kingston","nameJa":"キングストン","reading":"キングストン","rank":0,"path":"","bbox":[613.4,636.3,613.4,636.3],"centroid":[613.4,636.3],"neighbors":[]}]};

export default layer;

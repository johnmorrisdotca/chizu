/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Aruba (country-aw): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-aw.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-aw";
 * console.log(layer.map, layer.features.length);
 * // country-aw 2
 * ```
 */
const layer: ChizuFeatureLayer = {"map":"country-aw","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-aw; names from Natural Earth and Wikidata","features":[{"code":"Q594885","kind":"peak","group":"peaks","name":"Mount Jamanota","nameJa":"ジャマノタ山","reading":"じゃまのたさん","rank":9,"elevation":188,"path":"","bbox":[557.2,662.9,557.2,662.9],"centroid":[557.2,662.9],"neighbors":[]},{"code":"capital-AW","kind":"capital","group":"capitals","name":"Oranjestad","nameJa":"オラニエスタッド","reading":"オラニエスタッド","rank":0,"path":"","bbox":[102,522.9,102,522.9],"centroid":[102,522.9],"neighbors":[]}]};

export default layer;

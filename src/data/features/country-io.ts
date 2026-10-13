/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of British Indian Ocean Territory (country-io): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-io.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-io";
 * console.log(layer.map, layer.features.length);
 * // country-io 2
 * ```
 */
const layer: ChizuFeatureLayer = {"map":"country-io","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-io; names from Natural Earth and Wikidata","features":[{"code":"Q1239","kind":"ocean","group":"marine","name":"Indian Ocean","nameJa":"インド洋","reading":"いんどよう","rank":0,"path":"M-1,-1L557,-1L557,1001L-1,1001Z","bbox":[-1,-1,557,1001],"centroid":[278,500],"neighbors":[]},{"code":"capital-IO","kind":"capital","group":"capitals","name":"Diego Garcia","nameJa":"ディエゴガルシア島","rank":0,"path":"","bbox":[517.8,944.6,517.8,944.6],"centroid":[517.8,944.6],"neighbors":[]}]};

export default layer;

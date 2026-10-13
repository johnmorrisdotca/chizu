/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Palau (country-pw): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

/**
 * Named physical features and capital markers on the canvas of country-pw.
 * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.
 *
 * @example
 * ```ts
 * import layer from "@johnmorrisdotca/chizu/features/country-pw";
 * console.log(layer.map, layer.features.length);
 * // country-pw 3
 * ```
 */
const layer: ChizuFeatureLayer = {"map":"country-pw","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-pw; names from Natural Earth and Wikidata","features":[{"code":"Q159183","kind":"sea","group":"marine","name":"Philippine Sea","nameJa":"フィリピン海","reading":"ふぃりぴんかい","rank":1,"path":"M699,277L-1,734.6L-1,-1L699,-1Z","bbox":[-1,-1,699,734.6],"centroid":[256,256],"neighbors":[]},{"code":"Q1191219","kind":"peak","group":"peaks","name":"Mount Ngerchelchuus","nameJa":"ゲルチェレチュース山","reading":"げるちぇれちゅーすさん","rank":9,"elevation":242,"path":"","bbox":[671.9,98.5,671.9,98.5],"centroid":[671.9,98.5],"neighbors":[]},{"code":"capital-PW","kind":"capital","group":"capitals","name":"Ngerulmud","nameJa":"ンゲルルムッド","reading":"ンゲルルムッド","rank":0,"path":"","bbox":[677.7,116.1,677.7,116.1],"centroid":[677.7,116.1],"neighbors":[]}]};

export default layer;

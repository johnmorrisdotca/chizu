/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Bermuda (country-bm): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-bm","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-bm; names from Natural Earth and Wikidata","features":[{"code":"Q6421145","kind":"peak","group":"peaks","name":"Town Hill","nameJa":"タウン・ヒル","reading":"タウンヒル","rank":9,"elevation":79,"path":"","bbox":[528.8,390.6,528.8,390.6],"centroid":[528.8,390.6],"neighbors":[]}]};

export default layer;

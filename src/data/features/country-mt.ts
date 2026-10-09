/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Malta (country-mt): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-mt","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-mt; names from Natural Earth and Wikidata","features":[{"code":"ne-1159107445","kind":"peak","group":"peaks","name":"Dingli Cliffs","nameJa":"ディングリクリフ","reading":"ディングリクリフ","rank":9,"elevation":253,"path":"","bbox":[563.5,694.9,563.5,694.9],"centroid":[563.5,694.9],"neighbors":[]}]};

export default layer;

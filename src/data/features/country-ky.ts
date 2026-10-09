/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Cayman Islands (country-ky): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-ky","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-ky; names from Natural Earth and Wikidata","features":[{"code":"Q1247","kind":"sea","group":"marine","name":"Caribbean Sea","nameJa":"カリブ海","reading":"かりぶかい","rank":1,"path":"M-1,-1L1001,-1L1001,313L-1,313Z","bbox":[-1,-1,1001,313],"centroid":[500,156],"neighbors":[]}]};

export default layer;

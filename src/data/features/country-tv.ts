/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Tuvalu (country-tv): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-tv","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-tv; names from Natural Earth and Wikidata","features":[{"code":"Q98","kind":"ocean","group":"marine","name":"Pacific Ocean","nameJa":"太平洋","reading":"たいへいよう","rank":0,"path":"M-1,-1L1001,-1L1001,998L-1,998Z","bbox":[-1,-1,1001,998],"centroid":[500,498.5],"neighbors":[]}]};

export default layer;

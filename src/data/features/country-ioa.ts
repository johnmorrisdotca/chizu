/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Indian Ocean Ter. (country-ioa): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-ioa","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-ioa; names from Natural Earth and Wikidata","features":[{"code":"Q1239","kind":"ocean","group":"marine","name":"Indian Ocean","nameJa":"インド洋","reading":"いんどよう","rank":0,"path":"M-1,-1L1001,-1L1001,216L-1,216Z","bbox":[-1,-1,1001,216],"centroid":[500,107.5],"neighbors":[]},{"code":"Q524471","kind":"peak","group":"peaks","name":"Murray Hill","nameJa":"マーレー・ヒル","reading":"マーレーヒル","rank":9,"elevation":356,"path":"","bbox":[988.9,6.3,988.9,6.3],"centroid":[988.9,6.3],"neighbors":[]}]};

export default layer;

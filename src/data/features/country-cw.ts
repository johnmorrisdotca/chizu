/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Curaçao (country-cw): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-cw","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-cw; names from Natural Earth and Wikidata","features":[{"code":"Q1247","kind":"sea","group":"marine","name":"Caribbean Sea","nameJa":"カリブ海","reading":"かりぶかい","rank":1,"path":"M-1,-1L1001,-1L1001,830L-1,830ZM40.9,220.5L408.2,591.6L853.1,819.6L973.2,785.6L796.6,551.4L366.6,379.8L219.7,117.8L123.1,43.8L30,26.2Z","bbox":[-1,-1,1001,830],"centroid":[740.7,253.8],"neighbors":[]}]};

export default layer;

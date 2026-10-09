/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of American Samoa (country-as): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-as","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-as; names from Natural Earth and Wikidata","features":[{"code":"Q98","kind":"ocean","group":"marine","name":"Pacific Ocean","nameJa":"太平洋","reading":"たいへいよう","rank":0,"path":"M-1,-1L815,-1L815,1001L-1,1001Z","bbox":[-1,-1,815,1001],"centroid":[407,500],"neighbors":[]},{"code":"Q1226878","kind":"peak","group":"peaks","name":"Lata Mountain","nameJa":"ラタ山","reading":"らたさん","rank":9,"elevation":966,"path":"","bbox":[447,914.9,447,914.9],"centroid":[447,914.9],"neighbors":[]}]};

export default layer;

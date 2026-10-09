/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Wallis & Futuna (country-wf): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-wf","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-wf; names from Natural Earth and Wikidata","features":[{"code":"Q98","kind":"ocean","group":"marine","name":"Pacific Ocean","nameJa":"太平洋","reading":"たいへいよう","rank":0,"path":"M-1,-1L1001,-1L1001,556L-1,556Z","bbox":[-1,-1,1001,556],"centroid":[500,277.5],"neighbors":[]},{"code":"ne-1159107985","kind":"peak","group":"peaks","name":"Mont Singavi","nameJa":"モン・サンガーヴ山","reading":"もんさんがーゔさん","rank":9,"elevation":762,"path":"","bbox":[14.8,530.5,14.8,530.5],"centroid":[14.8,530.5],"neighbors":[]}]};

export default layer;

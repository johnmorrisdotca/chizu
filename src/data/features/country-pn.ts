/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Pitcairn (country-pn): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-pn","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-pn; names from Natural Earth and Wikidata","features":[{"code":"Q98","kind":"ocean","group":"marine","name":"Pacific Ocean","nameJa":"太平洋","reading":"たいへいよう","rank":0,"path":"M-1,-1L1001,-1L1001,211L-1,211Z","bbox":[-1,-1,1001,211],"centroid":[500,105],"neighbors":[]},{"code":"capital-PN","kind":"capital","group":"capitals","name":"Adamstown","nameJa":"アダムスタウン","reading":"アダムスタウン","rank":0,"path":"","bbox":[112.2,209.1,112.2,209.1],"centroid":[112.2,209.1],"neighbors":[]}]};

export default layer;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of St. Vincent & Grenadines (country-vc): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-vc","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-vc; names from Natural Earth and Wikidata","features":[{"code":"Q1247","kind":"sea","group":"marine","name":"Caribbean Sea","nameJa":"カリブ海","reading":"かりぶかい","rank":1,"path":"M-1,-1L413,-1L413,1001L-1,1001Z","bbox":[-1,-1,413,1001],"centroid":[206,500],"neighbors":[]},{"code":"capital-VC","kind":"capital","group":"capitals","name":"Kingstown","nameJa":"キングスタウン","reading":"キングスタウン","rank":0,"path":"","bbox":[282,277.5,282,277.5],"centroid":[282,277.5],"neighbors":[]}]};

export default layer;

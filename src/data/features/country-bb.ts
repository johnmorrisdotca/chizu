/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Barbados (country-bb): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-bb","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-bb; names from Natural Earth and Wikidata","features":[{"code":"Q1247","kind":"sea","group":"marine","name":"Caribbean Sea","nameJa":"カリブ海","reading":"かりぶかい","rank":1,"path":"M-1,-1L755,-1L755,1001L-1,1001ZM37.8,661.9L141.4,826L438.3,963.1L533.1,894.5L752.6,652.7L552.4,503.1L208.2,91.9L25.7,140.6Z","bbox":[-1,-1,755,1001],"centroid":[555.7,198.3],"neighbors":[]},{"code":"Q1854502","kind":"peak","group":"peaks","name":"Mount Hillaby","nameJa":"ヒラビー山","reading":"ひらびーさん","rank":9,"elevation":340,"path":"","bbox":[246.2,458.3,246.2,458.3],"centroid":[246.2,458.3],"neighbors":[]},{"code":"capital-BB","kind":"capital","group":"capitals","name":"Bridgetown","nameJa":"ブリッジタウン","reading":"ブリッジタウン","rank":0,"path":"","bbox":[113.3,833.6,113.3,833.6],"centroid":[113.3,833.6],"neighbors":[]}]};

export default layer;

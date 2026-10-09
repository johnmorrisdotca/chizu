/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of St. Lucia (country-lc): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-lc","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-lc; names from Natural Earth and Wikidata","features":[{"code":"Q1247","kind":"sea","group":"marine","name":"Caribbean Sea","nameJa":"カリブ海","reading":"かりぶかい","rank":1,"path":"M-1,-1L479,-1L479,1001L-1,1001ZM44.2,827.3L310.7,992.5L447.8,730L468.3,253.2L416.6,46.6L327.5,98.6L199.5,254.5L36.6,494.2L13.2,619.5Z","bbox":[-1,-1,479,1001],"centroid":[130.3,130.3],"neighbors":[]},{"code":"Q1811114","kind":"peak","group":"peaks","name":"Mount Gimie","nameJa":"ジミー山","reading":"じみーさん","rank":9,"elevation":950,"path":"","bbox":[167.4,634.1,167.4,634.1],"centroid":[167.4,634.1],"neighbors":[]},{"code":"capital-LC","kind":"capital","group":"capitals","name":"Castries","nameJa":"カストリーズ","reading":"カストリーズ","rank":0,"path":"","bbox":[216.4,256.5,216.4,256.5],"centroid":[216.4,256.5],"neighbors":[]}]};

export default layer;

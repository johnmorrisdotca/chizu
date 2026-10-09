/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Northern Mariana Islands (country-mp): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-mp","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-mp; names from Natural Earth and Wikidata","features":[{"code":"Q159183","kind":"sea","group":"marine","name":"Philippine Sea","nameJa":"フィリピン海","reading":"ふぃりぴんかい","rank":1,"path":"M71.4,-1L142,141.8L142,926.9L102.8,1001L-1,1001L-1,-1Z","bbox":[-1,-1,142,1001],"centroid":[70.5,500],"neighbors":[]}]};

export default layer;

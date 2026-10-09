/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Micronesia (country-fm): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-fm","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-fm; names from Natural Earth and Wikidata","features":[{"code":"Q159183","kind":"sea","group":"marine","name":"Philippine Sea","nameJa":"フィリピン海","reading":"ふぃりぴんかい","rank":1,"path":"M61,-1L-1,36L-1,-1Z","bbox":[-1,-1,61,36],"centroid":[12.4,12.4],"neighbors":[]},{"code":"ne-1159107639","kind":"peak","group":"peaks","name":"Mount Nanlaud","nameJa":"ンギネニ山","reading":"んぎねにさん","rank":9,"elevation":791,"path":"","bbox":[805.3,127.6,805.3,127.6],"centroid":[805.3,127.6],"neighbors":[]},{"code":"capital-FM","kind":"capital","group":"capitals","name":"Palikir","nameJa":"パリキール","reading":"パリキール","rank":0,"path":"","bbox":[803.6,125.8,803.6,125.8],"centroid":[803.6,125.8],"neighbors":[]}]};

export default layer;

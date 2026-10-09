/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Nauru (country-nr): 0 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-nr","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-nr; names from Natural Earth and Wikidata","features":[{"code":"capital-NR","kind":"capital","group":"capitals","name":"Yaren","nameJa":"ヤレン","reading":"ヤレン","rank":0,"path":"","bbox":[211.7,969.8,211.7,969.8],"centroid":[211.7,969.8],"neighbors":[]}]};

export default layer;

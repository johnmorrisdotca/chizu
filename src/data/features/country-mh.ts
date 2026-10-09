/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Marshall Islands (country-mh): 0 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-mh","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-mh; names from Natural Earth and Wikidata","features":[{"code":"capital-MH","kind":"capital","group":"capitals","name":"Majuro","nameJa":"マジュロ","reading":"マジュロ","rank":0,"path":"","bbox":[597.2,749.2,597.2,749.2],"centroid":[597.2,749.2],"neighbors":[]}]};

export default layer;

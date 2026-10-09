/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of San Marino (country-sm): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-sm","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-sm; names from Natural Earth and Wikidata","features":[{"code":"Q158526","kind":"peak","group":"peaks","name":"Monte Titano","nameJa":"ティターノ山","reading":"てぃたーのさん","rank":9,"elevation":739,"path":"","bbox":[512.1,801.9,512.1,801.9],"centroid":[512.1,801.9],"neighbors":[]},{"code":"capital-SM","kind":"capital","group":"capitals","name":"City of San Marino","nameJa":"サンマリノ市","reading":"さんまりのし","rank":0,"path":"","bbox":[512.2,580.8,512.2,580.8],"centroid":[512.2,580.8],"neighbors":[]}]};

export default layer;

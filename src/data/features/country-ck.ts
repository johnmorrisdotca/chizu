/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Cook Islands (country-ck): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-ck","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-ck; names from Natural Earth and Wikidata","features":[{"code":"Q498069","kind":"peak","group":"peaks","name":"Te Manga","nameJa":"テ・マンガ山","reading":"てまんがさん","rank":9,"elevation":652,"path":"","bbox":[461.7,944.1,461.7,944.1],"centroid":[461.7,944.1],"neighbors":[]},{"code":"capital-CK","kind":"capital","group":"capitals","name":"Avarua","nameJa":"アバルア","reading":"アバルア","rank":0,"path":"","bbox":[463.1,943.9,463.1,943.9],"centroid":[463.1,943.9],"neighbors":[]}]};

export default layer;

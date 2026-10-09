/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Anguilla (country-ai): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-ai","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-ai; names from Natural Earth and Wikidata","features":[{"code":"Q1247","kind":"sea","group":"marine","name":"Caribbean Sea","nameJa":"カリブ海","reading":"かりぶかい","rank":1,"path":"M477.2,-1L1001,185L1001,908L-1,908L-1,-1Z","bbox":[-1,-1,1001,908],"centroid":[446.4,460.6],"neighbors":[]},{"code":"Q3003173","kind":"peak","group":"peaks","name":"Crocus Hill","nameJa":"クロッカス・ヒル","reading":"クロッカスヒル","rank":9,"elevation":65,"path":"","bbox":[732.8,792.7,732.8,792.7],"centroid":[732.8,792.7],"neighbors":[]},{"code":"capital-AI","kind":"capital","group":"capitals","name":"The Valley","nameJa":"ザ・バレー","reading":"ザバレー","rank":0,"path":"","bbox":[752.6,799.9,752.6,799.9],"centroid":[752.6,799.9],"neighbors":[]}]};

export default layer;

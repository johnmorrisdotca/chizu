/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Brunei (country-bn): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-bn","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-bn; names from Natural Earth and Wikidata","features":[{"code":"Q37660","kind":"sea","group":"marine","name":"South China Sea","nameJa":"南シナ海","reading":"みなみしなかい","rank":1,"path":"M1001,92.6L837.6,116L754.5,116.1L769.6,69.7L770,30L731.5,25.7L617.8,81.8L544.8,129.8L475.3,191L400.7,245.1L312.5,292.2L220.8,331.6L131.5,343.2L40.2,341.9L9.9,354.8L-1,366.3L-1,-1L1001,-1Z","bbox":[-1,-1,1001,366.3],"centroid":[168.3,168.3],"neighbors":[]},{"code":"capital-BN","kind":"capital","group":"capitals","name":"Bandar Seri Begawan","nameJa":"バンダルスリブガワン","reading":"バンダルスリブガワン","rank":0,"path":"","bbox":[676.2,101.1,676.2,101.1],"centroid":[676.2,101.1],"neighbors":[]}]};

export default layer;

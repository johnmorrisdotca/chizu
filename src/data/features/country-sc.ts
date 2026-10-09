/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Seychelles (country-sc): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-sc","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-sc; names from Natural Earth and Wikidata","features":[{"code":"Q1579060","kind":"peak","group":"peaks","name":"Morne Seychellois","nameJa":"モルヌ・セシェロワ","reading":"モルヌセシェロワ","rank":9,"elevation":905,"path":"","bbox":[917.2,84.3,917.2,84.3],"centroid":[917.2,84.3],"neighbors":[]}]};

export default layer;

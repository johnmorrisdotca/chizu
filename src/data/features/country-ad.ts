/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Andorra (country-ad): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-ad","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-ad; names from Natural Earth and Wikidata","features":[{"code":"Q62467","kind":"peak","group":"peaks","name":"Coma Pedrosa","nameJa":"コマ・ペドローザ","reading":"コマペドローザ","rank":9,"elevation":2943,"path":"","bbox":[93.4,224,93.4,224],"centroid":[93.4,224],"neighbors":[]}]};

export default layer;

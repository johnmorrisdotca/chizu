/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of St. Barthélemy (country-bl): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-bl","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-bl; names from Natural Earth and Wikidata","features":[{"code":"Q3055081","kind":"peak","group":"peaks","name":"Morne du Vitet","nameJa":"モメ・ドゥ・ヴィティト山","reading":"もめどぅゔぃてぃとさん","rank":9,"elevation":281,"path":"","bbox":[493.1,311.7,493.1,311.7],"centroid":[493.1,311.7],"neighbors":[]}]};

export default layer;

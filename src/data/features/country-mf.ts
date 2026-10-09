/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of St. Martin (country-mf): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-mf","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-mf; names from Natural Earth and Wikidata","features":[{"code":"Q5919800","kind":"peak","group":"peaks","name":"Pic Paradis","nameJa":"ピク・パラディ","reading":"ピクパラディ","rank":9,"elevation":420,"path":"","bbox":[711.2,324.9,711.2,324.9],"centroid":[711.2,324.9],"neighbors":[]}]};

export default layer;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Montserrat (country-ms): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-ms","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-ms; names from Natural Earth and Wikidata","features":[{"code":"Q845239","kind":"peak","group":"peaks","name":"Soufrière Hills","nameJa":"スーフリエール・ヒルズ","reading":"スーフリエールヒルズ","rank":9,"elevation":914,"path":"","bbox":[266.4,666.4,266.4,666.4],"centroid":[266.4,666.4],"neighbors":[]}]};

export default layer;

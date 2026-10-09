/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of U.S. Virgin Islands (country-vi): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-vi","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-vi; names from Natural Earth and Wikidata","features":[{"code":"Q3005470","kind":"peak","group":"peaks","name":"Crown Mountain","nameJa":"クラウン山","reading":"くらうんさん","rank":9,"elevation":473,"path":"","bbox":[96.4,37.8,96.4,37.8],"centroid":[96.4,37.8],"neighbors":[]}]};

export default layer;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of British Virgin Islands (country-vg): 0 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-vg","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-vg; names from Natural Earth and Wikidata","features":[{"code":"Q6357023","kind":"peak","group":"peaks","name":"Mount Sage","nameJa":"セージ山","reading":"せーじさん","rank":9,"elevation":521,"path":"","bbox":[239.7,690.8,239.7,690.8],"centroid":[239.7,690.8],"neighbors":[]}]};

export default layer;

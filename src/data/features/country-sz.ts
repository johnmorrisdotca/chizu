/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Eswatini (country-sz): 0 seas, 0 lakes, 0 rivers, 1 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-sz","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-sz; names from Natural Earth and Wikidata","features":[{"code":"Q1501766","kind":"range","group":"landforms","name":"Lebombo Mountains","nameJa":"レボンボマウンテンズ","reading":"レボンボマウンテンズ","rank":6,"path":"M592.3,1001L571.5,857.9L565.4,238.7L609.2,-1L756,-1L756,1001Z","bbox":[565.4,-1,756,1001],"centroid":[660.7,284.9],"neighbors":[]},{"code":"Q1337951","kind":"peak","group":"peaks","name":"Emlembe","nameJa":"エムルム","reading":"エムルム","rank":9,"elevation":1862,"path":"","bbox":[195.6,116.5,195.6,116.5],"centroid":[195.6,116.5],"neighbors":[]}]};

export default layer;

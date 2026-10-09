/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Dominica (country-dm): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-dm","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-dm; names from Natural Earth and Wikidata","features":[{"code":"Q1247","kind":"sea","group":"marine","name":"Caribbean Sea","nameJa":"カリブ海","reading":"かりぶかい","rank":1,"path":"M-1,-1L536,-1L536,1001L-1,1001ZM17.4,251.3L163.7,541.6L253.4,940.9L462.5,890.7L530.9,602.8L471.7,247.7L376.1,113L68.3,1.5L42.3,70Z","bbox":[-1,-1,536,1001],"centroid":[118.6,882.1],"neighbors":[]},{"code":"Q1638549","kind":"peak","group":"peaks","name":"Morne Diablotins","nameJa":"ディアブロティン山","reading":"でぃあぶろてぃんさん","rank":9,"elevation":1447,"path":"","bbox":[198.2,309.8,198.2,309.8],"centroid":[198.2,309.8],"neighbors":[]}]};

export default layer;

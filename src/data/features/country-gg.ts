/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Guernsey (country-gg): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-gg","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-gg; names from Natural Earth and Wikidata","features":[{"code":"Q34640","kind":"channel","group":"marine","name":"English Channel","nameJa":"イギリス海峡","reading":"いぎりすかいきょう","rank":3,"path":"M-1,-1L1001,-1L1001,984L-1,984Z","bbox":[-1,-1,1001,984],"centroid":[500,491.5],"neighbors":[]}]};

export default layer;

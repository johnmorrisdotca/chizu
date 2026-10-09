/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of British Indian Ocean Territory (country-io): 1 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-io","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-io; names from Natural Earth and Wikidata","features":[{"code":"Q1239","kind":"ocean","group":"marine","name":"Indian Ocean","nameJa":"インド洋","reading":"いんどよう","rank":0,"path":"M-1,-1L557,-1L557,1001L-1,1001Z","bbox":[-1,-1,557,1001],"centroid":[278,500],"neighbors":[]}]};

export default layer;

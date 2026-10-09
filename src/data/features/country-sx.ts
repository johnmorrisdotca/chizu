/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Sint Maarten (country-sx): 0 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-sx","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-sx; names from Natural Earth and Wikidata","features":[{"code":"capital-SX","kind":"capital","group":"capitals","name":"Philipsburg","nameJa":"フィリップスブルフ","reading":"フィリップスブルフ","rank":0,"path":"","bbox":[778.6,437.2,778.6,437.2],"centroid":[778.6,437.2],"neighbors":[]}]};

export default layer;

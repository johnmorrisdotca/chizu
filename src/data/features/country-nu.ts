/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Niue (country-nu): 0 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-nu","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-nu; names from Natural Earth and Wikidata","features":[{"code":"capital-NU","kind":"capital","group":"capitals","name":"Alofi","nameJa":"アロフィ","reading":"アロフィ","rank":0,"path":"","bbox":[160.9,537,160.9,537],"centroid":[160.9,537],"neighbors":[]}]};

export default layer;

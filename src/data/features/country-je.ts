/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Jersey (country-je): 0 seas, 0 lakes, 0 rivers, 1 landforms, 0 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-je","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-je; names from Natural Earth and Wikidata","features":[{"code":"Q560549","kind":"plain","group":"landforms","name":"North European Plain","nameJa":"北ヨーロッパ平野","reading":"きたよーろっぱへいや","rank":1,"path":"M793.5,628L646,521.7L326.3,521.7L25.7,593.7L92.1,4.2L683.4,76.4L955.5,234.1L993.4,564.6L828.5,628Z","bbox":[25.7,4.2,993.4,628],"centroid":[307.1,278.3],"neighbors":[]}]};

export default layer;

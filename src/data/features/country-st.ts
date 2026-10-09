/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of São Tomé & Príncipe (country-st): 2 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-st","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-st; names from Natural Earth and Wikidata","features":[{"code":"Q97","kind":"ocean","group":"marine","name":"Atlantic Ocean","nameJa":"大西洋","reading":"たいせいよう","rank":0,"path":"M-1,877.4L3.9,878.9L21.2,944.3L34.8,974.9L56.9,986.3L56.9,994.8L-1,994.8ZM-1,994.8L311.4,994.8L328.2,1001L-1,1001Z","bbox":[-1,877.4,328.2,1001],"centroid":[16.6,977.1],"neighbors":["Q41430"]},{"code":"Q41430","kind":"gulf","group":"marine","name":"Gulf of Guinea","nameJa":"ギニア湾","reading":"ぎにあわん","rank":2,"path":"M328.2,1001L311.4,994.8L56.9,994.8L56.9,986.3L118.5,942.4L172.2,869.1L171.8,820.1L134.6,773.1L98,775.6L37.3,811.3L9.5,847.3L3.9,878.9L-1,877.4L-1,-1L598,-1L598,1001Z","bbox":[-1,-1,598,1001],"centroid":[298.5,500],"neighbors":["Q97"]},{"code":"Q1471391","kind":"peak","group":"peaks","name":"Pico de São Tomé","nameJa":"サントメ山","reading":"さんとめさん","rank":6,"elevation":2024,"path":"","bbox":[55.3,846.1,55.3,846.1],"centroid":[55.3,846.1],"neighbors":[]},{"code":"capital-ST","kind":"capital","group":"capitals","name":"São Tomé","nameJa":"サントメ","reading":"サントメ","rank":0,"path":"","bbox":[160.1,811.5,160.1,811.5],"centroid":[160.1,811.5],"neighbors":[]}]};

export default layer;

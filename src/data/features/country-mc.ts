/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Monaco (country-mc): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-mc","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-mc; names from Natural Earth and Wikidata","features":[{"code":"Q4918","kind":"sea","group":"marine","name":"Mediterranean Sea","nameJa":"地中海","reading":"ちちゅうかい","rank":1,"path":"M-1,685.5L1001,261.6L1001,880L-1,880Z","bbox":[-1,261.6,1001,880],"centroid":[753.9,632.4],"neighbors":[]},{"code":"Q1517182","kind":"peak","group":"peaks","name":"Mont Agel","nameJa":"アジェル山","reading":"あじぇるさん","rank":9,"elevation":140,"path":"","bbox":[536.2,339.5,536.2,339.5],"centroid":[536.2,339.5],"neighbors":[]},{"code":"capital-MC","kind":"capital","group":"capitals","name":"Monaco","nameJa":"モナコ","reading":"モナコ","rank":0,"path":"","bbox":[756.7,646.7,756.7,646.7],"centroid":[756.7,646.7],"neighbors":[]}]};

export default layer;

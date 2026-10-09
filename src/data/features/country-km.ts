/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Comoros (country-km): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-km","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-km; names from Natural Earth and Wikidata","features":[{"code":"Q165100","kind":"channel","group":"marine","name":"Mozambique Channel","nameJa":"モザンビーク海峡","reading":"もざんびーくかいきょう","rank":2,"path":"M-1,-1L1001,-1L1001,794L-1,794ZM907.8,590.2L886.3,625.5L852.2,631.2L820.4,624.9L765.4,629.8L885,692.9L947.5,757.7L981.6,774.2L997.7,748.8L998.4,667.8L960.5,560.3L941.6,552.5L911.8,569.2ZM108.2,385.7L177.9,430L192.4,419.7L211.6,389.2L178.6,304.1L126.5,196.5L136.5,36.9L97.3,5.7L65,10.3L51,23.4L32,55.1L10.3,303.5L68.8,375.4Z","bbox":[-1,-1,1001,794],"centroid":[559.5,348.4],"neighbors":[]},{"code":"ne-1159106927","kind":"peak","group":"peaks","name":"Kartala","nameJa":"カルタラ山","reading":"かるたらさん","rank":9,"elevation":2361,"path":"","bbox":[119.3,302.1,119.3,302.1],"centroid":[119.3,302.1],"neighbors":[]},{"code":"capital-KM","kind":"capital","group":"capitals","name":"Moroni","nameJa":"モロニ","reading":"モロニ","rank":0,"path":"","bbox":[27.9,263.3,27.9,263.3],"centroid":[27.9,263.3],"neighbors":[]}]};

export default layer;

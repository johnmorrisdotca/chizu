/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Grenada (country-gd): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-gd","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-gd; names from Natural Earth and Wikidata","features":[{"code":"Q1247","kind":"sea","group":"marine","name":"Caribbean Sea","nameJa":"カリブ海","reading":"かりぶかい","rank":1,"path":"M-1,-1L685,-1L685,1001L-1,1001Z","bbox":[-1,-1,685,1001],"centroid":[342,500],"neighbors":[]},{"code":"Q525281","kind":"peak","group":"peaks","name":"Mount Saint Catherine","nameJa":"セント・キャサリン山","reading":"せんときゃさりんさん","rank":9,"elevation":840,"path":"","bbox":[211.1,695.6,211.1,695.6],"centroid":[211.1,695.6],"neighbors":[]},{"code":"capital-GD","kind":"capital","group":"capitals","name":"St. George's","nameJa":"セントジョージズ","reading":"セントジョージズ","rank":0,"path":"","bbox":[75.2,910.5,75.2,910.5],"centroid":[75.2,910.5],"neighbors":[]}]};

export default layer;

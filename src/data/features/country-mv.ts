/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Maldives (country-mv): 3 seas, 0 lakes, 0 rivers, 0 landforms, 0 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-mv","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-mv; names from Natural Earth and Wikidata","features":[{"code":"Q1239","kind":"ocean","group":"marine","name":"Indian Ocean","nameJa":"インド洋","reading":"いんどよう","rank":0,"path":"M-1,969L55.7,999L137,921.3L137,1001L-1,1001Z","bbox":[-1,921.3,137,1001],"centroid":[113.1,977.2],"neighbors":["Q544914","Q58705"]},{"code":"Q58705","kind":"sea","group":"marine","name":"Arabian Sea","nameJa":"アラビア海","reading":"あらびあかい","rank":1,"path":"M-1,838.5L55.7,999L-1,969Z","bbox":[-1,838.5,55.7,999],"centroid":[19.3,956.7],"neighbors":["Q1239","Q544914"]},{"code":"Q544914","kind":"sea","group":"marine","name":"Laccadive Sea","nameJa":"ラッカディブ海","reading":"らっかでぃぶかい","rank":2,"path":"M137,921.3L55.7,999L-1,838.5L-1,-1L137,-1Z","bbox":[-1,-1,137,999],"centroid":[68,499],"neighbors":["Q1239","Q58705"]},{"code":"capital-MV","kind":"capital","group":"capitals","name":"Malé","nameJa":"マレ","reading":"マレ","rank":0,"path":"","bbox":[105.3,376.8,105.3,376.8],"centroid":[105.3,376.8],"neighbors":[]}]};

export default layer;

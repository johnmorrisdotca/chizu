/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Isle of Man (country-im): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-im","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-im; names from Natural Earth and Wikidata","features":[{"code":"Q41735","kind":"sea","group":"marine","name":"Irish Sea","nameJa":"アイリッシュ海","reading":"あいりっしゅかい","rank":2,"path":"M-1,-1L774,-1L774,1001L-1,1001ZM285.2,995.3L612.2,645.9L643.6,534.9L731.2,413.4L667.3,73.1L637.4,43.9L590.7,32.3L455.5,117.2L284.9,419.6L149,536.2L73,828.2L8.3,955.2L39.9,965.5L152.3,932.3Z","bbox":[-1,-1,774,1001],"centroid":[192.8,192.8],"neighbors":[]},{"code":"Q147557","kind":"peak","group":"peaks","name":"Snaefell","nameJa":"スネーフェル","reading":"スネーフェル","rank":9,"elevation":621,"path":"","bbox":[534.4,439.1,534.4,439.1],"centroid":[534.4,439.1],"neighbors":[]},{"code":"capital-IM","kind":"capital","group":"capitals","name":"Douglas","nameJa":"ダグラス","reading":"ダグラス","rank":0,"path":"","bbox":[502.4,743.1,502.4,743.1],"centroid":[502.4,743.1],"neighbors":[]}]};

export default layer;

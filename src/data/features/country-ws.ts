/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Samoa (country-ws): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-ws","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-ws; names from Natural Earth and Wikidata","features":[{"code":"Q98","kind":"ocean","group":"marine","name":"Pacific Ocean","nameJa":"太平洋","reading":"たいへいよう","rank":0,"path":"M-1,-1L1001,-1L1001,453L-1,453ZM683.6,413.1L784.1,447.6L987.7,447.7L991.3,429.1L982.4,394.6L948.6,373.5L905.4,368.1L876.8,319.4L687.7,263.6L593.7,276.8L548.4,301.9L561.4,340L647.8,412.6ZM202.2,15.3L84.1,47.1L3,42L28.7,89.3L92.2,139.8L184.1,251.9L222.3,258.3L336.3,238.7L415,261.4L450.9,169.8L417.7,73.8L334.2,1.7Z","bbox":[-1,-1,1001,453],"centroid":[846.7,151.5],"neighbors":[]},{"code":"Q1147814","kind":"peak","group":"peaks","name":"Silisili","nameJa":"シリシリ山","reading":"しりしりさん","rank":9,"elevation":1858,"path":"","bbox":[217.9,112.8,217.9,112.8],"centroid":[217.9,112.8],"neighbors":[]}]};

export default layer;

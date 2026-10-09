/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Puerto Rico (country-pr): 2 seas, 0 lakes, 0 rivers, 0 landforms, 2 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-pr","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-pr; names from Natural Earth and Wikidata","features":[{"code":"Q97","kind":"ocean","group":"marine","name":"Atlantic Ocean","nameJa":"大西洋","reading":"たいせいよう","rank":0,"path":"M1001,25.2L865,48.6L857.4,55L810.2,47.2L764.4,31L693.4,21.3L685.2,21.3L694.2,37.2L683,38.4L671.6,30.8L662.8,20.7L649.6,18.6L418.2,12.2L326.8,0.4L307,3L290.1,9.1L285.1,33.9L280.2,39.3L276.3,35.1L9.3,-1L1001,-1Z","bbox":[9.3,-1,1001,55],"centroid":[848.4,26.1],"neighbors":["Q1247"]},{"code":"Q1247","kind":"sea","group":"marine","name":"Caribbean Sea","nameJa":"カリブ海","reading":"かりぶかい","rank":1,"path":"M9.3,-1L276.3,35.1L280.2,39.3L269.5,50.4L250.8,61.5L260,78.7L272.9,93.5L284.6,116.7L283.7,144.6L275.2,206.4L295.2,217.2L343.2,217L362.7,222.6L385.5,225L408.5,222.1L433,209.9L497.5,213.3L530.1,209.8L568.1,224.1L599,218.7L613.8,224.3L628.9,225.3L669.6,224.4L731,214.5L781.6,181.9L800.8,153.9L824.3,131.3L860.5,109.2L857.4,55L865,48.6L1001,25.2L1001,236L-1,236L-1,-1Z","bbox":[-1,-1,1001,236],"centroid":[110.1,124.9],"neighbors":["Q97"]},{"code":"Q3721036","kind":"peak","group":"peaks","name":"El Yunque","nameJa":"ピコエルユンケ","reading":"ピコエルユンケ","rank":6,"elevation":1055,"path":"","bbox":[793.9,82.9,793.9,82.9],"centroid":[793.9,82.9],"neighbors":[]},{"code":"Q2714342","kind":"peak","group":"peaks","name":"Cerro de Punta","nameJa":"プンタ山","reading":"ぷんたさん","rank":9,"elevation":1338,"path":"","bbox":[500.7,138.3,500.7,138.3],"centroid":[500.7,138.3],"neighbors":[]}]};

export default layer;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Hong Kong (country-hk): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-hk","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-hk; names from Natural Earth and Wikidata","features":[{"code":"Q37660","kind":"sea","group":"marine","name":"South China Sea","nameJa":"南シナ海","reading":"みなみしなかい","rank":1,"path":"M87.6,-1L167.4,63.1L316.4,99.8L300.5,153.5L105.4,259.8L116.5,321.7L177.4,381.6L347.2,360.4L534.8,413.2L763.7,514.6L799.4,457.7L804,364.4L882.7,321.7L864.7,242.7L793.5,204.2L804.6,123L760.6,43.9L819.5,-1L1001,-1L1001,743L-1,743L-1,-1Z","bbox":[-1,-1,1001,743],"centroid":[327.4,554.1],"neighbors":[]},{"code":"Q1481864","kind":"peak","group":"peaks","name":"Tai Mo Shan","nameJa":"大帽山","rank":9,"elevation":957,"path":"","bbox":[501.6,295.1,501.6,295.1],"centroid":[501.6,295.1],"neighbors":[]}]};

export default layer;

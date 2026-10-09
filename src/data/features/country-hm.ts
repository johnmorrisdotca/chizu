/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Heard & McDonald Islands (country-hm): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-hm","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-hm; names from Natural Earth and Wikidata","features":[{"code":"Q1239","kind":"ocean","group":"marine","name":"Indian Ocean","nameJa":"インド洋","reading":"いんどよう","rank":0,"path":"M1001,422.8L859.6,374.4L607.5,189L264.6,109.7L119.9,13.8L26.2,41.5L30.9,79.7L86.3,172.8L174.6,196.9L308.3,534.3L398.3,642.7L611.5,642.8L817.9,507.2L970.2,486.4L1001,466.3L1001,667L-1,667L-1,-1L1001,-1Z","bbox":[-1,-1,1001,667],"centroid":[839.2,160.8],"neighbors":[]},{"code":"ne-1159108125","kind":"peak","group":"peaks","name":"Big Ben","nameJa":"ビッグ・ベン山塊","rank":9,"elevation":2745,"path":"","bbox":[493.7,399.2,493.7,399.2],"centroid":[493.7,399.2],"neighbors":[]}]};

export default layer;

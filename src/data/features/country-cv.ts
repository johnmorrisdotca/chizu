/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Cape Verde (country-cv): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-cv","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-cv; names from Natural Earth and Wikidata","features":[{"code":"Q97","kind":"ocean","group":"marine","name":"Atlantic Ocean","nameJa":"大西洋","reading":"たいせいよう","rank":0,"path":"M-1,-1L1001,-1L1001,928L-1,928ZM919.2,466.5L942.9,468.8L983.9,446.4L994.2,419.3L990.1,397.6L968.9,377.5L949,376.1L937.2,378.7L906.3,371.9L907.1,406.1L891.1,446.3ZM584.2,822.1L613.9,867L639.5,881.5L689,884.3L711.7,848.8L677.5,797.8L660.7,789.6L615.5,746.7L613.2,729.2L597.7,724.7L593.6,731.5L595.4,757.5L584.9,787.7ZM380.5,844.4L357.1,837L317.7,859.4L310.1,878.5L319.4,900.4L338.7,915.8L359.1,922.2L388.3,907.5L392.9,879.2ZM19,100.5L34.3,104.5L70.4,96.7L127.1,57.2L141.1,39.7L120.9,8L91.7,1.1L8.8,40.3L7,49.4L14.1,69.7Z","bbox":[-1,-1,1001,928],"centroid":[390.9,390.9],"neighbors":[]},{"code":"ne-1159107871","kind":"peak","group":"peaks","name":"Pico do Fogo","nameJa":"ピコデカノ","reading":"ピコデカノ","rank":6,"elevation":2829,"path":"","bbox":[353,871.7,353,871.7],"centroid":[353,871.7],"neighbors":[]},{"code":"capital-CV","kind":"capital","group":"capitals","name":"Praia","nameJa":"プライア","reading":"プライア","rank":0,"path":"","bbox":[687.1,882.8,687.1,882.8],"centroid":[687.1,882.8],"neighbors":[]}]};

export default layer;

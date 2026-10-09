/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Bahrain (country-bh): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-bh","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-bh; names from Natural Earth and Wikidata","features":[{"code":"Q34675","kind":"gulf","group":"marine","name":"Persian Gulf","nameJa":"ペルシア湾","reading":"ぺるしあわん","rank":1,"path":"M-1,-1L560,-1L560,1001L-1,1001ZM91.3,136.8L138.2,323.9L107.9,454.7L207.4,641.8L246.5,679.2L288.2,571.5L300.9,403.2L290.8,230.4L224.9,126.4L260.5,65.8L233,58.3L113.5,83Z","bbox":[-1,-1,560,1001],"centroid":[372.6,815.3],"neighbors":[]},{"code":"Q1032812","kind":"peak","group":"peaks","name":"Mountain of Smoke","nameJa":"ジャバル・アド・ドゥハーン","reading":"ジャバルアドドゥハーン","rank":9,"elevation":134,"path":"","bbox":[215,349.8,215,349.8],"centroid":[215,349.8],"neighbors":[]}]};

export default layer;

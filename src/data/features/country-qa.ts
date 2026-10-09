/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Qatar (country-qa): 1 seas, 0 lakes, 0 rivers, 1 landforms, 0 peaks.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-qa","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-qa; names from Natural Earth and Wikidata","features":[{"code":"Q34675","kind":"gulf","group":"marine","name":"Persian Gulf","nameJa":"ペルシア湾","reading":"ぺるしあわん","rank":1,"path":"M374.9,1001L373.6,993.1L332.1,997.1L292.1,970.4L365.1,946.8L382.8,932.2L442.6,792.9L472.7,746.5L484.9,691.6L480.8,632L457.8,546.8L434,481L428.5,442L414.4,396.8L437.4,298.5L462.9,236.6L446.3,160.9L359.6,93L288.2,4.4L201.8,49.7L142.9,111.5L86.7,272.4L66.6,341.8L29.4,414.2L6.9,446.8L2,474.9L14.4,613.9L53.2,794.5L47.1,818.3L29,856.3L-1,822.6L-1,-1L490,-1L490,1001Z","bbox":[-1,-1,490,1001],"centroid":[75.7,75.7],"neighbors":[]},{"code":"Q31945","kind":"peninsula","group":"landforms","name":"Arabian Peninsula","nameJa":"アラビア半島","reading":"あらびあはんとう","rank":1,"path":"M-1,822.5L29,856.4L47,818.2L53.2,794.4L45.8,759.9L72.7,697.4L76.6,572.6L70.7,440.6L78.8,331.6L102.9,241L141.2,130.2L167.8,85.4L201.8,49.7L286.5,5.2L290.8,7.3L359.6,93L446.3,160.8L462.9,236.6L437.6,298.5L414.4,396.9L428.5,442.1L433.8,481.2L457.7,546.9L480.8,632.2L485,691.6L472.7,746.6L442.5,792.9L382.9,932.2L365.1,946.7L292.1,970.4L332.2,997.2L373.5,993.1L374.8,1001L-1,1001Z","bbox":[-1,5.2,485,1001],"centroid":[278.1,667.8],"neighbors":[]}]};

export default layer;

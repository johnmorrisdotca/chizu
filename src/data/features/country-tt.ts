/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Trinidad & Tobago (country-tt): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-tt","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-tt; names from Natural Earth and Wikidata","features":[{"code":"Q1247","kind":"sea","group":"marine","name":"Caribbean Sea","nameJa":"カリブ海","reading":"かりぶかい","rank":1,"path":"M330.9,425.1L240.6,436.9L198.5,458.6L209.8,472.1L276.7,497.4L306.4,515.8L321.1,541.5L330.8,588.2L306.2,783.8L285.1,794.9L211.2,801.7L190.5,839.2L16.2,927.8L112,916.5L236.7,931.2L537.6,921.7L652.9,881.1L658.5,856.6L661.9,788.8L684.1,744L649.8,698.5L634.6,629.2L647.8,574.4L637.2,493.6L663.5,459.9L719.8,370.2L605.5,376.1L537.8,396.8L398.3,401.8ZM1001,356.3L771.5,798.3L738.9,948L-1,948L-1,486.9L6.2,484.7L36,441.5L-1,445.7L-1,-1L1001,-1Z","bbox":[-1,-1,1001,948],"centroid":[217.7,217.7],"neighbors":[]},{"code":"Q1056103","kind":"peak","group":"peaks","name":"El Cerro del Aripo","nameJa":"アリポ山","reading":"ありぽさん","rank":9,"elevation":940,"path":"","bbox":[483.6,457.2,483.6,457.2],"centroid":[483.6,457.2],"neighbors":[]},{"code":"capital-TT","kind":"capital","group":"capitals","name":"Port of Spain","nameJa":"ポートオブスペイン","reading":"ポートオブスペイン","rank":0,"path":"","bbox":[291.5,493.3,291.5,493.3],"centroid":[291.5,493.3],"neighbors":[]}]};

export default layer;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * The named features of Jamaica (country-jm): 1 seas, 0 lakes, 0 rivers, 0 landforms, 1 peaks, 1 capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = {"map":"country-jm","source":"Natural Earth 5.1.2 physical vectors, 1:10m, on the canvas of country-jm; names from Natural Earth and Wikidata","features":[{"code":"Q1247","kind":"sea","group":"marine","name":"Caribbean Sea","nameJa":"カリブ海","reading":"かりぶかい","rank":1,"path":"M-1,-1L1001,-1L1001,397L-1,397ZM181.4,27.3L128.5,38.3L72.7,36.5L56.2,46.9L22.4,83.4L16.2,113.6L36.6,146.8L137.4,160.3L150.6,168.7L187.7,229.5L224.9,243.3L239.6,258.7L276.5,311.7L321.1,320.2L415.8,322.1L462.9,333.1L500.2,359L534.6,390.1L555.9,327.5L573.6,310.6L595.6,300.4L611.9,323.1L653.8,325.5L675.8,299L695.3,265.4L722.2,264L743.5,269.5L731.5,281.3L779.7,287.2L799.8,299.9L845.9,316.5L895.8,315.3L948.1,309.4L989.5,293.1L979.4,265.7L925.4,178.7L764.6,128.7L722.5,106.2L669.7,65.1L646.5,59.5L621.6,59L564.1,50.2L508.6,32.9L466.1,28.6L421.9,28.3L229.3,1.3L204.9,11.6Z","bbox":[-1,-1,1001,397],"centroid":[103.9,292.1],"neighbors":[]},{"code":"Q885798","kind":"peak","group":"peaks","name":"Blue Mountain Peak","nameJa":"ブルー・マウンテン峰","rank":6,"elevation":2256,"path":"","bbox":[814.3,222.2,814.3,222.2],"centroid":[814.3,222.2],"neighbors":[]},{"code":"capital-JM","kind":"capital","group":"capitals","name":"Kingston","nameJa":"キングストン","reading":"キングストン","rank":0,"path":"","bbox":[724.4,267.1,724.4,267.1],"centroid":[724.4,267.1],"neighbors":[]}]};

export default layer;

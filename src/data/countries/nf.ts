/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Norfolk Island, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-nf","kind":"country","name":"Norfolk Island","nameJa":"ノーフォーク島","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 893 1000","width":893,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[167.955168,-29.034974],"scale":694347.46,"translate":[456.226,454.208]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"NF","name":"Norfolk Island","nameJa":"ノーフォーク島","group":"Oceania","iso3":"NFK","path":"M763.26,246.56L892.6,341.28L874.42,546.4L772.63,748.55L650.2,834.32L613.99,865.88L591.58,903.34L576.05,948.71L577.78,1000L514.86,825.43L406.24,715.96L292.45,706.1L217.47,834.33L151.96,834.35L129.51,704.17L85.51,581.88L65.64,471.44L108.73,378.72L188.9,266.27L194.92,177.52L131.95,136.11L0,171.65L152.61,0L354.46,45.34L569.23,173.54Z","neighbors":[],"bbox":[0,0,892.6,1000],"centroid":[456.23,454.21]}]};

export default map;

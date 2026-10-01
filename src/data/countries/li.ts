/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Liechtenstein, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-li","kind":"country","name":"Liechtenstein","nameJa":"リヒテンシュタイン","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 452 1000","width":452,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[9.540922,47.138158],"scale":272317.09,"translate":[210.519,592.415]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"LI","name":"Liechtenstein","nameJa":"リヒテンシュタイン","reading":"リヒテンシュタイン","group":"Europe","iso3":"LIE","path":"M146.76,0L176.09,43.48L230.44,93.95L208.76,160.15L223.11,201.9L253.81,243.28L281.52,309.22L278.2,343.12L246.16,414.6L246.5,455.85L342.71,512.8L419.63,620.33L452.5,741.51L430.2,865.07L340.95,978.73L274.36,1000L76.58,966.94L3.64,945.28L0,900.94L37.84,850L87.37,798.94L118.16,735.59L116.52,634.16L89.49,558L54.45,489.46L29.79,410.85L37.58,250.84L93.38,90.61Z","neighbors":["AT","CH"],"bbox":[0,0,452.5,1000],"centroid":[210.52,592.41]}]};

export default map;

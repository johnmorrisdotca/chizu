/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Sint Maarten, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-sx","kind":"country","name":"Sint Maarten","nameJa":"シント・マールテン","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 446","width":1000,"height":446,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-63.070130000000006,18.040633],"scale":594754.6366279662,"translate":[481.19757359120564,223.08151466700252]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"SX","name":"Sint Maarten","nameJa":"シント・マールテン","reading":"シントマールテン","group":"North America","iso3":"SXM","path":"M117.29,0L325.7,37.49L1000,298.18L871.12,446.46L209.6,271.61L66.24,198.09L0,110.21L117.29,27.46Z","neighbors":["MF"],"bbox":[0,0,1000,446.46],"centroid":[481.2,223.08]}]};

export default map;

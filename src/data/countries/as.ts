/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * American Samoa, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-as","kind":"country","name":"American Samoa","nameJa":"米領サモア","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 814 1000","width":814,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-170.398992,-14.255181],"scale":16414.15,"translate":[193.384,917.444]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"AS","name":"American Samoa","nameJa":"米領サモア","reading":"べいりょうさもあ","group":"Oceania","groupJa":"オセアニア","iso3":"ASM","path":"M140.07,920.23L144.17,916.71L146.67,918.43L146.33,921.97L141.97,923.93L125.83,924.79L121.12,926.1L114.38,931.14L103.8,945.66L96.35,951.75L94.45,949.59L83.07,941.82L75.74,938.06L73.4,935.96L85.21,928.81L89.67,927.91L99.31,928.09L103.85,927.26L110.23,919.02L120.51,916.68L132,917.3ZM453.07,908.82L458.56,910.96L459.63,915.16L457.67,918.11L454.06,916.61L451.85,918.98L449.6,920.02L447.16,919.89L444.42,918.53L443.44,921.04L441.8,922.34L439.5,922.66L436.64,922.41L435.91,918.98L434.87,916.07L433.35,913.87L431.17,912.6L435.38,909.54L441.24,908.49ZM813.81,1000L810.64,997.33L813.3,996.24L814.15,996.58ZM394.14,894.76L396.38,893.11L399.15,893.05L402.21,893.99L405.42,895.4L398.59,898.85L395.92,898.49ZM3.85,0.32L3.68,3.07L1.41,4.22L0,2.56L0.25,0Z","neighbors":[],"bbox":[0,0,814.15,1000],"centroid":[193.39,917.44]}]};

export default map;

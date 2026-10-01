/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Indian Ocean Ter., alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-ioa","kind":"country","name":"Indian Ocean Ter.","nameJa":"オーストラリア領インド洋地域","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 215","width":1000,"height":215,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[104.632909,-10.703868],"scale":6589.5774091680305,"translate":[877.6445219805483,31.19176895582325]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"IOA","name":"Indian Ocean Ter.","nameJa":"オーストラリア領インド洋地域","group":"Asia","iso3":"AUS","path":"M4.84,212.54L5.56,213.24L2.88,214.43L1.18,212.43L0.29,209.11L0,206.31L0.77,206.29L0.8,207.41L0.99,208.34L1.64,210.19L1.24,211.45L1.82,212.66L3.12,213.21ZM9.28,214.53L8.16,214.09L7.85,213.74L7.71,213.12L9,213.01L9.99,212.44L10.58,211.44L10.73,210.09L11.31,211.43L11.25,212.75L10.58,213.86ZM998.81,0L1000,0.73L999.76,2.32L999.62,4.5L999.03,7.29L999.02,9.6L998.07,11.29L998.28,14.09L997.68,15.41L995.88,15.54L995.3,13.59L994.6,11.77L994.24,10.07L992.57,9.44L990.19,8.96L987.57,9.07L985.3,9.79L984.95,8.46L986.14,7.74L986.97,5.68L986.37,4.09L986.37,2.63L987.83,3.14L990.09,4.35L993.19,4.47L994.86,2.91L996.67,1.09Z","neighbors":[],"bbox":[0,0,1000,214.53],"centroid":[877.41,31.24]}]};

export default map;

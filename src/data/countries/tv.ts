/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Tuvalu, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-tv","kind":"country","name":"Tuvalu","nameJa":"ツバル","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 997","width":1000,"height":997,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[178.516032,-7.757983],"scale":15273.155395725747,"translate":[634.2302286945728,552.895217539646]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"TV","name":"Tuvalu","nameJa":"ツバル","reading":"ツバル","group":"Oceania","iso3":"TUV","path":"M812.23,762.06L814.55,758.72L815.63,755.9L815.16,753.43L814.05,750.26L813.91,745.92L814.41,740.34L816.25,743.93L816.45,750.44L818.64,753.87L819.17,756.34L817.1,758.83ZM598.47,636.08L596.56,635.82L597.14,632.37L599.16,627.87L601.13,624.49ZM273.65,404.02L273.59,403.41L273.07,402.16L272.98,401.57L273.76,403.39L273.85,404.5L273.65,404.8ZM50.86,166.32L52.14,162.82L53.13,162.71L53.01,164.38ZM323.58,116.96L322.46,115.23L322,114.29L321.74,113.54L324.83,114.16L326.9,115.21L326.82,116.34ZM2.67,4.07L0,0.44L1.23,0L4.02,2.57L6.19,7.76ZM1000,991.04L999.81,996.19L999.59,996.73L999.29,991.35L997.87,987.7L998.56,988ZM989.83,976.04L991.26,977.02L992.59,980.74L992.2,981.32L990.85,977.91L989.72,976.35ZM678.3,481.86L674.39,474.44L673.66,471.88L679.77,477.31L680.5,477.57L681.1,479.87L681.29,482.49L680.58,483.77Z","neighbors":[],"bbox":[0,0,1000,996.73],"centroid":[634.21,552.88]}]};

export default map;

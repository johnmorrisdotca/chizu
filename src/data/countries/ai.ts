/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Anguilla, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-ai","kind":"country","name":"Anguilla","nameJa":"アンギラ","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 907","width":1000,"height":907,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-63.05915600000001,18.23015],"scale":120094.954578278,"translate":[734.3640769540939,778.6180982893042]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"AI","name":"Anguilla","nameJa":"アンギラ","reading":"アンギラ","group":"North America","iso3":"AIA","path":"M837.39,688.75L883.95,681.57L906.55,682.76L906.07,696.57L866.25,764.48L851.02,784.44L829.16,798.95L777.15,814.65L653.99,891.75L648.32,882.87L634.87,873.15L625.47,863.08L579.68,897.52L552.45,906.55L517.92,906.02L569.25,845.66L584.65,833.21L607.66,824.87L658.54,815.67L681.23,804.67L717.2,765.36L742.47,727.91L776.08,699.85ZM1.66,17.66L0,0L10.42,2.58ZM935.27,654.33L950.26,648.64L956.24,637.9L983.81,643.57L1000,653.65L987.42,658.71L961.65,666.3L956.86,673.25L938.29,685.88L931.69,678.94L939.48,668.84ZM350.48,688.66L331.69,681.78L329.4,669.65L347.44,659.57L363.29,667.21L382.33,667.69ZM484.87,699.1L494.84,702.34L486.78,705.16L479.88,704.75L474.51,700.3L469.53,697.47L473.75,696.67L481.03,698.29ZM505.2,706.38L509.03,706.39L511.34,704.37L515.56,704.77L517.08,712.05L510.95,712.85L505.58,711.63Z","neighbors":[],"bbox":[0,0,1000,906.55],"centroid":[734.36,778.62]}]};

export default map;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Guernsey, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-gg","kind":"country","name":"Guernsey","nameJa":"ガーンジー","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 983","width":1000,"height":983,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-2.530789,49.484321],"scale":175854.06,"translate":[284.755,759.989]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"GG","name":"Guernsey","nameJa":"ガーンジー","reading":"ガーンジー","group":"Europe","groupJa":"ヨーロッパ","iso3":"GGY","path":"M186.19,731.48L227.41,713.9L269.99,681.68L309.8,664.2L342.74,691.42L334.63,718.02L302.03,773.35L292.87,839.29L280.45,887.25L280.77,899.36L278.17,907.61L262.41,923.97L242.27,936.82L229.03,935.32L216.77,928.2L200.28,923.94L8.19,923.71L0,915.71L5.39,899.48L21.01,884.15L43.18,879.81L33.84,836.21L46.44,823.12L71.04,822.66L97.58,816.95ZM618.06,874.64L632.88,894.47L636.87,933.05L616.47,963.57L598.8,982.96L589.69,979.36L596.15,959.61L599.53,943.99L593.97,925.15L594.75,909.66L600.42,901.65L605.91,889.28L613.36,878.02ZM991.65,0L999.92,8.08L1000,25.06L965.3,63.82L939.68,79.04L907.9,87.42L889.26,72.76L904.47,39.35L931.77,22.63L951.37,20.42L983.42,1.54ZM438.51,767.4L450.18,761.02L455.41,789.74L439.22,827.97L436.93,815.74L435.77,788.39Z","neighbors":[],"bbox":[0,0,1000,982.96],"centroid":[284.76,759.99]}]};

export default map;

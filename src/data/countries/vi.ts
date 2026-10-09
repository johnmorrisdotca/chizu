/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * U.S. Virgin Islands, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-vi","kind":"country","name":"U.S. Virgin Islands","nameJa":"米領ヴァージン諸島","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 651 1000","width":651,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-64.797514,17.980107],"scale":81401.4,"translate":[328.995,577.596]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"VI","name":"U.S. Virgin Islands","nameJa":"米領ヴァージン諸島","reading":"べいりょうゔぁーじんしょとう","group":"North America","iso3":"VIR","path":"M651.19,902.02L616.29,905.82L587.22,915.39L530.26,941.8L500.86,951.01L222.26,990.99L196.81,1000L206.73,975.67L208.39,955.03L206.99,896.99L211.13,879.07L222.2,867.74L273.28,883.43L302.02,870.25L331.75,851.18L364,843.95L367.36,847.65L419.28,882.78L447.8,892.83L462.23,900.45L474.79,911.89L505.72,886.15L554.32,875.53L607.34,878.37L651.17,892.3ZM459.16,62.03L449.49,66.05L463.99,85.38L455.13,118.38L411.65,95.04L344.03,101.49L323.91,82.98L344.03,52.41L366.57,42.72L390.72,35.47L385.09,25L397.16,18.56L442.25,30.63L463.99,34.65L484.12,43.51L508.28,56.38L513.92,70.88L495.39,74.1ZM229.02,102.32L219.3,116.78L176.61,100.68L161.29,91.02L149.2,66.86L143.54,79.74L130.66,70.88L101.64,76.51L80.68,72.48L64.55,54.75L21.8,67.63L0,46.67L39.97,25.49L73.99,16.68L123.4,18.53L143.64,33.09L155.72,29.07L133.85,12.09L123.38,0L152.39,8.87L202.35,37.89L251.49,66.09L271.58,98.26L256.31,100.69L244.3,96.69Z","neighbors":[],"bbox":[0,0,651.19,1000],"centroid":[329,577.59]}]};

export default map;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Andorra, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-ad","kind":"country","name":"Andorra","nameJa":"アンドラ","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 835","width":1000,"height":835,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[1.560737,42.541315000000004],"scale":216859.2742518488,"translate":[430.3235013651288,408.9520427269001]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"AD","name":"Andorra","nameJa":"アンドラ","reading":"アンドラ","group":"Europe","iso3":"AND","path":"M838.47,554.45L811.99,585.98L780.86,600.6L747.12,601.04L713.93,588.96L706.7,577.23L698.91,574.11L690.55,578.32L680.47,590.17L650.28,692.3L560.85,730.21L384.79,753.22L369.2,771.02L357.07,792.72L339.45,814.23L307.1,832.12L284.29,835.23L115.12,812.48L83.11,788.57L83.18,741.14L2.88,615.04L50.23,593.51L66.1,589.43L121.24,549.71L111.8,489.85L62.86,445.96L0,454.26L9.3,411.25L55.55,331.14L55.86,316.57L32.55,300.68L36.06,264.99L51.68,226.79L64.1,204.02L125.76,178.87L168.82,29.79L256.87,34.46L338.61,3.12L381.19,0L532.29,103.85L562.81,118.21L879.52,149.11L855.48,226.02L900.46,254.49L965.31,274.5L988.86,308.63L1000,324.78L930,331.49L879.1,381.28L848.4,459.96Z","neighbors":["ES","FR"],"bbox":[0,0,1000,835.23],"centroid":[430.32,408.95]}]};

export default map;

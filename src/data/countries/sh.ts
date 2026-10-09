/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * St. Helena, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-sh","kind":"country","name":"St. Helena","nameJa":"セントヘレナ","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 849","width":1000,"height":849,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-5.71736,-15.959097],"scale":428260.41,"translate":[518.623,425.88]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"SH","name":"St. Helena","nameJa":"セントヘレナ","reading":"セントヘレナ","group":"Africa","iso3":"SHN","path":"M486.48,51.05L574.52,36.45L789.5,38.91L883.11,0L947.43,130.19L988.63,242.12L1000,349.79L977.16,459.28L911.04,579.08L830.62,643.55L737.34,692.8L629.16,770.04L612.21,727.46L587.65,704.34L559.59,689.13L530.93,663.58L428.61,767.6L309.34,835.14L185.39,849.15L67.28,793.22L0,696.53L16.93,615.61L65.73,532.88L93.48,433.72L139.36,322.39L247.25,208.01L377.09,112.49Z","neighbors":[],"bbox":[0,0,1000,849.15],"centroid":[518.62,425.88]}]};

export default map;

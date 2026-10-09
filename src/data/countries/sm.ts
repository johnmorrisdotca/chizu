/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * San Marino, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-sm","kind":"country","name":"San Marino","nameJa":"サンマリノ","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 849 1000","width":849,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[12.442216,43.936462],"scale":632981.96,"translate":[450.27,509.429]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"SM","name":"San Marino","nameJa":"サンマリノ","reading":"サンマリノ","group":"Europe","groupJa":"ヨーロッパ","iso3":"SMR","path":"M348.63,1000L110.9,876.61L0,641.05L79.92,377.34L202.42,253.09L284.67,169.62L538.58,38.89L767.8,0L823.72,104.45L849.31,288.83L832.98,479.52L775.51,589.52L768.09,603.73L747.54,627.15L735.22,655.7L731,690.67L737.32,723.95L595.48,964.61Z","neighbors":["IT"],"bbox":[0,0,849.31,1000],"centroid":[450.27,509.43]}]};

export default map;

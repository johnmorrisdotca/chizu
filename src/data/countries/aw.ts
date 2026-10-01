/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Aruba, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-aw","kind":"country","name":"Aruba","nameJa":"アルバ","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 845 1000","width":845,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-69.974184,12.516931],"scale":267144.84325811366,"translate":[401.52605501667466,537.2518423439648]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"AW","name":"Aruba","nameJa":"アルバ","reading":"アルバ","group":"North America","iso3":"ABW","path":"M297.98,254.46L573.54,468.27L626.89,526.5L667.47,630.08L829.43,832.65L844.86,954.64L793.54,1000L699.24,999.46L600.29,961.34L533.77,894.19L626.96,894.18L626.95,862.31L472.63,787.77L158.13,509.24L65.17,470.89L19.61,442.8L0,397.83L9.27,350.59L51.52,270.92L62.27,225.77L44.52,149.88L12.7,83.46L6.05,31.48L62.34,0L251.51,217.46Z","neighbors":[],"bbox":[0,0,844.85,1000],"centroid":[401.53,537.25]}]};

export default map;

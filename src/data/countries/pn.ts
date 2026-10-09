/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Pitcairn Islands, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-pn","kind":"country","name":"Pitcairn Islands","nameJa":"ピトケアン諸島","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 210","width":1000,"height":210,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-128.478192,-24.413611],"scale":10531.11,"translate":[382.156,86.826]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"PN","name":"Pitcairn Islands","nameJa":"ピトケアン諸島","reading":"ぴとけあんしょとう","group":"Oceania","groupJa":"オセアニア","iso3":"PCN","path":"M108.76,208.79L110.4,208.05L111.95,208.03L113.32,208.67L114.46,209.98L112.85,210.36L111.28,210.31L109.89,209.79ZM998.69,141.19L996.85,141.6L998.63,141.08L998.8,141.08L999.62,141.23L999.88,141.74L1000,142.69L999.9,141.98L999.61,141.58L998.82,141.17ZM406.94,70.43L411.38,72.33L413.52,78.03L413.63,84.05L411.96,86.86L408.52,84.46L404.93,79.15L403.58,73.53ZM1.3,0.01L1.95,0L1.84,0.63L1.03,1.56L0.39,1.91L0,0.99L0.37,0.54L0.84,0.56Z","neighbors":[],"bbox":[0,0,1000,210.35],"centroid":[382.15,86.83]}]};

export default map;

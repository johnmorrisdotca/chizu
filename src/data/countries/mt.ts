/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Malta, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-mt","kind":"country","name":"Malta","nameJa":"マルタ","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 884","width":1000,"height":884,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[14.403898000000002,35.920999],"scale":184583.41801068228,"translate":[573.6855672332424,498.31222086390767]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"MT","name":"Malta","nameJa":"マルタ","reading":"マルタ","group":"Europe","iso3":"MLT","path":"M949.85,597.77L989.46,662.2L1000,740.83L986.06,791.72L950.11,771.85L909.57,817.13L896.64,844.28L896.69,884L854.78,867.14L843.29,860.08L753.35,851.24L627.47,811.84L515.25,749.71L467.04,673.27L458.76,663.56L421.8,643.49L413.74,628.14L413.8,528.25L402.41,414.6L387.59,363.46L360.24,330.27L393.36,300.55L426.68,280.12L463.17,268.21L504.33,264.29L504.32,288.15L480.56,292.6L465.28,300.45L431.53,330.32L637.77,354.22L681.07,371.5L768.77,446.83L844.79,473.89L857.98,498.78L860.99,530.9L860.82,563.15L874.84,565.88ZM190.15,0L257.72,25L341.59,79.1L392.21,133.01L360.39,156.19L314.59,157.99L244.58,189.89L198.76,200.05L150.41,196.3L96.79,181.53L45.52,159.27L3.17,131.65L11.31,96.93L1.85,61.78L0,34.51L30.97,23.83Z","neighbors":[],"bbox":[0,0,1000,884],"centroid":[573.69,498.31]}]};

export default map;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Singapore, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-sg","kind":"country","name":"Singapore","nameJa":"シンガポール","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 508","width":1000,"height":508,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[103.813468,1.358922],"scale":157866.95109504714,"translate":[476.7503279111486,247.18650592422134]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"SG","name":"Singapore","nameJa":"シンガポール","reading":"シンガポール","group":"Asia","iso3":"SGP","path":"M882.53,158.52L951.13,174.1L989.24,188.22L1000,205.15L968.17,258.18L921.33,314.57L864.84,359.65L802.97,377.93L735.05,385.44L681.25,406.07L584.85,472.11L568.94,486.91L561.09,496.33L546.75,502.49L511.33,507.87L444.08,506.53L410.9,498.01L396.77,481.53L373.24,443.74L316.08,417.51L247.26,401.47L188.3,395.08L68.59,398.21L19.95,386.33L0,348.21L11.89,304.71L94.16,188.23L106.04,136.1L119.72,106.72L150.66,75.22L187.19,53.02L213.65,48.65L273.72,56.5L335.59,48.65L412.25,12L453.27,0L526.57,4.26L597.17,27.35L804.53,130.94Z","neighbors":[],"bbox":[0,0,1000,507.87],"centroid":[476.75,247.19]}]};

export default map;

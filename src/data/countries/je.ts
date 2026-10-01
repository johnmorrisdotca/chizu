/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Jersey, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-je","kind":"country","name":"Jersey","nameJa":"ジャージー","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 627","width":1000,"height":627,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-2.127417,49.221072],"scale":375395.5581901997,"translate":[490.13086034678435,301.1590841178765]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"JE","name":"Jersey","nameJa":"ジャージー","reading":"ジャージー","group":"Europe","iso3":"JEY","path":"M681.46,44.48L744.84,107.09L946.85,207.91L941.36,271.89L961.25,298.79L984.65,338.75L1000,357.12L962.78,391.57L945.77,433.98L941.32,488.38L941.77,560.88L930.88,626.75L902.47,625.99L864.44,598.04L825.03,581.29L693.28,578.73L620.41,546.25L520.9,444.7L483.8,419.11L445.13,402.31L415.52,402.3L380.85,439.62L347.9,499.86L313.35,581.42L277.11,569.13L223.48,510.44L178.9,491.74L166.69,501.85L79.18,539.08L35.27,540.35L66.12,399.63L37.41,252.16L0,124.68L3.95,44.17L54.25,26.11L114.78,44.32L195.65,89.19L253.59,84.97L297.97,70.61L339.22,43.43L386.39,0L420.13,33.86L513.39,57.33L561.77,89.32L590.82,57.85L617.78,48.25Z","neighbors":[],"bbox":[0,0,1000,626.75],"centroid":[490.13,301.16]}]};

export default map;

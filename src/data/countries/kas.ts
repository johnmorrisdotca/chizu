/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Siachen Glacier, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-kas","kind":"country","name":"Siachen Glacier","nameJa":"シアチェン氷河","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 646","width":1000,"height":646,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[77.179926,35.391169],"scale":68843.40162947708,"translate":[393.07891011801706,308.97649030715246]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"KAS","name":"Siachen Glacier","nameJa":"シアチェン氷河","group":"Asia","iso3":"KAS","path":"M264.36,646.2L131.74,324.11L0,1.85L5.36,2.33L46.13,0L64.07,7.89L77.64,23.21L100.56,56.81L116.07,70.14L134.22,77.95L154.51,82.23L194.2,83.5L234.41,76.43L255.42,75.97L274.1,81.89L286.71,92.83L307.39,120.73L320.11,132.54L355.27,147.71L390.75,150.39L462.4,141.3L492.01,144.5L515.78,156.71L561.43,194.82L592.51,211.65L620.93,214.7L683.21,205.21L718.19,203.55L725.45,204.75L863.53,227.42L891.92,221.75L918.34,206.34L948.24,183.44L960.86,178.84L973.79,177.7L1000,181.83L633.06,414.71Z","neighbors":["CN","IN","PK"],"bbox":[0,0,1000,646.2],"centroid":[393.08,308.98]}]};

export default map;

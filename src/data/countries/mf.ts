/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * St-Martin, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-mf","kind":"country","name":"St-Martin","nameJa":"サン・マルタン","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 686","width":1000,"height":686,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-63.055071,18.077622],"scale":442774.37,"translate":[674.197,344.044]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"MF","name":"St-Martin","nameJa":"サン・マルタン","reading":"サンマルタン","group":"North America","iso3":"MAF","path":"M949.77,685.83L447.8,491.71L292.65,463.79L292.66,426.37L231.67,438.61L119.84,478.19L91.74,484.15L21.8,443.88L0,400.47L23.63,370.61L243.05,366.93L372.79,334.88L463.08,264.15L497.77,138.69L558.14,93.73L695.93,40.91L848.04,1.9L949.05,0L946.99,166.98L997.26,397.14L1000,628.26Z","neighbors":["SX"],"bbox":[0,0,1000,685.83],"centroid":[674.2,344.04]}]};

export default map;

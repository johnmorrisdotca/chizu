/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * St-Barthélemy, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-bl","kind":"country","name":"St-Barthélemy","nameJa":"サン・バルテルミー島","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 655","width":1000,"height":655,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-62.832619,17.905586],"scale":795628.11,"translate":[458.756,327.192]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"BL","name":"St-Barthélemy","nameJa":"サン・バルテルミー島","group":"North America","iso3":"BLM","path":"M376.32,654.92L216.62,537.39L79.53,329.44L0,121.49L16.15,0L131.2,57.09L1000,189.83L903.78,342.42L755.96,511.96L574.75,637.41Z","neighbors":[],"bbox":[0,0,1000,654.92],"centroid":[458.76,327.19]}]};

export default map;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * St. Kitts & Nevis, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-kn","kind":"country","name":"St. Kitts & Nevis","nameJa":"セントクリストファー・ネーヴィス","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 982 1000","width":982,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-62.698454,17.271021],"scale":181717.88,"translate":[492.26,459.416]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"KN","name":"St. Kitts & Nevis","nameJa":"セントクリストファー・ネーヴィス","reading":"セントクリストファーネーヴィス","group":"North America","iso3":"KNA","path":"M792.87,675.24L855.87,676.49L910.61,694.91L952.69,735.92L977.15,805.2L980.75,833.85L982.3,907.4L977.26,935.03L961.75,973.49L949.55,986.93L894.55,1000L753.81,988.59L710.72,872.72L734.09,739.14ZM637.61,476.56L678.91,500.03L715.28,551.9L715.55,604.42L648.01,630.13L609.54,603.81L576.98,484.31L516.96,446.89L477.41,401.98L449.56,391.91L354.19,397.32L315.13,391.89L218.91,352.62L89.1,271.76L0,169.74L24.1,66.91L35.93,56.07L44.06,50.27L53.05,46.8L67.34,43.32L104.3,27.47L117.36,18.19L125.74,0L427.16,181.82L501.31,262.09L553.8,392.17L587.94,451.53Z","neighbors":[],"bbox":[0,0,982.3,1000],"centroid":[492.26,459.42]}]};

export default map;

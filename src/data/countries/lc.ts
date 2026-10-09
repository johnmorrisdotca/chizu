/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * St. Lucia, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-lc","kind":"country","name":"St. Lucia","nameJa":"セントルシア","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 478 1000","width":478,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-60.970328,13.90264],"scale":144242.26,"translate":[264.423,526.779]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"LC","name":"St. Lucia","nameJa":"セントルシア","reading":"セントルシア","group":"North America","groupJa":"北アメリカ大陸","iso3":"LCA","path":"M468.47,256.27L477.85,330.43L477.67,396.4L448.31,590.43L455.4,701.57L425.1,824.81L418.54,842.23L411.18,845.3L380.53,853.91L370.09,860.88L358.75,885.06L336.68,981.25L321.45,995.9L313.89,1000L301.75,1000L256.96,938.74L74.1,867.42L33.12,818.03L25.37,804.81L10.45,788.31L0.91,769.25L17.94,729.82L20.63,704.32L17.97,654.73L14.1,638.55L7.14,625.84L0.98,609.86L0,584.25L6.38,557.62L28.47,510.71L33.25,489.82L46.59,454.79L105.07,369.99L126.96,313.45L186.41,223.42L199.13,213.28L222.99,199.76L235.11,187.67L240.88,172.1L250.42,127.64L260.15,110.23L319.87,24.18L354.44,0L401.63,15.56L390.71,59L407.01,81.53L433.64,96.89L453.32,118.81L460.09,150.15Z","neighbors":[],"bbox":[0,0,477.84,1000],"centroid":[264.42,526.78]}]};

export default map;

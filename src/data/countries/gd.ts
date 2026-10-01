/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Grenada, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-gd","kind":"country","name":"Grenada","nameJa":"グレナダ","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 684 1000","width":684,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-61.656746,12.153327],"scale":108723.08,"translate":[248.286,714.433]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"GD","name":"Grenada","nameJa":"グレナダ","reading":"グレナダ","group":"North America","iso3":"GRD","path":"M329.52,598.49L345.07,630.69L348.4,658.25L341.85,751.53L337.4,764.81L329.25,777.94L316.87,806.97L317.48,821.79L327.9,852.83L323.22,858.7L313.56,863.18L308.12,874.38L305.86,889.2L305.26,904.72L294.99,921.71L215.47,963.56L215.47,949.43L199.61,957.23L187.75,967.88L180.2,982.09L177.4,1000L160.11,996.75L143.42,991.58L127.64,984.39L112.99,975.35L93.8,992.26L62.3,998.89L27.79,997.1L0,989.44L64.36,947.93L76.15,936.43L82.73,908.71L77.37,886.47L68.24,864.62L63.34,838.67L73.33,796.44L111.85,722.02L113.06,689.13L221.01,557.42L259.87,550.47L302.2,556.18L342.35,581.5L341.14,587.37ZM672.04,142.46L639.39,132.76L608.11,141.58L577.21,157.59L545.7,169.65L552.1,158.06L564.52,128.18L570.85,116.59L565.12,115.67L545.67,116.61L548.38,109.04L559.29,90.65L599.33,102.83L623.28,70.07L643.38,25.04L671.92,0L683.86,31.03L680.72,65.55L673.22,103.08Z","neighbors":[],"bbox":[0,0,683.86,1000],"centroid":[248.29,714.43]}]};

export default map;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Niue, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-nu","kind":"country","name":"Niue","nameJa":"ニウエ","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 886 1000","width":886,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-169.869343,-19.048913],"scale":320601.74,"translate":[428.774,474.891]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"NU","name":"Niue","nameJa":"ニウエ","reading":"ニウエ","group":"Oceania","iso3":"NIU","path":"M525.08,5.93L661.8,21.89L676.01,47.85L825.91,465.01L885.89,587.08L812.07,614.82L763.85,659.89L669.36,773.7L449.48,926.67L409.46,905.72L367.3,923.49L272.45,1000L255.88,945.36L213.93,920.78L155.2,917.61L88.52,926.74L105.3,908.51L118.84,888.47L135.61,868.89L164,850.21L139.45,757.32L127.82,732.28L0,689.98L14.37,589.79L127.72,411.24L118.67,379.37L99.5,349.78L84.64,318.37L88.28,277.38L106.57,248.23L127.02,242.76L151.13,240.48L181.91,218.61L288.65,5.93L458.54,0Z","neighbors":[],"bbox":[0,0,885.89,1000],"centroid":[428.77,474.89]}]};

export default map;

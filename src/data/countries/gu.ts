/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Guam, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-gu","kind":"country","name":"Guam","nameJa":"グアム","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 772 1000","width":772,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[144.771881,13.443760999999999],"scale":138697.68897107156,"translate":[347.72501214378474,509.27919336572893]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"GU","name":"Guam","nameJa":"グアム","reading":"グアム","group":"Oceania","iso3":"GUM","path":"M617.14,33.68L641.29,87.45L682.85,117.86L730.15,131.33L771.32,134.35L771.92,162.72L737.88,226.47L665.74,332.7L583.02,408.98L433.42,504.37L374.99,565.64L341.83,665.72L319.98,892.07L262.25,980.32L220.83,998.04L172.5,1000L132.81,986.1L108.67,942.35L76.48,900.68L69,888.66L54.67,796.94L47.2,780.69L35.9,766.5L22.11,755.26L4.86,747.37L29.03,723.06L44.37,698.14L52.44,667.22L54.76,624.28L50.17,604.28L38.3,579.35L24.9,558.17L0,539.53L10.55,521.22L28.95,510.79L38.71,523.6L71.29,520.37L213.48,437.38L246.24,408.03L374.97,332.79L400.06,307.57L421.51,278.41L440.28,243.34L489.65,81.01L504.76,51.75L532.52,25.15L570.79,2.67L603.53,0Z","neighbors":[],"bbox":[0,0,771.92,1000],"centroid":[347.73,509.28]}]};

export default map;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Heard & McDonald Islands, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-hm","kind":"country","name":"Heard & McDonald Islands","nameJa":"ハード島・マクドナルド諸島","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 666","width":1000,"height":666,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[73.50508,-53.088808],"scale":165447.61,"translate":[467.779,366.794]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"HM","name":"Heard & McDonald Islands","nameJa":"ハード島・マクドナルド諸島","reading":"はーどとうまくどなるどしょとう","group":"Antarctica","groupJa":"南極","iso3":"HMD","path":"M866.5,435.56L912.84,454.52L959.92,459.39L1000,453.69L738.91,534.15L648.57,629.86L598.83,652.12L471.68,666.39L412.97,656.77L355.48,610.74L338.55,587.73L292.94,512.83L235.16,371.92L222.65,326.59L235.59,297.2L215.5,280.55L204.3,259.89L205.81,238.27L223.57,218.26L189.32,195.07L161.74,183.15L61.21,173.8L31.04,154.63L10.12,117.58L0,59.34L57.94,39.63L105.66,0L164.99,66.82L175.89,69.61L188.83,100.6L217.62,137.2L246.07,159.7L259.06,148.4L266.34,104.21L284.42,84.44L307.62,89.82L331.27,119.63L307.54,137.52L329.79,183.55L366.97,191.51L407.24,172.68L438.05,137.42L472.26,154.57L570.51,158.84L611.05,187.79L629.97,208.26L668.94,225L689.12,237.96L702.22,257.02L728.96,306.89L742.35,317.02L786.68,371.41L804.81,402.01Z","neighbors":[],"bbox":[0,0,1000,666.39],"centroid":[467.78,366.79]}]};

export default map;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Curaçao, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-cw","kind":"country","name":"Curaçao","nameJa":"キュラソー","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 829","width":1000,"height":829,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-68.97123,12.193814999999999],"scale":135694.1353980021,"translate":[463.83414653466906,468.3473091598893]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"CW","name":"Curaçao","nameJa":"キュラソー","reading":"キュラソー","group":"North America","iso3":"CUW","path":"M904.93,695.58L987.26,779.74L1000,801.5L979.37,815.78L930.28,825.56L872.6,829.35L826.14,825.05L765.05,795.88L644.02,712.95L525.2,677.22L448.68,632.32L380.01,576.42L350.34,525.34L334.24,477.16L296.29,461.54L251.64,457.38L215.29,443.59L184.51,406.57L113.37,290.12L86.26,270.45L54.54,253.66L28.1,232.44L17.1,200.25L22.53,115.25L18.32,70.15L0,29.86L13,8.66L24.4,0L35.88,2.13L48.86,13.7L147.95,56.16L190.02,82.1L231.8,118.84L257.49,163.37L281.65,273.42L302.92,320.94L387.94,402.38L486.84,450.48L778.58,522.19L812.13,542.79L825.99,572.95L832.9,620.94L851,650.12Z","neighbors":[],"bbox":[0,0,1000,829.35],"centroid":[463.83,468.35]}]};

export default map;

/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Wallis and Futuna Is., alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-wf","kind":"country","name":"Wallis and Futuna Is.","nameJa":"ウォリス・フツナ","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 555","width":1000,"height":555,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-177.0548,-13.738966],"scale":28640.0370836051,"translate":[547.9200115427484,264.1428457655068]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"WF","name":"Wallis and Futuna Is.","nameJa":"ウォリス・フツナ","reading":"ウォリスフツナ","group":"Oceania","iso3":"WLF","path":"M21.02,517.58L37.66,535.2L39.15,538.33L45.27,540.17L67.48,551.88L67.49,555.29L41.67,553.69L37.42,555.42L31.3,552.68L18.95,550.87L14.25,548.37L5.16,534.37L0,520L3.69,512.17ZM985.57,0L991.59,10.93L997.62,19.41L1000,27.64L995.09,37.95L996.77,39.83L997.53,41.17L998.69,44.72L990.75,45.99L989.19,50.78L991.97,63.49L989.36,69.41L983.35,70.65L976.69,68.72L972.03,65.12L971.53,57.39L966.27,48.83L963.97,40.77L972.14,34.45L968.6,23.98L971.62,14.43L978.28,6.24Z","neighbors":[],"bbox":[0,0,1000,555.42],"centroid":[547.92,264.14]}]};

export default map;

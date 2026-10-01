/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Ashmore and Cartier Is., alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-atc","kind":"country","name":"Ashmore and Cartier Is.","nameJa":"アシュモア・カルティエ諸島","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 540","width":1000,"height":540,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[123.586368,-12.432578],"scale":2584084.31,"translate":[498.787,269.174]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"ATC","name":"Ashmore and Cartier Is.","nameJa":"アシュモア・カルティエ諸島","group":"Oceania","iso3":"AUS","path":"M967.78,77.08L1000,539.54L25.12,458.81L0,0Z","neighbors":[],"bbox":[0,0,1000,539.54],"centroid":[498.79,269.17]}]};

export default map;

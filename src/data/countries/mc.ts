/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Monaco, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-mc","kind":"country","name":"Monaco","nameJa":"モナコ","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 1000 879","width":1000,"height":879,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[7.398972,43.739846],"scale":1105874.13,"translate":[463.408,456.673]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"MC","name":"Monaco","nameJa":"モナコ","reading":"モナコ","group":"Europe","groupJa":"ヨーロッパ","iso3":"MCO","path":"M1000,388.7L935.76,456.44L728.19,629.23L538,878.92L208.84,853.73L0,786.94L21.19,567.01L96.46,341.08L304.01,108.22L574.88,0L843.64,155.16Z","neighbors":["FR"],"bbox":[0,0,1000,878.92],"centroid":[463.41,456.67]}]};

export default map;

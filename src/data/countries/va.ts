/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Vatican City, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-va","kind":"country","name":"Vatican City","nameJa":"バチカン市国","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 845 1000","width":845,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[12.453419,41.903311],"scale":49265489.53,"translate":[451.4,519.052]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"VA","name":"Vatican City","nameJa":"バチカン市国","reading":"ばちかんしこく","group":"Europe","iso3":"VAT","path":"M270.7,1000L0,773L33.92,409.29L202.87,0L812.11,45.57L845.39,1000Z","neighbors":["IT"],"bbox":[0,0,845.39,1000],"centroid":[450.33,517.93]}]};

export default map;

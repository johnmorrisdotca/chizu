/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Montserrat, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-ms","kind":"country","name":"Montserrat","nameJa":"モントセラト","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 596 1000","width":596,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-62.187397,16.737519],"scale":397993.52,"translate":[284.295,568.233]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"MS","name":"Montserrat","nameJa":"モントセラト","reading":"モントセラト","group":"North America","groupJa":"北アメリカ大陸","iso3":"MSR","path":"M550.55,521.18L548.4,571.48L521.35,658.55L527.85,687.37L549.24,718.46L573.61,766.51L591.76,815.96L596.1,853.27L572.83,910.66L534.66,955.33L481.06,986.42L414.19,1000L74.94,907.28L0,637.05L75.04,298.74L187.09,0L270.69,33.92L313.99,45.79L368.91,42.96L338.07,172.42L399.78,293.95L490.99,409.83Z","neighbors":[],"bbox":[0,0,596.1,1000],"centroid":[284.29,568.23]}]};

export default map;

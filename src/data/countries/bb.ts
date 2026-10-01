/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Barbados, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

const map: ChizuMap = {"id":"country-bb","kind":"country","name":"Barbados","nameJa":"バルバドス","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 754 1000","width":754,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[-59.561202,13.181041],"scale":195295.52870022785,"translate":[308.5100955571085,557.3452782109921]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"BB","name":"Barbados","nameJa":"バルバドス","reading":"バルバドス","group":"North America","iso3":"BRB","path":"M754.23,627.63L743.89,745.11L658.7,833.36L592.12,879.57L553.08,906.63L482.31,979.04L456.23,982.24L435.02,981.96L414.49,985.57L391.79,1000L359.09,943.69L297.75,908.46L223.18,890.85L178.87,887.65L152.66,885.84L108.09,854.07L69.75,779.31L26.84,627.7L0,168.48L6.63,115.64L30.13,70.98L77.25,22.46L137.17,0L198.16,33.3L243.77,102.37L259.7,136.91L282.78,187.12L346.36,325.12L390.11,385.72L451.68,433.01L538.79,499.7L589.03,528.81L653.99,550.01L715.31,578.27Z","neighbors":[],"bbox":[0,0,754.23,1000],"centroid":[308.51,557.35]}]};

export default map;

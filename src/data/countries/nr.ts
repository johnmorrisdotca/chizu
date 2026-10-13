/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run `pnpm data` to make it again.
 * Nauru, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "../../types.ts";

/**
 * Nauru, alone: Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000.
 * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.
 *
 * @example
 * ```ts
 * import map from "@johnmorrisdotca/chizu/countries/nr";
 * console.log(map.id, map.kind, map.regions.length, map.viewBox);
 * // country-nr country 1 0 0 834 1000
 * ```
 */
const map: ChizuMap = {"id":"country-nr","kind":"country","name":"Nauru","nameJa":"ナウル","regionName":"Country","regionNamePlural":"Countries","viewBox":"0 0 834 1000","width":834,"height":1000,"wraps":false,"projection":{"kind":"azimuthal-equal-area","centre":[166.933132,-0.520783],"scale":932518.15,"translate":[425.409,494.316]},"insets":[],"source":"Natural Earth 5.1.2 admin-0 countries, 1:10m, Lambert azimuthal equal-area centred on the country, longer side 1000","regions":[{"code":"NR","name":"Nauru","nameJa":"ナウル","reading":"ナウル","group":"Oceania","groupJa":"オセアニア","iso3":"NRU","path":"M517.87,0L790.7,123.17L834.41,443.7L721.82,793.38L517.87,1000L152.32,929.8L0,560.27L104.63,158.95Z","neighbors":[],"bbox":[0,0,834.41,1000],"centroid":[425.41,494.32]}]};

export default map;

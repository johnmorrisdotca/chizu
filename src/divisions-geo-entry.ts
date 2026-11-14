/**
 * The regions of the 32 countries that have them, each as longitude and latitude in degrees (Natural Earth admin-1,
 * 1:10m, simplified), for a globe or any spherical view: no projection, no boxes, and the border two regions share is
 * the same list of points in both. Its own entry, and each country its own file behind a dynamic import, so a page
 * pays only for the countries it loads.
 */
import { DIVISIONS_GEO_LOADERS } from "./data/divisions-geo-loaders.data.ts";
import type { ChizuGeoCollection } from "./geo-types.ts";

export type { ChizuGeoCollection, ChizuGeoFeature, ChizuGeoProperties } from "./geo-types.ts";

/**
 * Every country that has its regions as longitude and latitude, by code.
 *
 * @example
 * ```ts
 * import { DIVISIONS_GEO_CODES } from "@johnmorrisdotca/chizu/divisions-geo";
 *
 * console.log(DIVISIONS_GEO_CODES.length, DIVISIONS_GEO_CODES.includes("JP"));
 * // 32 true
 * ```
 */
export const DIVISIONS_GEO_CODES: readonly string[] = Object.keys(DIVISIONS_GEO_LOADERS).map((code) =>
  code.toUpperCase(),
);

/**
 * One country's regions as longitude and latitude, loaded on demand (the file for that country only); `null` for a
 * code with no regions. `./divisions-geo/<code>` is the same file as a static import.
 *
 * @example
 * ```ts
 * import { loadDivisionsGeo } from "@johnmorrisdotca/chizu/divisions-geo";
 *
 * const japan = (await loadDivisionsGeo("jp"))!;
 * const tokyo = japan.features.find((feature) => feature.properties.iso === "JP-13")!;
 * console.log(japan.features.length, tokyo.properties.code, tokyo.properties.nameJa, await loadDivisionsGeo("xx"));
 * // 47 13 東京都 null
 * ```
 *
 * @param code - The country's code, in either case.
 * @returns The country's regions, or `null` when it has none.
 */
export async function loadDivisionsGeo(code: string): Promise<ChizuGeoCollection | null> {
  const load = DIVISIONS_GEO_LOADERS[code.toLowerCase()];
  return load ? (await load()).default : null;
}

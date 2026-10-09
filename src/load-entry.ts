/**
 * Loading a map by name, one country at a time: `loadCountry("fr")` is France alone, `loadDivisions("fr")` its
 * départements. Each is a dynamic import of a file of its own, so a bundler makes a chunk for each and a page fetches
 * only the ones it draws.
 */
import { COUNTRY_LOADERS, DIVISIONS_LOADERS, FEATURE_LOADERS, WORLD_DETAIL_LOADER } from "./data/loaders.ts";
import type { ChizuFeatureLayer, ChizuMap } from "./types.ts";

/**
 * Every country that has a map of its own, by code, upper or lower case.
 *
 * @example
 * ```ts
 * import { COUNTRY_CODES } from "@johnmorrisdotca/chizu/load";
 *
 * console.log(COUNTRY_CODES.length, COUNTRY_CODES.includes("JP"));
 * // 238 true
 * ```
 */
export const COUNTRY_CODES: readonly string[] = Object.keys(COUNTRY_LOADERS).map((code) => code.toUpperCase());

/**
 * Every country that has a map of its own regions (provinces, states, départements), by code.
 *
 * @example
 * ```ts
 * import { DIVISIONS_CODES } from "@johnmorrisdotca/chizu/load";
 *
 * console.log(DIVISIONS_CODES.length, DIVISIONS_CODES.includes("JP"));
 * // 32 true
 * ```
 */
export const DIVISIONS_CODES: readonly string[] = Object.keys(DIVISIONS_LOADERS).map((code) => code.toUpperCase());

/**
 * One country alone, drawn from Natural Earth's 1:50m countries (the small ones from 1:10m); `null` for a code with no map.
 *
 * @example
 * ```ts
 * import { loadCountry } from "@johnmorrisdotca/chizu/load";
 *
 * const japan = (await loadCountry("jp"))!;
 * console.log(japan.id, japan.kind, japan.regions.length, await loadCountry("xx"));
 * // country-jp country 1 null
 * ```
 */
export async function loadCountry(code: string): Promise<ChizuMap | null> {
  const load = COUNTRY_LOADERS[code.toLowerCase()];
  return load ? (await load()).default : null;
}

/**
 * The regions of one country, from Natural Earth's 1:10m states and provinces; `null` for a country that has none.
 *
 * @example
 * ```ts
 * import { loadDivisions } from "@johnmorrisdotca/chizu/load";
 *
 * const japan = (await loadDivisions("jp"))!;
 * const tokyo = japan.regions.find((region) => region.iso === "JP-13")!;
 * console.log(japan.regions.length, tokyo.code, tokyo.nameJa, tokyo.reading, tokyo.group);
 * // 47 13 東京都 とうきょうと Kanto
 * ```
 */
export async function loadDivisions(code: string): Promise<ChizuMap | null> {
  const load = DIVISIONS_LOADERS[code.toLowerCase()];
  return load ? (await load()).default : null;
}

/**
 * The world drawn finer: the same 173 countries on the same canvas, in the same projection, from Natural Earth's
 * 1:50m outlines rather than its 1:110m ones, about 1.3 MB. For `mountChizu`'s `detail`, which draws it from the
 * fourth zoom step in, where the coarse coasts would look angular; everything else (framing, quizzes, callouts) keeps
 * to the world itself, whose codes, names and neighbours it shares.
 *
 * @example
 * ```ts
 * import { loadWorldDetail } from "@johnmorrisdotca/chizu/load";
 * import WORLD from "@johnmorrisdotca/chizu/world";
 *
 * const detail = await loadWorldDetail();
 * const japan = (map: typeof WORLD) => map.regions.find((region) => region.code === "JP")!.path.length;
 * console.log(detail.id, japan(detail) > japan(WORLD) * 3);
 * // world-detail true
 * ```
 */
export async function loadWorldDetail(): Promise<ChizuMap> {
  return (await WORLD_DETAIL_LOADER()).default;
}

/**
 * The ids of every map that has named features of its own: the world, and each country alone or by its regions whose
 * canvas holds a sea, a lake, a river, a landform or a peak big enough to see.
 *
 * @example
 * ```ts
 * import { FEATURE_MAPS } from "@johnmorrisdotca/chizu/load";
 *
 * console.log(FEATURE_MAPS.includes("world"), FEATURE_MAPS.includes("divisions-jp"), FEATURE_MAPS.includes("country-jp"));
 * // true true true
 * ```
 */
export const FEATURE_MAPS: readonly string[] = Object.keys(FEATURE_LOADERS);

/**
 * The named features of a map (its seas, lakes, rivers, landforms and peaks), drawn on its own canvas, by the map or its
 * id: a file of its own, fetched only when asked for. `null` for a map that has none. Pass it to `drawChizu` and
 * `mountChizu` as `featureLayer`, with `features: ["water"]` (or any group or kind) to draw them; `mountChizu` also
 * takes this function itself, and fetches each map's layer the first time it is shown.
 *
 * @example
 * ```ts
 * import { loadFeatures } from "@johnmorrisdotca/chizu/load";
 *
 * const japan = (await loadFeatures("divisions-jp"))!;
 * const seto = japan.features.find((one) => one.nameJa === "瀬戸内海")!;
 * console.log(japan.map, seto.name, seto.kind, seto.reading, await loadFeatures("divisions-xx"));
 * // divisions-jp Seto Inland Sea sea せとないかい null
 * ```
 */
export async function loadFeatures(map: string | Pick<ChizuMap, "id">): Promise<ChizuFeatureLayer | null> {
  const load = FEATURE_LOADERS[typeof map === "string" ? map : map.id];
  return load ? (await load()).default : null;
}

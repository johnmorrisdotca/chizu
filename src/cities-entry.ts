/**
 * The world's cities for Chizu's city layer, from kuni: its own entry (`@johnmorrisdotca/chizu/cities`), the one part of
 * Chizu that needs `@johnmorrisdotca/kuni` (an optional peer, 1.6.0 or later). A page that names no cities never loads
 * it, and one that has its own list passes that to `drawChizu`'s `cities` instead.
 */

import { type CityTier, loadCities } from "@johnmorrisdotca/kuni/cities";
import type { ChizuCity } from "./cities.ts";

export type { ChizuCity, ChizuCityOptions, ChizuCityPlaced } from "./cities.ts";

/**
 * The tiers loaded when none are asked for: every capital and every city of 100,000 people or more, about 9,000 cities.
 *
 * @example
 * ```ts
 * import { CHIZU_CITY_TIERS } from "@johnmorrisdotca/chizu/cities";
 *
 * console.log(CHIZU_CITY_TIERS.join(" "));
 * // capitals 1m 100k
 * ```
 */
export const CHIZU_CITY_TIERS: readonly CityTier[] = Object.freeze(["capitals", "1m", "100k"] as const);

/**
 * Kuni's cities, each once, ready for `drawChizu`'s `cities`: the tiers asked for (`capitals`, `1m`, `100k`, `15k`), or
 * `CHIZU_CITY_TIERS`. Each tier is loaded only when it is asked for, and kept by kuni once loaded.
 *
 * @example
 * ```ts no-run
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { drawChizu } from "@johnmorrisdotca/chizu/draw";
 * import { loadKuniCities } from "@johnmorrisdotca/chizu/cities";
 *
 * const svg = drawChizu(WORLD, { cities: await loadKuniCities(), language: "ja", style: true });
 * console.log(svg.includes('class="cz-cities"'));
 * // true
 * ```
 *
 * @param tiers - The kuni tiers to load; default `CHIZU_CITY_TIERS`.
 * @returns The cities, in the shape the city layer reads.
 */
export async function loadKuniCities(...tiers: readonly CityTier[]): Promise<readonly ChizuCity[]> {
  const set = await loadCities(...(tiers.length > 0 ? tiers : CHIZU_CITY_TIERS));
  return set.cities;
}

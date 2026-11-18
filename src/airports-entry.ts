/**
 * The world's 600 busiest airports for Chizu's airport marks (`@johnmorrisdotca/chizu/airports`), its own entry so that a
 * page that marks none never loads it: about 150 kB as data, loaded when this entry is imported. Ranked by passengers a
 * year from Wikidata (CC0), English and Japanese names as data. Hand the list to `drawChizu`'s `ports`.
 */

import type { ChizuPort } from "./ports.ts";
import data from "./ports-data/airports.data.ts";

export type { ChizuPort } from "./ports.ts";

/**
 * The 600 airports with the most passengers a year, busiest first, each with a `tier`: 1 for the first 150, 2 up to the
 * 300th, 3 to the 600th. The figure and its year (2015 or later) are in `passengers` and `year`.
 *
 * @example
 * ```ts
 * import { AIRPORTS } from "@johnmorrisdotca/chizu/airports";
 *
 * const haneda = AIRPORTS.find((airport) => airport.code === "HND")!;
 * console.log(AIRPORTS.length, haneda.name.ja, haneda.country);
 * // 600 東京国際空港 JP
 * ```
 */
export const AIRPORTS: readonly ChizuPort[] = data;

/**
 * Where each tier of `AIRPORTS` ends: the airports a page marks with the whole of tier 1, 2 and 3 are the first 150, 300 and 600.
 *
 * @example
 * ```ts
 * import { AIRPORT_TIER_ENDS } from "@johnmorrisdotca/chizu/airports";
 *
 * console.log(AIRPORT_TIER_ENDS.join(" "));
 * // 150 300 600
 * ```
 */
export const AIRPORT_TIER_ENDS: readonly number[] = Object.freeze([150, 300, 600]);

/**
 * The credit line for the airports, in English and Japanese, to show where the airports are shown.
 *
 * @example
 * ```ts
 * import { AIRPORTS_CREDIT } from "@johnmorrisdotca/chizu/airports";
 *
 * console.log(AIRPORTS_CREDIT.en);
 * // Airports: Wikidata (CC0), ranked by passengers a year.
 * ```
 */
export const AIRPORTS_CREDIT: { readonly en: string; readonly ja: string } = Object.freeze({
  en: "Airports: Wikidata (CC0), ranked by passengers a year.",
  ja: "空港: Wikidata（CC0）。年間の旅客数の順。",
});

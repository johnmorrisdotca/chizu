/**
 * The world's 1,081 harbours for Chizu's harbour marks (`@johnmorrisdotca/chizu/harbours`), its own entry so that a page
 * that marks none never loads it: about 170 kB as data, loaded when this entry is imported. Natural Earth's ports (public
 * domain) in its own order of size, Japanese names from Wikidata (CC0) where it has one. Hand the list to `drawChizu`'s `ports`.
 */

import type { ChizuPort } from "./ports.ts";
import data from "./ports-data/harbours.data.ts";

export type { ChizuPort } from "./ports.ts";

/**
 * Natural Earth's 1,081 ports, largest first, each with a `tier`: 1 for its sizes 3 and 4, 2 for 5, 3 for the rest.
 *
 * @example
 * ```ts
 * import { HARBOURS } from "@johnmorrisdotca/chizu/harbours";
 *
 * const yokohama = HARBOURS.find((harbour) => harbour.id === "yokohama")!;
 * console.log(HARBOURS.length, yokohama.name.ja, yokohama.country);
 * // 1081 横浜港 JP
 * ```
 */
export const HARBOURS: readonly ChizuPort[] = data;

/**
 * The credit line for the harbours, in English and Japanese, to show where the harbours are shown.
 *
 * @example
 * ```ts
 * import { HARBOURS_CREDIT } from "@johnmorrisdotca/chizu/harbours";
 *
 * console.log(HARBOURS_CREDIT.en);
 * // Harbours: Natural Earth (public domain); names: Wikidata (CC0).
 * ```
 */
export const HARBOURS_CREDIT: { readonly en: string; readonly ja: string } = Object.freeze({
  en: "Harbours: Natural Earth (public domain); names: Wikidata (CC0).",
  ja: "港: Natural Earth（パブリックドメイン）。名前: Wikidata（CC0）。",
});

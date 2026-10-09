import { CHIZU_COUNTRIES } from "./data/countries.ts";
import { placesFromText, type PastedPlaces } from "./fromText.ts";
import type { ChizuCountry } from "./types.ts";

const byCode = new Map(CHIZU_COUNTRIES.map((country) => [country.code, country]));

/**
 * The country with this code (upper or lower case), or undefined.
 *
 * @example
 * ```ts
 * import { countryByCode } from "@johnmorrisdotca/chizu/names";
 *
 * const japan = countryByCode("jp")!;
 * console.log(japan.name, japan.nameJa, japan.reading, japan.hasDivisions);
 * // Japan 日本 にほん true
 * ```
 */
export function countryByCode(code: string): ChizuCountry | undefined {
  return byCode.get(code.toUpperCase());
}

/**
 * The countries a pasted list names, by English name, Japanese name, short Japanese name, reading or code, in the order written
 * (`placesFromText`): `countriesFromText("Japan, フランス\nBrazil")`.
 *
 * @example
 * ```ts
 * import { countriesFromText } from "@johnmorrisdotca/chizu/names";
 *
 * const found = countriesFromText("Japan, ドイツ\nUS, Narnia");
 * console.log(found.countries.map((country) => country.code), found.missing);
 * // [ 'JP', 'DE', 'US' ] [ 'Narnia' ]
 * ```
 */
export function countriesFromText(text: string): { countries: ChizuCountry[]; missing: string[] } {
  const found: PastedPlaces = placesFromText(text, CHIZU_COUNTRIES);
  return { countries: found.codes.map((code) => byCode.get(code)!), missing: found.missing };
}

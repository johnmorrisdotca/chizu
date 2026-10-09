import type { ChizuRegion } from "./types.ts";

/**
 * A set of regions made from a list of place names somebody pasted.
 *
 * A teacher with eight prefecture names in a lesson plan should not have to find each one on the map. Matching is
 * deliberately forgiving in the ways a paste is messy and strict everywhere else: case and surrounding space never
 * matter, a name may be the English, the Japanese, the short Japanese or the reading, and a line that matches nothing is
 * reported rather than dropped. It is never fuzzy: "Tokyo" must not quietly become Tochigi.
 *
 * @example
 * ```ts
 * import { loadDivisions } from "@johnmorrisdotca/chizu/load";
 * import { placesFromText, type MatchOptions } from "@johnmorrisdotca/chizu";
 *
 * const japan = (await loadDivisions("jp"))!;
 * const options: MatchOptions = { optionalEnding: /[県府都道]$/u };
 * console.log(placesFromText("東京\n大阪\n北海道", japan.regions, options).codes);
 * // [ '13', '27', '1' ]
 * ```
 */

export type MatchOptions = {
  /**
   * A trailing character a pasted name may leave off, as a pattern. A prefecture is written 東京都 on the map and 東京
   * in a lesson plan: pass `/[県府都道]$/u`. Default: none.
   */
  optionalEnding?: RegExp;
};

type Named = Pick<ChizuRegion, "code" | "name" | "nameJa" | "nameShortJa" | "reading">;

/** Everything a region can be called, lowered and trimmed, for matching. */
function namesOf(region: Named, optionalEnding: RegExp | undefined): string[] {
  const names = [region.name, region.nameJa ?? "", region.nameShortJa ?? "", region.reading ?? "", String(region.code)]
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
  return optionalEnding ? names.flatMap((name) => [name, name.replace(optionalEnding, "")]).filter(Boolean) : names;
}

/**
 * A paste split into its lines, on the separators a pasted list actually uses.
 *
 * @example
 * ```ts
 * import { splitPastedPlaces } from "@johnmorrisdotca/chizu";
 *
 * console.log(splitPastedPlaces("Japan, France\n  Brazil;Egypt\t"));
 * // [ 'Japan', 'France', 'Brazil', 'Egypt' ]
 * ```
 */
export function splitPastedPlaces(text: string): string[] {
  return text
    .split(/[\n,、，;；・]+/u)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { placesFromText, type PastedPlaces } from "@johnmorrisdotca/chizu";
 *
 * const found: PastedPlaces = placesFromText("Japan\nAtlantis", WORLD.regions);
 * console.log(found.codes, found.missing);
 * // [ 'JP' ] [ 'Atlantis' ]
 * ```
 */
export type PastedPlaces = {
  /** The region codes found, in the order they were written, each once. */
  codes: string[];
  /** The lines that matched nothing, said back rather than dropped. */
  missing: string[];
};

/**
 * The regions a paste names. Order is the paste's, because somebody who wrote them in lesson order meant that order. A
 * name written twice adds the place once.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { placesFromText } from "@johnmorrisdotca/chizu";
 *
 * console.log(placesFromText("Japan, フランス\nBrazil, Narnia", WORLD.regions));
 * // { codes: [ 'JP', 'FR', 'BR' ], missing: [ 'Narnia' ] }
 * ```
 */
export function placesFromText(text: string, regions: readonly Named[], options: MatchOptions = {}): PastedPlaces {
  const byName = new Map<string, string>();
  for (const region of regions) {
    for (const name of namesOf(region, options.optionalEnding)) {
      // First wins: two regions sharing a shortened name keep the earlier one rather than silently swapping which a paste means.
      if (!byName.has(name)) byName.set(name, String(region.code));
    }
  }
  const codes: string[] = [];
  const missing: string[] = [];
  const seen = new Set<string>();
  for (const line of splitPastedPlaces(text)) {
    const wanted = line.toLowerCase();
    const code = byName.get(wanted) ?? (options.optionalEnding ? byName.get(wanted.replace(options.optionalEnding, "")) : undefined) ?? null;
    if (!code) {
      missing.push(line);
      continue;
    }
    if (seen.has(code)) continue;
    seen.add(code);
    codes.push(code);
  }
  return { codes, missing };
}

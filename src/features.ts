import type { ChizuFeature, ChizuFeatureGroup, ChizuFeatureKind, ChizuFeatureLayer, ChizuMap, ChizuRegion } from "./types.ts";

/**
 * NAMED FEATURES: the oceans, seas, bays and straits, the lakes and reservoirs, the rivers, the deserts, ranges and
 * plains, and the peaks of a map, each on the map's own canvas (`loadFeatures(mapId)` in `/load`). A feature has the
 * fields of a region the engine reads, so `featureMap` makes a layer a map of its own and every function that takes a
 * map takes it: `focusBox` and `zoomToFit` frame a sea, `findQuestion` asks "which river is this?", `placesFromText`
 * reads pasted names. These are the few things only features need: which to show, and a search by name.
 */

/**
 * The six groups, in the order they are drawn: seas under the land, then landforms, lakes, rivers, peaks and capitals on it.
 *
 * @example
 * ```ts
 * import { CHIZU_FEATURE_GROUPS } from "@johnmorrisdotca/chizu";
 *
 * console.log(CHIZU_FEATURE_GROUPS.join(" "));
 * // marine landforms lakes rivers peaks capitals
 * ```
 */
export const CHIZU_FEATURE_GROUPS: readonly ChizuFeatureGroup[] = ["marine", "landforms", "lakes", "rivers", "peaks", "capitals"];

/**
 * The kinds in each group.
 *
 * @example
 * ```ts
 * import { CHIZU_FEATURE_KINDS } from "@johnmorrisdotca/chizu";
 *
 * console.log(CHIZU_FEATURE_KINDS.lakes.join(" "), CHIZU_FEATURE_KINDS.rivers.join(" "));
 * // lake reservoir river
 * ```
 */
export const CHIZU_FEATURE_KINDS: Readonly<Record<ChizuFeatureGroup, readonly ChizuFeatureKind[]>> = {
  marine: ["ocean", "sea", "gulf", "bay", "strait", "channel", "sound", "fjord", "inlet", "lagoon", "reef"],
  landforms: ["desert", "range", "plateau", "plain", "peninsula", "cape", "basin", "delta", "valley", "wetland", "tundra", "isthmus", "depression", "lowland", "gorge", "foothills"],
  lakes: ["lake", "reservoir"],
  rivers: ["river"],
  peaks: ["peak"],
  capitals: ["capital", "seat"],
};

/**
 * What to show of a layer: `water` (seas, lakes and rivers), `all`, a group (`marine`, `landforms`, `lakes`, `rivers`,
 * `peaks`, `capitals`) or a single kind (`strait`, `reservoir`, `capital`).
 *
 * @example
 * ```ts
 * import type { ChizuFeatureChoice } from "@johnmorrisdotca/chizu";
 *
 * const choices: ChizuFeatureChoice[] = ["water", "peaks"];
 * console.log(choices.length);
 * // 2
 * ```
 */
export type ChizuFeatureChoice = "water" | "all" | ChizuFeatureGroup | ChizuFeatureKind;

const WATER: readonly ChizuFeatureGroup[] = ["marine", "lakes", "rivers"];

/**
 * Whether a feature is among the choices.
 *
 * @example
 * ```ts
 * import { featureChosen, type ChizuFeature } from "@johnmorrisdotca/chizu";
 *
 * const lake = { kind: "lake", group: "lakes" } as Pick<ChizuFeature, "kind" | "group">;
 * console.log(featureChosen(lake, ["water"]), featureChosen(lake, ["rivers"]), featureChosen(lake, ["lake"]));
 * // true false true
 * ```
 */
export function featureChosen(feature: Pick<ChizuFeature, "kind" | "group">, choices: readonly ChizuFeatureChoice[]): boolean {
  return choices.some((choice) => choice === "all" || choice === feature.group || choice === feature.kind || (choice === "water" && WATER.includes(feature.group)));
}

/**
 * The features of a layer that are among the choices, in the layer's order (seas first, peaks last).
 *
 * @example
 * ```ts
 * import { loadFeatures } from "@johnmorrisdotca/chizu/load";
 * import { featuresShown } from "@johnmorrisdotca/chizu";
 *
 * const japan = (await loadFeatures("divisions-jp"))!;
 * console.log(featuresShown(japan, ["lakes", "rivers"]).map((one) => one.name).join(", "));
 * // Lake Biwa, Ishikari River, Tone River, Mogami River
 * ```
 */
export function featuresShown(layer: Pick<ChizuFeatureLayer, "features"> | null | undefined, choices: readonly ChizuFeatureChoice[] = ["all"]): ChizuFeature[] {
  if (!layer || choices.length === 0) return [];
  return layer.features.filter((feature) => featureChosen(feature, choices));
}

/**
 * A layer as a map of its own: the same canvas, the features as its regions. Every function of the engine takes it,
 * so a sea is framed with `focusBox`, asked about with `findQuestion` (its look-alikes are the seas next to it, then
 * the rest of its group, then the nearest), and read from a paste with `placesFromText`.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { loadFeatures } from "@johnmorrisdotca/chizu/load";
 * import { featureMap, findQuestion, seededRandom } from "@johnmorrisdotca/chizu";
 *
 * const water = featureMap(WORLD, (await loadFeatures("world"))!, ["water"]);
 * const caspian = water.regions.find((one) => one.name === "Caspian Sea")!;
 * const question = findQuestion(water, caspian.code, seededRandom(3))!;
 * console.log(water.id, question.choices.length, question.choices[question.answerIndex] === caspian.code);
 * // world-features 4 true
 * ```
 */
export function featureMap(map: ChizuMap, layer: Pick<ChizuFeatureLayer, "features">, choices: readonly ChizuFeatureChoice[] = ["all"]): ChizuMap {
  const regions: ChizuRegion[] = featuresShown(layer, choices).map((feature) => ({ ...feature }));
  return { ...map, id: `${map.id}-features`, regionName: "Feature", regionNamePlural: "Features", insets: [], regions };
}

/** A name folded for matching: case, accents, width, katakana and hiragana, spaces and punctuation all set aside. */
function fold(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/gu, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .replace(/ゔ/gu, "ぶ")
    .replace(/[\s・･'’.,()（）-]/gu, "");
}

/**
 * The features a few typed letters may mean, best first: a name (English or Japanese) or reading that is the words
 * typed, then one that begins with them, then one with a word that does, then one that holds them anywhere; within
 * each, the higher ranked first. Case, accents, kana and spacing never matter, so `caspian`, `カスピ` and `かすぴ` all find
 * the Caspian Sea. Up to `limit` (default 10).
 *
 * @example
 * ```ts
 * import { loadFeatures } from "@johnmorrisdotca/chizu/load";
 * import { findFeatures } from "@johnmorrisdotca/chizu";
 *
 * const world = (await loadFeatures("world"))!;
 * console.log(findFeatures(world.features, "caspian")[0]?.nameJa, findFeatures(world.features, "びわ").length);
 * console.log(findFeatures(world.features, "ナイル").map((one) => one.name));
 * // カスピ海 0
 * // [ 'Nile', 'White Nile', 'Blue Nile' ]
 * ```
 */
export function findFeatures<T extends Pick<ChizuFeature, "code" | "name" | "nameJa" | "reading" | "rank">>(features: readonly T[], typed: string, options: { limit?: number } = {}): T[] {
  const needle = fold(typed);
  if (needle === "") return [];
  const scored: Array<{ feature: T; score: number }> = [];
  for (const feature of features) {
    const names = [feature.name, feature.nameJa ?? "", feature.reading ?? "", feature.code];
    let best = 0;
    for (const name of names) {
      if (!name) continue;
      const folded = fold(name);
      const words = name.toLowerCase().split(/[\s-]+/u).map(fold);
      const score = folded === needle ? 4 : folded.startsWith(needle) ? 3 : words.some((word) => word.startsWith(needle)) ? 2 : folded.includes(needle) ? 1 : 0;
      best = Math.max(best, score);
    }
    if (best > 0) scored.push({ feature, score: best });
  }
  scored.sort((a, b) => b.score - a.score || a.feature.rank - b.feature.rank || a.feature.name.localeCompare(b.feature.name, "en"));
  return scored.slice(0, options.limit ?? 10).map((entry) => entry.feature);
}

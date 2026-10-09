import type { ChizuMap } from "./types.ts";
import { shuffled, type Random } from "./random.ts";

/**
 * What makes one place on a map a convincing wrong answer for another.
 *
 * Somewhere on the far side of the map is never tempting, so the choices are drawn from the target's own corner of it:
 * land neighbours first, then its group (the continent, or the larger part of the country), then whatever is nearest.
 * It also keeps a "find it" board legible, since the choices are places on one map and clustered ones stay readable.
 * The rule is the same wherever the map is: Japan's prefectures, Brazil's states, the countries of the world.
 *
 * @example
 * ```ts
 * import { DISTRACTOR_SCORES } from "@johnmorrisdotca/chizu";
 *
 * console.log(DISTRACTOR_SCORES);
 * // { neighbor: 100, group: 60, proximity: 40 }
 * ```
 */
export const DISTRACTOR_SCORES = {
  neighbor: 100,
  group: 60,
  proximity: 40,
} as const;

/**
 * The parts of a place this scoring reads, so a map of your own places needs no more than these.
 *
 * @example
 * ```ts
 * import { distractorScore, type Scorable } from "@johnmorrisdotca/chizu";
 *
 * const north: Scorable = { code: "N", group: "Island", centroid: [10, 10], neighbors: ["S"] };
 * const south: Scorable = { code: "S", group: "Island", centroid: [10, 60], neighbors: ["N"] };
 * console.log(distractorScore(north, south, 100) > 100);
 * // true
 * ```
 */
export type Scorable = {
  /** A code, text or a number: a map of your own places may key them by either, and neighbours are compared as text. */
  code: string | number;
  group: string;
  centroid: readonly [number, number];
  neighbors: ReadonlyArray<string | number>;
};

/**
 * How tempting `candidate` is as a wrong answer for `target`, from 0 up to 200: 100 for a land neighbour, 60 for
 * the same group, and up to 40 for being close, measured against `diagonal`, the corner-to-corner length of the map
 * (each map is drawn on a canvas of its own, so a distance only means something relative to it).
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { distractorScore, mapDiagonal } from "@johnmorrisdotca/chizu";
 *
 * const get = (code: string) => WORLD.regions.find((region) => region.code === code)!;
 * const diagonal = mapDiagonal(WORLD);
 * console.log(distractorScore(get("DE"), get("FR"), diagonal) > distractorScore(get("DE"), get("BR"), diagonal));
 * // true
 * ```
 */
export function distractorScore(target: Scorable, candidate: Scorable, diagonal: number): number {
  let score = 0;
  // Codes are numeric on some maps and letters on others, so they are compared as text.
  if (target.neighbors.some((neighbor) => String(neighbor) === String(candidate.code))) score += DISTRACTOR_SCORES.neighbor;
  if (target.group === candidate.group) score += DISTRACTOR_SCORES.group;
  const distance = Math.hypot(target.centroid[0] - candidate.centroid[0], target.centroid[1] - candidate.centroid[1]);
  const closeness = diagonal > 0 ? Math.max(0, 1 - distance / diagonal) : 0;
  return score + Math.round(DISTRACTOR_SCORES.proximity * closeness);
}

/**
 * The corner-to-corner length of a map's canvas, which proximity is measured against.
 *
 * @example
 * ```ts
 * import { mapDiagonal } from "@johnmorrisdotca/chizu";
 *
 * console.log(mapDiagonal({ width: 300, height: 400 }));
 * // 500
 * ```
 */
export function mapDiagonal(map: Pick<ChizuMap, "width" | "height">): number {
  return Math.hypot(map.width, map.height);
}

/**
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { pickDistractors, seededRandom, type DistractorOptions } from "@johnmorrisdotca/chizu";
 *
 * const options: DistractorOptions = { count: 5, random: seededRandom(1) };
 * console.log(pickDistractors(WORLD, "BR", options).length);
 * // 5
 * ```
 */
export type DistractorOptions = {
  /** How many wrong answers. Default 3. */
  count?: number;
  /**
   * How many of the most tempting places the wrong answers are drawn from. Default `count + 3`: wider than `count`, so
   * that the same three look-alikes are not offered every time the question comes round.
   */
  pool?: number;
  /** The stream the draw is made from: the same seed offers the same choices. Default: the best `count`, with no draw. */
  random?: Random;
  /** Codes that may be offered, if only some may be (the countries a school names). The target's own code is never offered. Default: every region. */
  among?: ReadonlyArray<string | number>;
};

/**
 * The wrong answers to "which one is this?": the codes of `count` places, drawn from the most tempting ones for the
 * target, never the target itself. With `random` the pool is shuffled and cut, so the same target is asked with
 * different company; without it the answer is simply the best `count`, the same every time.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { pickDistractors } from "@johnmorrisdotca/chizu";
 *
 * console.log(pickDistractors(WORLD, "DE", { count: 3 }));
 * // [ 'LU', 'NL', 'AT' ]
 * ```
 */
export function pickDistractors(map: Pick<ChizuMap, "width" | "height" | "regions">, targetCode: string | number, options: DistractorOptions = {}): string[] {
  const count = options.count ?? 3;
  const target = map.regions.find((region) => String(region.code) === String(targetCode));
  if (!target || count <= 0) return [];
  const allowed = options.among === undefined ? null : new Set(options.among.map(String));
  const diagonal = mapDiagonal(map);
  const ranked = map.regions
    .filter((region) => region !== target && !(region as { unnamed?: boolean }).unnamed && (allowed === null || allowed.has(String(region.code))))
    .map((region, order) => ({ code: region.code, order, score: distractorScore(target, region, diagonal) }))
    .sort((a, b) => b.score - a.score || a.order - b.order);
  const pool = ranked.slice(0, Math.max(count, options.pool ?? count + 3));
  const chosen = options.random ? shuffled(pool, options.random).slice(0, count) : pool.slice(0, count);
  return chosen.map((entry) => entry.code);
}

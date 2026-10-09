/**
 * SEEDED RANDOMNESS for the choices a map makes at random: which look-alikes to offer, in what order.
 *
 * mulberry32 (Tommy Ettinger, 2017): one 32-bit word of state, a few multiplies a draw, the same stream for the same
 * seed in every browser and every Node. It is the stream `@johnmorrisdotca/tane` draws, written out here so that this
 * package depends on nothing. A question made from a seed is made again from it, so this must never change. It is not
 * a credential: it is for fair-looking questions, never for secrets.
 */

/**
 * A number in [0, 1), like `Math.random`, from a stream a seed fixes.
 *
 * @example
 * ```ts
 * import { shuffled, type Random } from "@johnmorrisdotca/chizu";
 *
 * const alwaysFirst: Random = () => 0;
 * console.log(shuffled(["a", "b", "c"], alwaysFirst).length);
 * // 3
 * ```
 */
export type Random = () => number;

/**
 * A stream of numbers in [0, 1) fixed by a seed. The seed is read as an unsigned 32-bit integer.
 *
 * @example
 * ```ts
 * import { seededRandom } from "@johnmorrisdotca/chizu";
 *
 * const a = seededRandom(42);
 * const b = seededRandom(42);
 * console.log(a() === b(), a() === b());
 * // true true
 * ```
 */
export function seededRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A copy of the list in a random order (Fisher–Yates, from the end); the list given is left alone.
 *
 * @example
 * ```ts
 * import { seededRandom, shuffled } from "@johnmorrisdotca/chizu";
 *
 * const items = ["JP", "FR", "BR", "EG"];
 * console.log(shuffled(items, seededRandom(7)).join(" ") === shuffled(items, seededRandom(7)).join(" "), items.join(" "));
 * // true JP FR BR EG
 * ```
 */
export function shuffled<T>(items: readonly T[], random: Random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

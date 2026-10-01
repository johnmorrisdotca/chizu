import { pickDistractors, type DistractorOptions } from "./distractors.ts";
import { shuffled, type Random } from "./random.ts";
import type { ChizuMap } from "./types.ts";

/** A "which one is this?" question: the place asked about, the choices (it among its look-alikes) and where it is in them. */
export type FindQuestion = {
  /** The code of the place asked about. */
  target: string;
  /** The codes to choose from, in an order a seed fixes, the target among them. */
  choices: string[];
  /** Where in `choices` the target is. */
  answerIndex: number;
};

/**
 * Makes the question: the target, `count` of the most tempting wrong answers for it (`pickDistractors`), and all of them
 * put in a random order. The same seed asks the same question. A map with fewer other places than `count` offers fewer
 * choices rather than failing.
 */
export function findQuestion(map: Pick<ChizuMap, "width" | "height" | "regions">, targetCode: string | number, random: Random, options: Omit<DistractorOptions, "random"> = {}): FindQuestion | null {
  const target = map.regions.find((region) => String(region.code) === String(targetCode));
  if (!target) return null;
  const wrong = pickDistractors(map, targetCode, { ...options, random });
  const choices = shuffled([target.code, ...wrong], random);
  return { target: target.code, choices, answerIndex: choices.indexOf(target.code) };
}

import { describe, expect, it } from "vitest";

import world from "./data/world.ts";
import { findQuestion } from "./quiz.ts";
import { seededRandom, shuffled } from "./random.ts";

describe("a which-one-is-this question", () => {
  it("has the answer among its choices, where it says it is, with the look-alikes round it", () => {
    for (const code of ["JP", "FR", "BR", "EG", "NZ"]) {
      const question = findQuestion(world, code, seededRandom(5))!;
      expect(question.target).toBe(code);
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices).size).toBe(4);
      expect(question.choices[question.answerIndex]).toBe(code);
    }
  });

  it("is the same question from the same seed, and another from another", () => {
    const a = findQuestion(world, "FR", seededRandom(9));
    expect(findQuestion(world, "FR", seededRandom(9))).toEqual(a);
    const others = new Set(Array.from({ length: 30 }, (_, seed) => JSON.stringify(findQuestion(world, "FR", seededRandom(seed + 1)))));
    expect(others.size).toBeGreaterThan(5);
  });

  it("asks for a place the map does not hold with nothing", () => {
    expect(findQuestion(world, "ZZ", seededRandom(1))).toBeNull();
  });

  it("offers as many choices as it is asked for", () => {
    expect(findQuestion(world, "FR", seededRandom(1), { count: 5 })!.choices).toHaveLength(6);
    expect(findQuestion(world, "FR", seededRandom(1), { count: 1 })!.choices).toHaveLength(2);
  });
});

describe("seeded randomness", () => {
  // The vectors are Tane's own (`random.test.ts` in github.com/johnmorrisdotca/tane): the same stream, so a seed means the same everywhere in the family.
  it("is mulberry32, the stream Tane draws", () => {
    const draws = (seed: number) => {
      const random = seededRandom(seed);
      return Array.from({ length: 5 }, () => random());
    };
    expect(draws(1)).toEqual([0.6270739405881613, 0.002735721180215478, 0.5274470399599522, 0.9810509674716741, 0.9683778982143849]);
    expect(draws(42)).toEqual([0.6011037519201636, 0.44829055899754167, 0.8524657934904099, 0.6697340414393693, 0.17481389874592423]);
    expect(draws(20260930)).toEqual([0.7129707557614893, 0.9029586620163172, 0.8964550015516579, 0.8198657901957631, 0.2130950081627816]);
  });

  it("shuffles a copy and leaves the list alone", () => {
    const list = [1, 2, 3, 4, 5, 6];
    const out = shuffled(list, seededRandom(3));
    expect(list).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...out].sort()).toEqual(list);
    expect(shuffled(list, seededRandom(3))).toEqual(out);
  });
});

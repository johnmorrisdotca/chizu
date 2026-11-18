import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { pickDistractors } from "./distractors.ts";
import { findQuestion } from "./quiz.ts";
import { seededRandom } from "./random.ts";
import world from "./world-entry.ts";

/*
 * What `findQuestion` and `pickDistractors` gave on the world at origin/main (21199f9), for 14 targets and seeds 1 to 12,
 * recorded from a temporary worktree of main that was removed afterwards. A seeded quiz must ask the same questions for
 * the same seed, so the small countries are never added to the world by itself.
 */
const main = JSON.parse(readFileSync(new URL("./worldQuizOnMain.fixture.json", import.meta.url), "utf8"));

describe("a seeded world quiz is the quiz it was on main", () => {
  it("has the same world, and the same questions for the same seeds", () => {
    expect(world.regions).toHaveLength(main.regions);
    for (const [target, questions] of Object.entries(main.find))
      for (const [at, question] of questions.entries())
        expect(findQuestion(world, target, seededRandom(at + 1)), `${target} seed ${at + 1}`).toEqual(question);
  });

  it("offers the same wrong answers, with and without a seed", () => {
    for (const [target, wrong] of Object.entries(main.pick))
      expect(pickDistractors(world, target, { count: 5 }), target).toEqual(wrong);
    for (const [target, rounds] of Object.entries(main.pickRandom))
      for (const [at, wrong] of rounds.entries())
        expect(
          pickDistractors(world, target, { count: 4, random: seededRandom(at + 1) }),
          `${target} ${at + 1}`,
        ).toEqual(wrong);
  });

  it("loads the small countries only when something asks for them", () => {
    const code = (file) => readFileSync(new URL(`./${file}`, import.meta.url), "utf8");
    for (const file of [
      "index.ts",
      "draw.ts",
      "quiz.ts",
      "distractors.ts",
      "mount.ts",
      "mountSmallStates.ts",
      "element-base.ts",
      "world-entry.ts",
    ])
      expect(code(file), file).not.toMatch(/from "\.\/smallStates\.ts"/);
    // mountChizu fetches the table through mountSmallStates.ts, the elements on their own
    for (const file of ["mountSmallStates.ts", "element-base.ts"])
      expect(code(file), file).toContain('import("./smallStates.ts")');
  });
});

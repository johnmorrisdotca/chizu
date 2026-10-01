import { describe, expect, it } from "vitest";

import fr from "./data/divisions/fr.ts";
import us from "./data/divisions/us.ts";
import world from "./data/world.ts";
import { DISTRACTOR_SCORES, distractorScore, mapDiagonal, pickDistractors, type Scorable } from "./distractors.ts";
import { seededRandom } from "./random.ts";

const DIAGONAL = 1000;

function scorable(overrides: Partial<Scorable> = {}): Scorable {
  return { code: "X", group: "North", centroid: [0, 0], neighbors: [], ...overrides };
}

describe("distractorScore", () => {
  it("rewards a land neighbour most", () => {
    const target = scorable({ code: "A", neighbors: ["B"] });
    const neighbour = scorable({ code: "B", group: "South", centroid: [DIAGONAL, 0] });
    const stranger = scorable({ code: "C", group: "South", centroid: [DIAGONAL, 0] });
    expect(distractorScore(target, neighbour, DIAGONAL) - distractorScore(target, stranger, DIAGONAL))
      .toBe(DISTRACTOR_SCORES.neighbor);
  });

  it("rewards sharing a group", () => {
    const target = scorable({ code: "A", group: "North" });
    const sameGroup = scorable({ code: "B", group: "North", centroid: [DIAGONAL, 0] });
    const otherGroup = scorable({ code: "C", group: "South", centroid: [DIAGONAL, 0] });
    expect(distractorScore(target, sameGroup, DIAGONAL) - distractorScore(target, otherGroup, DIAGONAL))
      .toBe(DISTRACTOR_SCORES.group);
  });

  it("prefers what is nearer when nothing else separates them", () => {
    const target = scorable({ code: "A", group: "North" });
    const near = scorable({ code: "B", group: "South", centroid: [10, 0] });
    const far = scorable({ code: "C", group: "South", centroid: [900, 0] });
    expect(distractorScore(target, near, DIAGONAL)).toBeGreaterThan(distractorScore(target, far, DIAGONAL));
  });

  /*
   * Prefecture codes are numbers and state codes are two letters, so a neighbour
   * list can hold either. Comparing them as text keeps one rule working for both
   * rather than silently scoring every neighbour as a stranger.
   */
  it("matches a neighbour whether the code is a number or a string", () => {
    const numeric = distractorScore(scorable({ code: 1, neighbors: [2] }), scorable({ code: 2 }), DIAGONAL);
    const textual = distractorScore(scorable({ code: "1", neighbors: ["2"] }), scorable({ code: "2" }), DIAGONAL);
    const mixed = distractorScore(scorable({ code: 1, neighbors: [2] }), scorable({ code: "2" }), DIAGONAL);
    expect(numeric).toBe(textual);
    expect(mixed).toBe(numeric);
  });

  it("never scores below zero when the map has no size", () => {
    expect(distractorScore(scorable(), scorable({ code: "Z", group: "South" }), 0)).toBe(0);
  });
});

describe("a map's own regions as scorables", () => {
  it("measures each map against its own diagonal", () => {
    expect(mapDiagonal(us)).toBeCloseTo(Math.hypot(us.width, us.height));
    expect(mapDiagonal(world)).toBeGreaterThan(0);
  });

  it("ranks a real neighbour above a distant region", () => {
    const states = us.regions;
    const oregon = states.find((state) => state.code === "OR")!;
    const california = states.find((state) => state.code === "CA")!;
    const florida = states.find((state) => state.code === "FL")!;
    const diagonal = mapDiagonal(us);
    expect(distractorScore(california, oregon, diagonal)).toBeGreaterThan(distractorScore(california, florida, diagonal));
  });
});

describe("choosing the wrong answers", () => {
  it("never offers the target itself, and gives as many as were asked", () => {
    for (const region of us.regions.slice(0, 20)) {
      const wrong = pickDistractors(us, region.code, { count: 3 });
      expect(wrong).toHaveLength(3);
      expect(wrong).not.toContain(region.code);
      expect(new Set(wrong).size).toBe(3);
    }
  });

  it("offers a country's land neighbours first", () => {
    const wrong = pickDistractors(world, "DE", { count: 4 });
    const germany = world.regions.find((region) => region.code === "DE")!;
    expect(germany.neighbors.length).toBeGreaterThanOrEqual(4);
    for (const code of wrong) expect(germany.neighbors, code).toContain(code);
  });

  it("offers neighbours before strangers on a map of regions too", () => {
    const wrong = pickDistractors(fr, "75", { count: 3 });
    const paris = fr.regions.find((region) => region.code === "75")!;
    expect(wrong.some((code) => paris.neighbors.includes(code))).toBe(true);
  });

  it("is the same every time without a stream, and varies the company with one", () => {
    const plain = pickDistractors(world, "JP", { count: 3 });
    expect(pickDistractors(world, "JP", { count: 3 })).toEqual(plain);
    const seen = new Set<string>();
    for (let seed = 1; seed <= 40; seed += 1) for (const code of pickDistractors(world, "JP", { count: 3, random: seededRandom(seed) })) seen.add(code);
    expect(seen.size).toBeGreaterThan(3);
    expect(pickDistractors(world, "JP", { count: 3, random: seededRandom(7) })).toEqual(pickDistractors(world, "JP", { count: 3, random: seededRandom(7) }));
  });

  it("keeps to the places it is allowed to offer", () => {
    const allowed = ["CN", "KR", "RU", "US", "IN"];
    const wrong = pickDistractors(world, "JP", { count: 3, among: allowed });
    expect(wrong).toHaveLength(3);
    for (const code of wrong) expect(allowed).toContain(code);
  });

  it("offers fewer rather than failing when the map has too few places", () => {
    expect(pickDistractors({ width: 100, height: 100, regions: world.regions.slice(0, 2) }, world.regions[0]!.code, { count: 3 })).toHaveLength(1);
    expect(pickDistractors(world, "ZZ")).toEqual([]);
    expect(pickDistractors(world, "JP", { count: 0 })).toEqual([]);
  });
});

import { country as kuniCountry } from "@johnmorrisdotca/kuni";
import { describe, expect, it } from "vitest";
import atc from "./data/countries/atc.data.ts";
import ioa from "./data/countries/ioa.data.ts";
import kas from "./data/countries/kas.data.ts";
import { CHIZU_CONTINENTS, CHIZU_COUNTRIES } from "./data/countries.data.ts";
import world from "./data/world.data.ts";
import { pickDistractors } from "./distractors.ts";
import { drawChizu } from "./draw.ts";
import { findQuestion } from "./quiz.ts";
import { seededRandom } from "./random.ts";
import type { ChizuMap, ChizuRegion } from "./types.ts";

/* Natural Earth's leftover polygons with no ISO 3166-1 code: drawn on their own country maps, never asked. */
const PARTS = ["ATC", "IOA", "KAS"];
const partMaps: ChizuMap[] = [atc, ioa, kas];
const parts = (): ChizuRegion[] => partMaps.map((map) => map.regions[0]!);

/** The world with the three parts added, each placed on the target's own centroid, in its group and bordering it: as tempting as a wrong answer can be. */
function poolWithParts(targetCode: string): ChizuMap {
  const target = world.regions.find((region) => region.code === targetCode)!;
  const added = parts().map((region) => ({
    ...region,
    group: target.group,
    centroid: target.centroid,
    neighbors: [targetCode],
  }));
  return {
    ...world,
    regions: [
      ...world.regions.map((region) =>
        region === target ? { ...region, neighbors: [...region.neighbors, ...PARTS] } : region,
      ),
      ...added,
    ],
  };
}
describe("the places that are not countries", () => {
  it("are marked on the table and on their own maps, and only those three", () => {
    expect(
      CHIZU_COUNTRIES.filter((country) => country.kind === "territory-part")
        .map((country) => country.code)
        .sort(),
    ).toEqual(PARTS);
    expect(CHIZU_COUNTRIES.filter((country) => country.kind === "country")).toHaveLength(235);
    for (const map of partMaps) expect(map.regions.map((region) => region.territoryPart)).toEqual([true]);
    expect(CHIZU_COUNTRIES.find((country) => country.code === "XK")?.kind).toBe("country");
    for (const region of world.regions) expect(region.territoryPart, region.code).toBeUndefined();
  });

  it("are the places kuni has no ISO 3166-1 code for, which is how the build tells them", () => {
    const withoutCode = CHIZU_COUNTRIES.filter((country) => !kuniCountry(country.code)).map((country) => country.code);
    expect(withoutCode.sort()).toEqual(PARTS);
  });

  it("never turn up in a question or as a wrong answer, over many seeds, though placed as tempting as can be", () => {
    for (const targetCode of ["IN", "PK", "CN", "AU", "NZ", "ID", "KZ"]) {
      const pool = poolWithParts(targetCode);
      expect(pool.regions.filter((region) => region.territoryPart)).toHaveLength(3);
      for (let seed = 1; seed <= 200; seed++) {
        const question = findQuestion(pool, targetCode, seededRandom(seed))!;
        expect(question.choices, `${targetCode} seed ${seed}`).toHaveLength(4);
        for (const code of PARTS) expect(question.choices, `${targetCode} seed ${seed}`).not.toContain(code);
        const wrong = pickDistractors(pool, targetCode, { count: 5, random: seededRandom(seed) });
        for (const code of PARTS) expect(wrong, `${targetCode} seed ${seed}`).not.toContain(code);
      }
      // With no draw, the best three: still none of them.
      for (const code of PARTS) expect(pickDistractors(pool, targetCode, { count: 3 })).not.toContain(code);
    }
  });

  it("are never the place asked about", () => {
    const pool = poolWithParts("IN");
    for (const code of PARTS) expect(findQuestion(pool, code, seededRandom(1)), code).toBeNull();
    // Asked about each place of the pool in turn, no round has one as its target or its choice.
    for (const region of pool.regions.filter((one) => !one.territoryPart).slice(0, 60)) {
      const question = findQuestion(pool, region.code, seededRandom(3))!;
      expect(question.choices.filter((code) => PARTS.includes(code))).toEqual([]);
    }
  });

  it("are still drawn, as before, on their own maps", () => {
    for (const map of partMaps) {
      const svg = drawChizu(map);
      expect(svg.startsWith("<svg"), map.id).toBe(true);
      expect(svg, map.id).toContain(map.regions[0]!.path);
      expect(svg, map.id).not.toContain("territoryPart");
    }
    // Drawn among the countries of a map that holds them, with their codes as ids.
    const mixed = drawChizu(poolWithParts("IN"));
    for (const region of parts()) expect(mixed).toContain(region.path);
  });

  it("leave Kosovo, which has a code of its own, in the pool and the continents", () => {
    expect(findQuestion(world, "XK", seededRandom(1))?.target).toBe("XK");
    const asAnswer = Array.from(
      { length: 200 },
      (_, seed) => findQuestion(world, "RS", seededRandom(seed + 1))!.choices,
    ).filter((choices) => choices.includes("XK"));
    expect(asAnswer.length).toBeGreaterThan(0);
    expect(CHIZU_CONTINENTS.find((continent) => continent.code === "EU")!.codes).toContain("XK");
  });

  it("change the continents by those three and no more", () => {
    const counts = Object.fromEntries(CHIZU_CONTINENTS.map((continent) => [continent.code, continent.codes.length]));
    // Before: AS 53 and OC 26; the three are KAS and IOA of Asia, and ATC of Oceania.
    expect(counts).toEqual({ AF: 57, AN: 0, AS: 51, EU: 50, NA: 38, OC: 25, SA: 14 });
    const listed = CHIZU_CONTINENTS.flatMap((continent) => continent.codes);
    for (const code of PARTS) expect(listed).not.toContain(code);
    expect(listed.length + PARTS.length).toBe(CHIZU_COUNTRIES.length);
    // Their own continent stays on the table, for a page that draws a map of Asia with them.
    expect(
      CHIZU_COUNTRIES.filter((country) => PARTS.includes(country.code))
        .map((country) => country.group)
        .sort(),
    ).toEqual(["Asia", "Asia", "Oceania"]);
  });
});

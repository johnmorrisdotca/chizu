import { describe, expect, it } from "vitest";

import { CUT_OUTLINES } from "../scripts/data-config.mjs";
import { CHIZU_COUNTRIES, CHIZU_SUBREGIONS } from "./data/countries.data.ts";
import worldData from "./data/world.data.ts";
import worldGeoDetail from "./data/world-geo-detail.data.ts";
import { pickDistractors } from "./distractors.ts";
import { drawChizu } from "./draw.ts";
import { groupMap } from "./groups.ts";
import { layoutCallouts } from "./layout.ts";
import { loadWorldDetail } from "./load-entry.ts";
import { unprojectPoint } from "./project.ts";
import { findQuestion } from "./quiz.ts";
import { seededRandom } from "./random.ts";
import { withSmallStates } from "./smallStates.ts";
import plain from "./world-entry.ts";

const world = withSmallStates(plain);

/* The countries the world leaves off on purpose, and the ones the 1:110m outlines leave off because they are too small. */
const LEFT_OFF = ["AQ", "TF", "CYN", "SOL", "KAS", "ATC", "IOA"];
/* Drawn alone only (CUT_OUTLINES): on the world they are inside the country that holds them, or too small to draw. */
const ALONE_ONLY = Object.keys(CUT_OUTLINES).filter((code) => !LEFT_OFF.includes(code));
const drawn = new Set(worldData.regions.map((region) => region.code));
const dots = world.regions.filter((region) => region.small);
const regionOf = (code: string) => world.regions.find((region) => region.code === code);

/** One country's `<g class="cz-region">` in a drawing, which holds no other group. */
const groupOf = (svg: string, code: string) =>
  svg.match(new RegExp(`<g class="cz-region[^>]*data-code="${code}"[^>]*>.*?</g>`))?.[0];

describe("the smallest countries, as dots on the world", () => {
  it("has Singapore, Malta and Bahrain, each a small region with its code, names and continent", () => {
    for (const [code, name, nameJa, group, groupJa] of [
      ["SG", "Singapore", "シンガポール", "Asia", "アジア"],
      ["MT", "Malta", "マルタ", "Europe", "ヨーロッパ"],
      ["BH", "Bahrain", "バーレーン", "Asia", "アジア"],
    ] as const) {
      const region = regionOf(code)!;
      expect(region.small, code).toBe(true);
      expect({ name: region.name, nameJa: region.nameJa, group: region.group, groupJa: region.groupJa }).toEqual({
        name,
        nameJa,
        group,
        groupJa,
      });
    }
  });

  it("puts every country but the seven left off and the thirteen drawn alone only on the world, and flags exactly the 62 the 1:110m outlines lack", () => {
    const expected = CHIZU_COUNTRIES.map((country) => country.code).filter(
      (code) => !LEFT_OFF.includes(code) && !ALONE_ONLY.includes(code),
    );
    expect(world.regions.map((region) => region.code).sort()).toEqual([...expected].sort());
    expect(world.regions).toHaveLength(235);
    expect(dots).toHaveLength(62);
    expect(dots.map((region) => region.code).sort()).toEqual(expected.filter((code) => !drawn.has(code)).sort());
    for (const code of [...LEFT_OFF, ...ALONE_ONLY]) expect(regionOf(code), code).toBeUndefined();
  });

  it("gives a dot the names, reading and codes the country table holds", () => {
    expect(dots).toHaveLength(62);
    for (const dot of dots) {
      const country = CHIZU_COUNTRIES.find((one) => one.code === dot.code)!;
      expect(
        {
          name: dot.name,
          nameJa: dot.nameJa,
          nameShortJa: dot.nameShortJa,
          reading: dot.reading,
          group: dot.group,
          iso3: dot.iso3,
        },
        dot.code,
      ).toEqual({
        name: country.name,
        nameJa: country.nameJa,
        nameShortJa: country.nameShortJa,
        reading: country.reading,
        group: country.group,
        iso3: country.iso3,
      });
      expect(dot.groupJa, dot.code).toBeTruthy();
    }
  });

  it("adds no dot for a country already drawn, and leaves every drawn region exactly as the data has it", () => {
    expect(dots).toHaveLength(62);
    for (const dot of dots) expect(drawn.has(dot.code), dot.code).toBe(false);
    expect(new Set(world.regions.map((region) => region.code)).size).toBe(world.regions.length);
    expect(world.regions.slice(0, worldData.regions.length)).toEqual(worldData.regions);
    expect(world.regions.slice(worldData.regions.length).every((region) => region.small === true)).toBe(true);
    expect(world.regions.slice(0, worldData.regions.length).some((region) => region.small)).toBe(false);
    expect({ ...world, regions: [], source: "" }).toEqual({ ...worldData, regions: [], source: "" });
  });

  it("adds no dot for a country a map already draws, and never changes the map it is given", () => {
    const outline = { ...regionOf("SG")!, small: undefined };
    const own = { ...worldData, regions: [...worldData.regions, outline] };
    const made = withSmallStates(own);
    expect(made.regions.filter((region) => region.code === "SG")).toEqual([outline]);
    expect(made.regions).toHaveLength(worldData.regions.length + 62);
    expect(own.regions).toHaveLength(worldData.regions.length + 1);
    expect(withSmallStates(own)).toBe(made);
    expect(withSmallStates(world)).toBe(world);
    const small = new Set(dots.map((region) => region.code));
    for (const region of worldData.regions) for (const other of region.neighbors) expect(small.has(other)).toBe(false);
    const sea = { ...worldData, kind: "country" as const };
    expect(withSmallStates(sea)).toBe(sea);
  });

  it("draws a country the world already had exactly as before: the drawing differs by the dots alone", () => {
    expect(dots).toHaveLength(62);
    const options = { labels: ["JP", "FR"], tones: { JP: "selected", FR: "correct" }, language: "ja" as const };
    const before = drawChizu(worldData, options);
    const after = drawChizu(world, options);
    let withoutDots = after;
    for (const dot of dots) withoutDots = withoutDots.replace(groupOf(after, dot.code)!, "");
    expect(withoutDots).toBe(before);
    for (const code of ["JP", "FR", "US", "AU"]) expect(groupOf(after, code)).toBe(groupOf(before, code));
  });

  it("draws a dot as a closed little shape on the point it stands for, in the world's own land style", () => {
    const svg = drawChizu(world);
    for (const code of ["SG", "MT", "BH"]) {
      const group = groupOf(svg, code)!;
      expect(group, code).toContain('<path class="cz-land"');
      expect(group, code).toContain(`<title>${regionOf(code)!.name}</title>`);
    }
    for (const dot of dots) {
      const [x, y] = dot.centroid;
      expect(dot.path.startsWith("M") && dot.path.endsWith("Z"), dot.code).toBe(true);
      expect(dot.bbox[2] - dot.bbox[0], dot.code).toBeCloseTo(3.6, 1);
      expect(dot.bbox[0] < x && x < dot.bbox[2] && dot.bbox[1] < y && y < dot.bbox[3], dot.code).toBe(true);
      expect(x >= 0 && x <= world.width && y >= 0 && y <= world.height, dot.code).toBe(true);
    }
  });

  it("puts each dot on its country's 1:50m outline, to the nearest hundredth of a degree", () => {
    expect(dots).toHaveLength(62);
    const features = new Map(worldGeoDetail.features.map((feature) => [feature.properties.code, feature]));
    for (const dot of dots) {
      const [lon, lat] = unprojectPoint(world, dot.centroid[0], dot.centroid[1])!;
      const feature = features.get(dot.code)!;
      const polygons = (
        feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates
      ) as number[][][][];
      const inside = polygons.some((polygon) => {
        const ring = polygon[0]!;
        const lons = ring.map((position) => position[0]!);
        const lats = ring.map((position) => position[1]!);
        return (
          lon >= Math.min(...lons) - 0.02 &&
          lon <= Math.max(...lons) + 0.02 &&
          lat >= Math.min(...lats) - 0.02 &&
          lat <= Math.max(...lats) + 0.02
        );
      });
      expect(inside, `${dot.code} at ${lon.toFixed(2)}, ${lat.toFixed(2)}`).toBe(true);
    }
  });

  it("names as neighbours only countries the world has, and the land borders the small ones have", () => {
    const codes = new Set(world.regions.map((region) => region.code));
    for (const dot of dots) {
      for (const other of dot.neighbors) expect(codes.has(other), `${dot.code} ${other}`).toBe(true);
      expect(dot.neighbors).not.toContain(dot.code);
    }
    expect(regionOf("MC")!.neighbors).toEqual(["FR"]);
    expect(regionOf("AD")!.neighbors).toEqual(["ES", "FR"]);
    expect(regionOf("SG")!.neighbors).toEqual([]);
  });

  it("is asked in a world quiz: any small country is a target, and turns up among the choices", () => {
    for (const code of ["SG", "MT", "BH"]) {
      const question = findQuestion(world, code, seededRandom(4))!;
      expect(question.target).toBe(code);
      expect(question.choices).toHaveLength(4);
      expect(question.choices[question.answerIndex]).toBe(code);
    }
    const asked = new Set<string>();
    const offered = new Set<string>();
    for (let seed = 1; seed <= 300; seed += 1) {
      const random = seededRandom(seed);
      const target = world.regions[Math.floor(random() * world.regions.length)]!;
      const question = findQuestion(world, target.code, random)!;
      if (target.small) asked.add(target.code);
      for (const choice of question.choices) if (regionOf(choice)!.small) offered.add(choice);
    }
    expect(asked.size).toBeGreaterThan(20);
    expect(offered.size).toBeGreaterThan(20);
    // Land neighbours are the best look-alikes, so Monaco is asked among France's and Italy's.
    expect(pickDistractors(world, "MC", { count: 1 })).toEqual(["FR"]);
  });

  it("never asks about the countries left off, nor a piece drawn with no name", () => {
    for (const code of LEFT_OFF) expect(findQuestion(world, code, seededRandom(1)), code).toBeNull();
    const unnamed = { ...world.regions[0]!, code: "ZZ", unnamed: true };
    const withPiece = { ...world, regions: [...world.regions, unnamed] };
    expect(findQuestion(withPiece, "ZZ", seededRandom(1))).toBeNull();
    for (let seed = 1; seed <= 100; seed += 1)
      for (const code of ["SG", "FR", "JP"])
        expect(pickDistractors(withPiece, code, { random: seededRandom(seed) })).not.toContain("ZZ");
    for (let seed = 1; seed <= 200; seed += 1)
      for (const code of ["SG", "MT", "FR", "HK"])
        for (const choice of findQuestion(world, code, seededRandom(seed))!.choices)
          expect(LEFT_OFF, choice).not.toContain(choice);
  });

  it("numbers and labels a dot like any country", () => {
    const spots = layoutCallouts(world, { codes: ["SG", "MT", "BH", "JP"] });
    expect(spots.map((spot) => spot.code).sort()).toEqual(["BH", "JP", "MT", "SG"]);
    for (const spot of spots.filter((one) => one.code !== "JP")) {
      const dot = regionOf(spot.code)!;
      expect(Math.hypot(spot.start[0] - dot.centroid[0], spot.start[1] - dot.centroid[1]), spot.code).toBeLessThan(2);
    }
    const svg = drawChizu(world, { callouts: ["SG", "MT"], labels: ["SG"], language: "ja" });
    expect(svg).toContain('class="cz-label"');
    expect(svg).toMatch(/data-code="SG">シンガポール<\/text>/);
    expect(svg.match(/class="cz-callout"/g)).toHaveLength(2);
  });

  it("is the same world, once, however often it is asked for, and the finer world is plain until asked", async () => {
    const detail = await loadWorldDetail();
    expect(dots).toHaveLength(62);
    expect(await loadWorldDetail()).toBe(detail);
    expect(detail.id).toBe("world-detail");
    expect(detail.regions).toHaveLength(173);
    expect(detail.regions.some((region) => region.small)).toBe(false);
    const withDots = withSmallStates(detail);
    expect(withDots.regions.map((region) => region.code)).toEqual(world.regions.map((region) => region.code));
    for (const dot of dots) expect(withDots.regions.find((region) => region.code === dot.code)).toEqual(dot);
  });

  it("leaves the world as it was by default: 173 regions, the same data, and a drawing no different", () => {
    expect(plain.regions).toHaveLength(173);
    expect(plain).toBe(worldData);
    expect(plain.regions.some((region) => region.small)).toBe(false);
    expect(drawChizu(plain)).toBe(drawChizu(worldData));
    expect(drawChizu(plain)).not.toContain('data-code="SG"');
    expect(drawChizu(plain, { labels: ["JP"], tones: { JP: "selected" } })).toBe(
      drawChizu(worldData, { labels: ["JP"], tones: { JP: "selected" } }),
    );
  });

  it("draws the dots when given the map with them, and nothing else changes", () => {
    const asked = drawChizu(world);
    for (const dot of dots) expect(groupOf(asked, dot.code), dot.code).toBeDefined();
    expect(asked.match(/class="cz-region/g)).toHaveLength(235);
    let withoutDots = asked;
    for (const dot of dots) withoutDots = withoutDots.replace(groupOf(asked, dot.code)!, "");
    expect(withoutDots).toBe(drawChizu(plain));
    expect(drawChizu(world, { callouts: ["SG"] })).toContain('data-code="SG"');
  });

  it("asks nothing about a small country on the plain world, and does on the world with the dots", () => {
    expect(findQuestion(plain, "SG", seededRandom(1))).toBeNull();
    expect(findQuestion(world, "SG", seededRandom(1))).not.toBeNull();
    for (let seed = 1; seed <= 50; seed += 1)
      for (const code of pickDistractors(plain, "MC", { random: seededRandom(seed) }))
        expect(regionOf(code)!.small, code).toBeUndefined();
  });

  it("makes a quiz of Micronesia and of Polynesia, which are all dots on the 1:110m world", () => {
    for (const code of ["057", "061"]) {
      const group = CHIZU_SUBREGIONS.find((one) => one.code === code)!;
      expect(group.codes.filter((one) => drawn.has(one))).toEqual([]);
      const map = groupMap(world, group.codes);
      expect(map.regions.length).toBe(group.codes.length);
      const asked = new Set<string>();
      for (let seed = 1; seed <= 60; seed += 1) {
        const target = group.codes[seed % group.codes.length]!;
        const question = findQuestion(map, target, seededRandom(seed))!;
        asked.add(question.target);
        expect(question.choices.length).toBeGreaterThanOrEqual(4);
        for (const choice of question.choices) expect(group.codes).toContain(choice);
      }
      expect(asked.size).toBe(group.codes.length);
      // Pointed at the world with the dots, with only these allowed, the same questions are asked.
      const among = findQuestion(world, group.codes[0]!, seededRandom(3), { among: group.codes })!;
      for (const choice of among.choices) expect(group.codes).toContain(choice);
    }
  });
});

import { describe, expect, it } from "vitest";

import { CHIZU_CONTINENTS, CHIZU_COUNTRIES, CHIZU_SUBREGIONS } from "./data/countries.ts";
import { DIVISIONS_LOADERS } from "./data/loaders.ts";
import world from "./data/world.ts";
import { pickDistractors } from "./distractors.ts";
import { groupBox, groupMap, groupTones, regionGroups } from "./groups.ts";
import { layoutCallouts } from "./layout.ts";
import { findQuestion } from "./quiz.ts";
import { seededRandom } from "./random.ts";

const continent = (code: string) => CHIZU_CONTINENTS.find((entry) => entry.code === code)!;

describe("the continents and subregions", () => {
  it("are kuni's seven continents, with every country in exactly one", () => {
    expect(CHIZU_CONTINENTS.map((entry) => entry.code)).toEqual(["AF", "AN", "AS", "EU", "NA", "OC", "SA"]);
    const placed = CHIZU_CONTINENTS.flatMap((entry) => entry.codes);
    expect(placed.sort()).toEqual(CHIZU_COUNTRIES.map((country) => country.code).sort());
    for (const country of CHIZU_COUNTRIES) {
      const home = CHIZU_CONTINENTS.find((entry) => entry.codes.includes(country.code))!;
      expect(home.name, country.code).toBe(country.group);
    }
  });

  it("name every continent and subregion in English and Japanese, with a reading", () => {
    for (const entry of [...CHIZU_CONTINENTS, ...CHIZU_SUBREGIONS]) {
      expect(entry.name.length, entry.code).toBeGreaterThan(0);
      expect(entry.nameJa?.length, entry.code).toBeGreaterThan(0);
      expect(entry.reading?.length, entry.code).toBeGreaterThan(0);
    }
    expect(continent("AS").nameJa).toBe("アジア");
    // kuni 1.1.0 follows UN M49, which puts South Georgia in South America and Heard Island in Oceania: Antarctica, which
    // the maps leave off, holds none of the countries drawn.
    expect(continent("AN").codes).toEqual([]);
    expect([continent("SA").codes.includes("GS"), continent("OC").codes.includes("HM"), continent("AF").codes.includes("IO")]).toEqual([true, true, true]);
  });

  it("put every country kuni places in a subregion in that one subregion only", () => {
    const seen = new Map<string, string>();
    for (const entry of CHIZU_SUBREGIONS) {
      expect(entry.kind).toBe("subregion");
      for (const code of entry.codes) {
        expect(seen.get(code), `${code} in ${entry.code} and ${seen.get(code)}`).toBeUndefined();
        seen.set(code, entry.code);
      }
    }
    expect(CHIZU_SUBREGIONS.find((entry) => entry.code === "030")!.codes).toEqual(expect.arrayContaining(["CN", "JP", "KR", "KP", "MN", "TW"]));
  });
});

describe("a group's map", () => {
  it("keeps only the group, with neighbours among themselves", () => {
    const africa = groupMap(world, continent("AF").codes, { name: "Africa" });
    expect(africa.regions.every((region) => continent("AF").codes.includes(region.code))).toBe(true);
    expect(africa.regions.length).toBe(world.regions.filter((region) => region.group === "Africa").length);
    const egypt = africa.regions.find((region) => region.code === "EG")!;
    expect(egypt.neighbors).not.toContain("IL");
    expect(egypt.neighbors).toContain("LY");
    expect(africa.name).toBe("Africa");
    expect(world.regions.find((region) => region.code === "EG")!.neighbors).toContain("IL");
  });

  it("asks questions and numbers callouts within the group only", () => {
    const europe = groupMap(world, continent("EU").codes);
    const question = findQuestion(europe, "FR", seededRandom(3))!;
    for (const choice of question.choices) expect(continent("EU").codes).toContain(choice);
    for (const code of pickDistractors(europe, "DE", { count: 5 })) expect(continent("EU").codes).toContain(code);
    const spots = layoutCallouts(world, { codes: ["FR", "DE", "IT", "ES"], box: groupBox(world, continent("EU").codes) });
    expect(spots.map((spot) => spot.code).sort()).toEqual(["DE", "ES", "FR", "IT"]);
  });

  it("works for any list of codes a page names, and passes over codes the map does not have", () => {
    const g7 = ["CA", "FR", "DE", "IT", "JP", "GB", "US", "XX"];
    expect(groupMap(world, g7).regions.map((region) => region.code).sort()).toEqual(["CA", "DE", "FR", "GB", "IT", "JP", "US"]);
  });
});

describe("framing a group", () => {
  it("frames Western Europe on the mainlands, not on France's overseas departments", () => {
    const box = groupBox(world, CHIZU_SUBREGIONS.find((entry) => entry.code === "155")!.codes);
    const france = world.regions.find((region) => region.code === "FR")!;
    // France on the world reaches South America (French Guiana); Europe's window does not.
    expect(france.bbox[3]).toBeGreaterThan(box.y + box.height);
    const brazil = world.regions.find((region) => region.code === "BR")!;
    expect(box.y + box.height).toBeLessThan(brazil.bbox[1]);
  });

  it("takes the shape of the frame it is drawn in", () => {
    const box = groupBox(world, continent("AF").codes, 2);
    expect(box.width / box.height).toBeCloseTo(2, 5);
  });

  it("frames Japan's regions, the boxed ones where they are drawn", async () => {
    const japan = (await DIVISIONS_LOADERS.jp!()).default;
    const kyushu = regionGroups(japan).find((group) => group.name === "Kyushu")!;
    const box = groupBox(japan, kyushu.codes);
    const okinawa = japan.insets.find((inset) => inset.code === "47")!.box;
    expect(box.y).toBeLessThanOrEqual(okinawa.y);
  });

  it("is the whole map for a group the map has none of", () => {
    expect(groupBox(world, ["XX"])).toEqual({ x: 0, y: 0, width: world.width, height: world.height });
  });
});

describe("a map's own groups", () => {
  it("are the continents on the world, with their Japanese names", () => {
    const groups = regionGroups(world);
    expect(groups.map((group) => group.name)).toEqual(["Asia", "Europe", "Africa", "North America", "South America", "Oceania"]);
    expect(groups[0]!.nameJa).toBe("アジア");
  });

  it("are the eight regions a Japanese school teaches on Japan's map, and Canada's five, and the Census regions", async () => {
    const japan = (await DIVISIONS_LOADERS.jp!()).default;
    expect(regionGroups(japan).map((group) => `${group.name} ${group.nameJa} ${group.codes.length}`)).toEqual([
      "Hokkaido 北海道地方 1",
      "Tohoku 東北地方 6",
      "Kanto 関東地方 7",
      "Chubu 中部地方 9",
      "Kinki 近畿地方 7",
      "Chugoku 中国地方 5",
      "Shikoku 四国地方 4",
      "Kyushu 九州地方 8",
    ]);
    const canada = (await DIVISIONS_LOADERS.ca!()).default;
    expect(Object.fromEntries(regionGroups(canada).map((group) => [group.name, group.codes.sort()]))).toEqual({
      Prairies: ["AB", "MB", "SK"],
      "West Coast": ["BC"],
      Atlantic: ["NB", "NL", "NS", "PE"],
      North: ["NT", "NU", "YT"],
      Central: ["ON", "QC"],
    });
    const us = (await DIVISIONS_LOADERS.us!()).default;
    expect(regionGroups(us).map((group) => group.nameJa).sort()).toEqual(["中西部", "北東部", "南部", "西部"]);
  });
});

describe("tones for a group", () => {
  it("fades everything outside, and tones the inside as asked", () => {
    const tones = groupTones(world, ["JP"], "faint", { JP: "selected" });
    expect(tones.JP).toBe("selected");
    expect(tones.FR).toBe("faint");
    expect(Object.keys(tones)).toHaveLength(world.regions.length);
  });
});

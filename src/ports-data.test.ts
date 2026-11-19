import { describe, expect, it } from "vitest";
import { AIRPORT_TIER_ENDS, AIRPORTS, AIRPORTS_CREDIT } from "./airports-entry.ts";
import { HARBOURS, HARBOURS_CREDIT } from "./harbours-entry.ts";
import type { ChizuPort } from "./ports.ts";

const sound = (list: readonly ChizuPort[], kind: ChizuPort["kind"]) => {
  expect(new Set(list.map((one) => one.id)).size).toBe(list.length);
  for (const one of list) {
    expect(one.kind).toBe(kind);
    expect(one.id, one.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(one.name.en, one.id).not.toBe("");
    expect(one.name.ja ?? "x", one.id).not.toBe("");
    expect(one.country, one.id).toMatch(/^([A-Z]{2}|SOL|CYN)$/);
    expect(Math.abs(one.lat), one.id).toBeLessThanOrEqual(90);
    expect(Math.abs(one.lon), one.id).toBeLessThanOrEqual(180);
    expect([1, 2, 3]).toContain(one.tier);
  }
};

describe("the airports", () => {
  it("are the 600 busiest, in tiers that end at the 150th, 300th and 600th", () => {
    expect(AIRPORTS).toHaveLength(600);
    expect(AIRPORT_TIER_ENDS).toEqual([150, 300, 600]);
    AIRPORTS.forEach((one, index) => {
      expect(one.tier, one.id).toBe(AIRPORT_TIER_ENDS.findIndex((end) => index < end) + 1);
    });
    sound(AIRPORTS, "airport");
  });
  it("are ranked by passengers a year, with the figure's year, from 2015 on", () => {
    for (const [index, one] of AIRPORTS.entries()) {
      expect(one.passengers, one.id).toBeGreaterThan(1_000_000);
      expect(one.year, one.id).toBeGreaterThanOrEqual(2015);
      if (index > 0) expect(one.passengers!, one.id).toBeLessThanOrEqual(AIRPORTS[index - 1]!.passengers!);
    }
  });
  it("leave out a figure that is a plan for an airport not yet open", () => {
    expect(AIRPORTS.some((one) => one.name.en === "King Salman International Airport")).toBe(false);
    expect(AIRPORTS[0]?.code).toBe("ATL");
  });
  it("carry codes, names in both languages and countries", () => {
    const haneda = AIRPORTS.find((one) => one.id === "hnd")!;
    expect(haneda).toMatchObject({ code: "HND", country: "JP", name: { ja: "東京国際空港" } });
    expect(AIRPORTS.find((one) => one.id === "lhr")?.country).toBe("GB");
    expect(AIRPORTS.find((one) => one.id === "bsl")?.country).toBe("FR");
    expect(AIRPORTS.filter((one) => one.name.ja === undefined).length).toBeLessThanOrEqual(3);
    expect(AIRPORTS.every((one) => (one.code ?? "") === (one.code ?? "").toUpperCase())).toBe(true);
  });
  it("are credited in both languages", () => {
    expect(AIRPORTS_CREDIT.en).toContain("Wikidata");
    expect(AIRPORTS_CREDIT.ja).toContain("Wikidata");
  });
});

describe("the harbours", () => {
  it("are Natural Earth's 1,081 ports, the largest first, in three tiers", () => {
    expect(HARBOURS).toHaveLength(1081);
    sound(HARBOURS, "harbour");
    const tiers = HARBOURS.map((one) => one.tier);
    expect(tiers).toEqual([...tiers].sort());
    expect([1, 2, 3].map((tier) => tiers.filter((one) => one === tier).length)).toEqual([143, 150, 788]);
  });
  it("name Yokohama in Japanese, and keep English where Wikidata has no label", () => {
    const yokohama = HARBOURS.find((one) => one.id === "yokohama")!;
    expect(yokohama).toMatchObject({ country: "JP", name: { en: "Yokohama", ja: "横浜港" } });
    expect(HARBOURS.filter((one) => one.name.ja !== undefined).length).toBeGreaterThan(800);
    expect(HARBOURS.some((one) => one.name.ja === undefined)).toBe(true);
    expect(HARBOURS.every((one) => !/[(（]/.test(one.name.ja ?? ""))).toBe(true);
  });
  it("have no code, no passengers, and a credit in both languages", () => {
    expect(HARBOURS.every((one) => one.code === undefined && one.passengers === undefined)).toBe(true);
    expect(HARBOURS_CREDIT.en).toContain("Natural Earth");
    expect(HARBOURS_CREDIT.ja).toContain("Natural Earth");
  });
});

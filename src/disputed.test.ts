import { describe, expect, it } from "vitest";
import WORLD from "./data/world.data.ts";
import { COUNTRY_CODES, DIVISIONS_CODES, loadCountry, loadDivisions, loadWorldDetail } from "./load-entry.ts";
import type { ChizuMap } from "./types.ts";

/** Every region of every map that says it is disputed, as `map:code`. */
async function flagged(): Promise<string[]> {
  const maps: ChizuMap[] = [WORLD, await loadWorldDetail()];
  for (const code of COUNTRY_CODES) maps.push((await loadCountry(code))!);
  for (const code of DIVISIONS_CODES) maps.push((await loadDivisions(code))!);
  return maps.flatMap((map) =>
    map.regions.filter((region) => region.disputed).map((region) => `${map.id}:${region.code}`),
  );
}

describe("the regions whose status is disputed", () => {
  it("are marked on every map that draws them, and on no other region", async () => {
    expect((await flagged()).sort()).toEqual(
      [
        ...["world", "world-detail", "country-xk", "country-tw", "country-eh"].flatMap((id) =>
          id.startsWith("world")
            ? ["XK", "TW", "EH"].map((code) => `${id}:${code}`)
            : [`${id}:${id.slice(-2).toUpperCase()}`],
        ),
        "divisions-ru:UA-43",
        "divisions-ru:UA-40",
        "divisions-in:AR",
        "divisions-in:JK",
        "divisions-in:LA",
      ].sort(),
    );
  }, 60000);

  it("each have a one-line note in English and in Japanese", async () => {
    const seen = new Set<string>();
    for (const map of [WORLD, (await loadDivisions("ru"))!, (await loadDivisions("in"))!]) {
      for (const region of map.regions.filter((one) => one.disputed)) {
        expect(region.disputedNote, region.code).toMatch(/^[^\n]{30,260}$/);
        expect(region.disputedNoteJa, region.code).toMatch(/[\u3040-\u30ff\u4e00-\u9fff]/);
        expect(region.disputedNoteJa, region.code).not.toMatch(/\n/);
        seen.add(region.code);
      }
    }
    expect([...seen].sort()).toEqual(["AR", "EH", "JK", "LA", "TW", "UA-40", "UA-43", "XK"]);
  });

  it("leave a region that is not disputed with none of the three fields", () => {
    const japan = WORLD.regions.find((region) => region.code === "JP")!;
    expect("disputed" in japan || "disputedNote" in japan || "disputedNoteJa" in japan).toBe(false);
  });
});

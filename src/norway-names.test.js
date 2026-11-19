import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/*
 * Norway's names, held to the build's configuration as text: the build's scripts are not imported here, and the
 * generated map is not read, so this holds before `pnpm data` has written the names.
 */
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const names = read("scripts/data-config/names.mjs");
const isoJoin = read("scripts/data-config/iso-join.mjs");

describe("Norway's counties of 2024", () => {
  it("names the eight joined pre-2020 counties as the county they lie in", () => {
    const table = names.match(/NAMED_AS_COUNTY_WITH_PART = [\s\S]*?\n\);/)?.[0] ?? "";
    for (const code of ["04", "05", "09", "10", "12", "14", "16", "17"]) expect(table).toContain(`"${code}"`);
    // Each of them carries the ISO code of the county of 2024 it joined.
    for (const [code, iso] of [
      ["04", "NO-34"],
      ["05", "NO-34"],
      ["09", "NO-42"],
      ["10", "NO-42"],
      ["12", "NO-46"],
      ["14", "NO-46"],
      ["16", "NO-50"],
      ["17", "NO-50"],
    ])
      expect(isoJoin).toMatch(new RegExp(`\\["${code}", "[^"]+", "${iso}"`));
  });

  it("joins the 15 pre-2020 counties to 11 counties of 2024", () => {
    const codes = new Set([...isoJoin.matchAll(/\["\d\d", "[^"]+", "(NO-\d\d)"/g)].map((m) => m[1]));
    expect([...codes].sort()).toEqual([
      "NO-31",
      "NO-32",
      "NO-33",
      "NO-34",
      "NO-39",
      "NO-40",
      "NO-42",
      "NO-46",
      "NO-50",
      "NO-55",
      "NO-56",
    ]);
  });

  it("draws Svalbard and Bouvet Island but as territories, not counties", () => {
    const table = names.match(/TYPE_FIXES = \{[\s\S]*?\n\};/)?.[0] ?? "";
    expect(table).toContain('"NO:21": "territory"');
    expect(table).toContain('"NO:X01~": "territory"');
  });
});

import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Each list is its own entry, so the data files are held to a size each: a page pays for the one it imports.
describe("the airports' and harbours' data files", () => {
  it("stay within their size", () => {
    expect(statSync("src/ports-data/airports.data.ts").size).toBeLessThan(200_000);
    expect(statSync("src/ports-data/harbours.data.ts").size).toBeLessThan(200_000);
  });
  it("are written by the build script and say what they were made from", () => {
    for (const file of ["airports", "harbours"]) {
      const text = readFileSync(`src/ports-data/${file}.data.ts`, "utf8");
      expect(text).toContain("WRITTEN BY scripts/build-ports.mjs");
      expect(text).toMatch(/retrieved \d{4}-\d{2}-\d{2}/);
    }
  });
});

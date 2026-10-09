// The files of features held to their budgets, and to the notice that says where they come from. Plain JavaScript, so
// that reading files needs no Node types.
import { readdirSync, readFileSync, statSync } from "node:fs";

import { describe, expect, it } from "vitest";

/** The largest a file of features may be: the world's is fetched beside the 170 kB world, a country's alone. */
export const FEATURE_BUDGET = { world: 210_000, other: 300_000 };

describe("the files of features", () => {
  it("are each within their budget", () => {
    const files = readdirSync("src/data/features");
    expect(files.length).toBeGreaterThan(200);
    for (const file of files) expect(statSync(`src/data/features/${file}`).size, file).toBeLessThanOrEqual(file === "world.ts" ? FEATURE_BUDGET.world : FEATURE_BUDGET.other);
  });

  it("say where the shapes and names come from, in NOTICE.md", () => {
    const notice = readFileSync("NOTICE.md", "utf8");
    for (const words of ["Wikidata", "CC0", "ne_10m_rivers_lake_centerlines", "ne_10m_geography_marine_polys", "kuni"]) expect(notice, words).toContain(words);
  });
});

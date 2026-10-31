// The files of features held to their budgets, and to the notice that says where they come from. Plain JavaScript, so
// that reading files needs no Node types.
import { readdirSync, readFileSync, statSync } from "node:fs";

import { describe, expect, it } from "vitest";

/** The largest a file of features may be, after the 120-column format: the world's is fetched beside the world, a country's alone. */
export const FEATURE_BUDGET = { world: 240_000, other: 310_000 };

describe("the files of features", () => {
  it("are each within their budget", () => {
    const files = readdirSync("src/data/features");
    expect(files.length).toBeGreaterThan(200);
    for (const file of files)
      expect(statSync(`src/data/features/${file}`).size, file).toBeLessThanOrEqual(
        file === "world.data.ts" ? FEATURE_BUDGET.world : FEATURE_BUDGET.other,
      );
  });

  it("say where the shapes and names come from, in NOTICE.md", () => {
    const notice = readFileSync("NOTICE.md", "utf8");
    for (const words of ["Wikidata", "CC0", "ne_10m_rivers_lake_centerlines", "ne_10m_geography_marine_polys", "kuni"])
      expect(notice, words).toContain(words);
  });
});

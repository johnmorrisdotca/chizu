import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** The README's Architecture tree names every source file, and nothing that is not one, so it cannot fall behind the code. The generated maps (a file for each country) are named by their folders, with their counts. */
describe("the README's Architecture", () => {
  const readme = readFileSync("README.md", "utf8");
  const section = readme.slice(readme.indexOf("## Architecture"));
  const tree = section.slice(section.indexOf("```text"), section.indexOf("```", section.indexOf("```text") + 7));
  const files = (folder) => readdirSync(folder, { recursive: true }).map((path) => path.replace(/\\/g, "/"));

  it("names exactly the files under src/, the generated maps apart", () => {
    const named = [...tree.matchAll(/[├└]── ([\w.-]+\.ts)\b/g)].map((match) => match[1]).sort();
    const listed = files("src")
      .filter((path) => path.endsWith(".ts") && !/\.(test|fixture)\./.test(path) && !/^data\/(countries|divisions|features)\//.test(path))
      .map((path) => path.split("/").at(-1))
      .sort();
    expect(named).toEqual(listed);
  });

  it("counts the generated maps as the folders have them", () => {
    const count = (folder) => files(`src/data/${folder}`).filter((path) => path.endsWith(".ts")).length;
    expect(tree).toContain(`countries/<code>.ts   ${count("countries")} countries, each alone`);
    expect(tree).toContain(`divisions/<code>.ts   ${count("divisions")} countries' regions`);
    expect(tree).toContain(`features/<map>.ts     ${count("features")} maps' named features`);
  });
});

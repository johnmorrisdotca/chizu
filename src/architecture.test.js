import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** The source tree in docs/architecture.md, which the README's Architecture section links, and the copy of it in the architecture guide, name every source file, and nothing that is not one, so they cannot fall behind the code. The generated maps (a file for each country) are named by their folders, with their counts. */
const treeOf = (text) => text.slice(text.indexOf("```text"), text.indexOf("```", text.indexOf("```text") + 7));
const trees = {
  "the source tree in docs/architecture.md": treeOf(readFileSync("docs/architecture.md", "utf8")),
  "the source tree in the architecture guide": treeOf(readFileSync("docs/guides/architecture.md", "utf8")),
};
for (const [title, tree] of Object.entries(trees)) describe(title, () => {
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

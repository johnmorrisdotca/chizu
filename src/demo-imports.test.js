import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * The demo page's modules import one way: demo.js sets the page up and imports the panels, a panel imports demo-core.js
 * and the helpers, and what one panel calls in another goes through demo-core's `calls`. A cycle works only while every
 * use waits inside a function, so none is allowed.
 */
const folder = "demo";
const modules = readdirSync(folder).filter((name) => name.endsWith(".js"));
const importsOf = (name) =>
  [...readFileSync(`${folder}/${name}`, "utf8").matchAll(/^(?:import|export)\b[^;]*?\bfrom\s+"\.\/([\w.-]+\.js)"/gms)]
    .map((match) => match[1])
    .filter((target) => modules.includes(target));

/** Every cycle of imports among the demo's own modules, each as the path that closes it. */
function cycles() {
  const graph = new Map(modules.map((name) => [name, importsOf(name)]));
  const found = [];
  const done = new Set();
  const walk = (name, path) => {
    if (path.includes(name)) {
      found.push([...path.slice(path.indexOf(name)), name].join(" -> "));
      return;
    }
    if (done.has(name)) return;
    for (const next of graph.get(name) ?? []) walk(next, [...path, name]);
    done.add(name);
  };
  for (const name of modules) walk(name, []);
  return found;
}

describe("the demo page's modules", () => {
  it("read their imports (demo.js imports each panel)", () => {
    expect(importsOf("demo.js")).toEqual(
      expect.arrayContaining(["demo-core.js", "demo-maps.js", "demo-info.js", "demo-quiz.js", "demo-colour.js"]),
    );
  });

  it("import each other in no cycle", () => {
    expect(cycles()).toEqual([]);
  });
});

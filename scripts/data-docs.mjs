// Public reference comments for the generated map and feature modules.
import process from "node:process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function mapReferenceDoc(entry, description, map) {
  const importPath = `@johnmorrisdotca/chizu/${entry}`;
  return `/**\n * ${description}\n * The native map geometry, region identifiers, names, projection and insets; coordinates belong to this canvas.\n *\n * @example\n * \`\`\`ts\n * import map from "${importPath}";\n * console.log(map.id, map.kind, map.regions.length, map.viewBox);\n * // ${map.id} ${map.kind} ${map.regions.length} ${map.viewBox}\n * \`\`\`\n */\n`;
}

export function featureReferenceDoc(entry, layer) {
  return `/**\n * Named physical features and capital markers on the canvas of ${layer.map}.\n * Pair this layer with the map whose id matches its map field; these coordinates are not another map's coordinates.\n *\n * @example\n * \`\`\`ts\n * import layer from "@johnmorrisdotca/chizu/${entry}";\n * console.log(layer.map, layer.features.length);\n * // ${layer.map} ${layer.features.length}\n * \`\`\`\n */\n`;
}

// Refresh comments only: geometry, ordering, identifiers and upstream metadata stay byte-identical.
export function refreshDataReferenceDocs(root) {
  const changes = [];
  for (const kind of ["countries", "divisions", "features"]) {
    const directory = join(root, "src/data", kind);
    for (const filename of readdirSync(directory).filter(name => name.endsWith(".ts"))) {
      const file = join(directory, filename);
      const text = readFileSync(file, "utf8");
      const entry = `${kind}/${filename.slice(0, -3)}`;
      const declaration = kind === "features" ? "const layer: ChizuFeatureLayer" : "const map: ChizuMap";
      const position = text.indexOf(declaration);
      if (position < 0) throw new Error(`No generated declaration in ${relative(root, file)}`);
      const prior = text.slice(0, position);
      const headerEnd = prior.indexOf("*/") + 2;
      const existing = prior.slice(headerEnd).match(/\/\*\*[\s\S]*?\*\/\s*$/);
      const insert = existing ? headerEnd + existing.index : position;
      const description = text.split("\n")[2].replace(/^ \* /, "");
      const literal = text.slice(position).match(/= (\{[^\n]*\});/)[1];
      const data = JSON.parse(literal);
      const doc = kind === "features" ? featureReferenceDoc(entry, data) : mapReferenceDoc(entry, description, data);
      const next = text.slice(0, insert) + doc + text.slice(position);
      if (next !== text) { writeFileSync(file, next); changes.push(relative(root, file)); }
    }
  }
  return changes;
}

if (process.argv[2] === "--refresh") {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  console.log(`Refreshed reference comments in ${refreshDataReferenceDocs(root).length} data modules.`);
}

// The documents and the demo, held to the source. Plain JavaScript, so that reading files needs no Node types.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

import { describe, expect, it } from "vitest";

import { CONTINENT_OVERRIDES, DISPLAY_NAMES, ISO_JOIN, KUNI_NAMES_KEPT_FROM_NATURAL_EARTH, NAME_FIXES, SHORT_ENGLISH_NOT_FOR_MAPS } from "../scripts/data-config.mjs";
import { CHIZU_COUNTRIES, CHIZU_SOURCE } from "./data/countries.ts";
import { DIVISIONS_LOADERS } from "./data/loaders.ts";
import world from "./data/world.ts";
import { MAP_ZOOM_LEVELS } from "./frame.ts";
import { pickDistractors } from "./distractors.ts";
import { placesFromText } from "./fromText.ts";
import { CALLOUT_RADIUS_RATIO, layoutCallouts } from "./layout.ts";
import { projectPoint, unprojectPoint } from "./project.ts";
import { findQuestion } from "./quiz.ts";
import { seededRandom } from "./random.ts";
import { CHIZU_STRINGS } from "./strings.ts";
import { CHIZU_STYLE } from "./style.ts";
import { CHIZU_MAP_STYLE } from "./mountStyle.ts";
import { VERSION } from "./version.ts";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const readme = readFileSync("README.md", "utf8");
const notice = readFileSync("NOTICE.md", "utf8");
const config = readFileSync("scripts/data-config.mjs", "utf8");

/** A README section's text, from its heading to the next heading of the same level. */
const section = (heading) => {
  const from = readme.indexOf(`\n## ${heading}\n`);
  if (from < 0) throw new Error(`no “## ${heading}” in the README`);
  const next = readme.indexOf("\n## ", from + 5);
  return readme.slice(from, next < 0 ? undefined : next);
};

/** The cells of every table row in a piece of text, header and rule rows left out. */
const rows = (text) =>
  text
    .split("\n")
    .filter((line) => line.startsWith("|") && !/^\|[\s|:-]+\|$/.test(line))
    .map((line) => line.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.replace(/\\\|/g, "|").trim()));

/** The custom properties a block of CSS declares: { name: value }. */
const declarations = (css) => Object.fromEntries([...css.matchAll(/(--[a-z0-9-]+):\s*([^;}]+)[;}]/g)].map((match) => [match[1], match[2].trim()]));

describe("the documents", () => {
  it("say the version package.json says, in the code and at the top of the changelog", () => {
    expect(VERSION).toBe(pkg.version);
    expect(readFileSync("CHANGELOG.md", "utf8")).toMatch(new RegExp(`^## \\[${pkg.version.replace(/\./g, "\\.")}\\] `, "m"));
  });

  it("name in the README every entry package.json exports, and no other", () => {
    const named = [...readme.matchAll(/`(@johnmorrisdotca\/chizu(?:\/[a-z<>/-]+)?)`/g)].map((match) => match[1]);
    for (const key of Object.keys(pkg.exports).filter((one) => one !== ".")) {
      const entry = `${pkg.name}/${key.slice(2).replace("*", key.includes("countries") || key.includes("divisions") ? "<code>" : "*")}`;
      expect(readme, entry).toContain(`\`${entry}\``);
    }
    for (const entry of named) {
      const key = entry === pkg.name ? "." : `./${entry.slice(pkg.name.length + 1).replace("<code>", "*")}`;
      expect(Object.keys(pkg.exports), entry).toContain(key);
    }
  });

  it("keep the family's stylesheet byte for byte, as its first line's hash says", () => {
    const [first, ...rest] = readFileSync("demo/family.css", "utf8").split("\n");
    const hash = /sha256 of every line after this one: ([0-9a-f]{64})/.exec(first)?.[1];
    expect(createHash("sha256").update(rest.join("\n")).digest("hex")).toBe(hash);
  });

  it("keep the family's template naming this package among the family, as the footer lists it", () => {
    expect(readFileSync("scripts/family-template.mjs", "utf8")).toContain(`{ id: "chizu", name: "Chizu", kana: "地図" }`);
  });
});

describe("the README's promises", () => {
  it("has the sections a package of this family has, each with something in it", () => {
    for (const heading of ["In 30 seconds", "Who it is for", "Features", "Use it in your project", "Maps", "Numbered callouts", "API", "Theming", "Limits", "Languages", "Browser and runtime support", "Roadmap", "Architecture", "The name", "Where it comes from, and where it is used", "Development", "Contributing", "Changes", "Licence"]) {
      expect(section(heading).length, heading).toBeGreaterThan(heading.length + 40);
    }
  });

  it("installs the package it is, and every version it names is the one in package.json", () => {
    expect(readme).toContain(`npm install ${pkg.name}`);
    expect(readme).not.toMatch(/\bchizu@\d+\.\d+/);
  });

  it("links only to files that exist", () => {
    const targets = [...readme.matchAll(/\]\((?!https?:|#|mailto:)([^)\s#]+)/g)].map((match) => match[1]);
    expect(targets.length).toBeGreaterThan(5);
    for (const target of targets) expect(existsSync(target), target).toBe(true);
  });

  it("lists every package of the family, with its kana, as the demo's footer does", () => {
    const template = readFileSync("scripts/family-template.mjs", "utf8");
    const family = [...template.matchAll(/\{ id: "([\w-]+)", name: "(\w+)", kana: "([^"]+)" \}/g)].map((match) => ({ id: match[1], name: match[2], kana: match[3] }));
    expect(family.length).toBeGreaterThanOrEqual(17);
    const block = readme.slice(readme.indexOf("### The family"), readme.indexOf("\n## ", readme.indexOf("### The family")));
    for (const { id, name, kana } of family) expect(block, id).toContain(`- [${name}](https://github.com/johnmorrisdotca/${id}) (${kana}`);
    const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "twenty-one", "twenty-two", "twenty-three", "twenty-four"];
    expect(block).toContain(`one of ${words[family.length]} packages`);
    expect([...block.matchAll(/^- \[/gm)]).toHaveLength(family.length);
  });

  it("gives every colour of the drawing, and of the mounted map, with its light and dark values", () => {
    const parts = (css, light, dark) => [declarations(css.slice(css.indexOf(light), css.indexOf("}", css.indexOf(light)))), declarations(css.slice(css.indexOf(dark), css.indexOf("}", css.indexOf(dark))))];
    const [light, dark] = parts(CHIZU_STYLE, ".chizu {", ':root[data-theme="dark"] .chizu {');
    const [mapLight, mapDark] = parts(CHIZU_MAP_STYLE, ".chizu-map {", ':root[data-theme="dark"] .chizu-map {');
    const table = Object.fromEntries(rows(section("Theming")).filter((row) => row[0].startsWith("`--")).map((row) => [row[0].replace(/`/g, ""), row]));
    expect(Object.keys(table).sort()).toEqual([...Object.keys(light), ...Object.keys(mapLight)].sort());
    for (const [name, value] of Object.entries({ ...light, ...mapLight })) {
      if (name === "--cz-font") continue;
      const row = table[name];
      expect(row[2], name).toBe(`\`${value}\``);
      const other = { ...dark, ...mapDark }[name];
      expect(row[3], name).toBe(other === undefined || other === value ? "the same" : `\`${other}\``);
    }
  });

  it("states the limits as the code has them", () => {
    const limits = section("Limits");
    expect(limits).toContain(`ten steps, ${MAP_ZOOM_LEVELS[0]}× to ${MAP_ZOOM_LEVELS.at(-1)}×`);
    expect(MAP_ZOOM_LEVELS).toHaveLength(10);
    expect(limits).toContain(`${world.regions.length} countries on a canvas ${world.width.toLocaleString("en-US")} wide and ${world.height} tall`);
    expect(limits).toContain(`| Countries alone | ${CHIZU_COUNTRIES.length},`);
    expect(limits).toContain(`| Countries with regions | ${Object.keys(DIVISIONS_LOADERS).length} |`);
    expect(limits).toContain(`${CALLOUT_RADIUS_RATIO * 100}% of the window's width`);
    expect(readFileSync("src/wrap.ts", "utf8")).toContain("const MOST_COPIES = 4;");
    expect(limits).toContain("at most 4");
    expect(readFileSync("src/distractors.ts", "utf8")).toContain("options.count ?? 3");
    expect(readFileSync("src/distractors.ts", "utf8")).toContain("count + 3");
  });

  it("names the 32 countries that have regions, and says how many", () => {
    const maps = section("Maps");
    expect(maps).toContain("**32 countries with regions**");
    for (const country of CHIZU_COUNTRIES.filter((one) => one.hasDivisions)) expect(maps, country.code).toContain(country.name.replace(" of America", ""));
    expect(Object.keys(DIVISIONS_LOADERS)).toHaveLength(32);
  });

  it("lists every name the map prints that is not kuni's, with the reason, so that kuni can take each over", () => {
    const names = readFileSync("docs/names.md", "utf8");
    expect(section("Maps")).toContain("docs/names.md");
    for (const [code, why] of Object.entries(SHORT_ENGLISH_NOT_FOR_MAPS)) expect(names, code).toContain(`| ${code} | kuni's full English name | ${why} |`);
    for (const [code, entry] of Object.entries(DISPLAY_NAMES)) expect(names, code).toContain(entry.why);
    for (const [code, entry] of Object.entries(CONTINENT_OVERRIDES)) {
      expect(names, code).toContain(`| ${code} |`);
      expect(names, code).toContain(entry.why);
    }
    for (const [iso, entry] of Object.entries(KUNI_NAMES_KEPT_FROM_NATURAL_EARTH)) {
      expect(names, iso).toContain(`| ${iso} |`);
      expect(names, iso).toContain(entry.why);
    }
    for (const key of Object.keys(NAME_FIXES)) expect(names, key).toContain(`| ${key} |`);
  });

  it("lists every region with no ISO 3166-2 code, with the reason the build script gives", () => {
    const maps = readFileSync("docs/iso-codes.md", "utf8");
    expect(section("Maps")).toContain("docs/iso-codes.md");
    const missing = Object.entries(ISO_JOIN).filter(([, join]) => join.iso === null);
    expect(maps).toContain(`These ${missing.length} of the`);
    for (const [key, join] of missing) {
      const [country, code] = key.split(":");
      expect(maps, key).toContain(`| ${country} | \`${code}\` |`);
      expect(maps, key).toContain(join.why);
    }
  });

  it("keeps the worked examples true: what the README says the calls give is what they give", () => {
    const question = findQuestion(world, "FR", seededRandom(7));
    expect(readme).toContain(`// { target: "FR", choices: ${JSON.stringify(question.choices).replace(/","/g, '", "')}, answerIndex: ${question.answerIndex} }`);
    expect(readme).toContain(`// ${JSON.stringify(pickDistractors(world, "DE", { count: 3 })).replace(/","/g, '", "')}: its neighbours first`);
    expect(readme).toContain(`// ${JSON.stringify(pickDistractors(world, "JP", { count: 3 })).replace(/","/g, '", "')}: nothing touches Japan`);
    const [x, y] = projectPoint(world, 139.69, 35.69);
    expect(readme).toContain(`// [${x.toFixed(1)}, ${y.toFixed(1)}]: Tokyo on the world's canvas`);
    const [lon, lat] = unprojectPoint(world, 456, 200);
    expect(readme).toContain(`// [${lon.toFixed(1)}, ${lat.toFixed(1)}]`);
    const [first] = layoutCallouts(world, { codes: ["JP", "BR", "EG", "AU"], radiusRatio: 0.02 });
    const r1 = (n) => String(Math.round(n * 10) / 10);
    expect(readme).toContain(`// [{ code: "JP", number: 1, start: [${r1(first.start[0])}, ${Math.round(first.start[1])}], circle: [${r1(first.circle[0])}, ${r1(first.circle[1])}], radius: ${first.radius} }, …]`);
    expect(placesFromText("Japan, フランス\nBrazil, Narnia", world.regions)).toEqual({ codes: ["JP", "FR", "BR"], missing: ["Narnia"] });
    expect(readme).toContain('// { codes: ["JP", "FR", "BR"], missing: ["Narnia"] }');
  });

  it("says where the data comes from as NOTICE.md and the build script do, with the hashes the script checks", () => {
    expect(CHIZU_SOURCE.version).toBe("5.1.2");
    expect(notice).toContain(`Natural Earth ${CHIZU_SOURCE.version}`);
    expect(readme).toContain(`Natural Earth](https://www.naturalearthdata.com/) ${CHIZU_SOURCE.version}`);
    for (const [file, hash] of config.matchAll(/"(ne_[0-9a-z_]+\.geojson)": "([0-9a-f]{64})"/g).map((match) => [match[1], match[2]])) {
      expect(notice, file).toContain(hash);
      expect(notice, file).toContain(file.replace(".geojson", ""));
    }
    expect(config.match(/"ne_[0-9a-z_]+\.geojson": "[0-9a-f]{64}"/g)).toHaveLength(4);
    expect(CHIZU_SOURCE.files).toHaveLength(4);
    expect(notice).toContain(`tree/${CHIZU_SOURCE.tag}`);
    expect(pkg.files).toContain("NOTICE.md");
  });

  it("counts the hand-written readings as the build script has them", () => {
    const table = config.slice(config.indexOf("export const KANJI_READINGS"), config.indexOf("};", config.indexOf("export const KANJI_READINGS")));
    const count = [...table.matchAll(/^\s+\S+: "[^"]+",$/gm)].length;
    expect(readme).toContain(`${count} of them (\`KANJI_READINGS\``);
  });

  it("keeps docs/strings-ja.md as the board's words, English beside Japanese (pnpm docs:make rewrites it)", () => {
    const cell = (text) => text.replace(/\|/g, "\\|").replace(/\n/g, " ");
    const lines = ["# Chizu's words, in English and Japanese", "", "Made from `src/strings.ts` by `pnpm docs:make`; a test fails if the two differ, so this list is never out of date.", "", "**The Japanese has not yet been reviewed by a native reader.** If a line reads wrongly or unnaturally, please", "open a *Fix a translation* issue with the string's name. `{name}` and the other braces are filled in when shown.", "", "| Name | English | Japanese |", "| --- | --- | --- |"];
    for (const key of Object.keys(CHIZU_STRINGS.en)) lines.push(`| \`${key}\` | ${cell(CHIZU_STRINGS.en[key])} | ${cell(CHIZU_STRINGS.ja[key] ?? "")} |`);
    const made = `${lines.join("\n")}\n`;
    if (process.env.UPDATE_DOCS === "1") writeFileSync("docs/strings-ja.md", made);
    expect(readFileSync("docs/strings-ja.md", "utf8")).toBe(made);
  });

  it("has the files a visitor looks for: issue templates, a pull request template, a security policy", () => {
    for (const file of [".github/ISSUE_TEMPLATE/report-a-bug.md", ".github/ISSUE_TEMPLATE/suggest-a-feature.md", ".github/ISSUE_TEMPLATE/fix-a-translation.md", ".github/ISSUE_TEMPLATE/add-my-project.md", ".github/ISSUE_TEMPLATE/config.yml", ".github/pull_request_template.md", "SECURITY.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "NOTICE.md"]) expect(existsSync(file), file).toBe(true);
    expect(readme).toContain("issues/new?template=fix-a-translation.md");
  });

  it("keeps SECURITY.md and CODE_OF_CONDUCT.md equal to the family's master text, a copy of which is kept in scripts/community", () => {
    for (const file of ["SECURITY.md", "CODE_OF_CONDUCT.md"]) expect(readFileSync(file, "utf8"), file).toBe(readFileSync(`scripts/community/${file}`, "utf8"));
  });
});

describe("what the repository must not hold", () => {
  it("carries nothing from the private notes of the app the engine began in, and names it only as the family does", () => {
    for (const file of ["README.md", "NOTICE.md", "CHANGELOG.md", "package.json"]) {
      const text = readFileSync(file, "utf8");
      expect(text, file).not.toMatch(/wanikani|\bwk\b|@gmail|password/i);
      for (const match of text.matchAll(/UmaKuma/g)) expect(text.startsWith("UmaKuma, a Japanese study app by the same author", match.index), file).toBe(true);
    }
  });
});

describe("the API's examples", () => {
  /* Every export says how it is used, in a block `pnpm test:readme` type-checks and runs and whose printed lines it compares. */
  it("give every export of every entry point an @example with a TypeScript block", async () => {
    const { apiOf } = await import("../scripts/api.mjs");
    const missing = [];
    for (const entry of apiOf()) {
      for (const one of entry.exports) {
        if (!one.examples.some((example) => /^```ts\b/m.test(example))) missing.push(`${entry.name} ${one.name} (${one.where?.file}:${one.where?.line})`);
      }
    }
    expect(missing).toEqual([]);
  }, 60000);

  it("say what each example prints, unless it needs a page", async () => {
    const { apiOf } = await import("../scripts/api.mjs");
    const silent = [];
    for (const entry of apiOf()) {
      for (const one of entry.exports) {
        for (const example of one.examples) {
          const fence = example.match(/^```(\S+)([^\n]*)\n([\s\S]*?)\n```$/m);
          if (!fence || fence[2].includes("no-run")) continue;
          if (!fence[3].trimEnd().split("\n").at(-1).startsWith("// ")) silent.push(`${entry.name} ${one.name}`);
        }
      }
    }
    expect(silent).toEqual([]);
  }, 60000);
});

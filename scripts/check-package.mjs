// Packs the package the way it is published (`npm pack`, npm and not pnpm),
// installs the tarball into an empty project, and uses it as somebody who
// installed it would: every entry in `exports` imported by ESM and loaded by
// `require`, and each command in `bin` run. A package whose `exports` name a
// file that is not in the tarball fails here, before it can be published.
// `pnpm test:package` builds first.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const windows = process.platform === "win32";
const scratch = mkdtempSync(join(tmpdir(), "chizu-package-"));

/** Run a command and hand back what it printed. On Windows, npm and the installed commands are .cmd files, which only a shell runs; node itself is run directly. */
function run(command, args, cwd, viaShell = false) {
  const shell = viaShell && windows;
  // A path is quoted for the shell; a bare name such as npm is left for the shell to find.
  const ran = spawnSync(shell && /[\\/]/.test(command) ? `"${command}"` : command, args, { cwd, encoding: "utf8", shell });
  if (ran.status !== 0) {
    console.error(`FAIL ${command} ${args.join(" ")}\n${ran.stdout}\n${ran.stderr}`);
    process.exit(1);
  }
  return ran.stdout;
}

// 1. Pack, with npm.
const packed = JSON.parse(run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", scratch], root, true));
const tarball = join(scratch, packed[0].filename);
const inTarball = new Set(packed[0].files.map((file) => file.path));
console.log(`ok   npm pack: ${packed[0].filename}, ${packed[0].files.length} files`);
// The README's pictures are in docs/images, for GitHub and npm to show by address, and are never in what is installed.
const shipped = [...inTarball].filter((file) => file.startsWith("docs/") || /\.(webp|png|jpe?g|gif)$/.test(file));
if (shipped.length > 0) {
  console.error(`FAIL the tarball holds pictures or docs: ${shipped.join(", ")}`);
  process.exit(1);
}
console.log("ok   no picture and nothing from docs/ is in the tarball");

// 2. Everything package.json points at is in the tarball.
const pointed = [pkg.main, pkg.module, pkg.types, ...Object.values(pkg.bin ?? {}), ...Object.values(pkg.exports).flatMap((entry) => (typeof entry === "string" ? [entry] : Object.values(entry)))];
// A pattern (`./dist/data/countries/*.js`) points at every file it matches: at least one, and none that is only a declaration.
for (const file of new Set(pointed)) {
  const wanted = file.replace(/^\.\//, "");
  const found = wanted.includes("*") ? [...inTarball].some((name) => new RegExp(`^${wanted.replace(/[.]/g, "\\.").replace("*", "[a-z0-9-]+")}$`).test(name)) : inTarball.has(wanted);
  if (!found) {
    console.error(`FAIL package.json points at ${file}, which is not in the tarball`);
    process.exit(1);
  }
}
console.log(`ok   every file package.json points at is in the tarball (${new Set(pointed).size})`);

for (const named of pkg.files) {
  if (![...inTarball].some((file) => file === named || file.startsWith(`${named}/`))) {
    console.error(`FAIL package.json's files names ${named}, which is not in the tarball`);
    process.exit(1);
  }
}
console.log(`ok   everything in package.json's files is in the tarball (${pkg.files.length})`);

// 3. Install it into an empty project.
const project = join(scratch, "project");
mkdirSync(project);
writeFileSync(join(project, "package.json"), JSON.stringify({ name: "scratch", private: true, version: "0.0.0" }));
run("npm", ["install", "--no-audit", "--no-fund", "--silent", tarball], project, true);
console.log("ok   npm install of the tarball");

// What the built package in this checkout makes: the installed one must make the same.
const local = await import(new URL("../dist/index.js", import.meta.url).href);
const localWorld = (await import(new URL("../dist/world-entry.js", import.meta.url).href)).default;
const question = local.findQuestion(localWorld, "FR", local.seededRandom(7));
const spots = local.layoutCallouts(localWorld, { codes: ["JP", "BR", "EG", "AU"], radiusRatio: 0.02 });

// 4. Every entry in `exports`, by ESM and by require. A pattern is tried on a few of the files it matches.
const SAMPLES = { "./countries/*": ["fr", "jp", "sg"], "./divisions/*": ["de", "us", "fr"], "./features/*": ["world", "divisions-jp", "country-fr"] };
const entries = Object.keys(pkg.exports).flatMap((key) => {
  if (key === ".") return [pkg.name];
  if (key.includes("*")) return SAMPLES[key].map((one) => `${pkg.name}/${key.slice(2).replace("*", one)}`);
  return [`${pkg.name}/${key.slice(2)}`];
});
writeFileSync(
  join(project, "esm.mjs"),
  `${entries.map((entry, i) => `import * as m${i} from ${JSON.stringify(entry)};`).join("\n")}
const all = [${entries.map((_, i) => `m${i}`).join(", ")}];
const names = ${JSON.stringify(entries)};
all.forEach((m, i) => { if (Object.keys(m).length === 0) throw new Error(names[i] + " exports nothing"); });
const { findQuestion, seededRandom, layoutCallouts, projectPoint, VERSION, zoomBox } = m0;
const world = (await import(${JSON.stringify(`${pkg.name}/world`)})).default;
if (world.regions.length !== 173) throw new Error("the world has " + world.regions.length + " countries");
const question = findQuestion(world, "FR", seededRandom(7));
if (JSON.stringify(question) !== ${JSON.stringify(JSON.stringify(question))}) throw new Error("the installed package asked " + JSON.stringify(question));
const spots = layoutCallouts(world, { codes: ["JP", "BR", "EG", "AU"], radiusRatio: 0.02 });
if (JSON.stringify(spots) !== ${JSON.stringify(JSON.stringify(spots))}) throw new Error("the installed package placed " + JSON.stringify(spots));
if (VERSION !== ${JSON.stringify(pkg.version)}) throw new Error("VERSION is " + VERSION);
const [x, y] = projectPoint(world, 139.69, 35.69);
if (!(x > 400 && x < 480 && y > 150 && y < 260)) throw new Error("Tokyo is at " + x + "," + y);
const { drawChizu } = await import(${JSON.stringify(`${pkg.name}/draw`)});
const svg = drawChizu(world, { tones: { JP: "selected" }, callouts: ["JP", "BR"], language: "ja" });
if (!svg.startsWith("<svg") || !svg.includes("cz-tone-selected") || !svg.includes("cz-callout")) throw new Error("the drawing is " + String(svg).slice(0, 80));
const { CHIZU_COUNTRIES, countryByCode } = await import(${JSON.stringify(`${pkg.name}/names`)});
if (CHIZU_COUNTRIES.length !== 238 || countryByCode("jp").nameJa !== "日本") throw new Error("the names are wrong");
const { loadCountry, loadDivisions, loadWorldDetail } = await import(${JSON.stringify(`${pkg.name}/load`)});
const france = await loadDivisions("fr");
if (france.regions.length !== 96 || (await loadCountry("jp")).regions[0].nameJa !== "日本" || (await loadDivisions("jp")).regions.length !== 47 || (await loadDivisions("xx")) !== null || (await loadWorldDetail()).id !== "world-detail") throw new Error("the loaders are wrong");
if (zoomBox(world, 2, { x: 500, y: 244 }).width !== 500) throw new Error("zoom is wrong");
const { loadFeatures } = await import(${JSON.stringify(`${pkg.name}/load`)});
const water = await loadFeatures("divisions-jp");
if (!water.features.some((one) => one.code === "Q200239" && one.nameJa === "琵琶湖") || !drawChizu(world, { features: ["water"], featureLayer: await loadFeatures("world") }).includes("cz-feature")) throw new Error("the features are wrong");
console.log(names.join(" "));
`,
);
writeFileSync(
  join(project, "cjs.cjs"),
  `const names = ${JSON.stringify(entries)};
for (const name of names) { const m = require(name); if (Object.keys(m).length === 0) throw new Error(name + " exports nothing"); }
const { seededRandom, findQuestion } = require(${JSON.stringify(pkg.name)});
const world = require(${JSON.stringify(`${pkg.name}/world`)}).default;
const q = findQuestion(world, "FR", seededRandom(7));
if (q.choices[q.answerIndex] !== "FR") throw new Error("the question does not hold its answer by require");
console.log(names.join(" "));
`,
);
console.log(`ok   import:  ${run(process.execPath, ["esm.mjs"], project).trim()}`);
console.log(`ok   require: ${run(process.execPath, ["cjs.cjs"], project).trim()}`);

// 5. Each command in `bin`, as installed.
for (const name of Object.keys(pkg.bin ?? {})) {
  const command = join(project, "node_modules", ".bin", windows ? `${name}.cmd` : name);
  const version = run(command, ["--version"], project, true).trim();
  if (version !== pkg.version) {
    console.error(`FAIL ${name} --version said ${version}`);
    process.exit(1);
  }
  const shuffled = run(command, ["--seed", "42", "--shuffle", "a", "b", "c"], project, true).replace(/\r\n/g, "\n");
  if (shuffled !== "c\na\nb\n") {
    console.error(`FAIL ${name} shuffled ${JSON.stringify(shuffled)}`);
    process.exit(1);
  }
  console.log(`ok   ${name} --version and a seeded shuffle, as installed`);
}

rmSync(scratch, { recursive: true, force: true });
console.log("the package installs and runs as published, on", process.platform, process.version);

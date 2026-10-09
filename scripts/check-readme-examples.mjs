// Runs the README's examples and every export's `@example` (`pnpm test:readme`, after a build): every fenced `ts` and `js` block is written to its own file
// under .readme-examples/, which imports the package by its name exactly as a reader would (the package names itself through its
// `exports`, so this is the built package in this checkout). TypeScript blocks are type-checked together with the compiler's
// own strictness and then run; JavaScript blocks are run. Flags on the fence: `no-run` type-checks and does not run (the block
// needs a browser or a server), `no-check` skips the block (an excerpt). A block that fails is named by its line in README.md.
// An `@example` that ends in comment lines (`// 50 4`) says what it prints: those lines are compared with what it printed.
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { apiOf } from "./api.mjs";
import { parts } from "./readme-lint.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const readme = readFileSync(join(root, "README.md"), "utf8").replace(/\r\n/g, "\n");
const work = join(root, ".readme-examples");
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });

const blocks = [];
for (const part of parts(readme)) {
  if (part.type !== "code") continue;
  const [language, ...flags] = part.info.split(/\s+/);
  if (!["ts", "js", "mjs"].includes(language) || flags.includes("no-check")) continue;
  const typescript = language === "ts";
  // A block is a module, so that its `await`s and its names are its own, and each file has the same imports as the block says.
  const file = join(work, `line-${part.line}.${typescript ? "ts" : "mjs"}`);
  writeFileSync(file, `${part.body}\nexport {};\n`);
  blocks.push({ file, line: part.line, typescript, run: !flags.includes("no-run") });
}
// Every export's examples, from its doc comment: a fenced block in each `@example`.
for (const entry of apiOf()) {
  for (const one of entry.exports) {
    one.examples.forEach((example, index) => {
      const fence = example.match(/^```(\S+)([^\n]*)\n([\s\S]*?)\n```$/m);
      if (!fence) return;
      const flags = fence[2].trim().split(/\s+/);
      const body = fence[3];
      const lines = body.trimEnd().split("\n");
      let tail = lines.length;
      while (tail > 0 && lines[tail - 1].startsWith("// ")) tail -= 1;
      const expected = tail < lines.length ? lines.slice(tail).map((line) => line.slice(3)).join("\n") : null;
      const label = `${entry.name} ${one.name}${one.examples.length > 1 ? ` #${index + 1}` : ""} (${one.where?.file}:${one.where?.line})`;
      const file = join(work, `example-${blocks.length}-${one.name}-${index}.ts`);
      writeFileSync(file, `${body}\nexport {};\n`);
      blocks.push({ file, line: label, typescript: true, run: !flags.includes("no-run"), expected });
    });
  }
}
if (!blocks.length) {
  console.error("README.md has no ts or js block to run");
  process.exit(1);
}

let failed = 0;
const typed = blocks.filter((block) => block.typescript);
if (typed.length) {
  writeFileSync(
    join(work, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: { target: "ES2022", lib: ["dom", "dom.iterable", "es2023"], module: "esnext", moduleResolution: "bundler", strict: true, noEmit: true, skipLibCheck: true, jsx: "react-jsx", types: [] },
      include: typed.map((block) => block.file.slice(work.length + 1)),
    }),
  );
  const checked = spawnSync(process.execPath, [join(root, "node_modules", "typescript", "bin", "tsc"), "-p", join(work, "tsconfig.json")], { cwd: root, encoding: "utf8" });
  if (checked.status !== 0) {
    failed += 1;
    const lineOf = (text) => text.replace(/\.readme-examples\/line-(\d+)\.ts\((\d+),(\d+)\)/g, (_, block, row, column) => `README.md:${Number(block) + Number(row)}:${column} (block at line ${block})`);
    console.error(`FAIL type check of the README's TypeScript blocks:\n${lineOf(checked.stdout + checked.stderr)}`);
  } else console.log(`ok   ${typed.length} TypeScript block${typed.length === 1 ? "" : "s"} type-check`);
}
for (const block of blocks) {
  if (!block.run) continue;
  const ran = spawnSync(process.execPath, [block.file], { cwd: root, encoding: "utf8", timeout: 60_000 });
  const where = typeof block.line === "number" ? `README.md line ${block.line}` : block.line;
  if (ran.status !== 0) {
    failed += 1;
    console.error(`FAIL ${where}: the block did not run\n${(ran.stderr || ran.stdout).trim().split("\n").slice(0, 12).join("\n")}`);
  } else if (block.expected !== undefined && block.expected !== null && ran.stdout.trimEnd() !== block.expected) {
    failed += 1;
    console.error(`FAIL ${where}: it printed\n${ran.stdout.trimEnd()}\nand its comment says\n${block.expected}`);
  } else console.log(`ok   ${where} ran${ran.stdout.trim() ? `: ${ran.stdout.trim().split("\n").slice(0, 4).join(" | ").slice(0, 110)}` : ""}`);
}
rmSync(work, { recursive: true, force: true });
if (failed) {
  console.error(`${failed} of the README's and the API's examples failed`);
  process.exit(1);
}
console.log(`all ${blocks.length} of ${pkg.name}'s README and API examples hold`);

// The demo's working parts that need no page: checking a typed answer, a quiz round from a seed, figures pasted for a
// coloured map, the files a download writes, and the code that draws the map as it is. Pure functions over plain data,
// tested in src/demoTools.test.js; demo.js puts them on the page.

/** Katakana to hiragana, so that either spelling of a reading is the same answer. */
const hiragana = (text) => text.replace(/[ァ-ヶ]/g, (letter) => String.fromCharCode(letter.charCodeAt(0) - 0x60));

/**
 * A name as an answer is compared: full-width letters made ordinary, accents and case taken off, katakana made
 * hiragana, and the spaces, dots, dashes and apostrophes people type or leave out removed. Ōsaka, osaka, OSAKA and
 * ｏｓａｋａ are one answer; so are とうきょう and トウキョウ.
 */
export function foldAnswer(text) {
  return hiragana(
    String(text)
      .normalize("NFKC")
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[\s・·.\-‐–—'’`"“”()（）、,]/gu, ""),
  )
    .normalize("NFC")
    .replace(/[ゔ]/g, "ぶ");
}

/** The endings a Japanese name for a place may be written with or without: 東京都 is 東京, 大阪府 is 大阪, オンタリオ州 is オンタリオ. Their readings too. */
const KANJI_ENDINGS = /(都|道|府|県|州|省|市|区|地方|諸島|共和国|王国)$/u;
const READING_ENDINGS = { 都: "と", 府: "ふ", 県: "けん", 州: "しゅう", 省: "しょう", 市: "し" };
const ENGLISH_ENDINGS = /\s+(prefecture|province|state|county|region|city|metropolis)$/iu;

/** Every way a region's name may be typed and still be right: its names in both languages, with and without the endings people leave off, and its code. */
export function answersFor(region) {
  const out = new Set();
  const add = (text) => text && out.add(foldAnswer(text));
  for (const name of [region.name, region.nameJa, region.nameShortJa]) {
    if (!name) continue;
    add(name);
    add(name.replace(KANJI_ENDINGS, ""));
    add(name.replace(ENGLISH_ENDINGS, ""));
  }
  add(region.reading);
  add(readingWithoutEnding(region));
  add(region.code);
  add(region.iso);
  out.delete("");
  return out;
}

/** A reading without the ending its name may leave off: とうきょうと is とうきょう too. Null where the name has no such ending. */
function readingWithoutEnding(region) {
  const name = region.nameJa ?? "";
  const reading = region.reading ?? "";
  const ending = Object.keys(READING_ENDINGS).find((one) => name.endsWith(one) && name !== "北海道");
  if (!ending) return null;
  const sound = READING_ENDINGS[ending];
  return reading.endsWith(sound) ? reading.slice(0, -sound.length) : null;
}

/** Whether a typed name is this region: any of its names, either language, any spelling `foldAnswer` folds together. */
export function isNameOf(typed, region) {
  const text = String(typed).trim();
  const answers = answersFor(region);
  return [text, text.replace(ENGLISH_ENDINGS, ""), text.replace(KANJI_ENDINGS, "")].some((one) => {
    const folded = foldAnswer(one);
    return folded !== "" && answers.has(folded);
  });
}

/** Whether a typed reading is this region's: its reading in hiragana or katakana, with or without the ending (とうきょう for 東京都). */
export function isReadingOf(typed, region) {
  const folded = foldAnswer(typed);
  if (folded === "" || !region.reading) return false;
  return folded === foldAnswer(region.reading) || folded === foldAnswer(readingWithoutEnding(region) ?? "");
}

/** Whether a region's name is worth asking the reading of: it has a reading, and its Japanese name has kanji in it. */
export function hasKanjiReading(region) {
  const shown = region.nameShortJa ?? region.nameJa ?? "";
  return Boolean(region.reading) && /\p{Script=Han}/u.test(shown);
}

/**
 * The questions of a round, from its seed: the same seed asks the same places in the same order. `pool` is the codes
 * the round may ask about, `size` how many it asks (fewer if the pool is smaller), `random` the seeded stream.
 */
export function roundOrder(pool, size, random) {
  const order = [...pool];
  for (let index = order.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [order[index], order[other]] = [order[other], order[index]];
  }
  return order.slice(0, Math.min(size, order.length));
}

/** A streak counter: the run of right answers now, and the longest. */
export function nextStreak({ current, best }, right) {
  const now = right ? current + 1 : 0;
  return { current: now, best: Math.max(best, now) };
}

/**
 * Lines pasted for a coloured map: one place and one number to a line, the number after the last comma, tab or
 * semicolon (so "Tokyo, 14,047,594" is not read). `find` turns the place's words into a region code or null.
 * Returns the matched rows, and the lines that matched no place or had no number, said back rather than dropped.
 */
export function parseFigures(text, find) {
  const rows = [];
  const missing = [];
  const noNumber = [];
  const seen = new Set();
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "") continue;
    const cut = Math.max(line.lastIndexOf(","), line.lastIndexOf("\t"), line.lastIndexOf(";"));
    if (cut <= 0) {
      noNumber.push(line);
      continue;
    }
    const place = line.slice(0, cut).trim();
    const figure = line.slice(cut + 1).trim().replace(/[\s_]/g, "");
    const value = figure === "" ? Number.NaN : Number(figure);
    if (!Number.isFinite(value)) {
      noNumber.push(line);
      continue;
    }
    const code = find(place);
    if (code === null || code === undefined) {
      missing.push(place);
      continue;
    }
    if (seen.has(code)) continue;
    seen.add(code);
    rows.push({ code, value, place });
  }
  return { rows, missing, noNumber };
}

/**
 * Five steps from the lowest figure to the highest, by rank (each step holds about a fifth of the places), so one
 * very large figure does not leave every other place in the first step. Returns each row's step (1 to `count`) and
 * each step's lowest and highest figure; a step no row falls in is left out.
 */
export function figureSteps(rows, count = 5) {
  const sorted = [...rows].sort((a, b) => a.value - b.value);
  const stepOf = new Map();
  sorted.forEach((row, index) => stepOf.set(row.code, Math.min(count, Math.floor((index * count) / sorted.length) + 1)));
  // Equal figures share a step: the step of the first of them.
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index].value === sorted[index - 1].value) stepOf.set(sorted[index].code, stepOf.get(sorted[index - 1].code));
  }
  const steps = [];
  for (let step = 1; step <= count; step += 1) {
    const inside = sorted.filter((row) => stepOf.get(row.code) === step);
    if (inside.length > 0) steps.push({ step, from: inside[0].value, to: inside.at(-1).value, count: inside.length });
  }
  return { stepOf, steps };
}

/** A number as a person reads it: thousands grouped, at most two decimals. */
export function figureText(value, language = "en") {
  return new Intl.NumberFormat(language === "ja" ? "ja-JP" : "en-US", { maximumFractionDigits: 2 }).format(value);
}

/** A table as CSV: a header row and the rows, every cell quoted where it must be. */
export function toCsv(columns, rows) {
  const cell = (value) => {
    const text = value === undefined || value === null ? "" : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return `${[columns.map((column) => cell(column.label)), ...rows.map((row) => columns.map((column) => cell(row[column.key])))].map((line) => line.join(",")).join("\n")}\n`;
}

/** A table as plain text: a title line, then one line a row, its cells joined by a tab. */
export function toText(title, columns, rows) {
  return `${title}\n\n${[columns.map((column) => column.label).join("\t"), ...rows.map((row) => columns.map((column) => row[column.key] ?? "").join("\t"))].join("\n")}\n`;
}

/** A table as JSON: the rows, with only the columns asked for. */
export function toJson(columns, rows, extra = {}) {
  return `${JSON.stringify({ ...extra, rows: rows.map((row) => Object.fromEntries(columns.map((column) => [column.key, row[column.key] ?? null]))) }, null, 2)}\n`;
}

/** A file name from a few words: lower case, a dash between words, nothing a file system could object to. */
export function fileName(...parts) {
  return parts
    .filter(Boolean)
    .join("-")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * The code that draws the map as it is now, for a page of the reader's own: the imports, loading the map, and either
 * `mountChizu` (a map to drag and zoom) or `drawChizu` (SVG text), with the tones, callouts and language in use.
 * `view` is `{ mapKey, language, tones, callouts, part }`; `part` is `{ codes }` or null.
 */
export function codeFor(view, kind) {
  const [source, code] = view.mapKey === "world" ? ["world", null] : view.mapKey.split(":");
  const lines = [];
  const imports = [];
  let mapExpression;
  const loaders = [];
  if (source === "world") {
    imports.push(`import WORLD from "@johnmorrisdotca/chizu/world";`);
    mapExpression = "WORLD";
  } else {
    loaders.push(source === "country" ? "loadCountry" : "loadDivisions");
    mapExpression = "map";
  }
  if (view.features) loaders.push("loadFeatures");
  if (loaders.length) imports.push(`import { ${loaders.join(", ")} } from "@johnmorrisdotca/chizu/load";`);
  const engine = [];
  if (view.part) engine.push("groupBox", "groupTones");
  if (kind === "mount") imports.push(`import { mountChizu } from "@johnmorrisdotca/chizu/mount";`);
  else imports.push(`import { drawChizu } from "@johnmorrisdotca/chizu/draw";`);
  if (engine.length) imports.push(`import { ${engine.join(", ")} } from "@johnmorrisdotca/chizu";`);
  lines.push(...imports, "");
  if (source !== "world") lines.push(`const map = await ${source === "country" ? "loadCountry" : "loadDivisions"}(${JSON.stringify(code)});`);
  if (view.part) lines.push(`const part = ${JSON.stringify(view.part.codes)};`);
  if (view.features && kind === "draw") lines.push(`const layer = await loadFeatures(${JSON.stringify(view.mapId ?? (source === "world" ? "world" : `${source === "country" ? "country" : "divisions"}-${code}`))});`);
  const tones = Object.keys(view.tones ?? {}).length ? JSON.stringify(view.tones) : null;
  const toneExpression = view.part ? (tones ? `{ ...groupTones(${mapExpression}, part), ...${tones} }` : `groupTones(${mapExpression}, part)`) : tones;
  const options = [];
  if (kind === "mount") options.push(`map: ${mapExpression}`);
  options.push(`language: ${JSON.stringify(view.language)}`);
  if (toneExpression) options.push(`tones: ${toneExpression}`);
  if (view.callouts) options.push(`callouts: ${JSON.stringify(view.callouts)}`);
  if (view.features) options.push(`features: ${JSON.stringify(view.features)}`, `featureLayer: ${kind === "mount" ? "loadFeatures" : "layer"}`);
  if (kind === "draw" && view.part) options.push(`box: groupBox(${mapExpression}, part, 4 / 3)`);
  if (kind === "draw") options.push("style: true");
  if (kind === "mount") {
    lines.push(`const mount = mountChizu(document.querySelector("#map"), {`, ...options.map((option) => `  ${option},`), `});`);
    if (view.part) lines.push(`mount.show(part);`);
  } else {
    lines.push(`const svg = drawChizu(${mapExpression}, {`, ...options.map((option) => `  ${option},`), `});`, `document.querySelector("#map").innerHTML = svg;`);
  }
  return `${lines.join("\n")}\n`;
}

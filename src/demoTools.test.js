// The demo's working parts that need no page (demo/tools.js): typed answers, a round from a seed, pasted figures and
// their steps, the files a download writes, and the code that draws the map as it is.
import { describe, expect, it } from "vitest";

import { answersFor, codeFor, fileName, figureSteps, foldAnswer, hasKanjiReading, isNameOf, isReadingOf, nextStreak, parseFigures, roundOrder, toCsv, toJson, toText } from "../demo/tools.js";
import japan from "./data/divisions/jp.ts";
import world from "./data/world.ts";
import { seededRandom } from "./random.ts";

const prefecture = (code) => japan.regions.find((region) => region.code === code);

describe("a typed answer", () => {
  it("folds case, accents, full-width letters, spaces and katakana away", () => {
    expect(foldAnswer("Ōsaka")).toBe("osaka");
    expect(foldAnswer("ＯＳＡＫＡ")).toBe("osaka");
    expect(foldAnswer("トウキョウ")).toBe(foldAnswer("とうきょう"));
    expect(foldAnswer("Côte d’Ivoire")).toBe("cotedivoire");
  });

  it("is right in English or Japanese, with or without the ending, and by code", () => {
    const tokyo = prefecture("13");
    for (const typed of ["Tokyo", "tokyo", "東京都", "東京", "とうきょうと", "トウキョウ", "JP-13"]) expect(isNameOf(typed, tokyo), typed).toBe(true);
    expect(isNameOf("Kyoto", tokyo)).toBe(false);
    expect(isNameOf("", tokyo)).toBe(false);
    expect(isNameOf("osaka", prefecture("27"))).toBe(true);
    expect(isNameOf("Ōsaka Prefecture", prefecture("27"))).toBe(true);
    expect(answersFor(prefecture("1")).has(foldAnswer("北海道"))).toBe(true);
  });

  it("reads a name in kana, in either script, with the ending or without it", () => {
    expect(isReadingOf("とうきょうと", prefecture("13"))).toBe(true);
    expect(isReadingOf("トウキョウト", prefecture("13"))).toBe(true);
    expect(isReadingOf("とうきょう", prefecture("13"))).toBe(true);
    expect(isReadingOf("ほっかいどう", prefecture("1"))).toBe(true);
    expect(isReadingOf("ほっかい", prefecture("1"))).toBe(false);
    expect(isReadingOf("きょうと", prefecture("13"))).toBe(false);
  });

  it("asks readings only of names written with kanji", () => {
    expect(japan.regions.every(hasKanjiReading)).toBe(true);
    const country = (code) => world.regions.find((region) => region.code === code);
    expect(hasKanjiReading(country("JP"))).toBe(true);
    expect(hasKanjiReading(country("FR"))).toBe(false);
  });
});

describe("a round", () => {
  it("asks the same places in the same order from the same seed, each once", () => {
    const pool = japan.regions.map((region) => region.code);
    const one = roundOrder(pool, 10, seededRandom(42));
    expect(roundOrder(pool, 10, seededRandom(42))).toEqual(one);
    expect(roundOrder(pool, 10, seededRandom(43))).not.toEqual(one);
    expect(new Set(one).size).toBe(10);
    expect(roundOrder(["a", "b"], 10, seededRandom(1))).toHaveLength(2);
  });

  it("counts a streak, and keeps the best", () => {
    let streak = { current: 0, best: 0 };
    for (const right of [true, true, false, true]) streak = nextStreak(streak, right);
    expect(streak).toEqual({ current: 1, best: 2 });
  });
});

describe("pasted figures", () => {
  const find = (words) => ({ tokyo: "13", osaka: "27", "jp-23": "23" })[words.toLowerCase()] ?? null;

  it("read the number after the last comma, tab or semicolon, and say back what matched nothing", () => {
    const parsed = parseFigures("Tokyo, 14047594\nOsaka\t8,837,685\nJP-23; 7542415.5\nAtlantis, 3\nKyoto\n\nTokyo, 1", find);
    expect(parsed.rows).toEqual([
      { code: "13", value: 14047594, place: "Tokyo" },
      { code: "27", value: 685, place: "Osaka\t8,837" },
      { code: "23", value: 7542415.5, place: "JP-23" },
    ].filter((row) => row.code !== "27"));
    expect(parsed.missing).toEqual(["Osaka\t8,837", "Atlantis"]);
    expect(parsed.noNumber).toEqual(["Kyoto"]);
  });

  it("fall in five steps by rank, equal figures in one step", () => {
    const rows = Array.from({ length: 10 }, (_, index) => ({ code: String(index), value: index === 9 ? 1e9 : index }));
    const { stepOf, steps } = figureSteps(rows);
    expect(steps.map((step) => step.count)).toEqual([2, 2, 2, 2, 2]);
    expect(stepOf.get("0")).toBe(1);
    expect(stepOf.get("9")).toBe(5);
    expect(figureSteps([{ code: "a", value: 1 }, { code: "b", value: 1 }, { code: "c", value: 2 }]).stepOf.get("b")).toBe(1);
  });
});

describe("files", () => {
  const columns = [{ key: "code", label: "code" }, { key: "name", label: "name" }];
  const rows = [{ code: "13", name: "Tokyo" }, { code: "X", name: 'A "quoted", name' }];

  it("write CSV with quoting, JSON with the columns asked for, and text a line a row", () => {
    expect(toCsv(columns, rows)).toBe('code,name\n13,Tokyo\nX,"A ""quoted"", name"\n');
    expect(JSON.parse(toJson(columns, rows, { map: "jp" }))).toEqual({ map: "jp", rows });
    expect(toText("Japan", columns, rows)).toBe('Japan\n\ncode\tname\n13\tTokyo\nX\tA "quoted", name\n');
    expect(fileName("chizu", "divisions-jp", "Kantō", "map")).toBe("chizu-divisions-jp-kanto-map");
  });
});

describe("the code for the view", () => {
  it("loads the map in view, mounts or draws it, and keeps to the part", () => {
    const mount = codeFor({ mapKey: "divisions:jp", language: "ja", tones: {}, callouts: null, part: { codes: ["13", "14"] } }, "mount");
    expect(mount).toContain('import { loadDivisions } from "@johnmorrisdotca/chizu/load";');
    expect(mount).toContain('const map = await loadDivisions("jp");');
    expect(mount).toContain("tones: groupTones(map, part)");
    expect(mount).toContain("mount.show(part);");
    const draw = codeFor({ mapKey: "world", language: "en", tones: { JP: "selected" }, callouts: { codes: ["JP"] }, part: null }, "draw");
    expect(draw).toContain('import WORLD from "@johnmorrisdotca/chizu/world";');
    expect(draw).toContain('tones: {"JP":"selected"}');
    expect(draw).toContain('callouts: {"codes":["JP"]}');
    expect(draw).toContain("style: true");
  });

  it("draws the features the switch has on, from their own file", () => {
    const mount = codeFor({ mapKey: "divisions:jp", mapId: "divisions-jp", language: "en", tones: {}, callouts: null, part: null, features: ["water"] }, "mount");
    expect(mount).toContain('import { loadDivisions, loadFeatures } from "@johnmorrisdotca/chizu/load";');
    expect(mount).toContain('features: ["water"]');
    expect(mount).toContain("featureLayer: loadFeatures");
    const draw = codeFor({ mapKey: "world", mapId: "world", language: "en", tones: {}, callouts: null, part: null, features: ["all"] }, "draw");
    expect(draw).toContain('import { loadFeatures } from "@johnmorrisdotca/chizu/load";');
    expect(draw).toContain('const layer = await loadFeatures("world");');
    expect(draw).toContain("featureLayer: layer");
    expect(codeFor({ mapKey: "world", language: "en", tones: {}, callouts: null, part: null }, "mount")).not.toContain("loadFeatures");
  });
});

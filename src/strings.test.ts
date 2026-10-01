import { describe, expect, it } from "vitest";

import de from "./data/divisions/de.ts";
import { CHIZU_STRINGS, chizuLanguageOf, chizuSay, nameOf } from "./strings.ts";

describe("the words chizu says", () => {
  it("has every line in both languages, with the same values to fill in", () => {
    expect(Object.keys(CHIZU_STRINGS.ja).sort()).toEqual(Object.keys(CHIZU_STRINGS.en).sort());
    const fields = (line: string) => [...line.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
    for (const key of Object.keys(CHIZU_STRINGS.en)) expect(fields(CHIZU_STRINGS.ja[key]!), key).toEqual(fields(CHIZU_STRINGS.en[key]!));
  });

  it("fills in what it is given and leaves what it is not", () => {
    expect(chizuSay("en", "map", { name: "Germany" })).toBe("Map of Germany");
    expect(chizuSay("ja", "map", { name: "ドイツ" })).toBe("ドイツの地図");
    expect(chizuSay("en", "map")).toBe("Map of {name}");
    expect(chizuSay("en", "no-such-line")).toBe("no-such-line");
  });

  it("takes Japanese for any ja tag and English for the rest", () => {
    expect(chizuLanguageOf("ja")).toBe("ja");
    expect(chizuLanguageOf("ja-JP")).toBe("ja");
    expect(chizuLanguageOf("en-GB")).toBe("en");
    expect(chizuLanguageOf("fr")).toBe("en");
    expect(chizuLanguageOf(undefined)).toBe("en");
  });

  it("names a region in each language, falling back to the English", () => {
    const bavaria = de.regions.find((region) => region.code === "BY")!;
    expect(nameOf(bavaria, "en")).toBe("Bavaria");
    expect(nameOf(bavaria, "ja")).toBe("バイエルン自由州");
    expect(nameOf({ name: "Nowhere" }, "ja")).toBe("Nowhere");
    expect(nameOf({ name: "United States", nameJa: "アメリカ合衆国", nameShortJa: "アメリカ" }, "ja")).toBe("アメリカ");
  });
});

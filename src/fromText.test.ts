import { describe, expect, it } from "vitest";

import world from "./data/world.ts";
import { placesFromText, splitPastedPlaces } from "./fromText.ts";
import { countriesFromText, countryByCode } from "./countries.ts";
import type { ChizuRegion } from "./types.ts";

const region = (code: string, name: string, nameJa: string, reading: string) => ({ code, name, nameJa, reading }) as unknown as ChizuRegion;

const JP = [
  region("13", "Tokyo", "東京都", "とうきょう"),
  region("9", "Tochigi", "栃木県", "とちぎ"),
  region("1", "Hokkaido", "北海道", "ほっかいどう"),
  region("27", "Osaka", "大阪府", "おおさか"),
];
/** A prefecture is written 東京都 on the map and 東京 in a lesson plan. */
const SUFFIX = { optionalEnding: /[県府都道]$/u };

/*
 * A map can be made by tapping shapes on a board, one at a time, and a list can be made from pasted text. A teacher with
 * eight prefecture names in a lesson plan should not have to find each one.
 */
describe("a paste of place names", () => {
  it("splits on the separators a pasted list actually uses", () => {
    expect(splitPastedPlaces("Tokyo\nTochigi, Osaka、Hokkaido")).toEqual(["Tokyo", "Tochigi", "Osaka", "Hokkaido"]);
    expect(splitPastedPlaces("  \n\n Tokyo  \n ")).toEqual(["Tokyo"]);
  });

  it("finds a place by its English name, whatever the case", () => {
    expect(placesFromText("tokyo\nOSAKA", JP).codes).toEqual(["13", "27"]);
  });

  it("finds a place written in Japanese, with or without its suffix", () => {
    expect(placesFromText("東京都\n栃木\n大阪府", JP, SUFFIX).codes).toEqual(["13", "9", "27"]);
  });

  it("finds a place by its reading", () => {
    expect(placesFromText("ほっかいどう", JP).codes).toEqual(["1"]);
  });

  /* Somebody who wrote them in lesson order meant that order. */
  it("keeps the order they were written in", () => {
    expect(placesFromText("Osaka\nTokyo\nHokkaido", JP).codes).toEqual(["27", "13", "1"]);
  });

  it("adds a place written twice only once", () => {
    expect(placesFromText("Tokyo\n東京都\ntokyo", JP, SUFFIX).codes).toEqual(["13"]);
  });

  /*
   * Never fuzzy: "Tokyo" must not quietly become Tochigi. A line that matches
   * nothing is said back rather than dropped, so a paste that half worked
   * does not look like one that worked.
   */
  it("says back what it could not find, and matches nothing loosely", () => {
    const found = placesFromText("Tokyo\nToky\nNarnia", JP);
    expect(found.codes).toEqual(["13"]);
    expect(found.missing).toEqual(["Toky", "Narnia"]);
  });

  it("finds nothing in an empty paste, and says nothing is missing either", () => {
    expect(placesFromText("   \n  ", JP)).toEqual({ codes: [], missing: [] });
  });
});


describe("a paste of countries", () => {
  it("finds the countries by English name, Japanese name, the short name, the reading or the code", () => {
    const found = countriesFromText("Japan\nフランス, アメリカ\nBR\nにほん\nAtlantis");
    expect(found.countries.map((country) => country.code)).toEqual(["JP", "FR", "US", "BR"]);
    expect(found.missing).toEqual(["Atlantis"]);
  });

  it("finds a place on the world map the same way", () => {
    expect(placesFromText("日本\nKorea\n中国", world.regions).codes).toEqual(["JP", "CN"]);
  });

  it("looks a country up by code, in either case", () => {
    expect(countryByCode("jp")?.nameJa).toBe("日本");
    expect(countryByCode("ZZ")).toBeUndefined();
  });
});

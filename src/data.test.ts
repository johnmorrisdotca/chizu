import { describe, expect, it } from "vitest";

import { CHIZU_COUNTRIES, CHIZU_SOURCE } from "./data/countries.ts";
import { COUNTRY_LOADERS, DIVISIONS_LOADERS } from "./data/loaders.ts";
import world from "./data/world.ts";
import { mapOutlines } from "./outlines.ts";
import type { ChizuMap } from "./types.ts";

/**
 * The maps have to be maps.
 *
 * A map mode once shipped for two countries drawing hand-written placeholder polygons (Ontario was five points, a blob)
 * while the questions, ids and scoring were all correct. Everything passed: the round built, the board rendered, the
 * answer was checked. It was simply impossible to play, because you cannot recognise Quebec from a pentagon. Nothing
 * asserted that a region's outline resembled the place. These do.
 */

const divisions = async () => Promise.all(Object.values(DIVISIONS_LOADERS).map(async (load) => (await load()).default));
const countries = async () => Promise.all(Object.values(COUNTRY_LOADERS).map(async (load) => (await load()).default));

/** Drawing commands in a path, which is the crudest measure of detail there is. */
const vertexCount = (path: string) => (path.match(/[MLZ]/g) ?? []).length;

/*
 * How much outline a region of a given size ought to have. A flat threshold fails the District of Columbia, which is
 * genuinely a four-mile diamond; what gives a blob away is being big and simple at once. So a region smaller than a few
 * pixels across is exempt, and the rest need eight corners. (Sri Lanka at 1:110m is ten points, Blackpool at 1:10m is eleven: honest at their scales.)
 */
const EXEMPT_BELOW_UNITS = 8;
const MINIMUM_VERTICES = 8;

function checkMap(map: ChizuMap) {
  const codes = new Set<string>();
  const tooSimple: string[] = [];
  const outside: string[] = [];
  const insetCodes = new Set(map.insets.map((inset) => inset.code));
  for (const region of map.regions) {
    expect(codes.has(region.code), `${map.id} ${region.code} twice`).toBe(false);
    codes.add(region.code);
    expect(region.path.startsWith("M"), `${map.id} ${region.code}`).toBe(true);
    expect(region.path.endsWith("Z"), `${map.id} ${region.code}`).toBe(true);
    expect(region.name.length, `${map.id} ${region.code}`).toBeGreaterThan(0);
    const [x0, y0, x1, y1] = region.bbox;
    expect(x1, `${map.id} ${region.code}`).toBeGreaterThanOrEqual(x0);
    expect(y1, `${map.id} ${region.code}`).toBeGreaterThanOrEqual(y0);
    if (Math.max(x1 - x0, y1 - y0) >= EXEMPT_BELOW_UNITS && vertexCount(region.path) < MINIMUM_VERTICES) tooSimple.push(`${region.code} (${vertexCount(region.path)} points)`);
    // A region drawn in a box is projected at its own place and moved into its box, so only the others have to be on the canvas.
    if (!insetCodes.has(region.code) && (x0 < -1 || y0 < -1 || x1 > map.width + 1 || y1 > map.height + 1)) outside.push(region.code);
    expect(region.centroid[0]).toBeGreaterThanOrEqual(x0 - 1);
    expect(region.centroid[0]).toBeLessThanOrEqual(x1 + 1);
  }
  expect(tooSimple, `${map.id} draws blobs`).toEqual([]);
  expect(outside, `${map.id} has regions off its canvas`).toEqual([]);
  expect(map.viewBox).toBe(`0 0 ${map.width} ${map.height}`);
  // Everyone named as a neighbour is on the map, and the neighbours are mutual: if A touches B then B touches A.
  const byCode = new Map(map.regions.map((region) => [region.code, region]));
  for (const region of map.regions) {
    for (const other of region.neighbors) {
      expect(byCode.has(other), `${map.id} ${region.code} names ${other}`).toBe(true);
      expect(byCode.get(other)!.neighbors, `${map.id} ${other} should name ${region.code}`).toContain(region.code);
    }
    expect(region.neighbors).not.toContain(region.code);
  }
  return map;
}

describe("the world", () => {
  it("has the 173 countries a school atlas draws, each a real outline", () => {
    checkMap(world);
    expect(world.regions).toHaveLength(173);
    expect(world.kind).toBe("world");
    expect(world.wraps).toBe(true);
    expect(world.width).toBe(1000);
  });

  it("leaves off Antarctica, the French Southern Lands, Northern Cyprus and Somaliland", () => {
    const codes = new Set(world.regions.map((region) => region.code));
    for (const left of ["AQ", "TF", "CYN", "SOL"]) expect(codes.has(left), left).toBe(false);
  });

  it("names every country in Japanese, and reads every one", () => {
    const missing = world.regions.filter((region) => !region.nameJa || !region.reading).map((region) => region.code);
    expect(missing).toEqual([]);
  });

  it("knows which countries touch, and which are islands", () => {
    const get = (code: string) => world.regions.find((region) => region.code === code)!;
    expect(get("DE").neighbors).toEqual(expect.arrayContaining(["FR", "PL", "AT", "CH", "NL", "DK", "CZ", "BE", "LU"]));
    expect(get("JP").neighbors).toEqual([]);
    expect(get("AU").neighbors).toEqual([]);
    expect(get("PT").neighbors).toEqual(["ES"]);
  });

  it("gives the everyday Japanese name where it is not the formal one", () => {
    const get = (code: string) => world.regions.find((region) => region.code === code)!;
    expect(get("US").nameJa).toBe("アメリカ合衆国");
    expect(get("US").nameShortJa).toBe("アメリカ");
    expect(get("US").reading).toBe("アメリカ");
    expect(get("CN").nameShortJa).toBe("中国");
    expect(get("CN").reading).toBe("ちゅうごく");
    expect(get("JP").reading).toBe("にほん");
    expect(get("FR").nameShortJa).toBeUndefined();
  });

  it("is grouped by continent, in the order a directory reads them", () => {
    const groups = [...new Set(world.regions.map((region) => region.group))];
    expect(groups).toEqual(["Asia", "Europe", "Africa", "North America", "South America", "Oceania"]);
  });
});

describe("the table of countries", () => {
  it("holds 238 countries, each once, with its names", () => {
    expect(CHIZU_COUNTRIES).toHaveLength(238);
    expect(new Set(CHIZU_COUNTRIES.map((country) => country.code)).size).toBe(238);
    for (const country of CHIZU_COUNTRIES) {
      expect(country.name.length, country.code).toBeGreaterThan(0);
      expect(country.nameJa.length, country.code).toBeGreaterThan(0);
      expect(country.group.length, country.code).toBeGreaterThan(0);
    }
  });

  it("agrees with the maps about which countries are on the world and which have regions", () => {
    expect(CHIZU_COUNTRIES.filter((country) => country.onWorld).map((country) => country.code).sort()).toEqual(world.regions.map((region) => region.code).sort());
    expect(CHIZU_COUNTRIES.filter((country) => country.hasDivisions).map((country) => country.code.toLowerCase()).sort()).toEqual(Object.keys(DIVISIONS_LOADERS).sort());
    expect(Object.keys(COUNTRY_LOADERS).sort()).toEqual(CHIZU_COUNTRIES.map((country) => country.code.toLowerCase()).sort());
  });

  it("says where Natural Earth was read from, at a release tag", () => {
    expect(CHIZU_SOURCE.licence).toBe("Public domain");
    expect(CHIZU_SOURCE.tag).toBe(`v${CHIZU_SOURCE.version}`);
    expect(CHIZU_SOURCE.repository).toBe("https://github.com/nvkelso/natural-earth-vector");
    expect(CHIZU_SOURCE.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("each country alone", () => {
  it("is one real outline on a canvas whose longer side is at most a thousand, with the country's own code", async () => {
    for (const map of await countries()) {
      expect(map.kind).toBe("country");
      expect(map.regions, map.id).toHaveLength(1);
      expect(map.id).toBe(`country-${map.regions[0]!.code.toLowerCase()}`);
      expect(Math.max(map.width, map.height), map.id).toBeLessThanOrEqual(1000);
      expect(Math.max(map.width, map.height), map.id).toBeGreaterThanOrEqual(900);
      expect(map.regions[0]!.path.length, map.id).toBeGreaterThan(20);
      expect(map.projection.kind).toBe("azimuthal-equal-area");
      const [x0, y0, x1, y1] = map.regions[0]!.bbox;
      expect(x0, map.id).toBeGreaterThanOrEqual(-1);
      expect(y0, map.id).toBeGreaterThanOrEqual(-1);
      expect(x1, map.id).toBeLessThanOrEqual(map.width + 1);
      expect(y1, map.id).toBeLessThanOrEqual(map.height + 1);
    }
  }, 60000);

  it("draws the far-flung parts of a country on the world and not on its own map", async () => {
    const france = (await COUNTRY_LOADERS.fr!()).default;
    // Metropolitan France and Corsica, not French Guiana, Réunion and the Pacific.
    expect(mapOutlines(france)[0]!.rings.length).toBeLessThan(10);
    expect(france.width / france.height).toBeGreaterThan(0.8);
    expect(france.width / france.height).toBeLessThan(1.2);
  });

  it("draws a small country from the finer file, so that it is a shape and not a hexagon", async () => {
    const singapore = (await COUNTRY_LOADERS.sg!()).default;
    expect(vertexCount(singapore.regions[0]!.path)).toBeGreaterThan(30);
    expect(singapore.source).toContain("1:10m");
    expect((await COUNTRY_LOADERS.fr!()).default.source).toContain("1:50m");
  });

  it("keeps each country's name in both languages", async () => {
    const japan = (await COUNTRY_LOADERS.jp!()).default;
    expect([japan.name, japan.nameJa]).toEqual(["Japan", "日本"]);
  });
});

describe("the regions of a country", () => {
  it("has 31 countries, each a real map", async () => {
    const maps = await divisions();
    expect(maps).toHaveLength(31);
    for (const map of maps) {
      checkMap(map);
      expect(map.kind).toBe("divisions");
      expect(map.regions.length, map.id).toBeGreaterThanOrEqual(9);
      expect(map.wraps).toBe(false);
    }
  }, 60000);

  it("gives a country whole of its regions, in the counts its government gives", async () => {
    const by = Object.fromEntries((await divisions()).map((map) => [map.id.replace("divisions-", ""), map.regions.length]));
    expect(by).toMatchObject({ us: 51, ca: 13, fr: 96, de: 16, kr: 17, br: 27, au: 10, mx: 32, es: 52, it: 110, pl: 16, ch: 26, at: 9, nl: 12, ie: 34, no: 21, se: 21, tw: 21, nz: 17 });
  });

  it("has no region of Japan: the prefectures wait on a source that says what it may be used for", () => {
    expect(Object.keys(DIVISIONS_LOADERS)).not.toContain("jp");
  });

  it("names nearly every region in Japanese", async () => {
    for (const map of await divisions()) {
      const missing = map.regions.filter((region) => !region.nameJa).length;
      expect(missing / map.regions.length, `${map.id}: ${missing} regions with no Japanese name`).toBeLessThan(0.05);
    }
  }, 60000);

  it("gives most regions a neighbour to draw wrong answers from", async () => {
    for (const map of await divisions()) {
      const orphans = map.regions.filter((region) => region.neighbors.length === 0);
      // An island may genuinely border nothing; a whole country of orphans means the wrong answers fall back to distance alone.
      expect(orphans.length, `${map.id}: ${orphans.map((region) => region.code).join(", ")}`).toBeLessThan(map.regions.length / 2);
    }
  }, 60000);

  it("draws Alaska and Hawaii in boxes of their own under the lower forty-eight", async () => {
    const us = (await DIVISIONS_LOADERS.us!()).default;
    expect(us.insets.map((inset) => inset.code)).toEqual(["AK", "HI"]);
    const outlines = mapOutlines(us);
    for (const inset of us.insets) {
      const at = us.regions.findIndex((region) => region.code === inset.code);
      for (const ring of outlines[at]!.rings) {
        expect(ring.minX).toBeGreaterThanOrEqual(inset.box.x - 1);
        expect(ring.maxX).toBeLessThanOrEqual(inset.box.x + inset.box.width + 1);
        expect(ring.minY).toBeGreaterThanOrEqual(inset.box.y - 1);
        expect(ring.maxY).toBeLessThanOrEqual(inset.box.y + inset.box.height + 1);
      }
    }
  });
});

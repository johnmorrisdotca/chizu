import { country as kuniCountry } from "@johnmorrisdotca/kuni";
import { subdivision as kuniSubdivision } from "@johnmorrisdotca/kuni/subdivisions";
import { describe, expect, it } from "vitest";

import { CONTINENT_OVERRIDES, DISPLAY_NAMES, ISO_JOIN, KUNI, SHORT_ENGLISH_NOT_FOR_MAPS } from "../scripts/data-config.mjs";

import { CHIZU_COUNTRIES, CHIZU_SOURCE } from "./data/countries.ts";
import { COUNTRY_LOADERS, DIVISIONS_LOADERS } from "./data/loaders.ts";
import world from "./data/world.ts";
import { pickDistractors } from "./distractors.ts";
import { regionGroups } from "./groups.ts";
import { mapOutlines, mapRegionPieces, parseMapRings } from "./outlines.ts";
import { findQuestion } from "./quiz.ts";
import { seededRandom } from "./random.ts";
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

  it("gives the everyday Japanese name where it is not the one kuni writes first", () => {
    const get = (code: string) => world.regions.find((region) => region.code === code)!;
    expect(get("US").nameJa).toBe("アメリカ合衆国");
    expect(get("US").nameShortJa).toBe("アメリカ");
    expect(get("US").reading).toBe("アメリカ");
    expect(get("CN").nameJa).toBe("中国");
    expect(get("CN").nameShortJa).toBeUndefined();
    expect(get("CN").reading).toBe("ちゅうごく");
    expect(get("JP").reading).toBe("にほん");
    expect(get("FR").nameShortJa).toBeUndefined();
    // CLDR's short form for the United Kingdom is 英国, the written abbreviation; the everyday name is イギリス.
    expect(get("GB").nameJa).toBe("イギリス");
    expect(get("GB").nameShortJa).toBeUndefined();
  });

  it("puts Russia in Europe and Cyprus and Timor-Leste in Asia, as UN M49 and kuni 1.1.0 do, with no continent of its own", () => {
    const groupOf = (code: string) => CHIZU_COUNTRIES.find((one) => one.code === code)!.group;
    expect([groupOf("RU"), groupOf("CY"), groupOf("TL")]).toEqual(["Europe", "Asia", "Asia"]);
    expect(CONTINENT_OVERRIDES).toEqual({});
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

  /* The point of reading kuni at build time: the two packages never name a country two ways. */
  it("names every country kuni knows as kuni does, and only three places it does not know", () => {
    const unknown: string[] = [];
    for (const country of CHIZU_COUNTRIES) {
      const known = kuniCountry(country.code);
      if (!known) {
        unknown.push(country.code);
        continue;
      }
      // The map prints kuni's short English name where it has one, but for the abbreviations and the names written here, each with its reason.
      const display = DISPLAY_NAMES[country.code];
      const printed = display?.name ?? (known.shortName?.en && !SHORT_ENGLISH_NOT_FOR_MAPS[country.code] ? known.shortName.en : known.name.en);
      expect([country.name, country.nameJa, country.iso3], country.code).toEqual([printed, known.name.ja, known.alpha3]);
      if (country.nameShortJa !== undefined) expect(country.nameShortJa, country.code).toBe(display?.nameShortJa ?? known.shortName?.ja);
      expect(country.reading, country.code).toBeTruthy();
    }
    expect(unknown.sort()).toEqual(["ATC", "IOA", "KAS"]);
    // No name on a map carries a bracket or CLDR's " - " or "SAR".
    for (const country of CHIZU_COUNTRIES) {
      expect(country.name, country.code).not.toMatch(/ - |SAR|[(（]/u);
      expect(country.nameShortJa ?? country.nameJa, country.code).not.toMatch(/[(（]/u);
    }
    for (const entry of Object.values(DISPLAY_NAMES)) expect(entry.why.length).toBeGreaterThan(20);
    expect(CHIZU_SOURCE.names).toEqual({ name: "kuni", package: KUNI.package, version: KUNI.version, licence: expect.stringContaining("MIT") });
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
  it("has 32 countries, each a real map", async () => {
    const maps = await divisions();
    expect(maps).toHaveLength(32);
    for (const map of maps) {
      checkMap(map);
      expect(map.kind).toBe("divisions");
      expect(map.regions.length, map.id).toBeGreaterThanOrEqual(9);
      expect(map.wraps).toBe(false);
    }
  }, 60000);

  it("gives a country whole of its regions, in the counts its government gives", async () => {
    const by = Object.fromEntries((await divisions()).map((map) => [map.id.replace("divisions-", ""), map.regions.length]));
    expect(by).toMatchObject({ jp: 47, us: 51, ca: 13, fr: 96, de: 16, kr: 17, br: 27, au: 10, mx: 32, es: 52, it: 110, pl: 16, ch: 26, at: 9, nl: 12, ie: 34, no: 21, se: 21, tw: 21, nz: 17 });
  });

  /*
   * Every region has its ISO 3166-2 code, or a line in ISO_JOIN saying why it has none. A code two regions share is
   * one ISO subdivision Natural Earth draws as several, and each holder has a line saying so: anything else would be
   * two places claiming one code, which a choropleth would quietly paint alike.
   */
  it("gives every region its ISO 3166-2 code from kuni, or says why it has none", async () => {
    for (const map of await divisions()) {
      const country = map.id.replace("divisions-", "").toUpperCase();
      const holders = new Map<string, string[]>();
      for (const region of map.regions) {
        const join = (ISO_JOIN as Record<string, { iso: string | null; why: string }>)[`${country}:${region.code}`];
        if (region.iso === undefined) {
          expect(join?.iso, `${map.id} ${region.code} ${region.name} has no ISO code and no reason`).toBeNull();
          expect(join!.why.length).toBeGreaterThan(10);
          continue;
        }
        expect(kuniSubdivision(region.iso), `${map.id} ${region.code}: ${region.iso} is not in kuni`).not.toBeNull();
        holders.set(region.iso, [...(holders.get(region.iso) ?? []), region.code]);
      }
      for (const [iso, codes] of holders) {
        if (codes.length === 1) continue;
        for (const code of codes) expect((ISO_JOIN as Record<string, { why: string }>)[`${country}:${code}`]?.why, `${map.id} ${code} shares ${iso} with no reason`).toBeTruthy();
      }
    }
  }, 60000);

  it("has ISO 3166-2 codes for nearly every region", async () => {
    const regions = (await divisions()).flatMap((map) => map.regions);
    const coded = regions.filter((region) => region.iso !== undefined).length;
    expect(coded / regions.length).toBeGreaterThan(0.98);
  }, 60000);

  /* A quiz that asks for “Cork” cannot have two right answers. */
  it("never names two regions of one map alike, in English or in Japanese", async () => {
    for (const map of await divisions()) {
      const twice = (names: (string | undefined)[]) => names.filter((name, index) => name !== undefined && names.indexOf(name) !== index);
      expect(twice(map.regions.map((region) => region.name)), map.id).toEqual([]);
      expect(twice(map.regions.map((region) => region.nameJa)), map.id).toEqual([]);
    }
  }, 60000);

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

describe("Japan's prefectures", () => {
  const japan = async () => (await DIVISIONS_LOADERS.jp!()).default;

  it("has the forty-seven, numbered as Japan numbers them, with their ISO codes", async () => {
    const map = await japan();
    expect(map.regions.map((region) => region.code)).toEqual(Array.from({ length: 47 }, (_, index) => String(index + 1)));
    expect(map.regions.map((region) => region.iso)).toEqual(Array.from({ length: 47 }, (_, index) => `JP-${String(index + 1).padStart(2, "0")}`));
    expect([map.name, map.nameJa, map.regionName]).toEqual(["Japan", "日本", "Prefecture"]);
  });

  it("names and reads every prefecture as kuni does", async () => {
    for (const region of (await japan()).regions) {
      const known = kuniSubdivision(region.iso!)!;
      expect([region.name, region.nameJa, region.reading], region.code).toEqual([known.name.en, known.name.ja, known.reading]);
    }
    const tokyo = (await japan()).regions.find((region) => region.code === "13")!;
    expect([tokyo.nameJa, tokyo.reading, tokyo.type]).toEqual(["東京都", "とうきょうと", "metropolis"]);
  });

  it("groups them in the eight regions a Japanese school teaches", async () => {
    const groups = new Map<string, number>();
    for (const region of (await japan()).regions) groups.set(region.group, (groups.get(region.group) ?? 0) + 1);
    expect(Object.fromEntries(groups)).toEqual({ Hokkaido: 1, Tohoku: 6, Kanto: 7, Chubu: 9, Kinki: 7, Chugoku: 5, Shikoku: 4, Kyushu: 8 });
  });

  it("knows which prefectures touch, and that Hokkaido and Okinawa touch none", async () => {
    const get = async (code: string) => (await japan()).regions.find((region) => region.code === code)!;
    expect((await get("13")).neighbors).toEqual(["11", "12", "14", "19"]);
    expect((await get("1")).neighbors).toEqual([]);
    expect((await get("47")).neighbors).toEqual([]);
  });

  /* Natural Earth draws the Amami Islands inside Okinawa; they are Kagoshima's, and the build gives them back. */
  it("gives the Amami Islands to Kagoshima, drawn with its other islands south of Yakushima", async () => {
    const map = await japan();
    const outlines = mapOutlines(map);
    const kagoshima = map.insets.find((inset) => inset.code === "46")!;
    const inBox = (ring: { minX: number; maxX: number; minY: number; maxY: number }, box: typeof kagoshima.box) =>
      ring.minX >= box.x - 1 && ring.maxX <= box.x + box.width + 1 && ring.minY >= box.y - 1 && ring.maxY <= box.y + box.height + 1;
    const rings = outlines[map.regions.findIndex((region) => region.code === "46")]!.rings;
    // Amami Ōshima, Kikai, Tokunoshima, Okinoerabu and Yoron, and the Tokara Islands, in the box; Kyushu's part and Yakushima out of it.
    expect(rings.filter((ring) => inBox(ring, kagoshima.box)).length).toBeGreaterThanOrEqual(11);
    expect(rings.filter((ring) => !inBox(ring, kagoshima.box)).length).toBeGreaterThanOrEqual(5);
    expect(map.insets.map((inset) => inset.code).sort()).toEqual(["13", "13", "13", "46", "47", "47", "47"]);
  });

  /* Okinawa is three boxes (its main islands, the Sakishima Islands, the Daito Islands) and Tokyo's far islands three more, each holding its own islands at a size they can be seen at. */
  it("draws every piece of Okinawa in one of its boxes, and Tokyo's far islands in theirs, each box filled by what it holds", async () => {
    const map = await japan();
    for (const code of ["47", "13"]) {
      const region = map.regions.find((entry) => entry.code === code)!;
      const boxes = map.insets.filter((inset) => inset.code === code);
      const pieces = mapRegionPieces(region, boxes);
      const boxed = pieces.filter((piece) => piece.transform !== null);
      expect(boxed, code).toHaveLength(3);
      if (code === "47") expect(pieces.every((piece) => piece.transform !== null)).toBe(true);
      else expect(pieces.filter((piece) => piece.transform === null)).toHaveLength(1);
      boxed.forEach((piece, index) => {
        const rings = parseMapRings(piece.d, piece.transform);
        const box = boxes[index]!.box;
        const width = Math.max(...rings.map((ring) => ring.maxX)) - Math.min(...rings.map((ring) => ring.minX));
        const height = Math.max(...rings.map((ring) => ring.maxY)) - Math.min(...rings.map((ring) => ring.minY));
        // What a box holds fills it on one side at least: a box no bigger than its contents need.
        expect(Math.max(width / box.width, height / box.height), `${code} box ${index}`).toBeGreaterThan(0.9);
      });
    }
    // Okinawa's main island is a shape, not a speck: over a hundred units tall on a canvas a thousand across.
    const okinawa = mapRegionPieces(map.regions.find((entry) => entry.code === "47")!, map.insets.filter((inset) => inset.code === "47"))[0]!;
    const tallest = Math.max(...parseMapRings(okinawa.d, okinawa.transform).map((ring) => ring.maxY - ring.minY));
    expect(tallest).toBeGreaterThan(100);
  });

  it("is about the size of the other countries' maps", async () => {
    const bytes = JSON.stringify(await japan()).length;
    expect(bytes).toBeGreaterThan(100_000);
    expect(bytes).toBeLessThan(400_000);
  });
});

describe("a piece drawn but not named", () => {
  /* Natural Earth draws a 38 km² piece of the Yamal coast with no name or code: it stays in the drawing, so the coast has no hole, and is never asked about. */
  it("is drawn, but never asked about, offered as a look-alike, or counted in a group", async () => {
    const russia = (await DIVISIONS_LOADERS.ru!()).default;
    const piece = russia.regions.find((region) => region.code === "X01~")!;
    expect(piece.unnamed).toBe(true);
    expect(piece.path.length).toBeGreaterThan(10);
    expect(findQuestion(russia, "X01~", seededRandom(1))).toBeNull();
    for (const region of russia.regions) expect(pickDistractors(russia, region.code, { count: 5 }), region.code).not.toContain("X01~");
    expect(regionGroups(russia).flatMap((group) => group.codes)).not.toContain("X01~");
    expect(russia.regions.filter((region) => region.unnamed)).toHaveLength(1);
  });
});

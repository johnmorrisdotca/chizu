import { describe, expect, it } from "vitest";

import { CUT_OUTLINES } from "../scripts/data-config.mjs";
import { CHIZU_COUNTRIES } from "./data/countries.data.ts";
import world from "./data/world.data.ts";
import { loadCountry } from "./load-entry.ts";
import { projectPoint, unprojectPoint } from "./project.ts";
import { findQuestion } from "./quiz.ts";
import { seededRandom } from "./random.ts";
import { withSmallStates } from "./smallStates.ts";

/*
 * The ISO codes Natural Earth's countries do not draw alone, each cut from its map units or its countries: where
 * each is (longitude and latitude of its middle, give or take `within` degrees), from an atlas. UM is the three
 * Line Islands the 9° rule keeps (Palmyra, Kingman, Jarvis), TF is Kerguelen, SJ is Svalbard with Jan Mayen.
 */
const PLACES: Record<string, { lon: number; lat: number; within: number; scale: string }> = {
  AQ: { lon: 0, lat: -90, within: 30, scale: "1:50m" },
  BQ: { lon: -66, lat: 15, within: 4, scale: "1:10m" },
  BV: { lon: 3.4, lat: -54.4, within: 1, scale: "1:10m" },
  CC: { lon: 96.85, lat: -12.15, within: 1, scale: "1:10m" },
  CX: { lon: 105.65, lat: -10.5, within: 1, scale: "1:10m" },
  GF: { lon: -53, lat: 4, within: 2, scale: "1:50m" },
  GI: { lon: -5.35, lat: 36.13, within: 0.5, scale: "1:10m" },
  GP: { lon: -61.5, lat: 16.2, within: 1, scale: "1:10m" },
  MQ: { lon: -61, lat: 14.65, within: 1, scale: "1:10m" },
  RE: { lon: 55.5, lat: -21.1, within: 1, scale: "1:10m" },
  SJ: { lon: 5, lat: 76, within: 16, scale: "1:50m" },
  TF: { lon: 69.5, lat: -49.3, within: 2, scale: "1:10m" },
  TK: { lon: -171.8, lat: -9, within: 1.5, scale: "1:10m" },
  UM: { lon: -161.5, lat: 3, within: 5, scale: "1:10m" },
  YT: { lon: 45.15, lat: -12.8, within: 1, scale: "1:10m" },
};
const CODES = Object.keys(PLACES);

/** Degrees between two longitudes, the short way round. */
const lonGap = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

describe("the ISO codes cut from Natural Earth's map units", () => {
  it("each has a map of its own that loadCountry returns, one outline, in the table", async () => {
    expect(Object.keys(CUT_OUTLINES).sort()).toEqual(CODES);
    for (const code of CODES) {
      const map = await loadCountry(code.toLowerCase());
      expect(map, code).not.toBeNull();
      expect(map!.id).toBe(`country-${code.toLowerCase()}`);
      expect(map!.regions.map((region) => region.code)).toEqual([code]);
      const region = map!.regions[0]!;
      expect(region.path, code).toMatch(/^M[\d.,L -]+Z/);
      expect(region.path.length, code).toBeGreaterThan(40);
      expect(region.territoryPart, code).toBeUndefined();
      expect(map!.source, code).toContain(PLACES[code]!.scale);
      expect(
        CHIZU_COUNTRIES.find((country) => country.code === code),
        code,
      ).toMatchObject({
        kind: "country",
        onWorld: false,
      });
    }
  });

  it("is drawn where the place is: its middle and the corners of its box near the atlas's", async () => {
    for (const code of CODES) {
      const { lon, lat, within } = PLACES[code]!;
      const map = (await loadCountry(code))!;
      const region = map.regions[0]!;
      const [x0, y0, x1, y1] = region.bbox;
      const middle = unprojectPoint(map, ...region.centroid)!;
      if (code !== "AQ") expect(lonGap(middle[0], lon), `${code} longitude ${middle[0]}`).toBeLessThanOrEqual(within);
      expect(Math.abs(middle[1] - lat), `${code} latitude ${middle[1]}`).toBeLessThanOrEqual(within);
      for (const [x, y] of [
        [x0, y0],
        [x1, y0],
        [x0, y1],
        [x1, y1],
      ] as const) {
        const corner = unprojectPoint(map, x, y)!;
        if (code === "AQ") expect(corner[1], `${code} corner`).toBeLessThan(-50);
        else {
          expect(lonGap(corner[0], lon), `${code} corner ${corner}`).toBeLessThanOrEqual(within * 2);
          expect(Math.abs(corner[1] - lat), `${code} corner ${corner}`).toBeLessThanOrEqual(within * 2);
        }
      }
    }
  });

  it("draws Antarctica as polar maps do: the South Pole in the middle, 0° (Greenwich) up and 90°E to the right", async () => {
    const map = (await loadCountry("aq"))!;
    expect(map.projection).toMatchObject({ kind: "azimuthal-equal-area", centre: [0, -90] });
    const [px, py] = projectPoint(map, 0, -90)!;
    const [gx, gy] = projectPoint(map, 0, -70)!;
    const [ex, ey] = projectPoint(map, 90, -70)!;
    expect(gy).toBeLessThan(py - 100);
    expect(Math.abs(gx - px)).toBeLessThan(1);
    expect(ex).toBeGreaterThan(px + 100);
    expect(Math.abs(ey - py)).toBeLessThan(1);
  });

  it("leaves the world and its quiz as they were, with Antarctica and the French Southern Lands still off", () => {
    const withDots = withSmallStates(world);
    expect(world.regions).toHaveLength(173);
    expect(withDots.regions).toHaveLength(235);
    for (const map of [world, withDots]) {
      const codes = new Set(map.regions.map((region) => region.code));
      for (const code of CODES) {
        expect(codes.has(code), `${map.id} ${code}`).toBe(false);
        expect(findQuestion(map, code, seededRandom(1)), code).toBeNull();
      }
    }
  });
});

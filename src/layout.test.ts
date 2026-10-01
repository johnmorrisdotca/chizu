import { describe, expect, it } from "vitest";

import { calloutFaults } from "./calloutPolish.ts";
import de from "./data/divisions/de.ts";
import us from "./data/divisions/us.ts";
import world from "./data/world.ts";
import { regionBox, wholeMapBox } from "./frame.ts";
import { CALLOUT_RADIUS_RATIO, layoutCallouts } from "./layout.ts";
import { mapOutlines, segmentMeetsRing } from "./outlines.ts";

const asLeaders = (spots: ReturnType<typeof layoutCallouts>) => spots.map((spot) => ({ x: spot.start[0], y: spot.start[1], hx: spot.circle[0], hy: spot.circle[1] }));

/** Twenty countries a school atlas names, spread over the world. */
const TWENTY = ["JP", "CN", "KR", "IN", "AU", "NZ", "US", "CA", "MX", "BR", "AR", "GB", "FR", "DE", "IT", "ES", "RU", "EG", "ZA", "KE"];

describe("numbered circles for a map's regions", () => {
  it("numbers each region asked for, in the order asked, each with a start on its own land and a circle in the water", () => {
    const codes = ["BY", "NW", "HH", "SN", "BE"];
    const spots = layoutCallouts(de, { codes });
    expect(spots.map((spot) => spot.code)).toEqual(codes);
    expect(spots.map((spot) => spot.number)).toEqual([1, 2, 3, 4, 5]);
    const land = mapOutlines(de);
    spots.forEach((spot) => {
      const at = de.regions.findIndex((region) => region.code === spot.code);
      expect(land[at]!.rings.some((ring) => segmentMeetsRing(spot.start[0], spot.start[1], spot.start[0], spot.start[1], ring)), `${spot.code} start`).toBe(true);
      expect(land.some(({ rings }) => rings.some((ring) => segmentMeetsRing(spot.circle[0], spot.circle[1], spot.circle[0], spot.circle[1], ring))), `${spot.code} circle`).toBe(false);
      expect(spot.radius).toBeCloseTo(de.width * CALLOUT_RADIUS_RATIO);
    });
    expect(calloutFaults(asLeaders(spots), spots[0]!.radius).crossings).toBe(0);
  });

  it("is the same arrangement every time", () => {
    const codes = de.regions.map((region) => region.code);
    expect(layoutCallouts(de, { codes })).toEqual(layoutCallouts(de, { codes }));
  });

  it("only numbers what the window shows", () => {
    const box = regionBox(us, "TX", 1.5);
    const spots = layoutCallouts(us, { codes: ["TX", "FL", "WA"], box });
    expect(spots.map((spot) => spot.code)).toContain("TX");
    expect(spots.map((spot) => spot.code)).not.toContain("WA");
    for (const spot of spots) {
      expect(spot.circle[0]).toBeGreaterThanOrEqual(box.x);
      expect(spot.circle[0]).toBeLessThanOrEqual(box.x + box.width);
    }
  });

  it("keeps a number's own place when another is not shown", () => {
    const box = regionBox(us, "TX", 1.5);
    const spots = layoutCallouts(us, { codes: ["WA", "TX"], box });
    expect(spots).toHaveLength(1);
    expect(spots[0]!.number).toBe(2);
  });

  it("numbers west to east when asked, whatever order the regions came in", () => {
    const spots = layoutCallouts(de, { codes: ["BY", "NW", "BB", "SL"], numbering: "west-to-east" });
    const sorted = [...spots].sort((a, b) => a.number - b.number);
    const xs = sorted.map((spot) => spot.start[0]);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
    expect(sorted.map((spot) => spot.number)).toEqual([1, 2, 3, 4]);
  });

  it("knows no region it was not given, and an empty list is no circles", () => {
    expect(layoutCallouts(de, { codes: ["nowhere"] })).toEqual([]);
    expect(layoutCallouts(de, { codes: [] })).toEqual([]);
  });

  it("keeps the credit's corner clear", () => {
    const keepOut = { bottom: de.width * 0.3, right: 80 };
    const spots = layoutCallouts(de, { codes: de.regions.map((r) => r.code), keepOut });
    for (const spot of spots) {
      const inCorner = spot.circle[0] > de.width - keepOut.bottom - spot.radius && spot.circle[1] > de.height - keepOut.right - spot.radius;
      expect(inCorner, spot.code).toBe(false);
    }
  });
});

describe("numbered circles on the world", () => {
  const spots = layoutCallouts(world, { codes: TWENTY, radiusRatio: 0.014 });

  it("numbers all twenty, in water, without crossing", () => {
    expect(spots).toHaveLength(20);
    const land = mapOutlines(world);
    for (const spot of spots) {
      expect(land.some(({ rings }) => rings.some((ring) => segmentMeetsRing(spot.circle[0], spot.circle[1], spot.circle[0], spot.circle[1], ring))), spot.code).toBe(false);
    }
    expect(calloutFaults(asLeaders(spots), spots[0]!.radius).crossings).toBe(0);
  });

  it("polishes away every near-miss when asked", () => {
    const polished = layoutCallouts(world, { codes: TWENTY, radiusRatio: 0.014, polish: true });
    const faults = calloutFaults(asLeaders(polished), polished[0]!.radius);
    expect(faults.crossings).toBe(0);
    expect(faults.close).toBeLessThanOrEqual(calloutFaults(asLeaders(spots), spots[0]!.radius).close);
  }, 60000);

  // Miller's projection centred on 155°E puts the Pacific in the middle and the cut in the Atlantic: the Americas are at the right of the canvas and Europe and Africa at the left, and a window across the cut shows Europe and Africa a canvas east of where they are stored.
  it("numbers a country where a window across the seam shows it", () => {
    const whole = wholeMapBox(world);
    const across = { x: whole.width * 0.7, y: 0, width: whole.width * 0.6, height: whole.height };
    const placed = layoutCallouts(world, { codes: ["JP", "BR", "CL", "EG", "GB"], box: across, radiusRatio: 0.02 });
    const at = (code: string) => placed.find((spot) => spot.code === code)!;
    // Japan is in the middle of the canvas, out of this window; the Americas are in it where they are stored, Egypt and Britain on the copy east of the seam.
    expect(placed.map((spot) => spot.code).sort()).toEqual(["BR", "CL", "EG", "GB"]);
    expect(at("BR").start[0]).toBeLessThan(whole.width);
    expect(at("EG").start[0]).toBeGreaterThan(whole.width);
    expect(at("GB").start[0]).toBeGreaterThan(whole.width);
    for (const spot of placed) {
      expect(spot.start[0]).toBeGreaterThanOrEqual(across.x);
      expect(spot.start[0]).toBeLessThanOrEqual(across.x + across.width);
      expect(spot.circle[0]).toBeGreaterThanOrEqual(across.x);
      expect(spot.circle[0]).toBeLessThanOrEqual(across.x + across.width);
    }
    expect(calloutFaults(asLeaders(placed), placed[0]!.radius).crossings).toBe(0);
  });
});

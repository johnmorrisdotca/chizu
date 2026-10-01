import { describe, expect, it } from "vitest";

import { calloutFaults, leaderStarts } from "./calloutPolish.ts";
import { placeCallouts } from "./callouts.ts";
import { parseMapRings, pointInRing, distanceToRing } from "./outlines.ts";

const square = (minX: number, minY: number, maxX: number, maxY: number) =>
  parseMapRings(`M${minX} ${minY}L${maxX} ${minY}L${maxX} ${maxY}L${minX} ${maxY}Z`)[0]!;

describe("where a leader may start", () => {
  it("starts at the anchor first, and everywhere else well inside the land", () => {
    const ring = square(0, 0, 200, 100);
    const starts = leaderStarts([100, 50], ring, 10);
    expect(starts[0]).toEqual([100, 50]);
    expect(starts.length).toBeGreaterThan(8);
    for (const [x, y] of starts.slice(1)) {
      expect(pointInRing(x, y, ring)).toBe(true);
      expect(distanceToRing(x, y, ring)).toBeGreaterThanOrEqual(6 - 1e-9);
    }
  });

  it("keeps to the middle of a region too small to leave from anywhere else", () => {
    expect(leaderStarts([5, 5], square(0, 0, 10, 10), 20).length).toBeGreaterThanOrEqual(1);
    expect(leaderStarts([5, 5], null, 20)).toEqual([[5, 5]]);
  });
});

describe("the faults a printed sheet is held to", () => {
  it("counts a crossing, a pair running close, and a line through another's circle", () => {
    const r = 10;
    expect(calloutFaults([{ x: 0, y: 0, hx: 100, hy: 100 }, { x: 0, y: 100, hx: 100, hy: 0 }], r)).toEqual({ crossings: 1, close: 0 });
    expect(calloutFaults([{ x: 0, y: 0, hx: 100, hy: 0 }, { x: 0, y: 30, hx: 100, hy: 5 }], r)).toEqual({ crossings: 0, close: 1 });
    expect(calloutFaults([{ x: 0, y: 0, hx: 200, hy: 0 }, { x: 100, y: 60, hx: 100, hy: 5 }], r)).toEqual({ crossings: 0, close: 1 });
    expect(calloutFaults([{ x: 0, y: 0, hx: 100, hy: 0 }, { x: 0, y: 40, hx: 100, hy: 40 }], r)).toEqual({ crossings: 0, close: 0 });
  });

  /* Two regions whose middles are half a radius apart cannot start further apart than that. */
  it("owes two leaders only the room they start with", () => {
    expect(calloutFaults([{ x: 0, y: 0, hx: -100, hy: 0 }, { x: 0, y: 5, hx: 0, hy: 100 }], 10)).toEqual({ crossings: 0, close: 0 });
  });
});

/*
 * Three regions in a row along a coast, each with a sliver of shore: the walk
 * sends all three leaders out to the same stretch of sea, side by side. The
 * polish gives each its own.
 */
describe("the polish", () => {
  const land = [square(300, 300, 340, 500), square(340, 300, 380, 500), square(380, 300, 420, 500)].map((ring) => ({ rings: [ring] }));
  const entries = [
    { item: "a", centroid: [320, 400] as const },
    { item: "b", centroid: [360, 400] as const },
    { item: "c", centroid: [400, 400] as const },
  ];
  const box = { x: 0, y: 0, width: 800, height: 800 };

  it("leaves no two leaders close where the walk alone would", () => {
    const polished = placeCallouts(entries, 12, box, { bottom: 0, right: 0 }, land, { polish: true });
    expect(calloutFaults(polished, 12)).toEqual({ crossings: 0, close: 0 });
    /* Each leader still starts on its own land. */
    polished.forEach((spot, at) => expect(pointInRing(spot.x, spot.y, land[at]!.rings[0]!)).toBe(true));
  });

  it("draws the same sheet every time", () => {
    const first = placeCallouts(entries, 12, box, { bottom: 0, right: 0 }, land, { polish: true });
    const again = placeCallouts(entries, 12, box, { bottom: 0, right: 0 }, land, { polish: true });
    expect(again).toEqual(first);
  });
});

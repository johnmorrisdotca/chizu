import { describe, expect, it } from "vitest";

import { CALLOUT_INSET, calloutSpaces, segmentCrossesBox, type CalloutLand } from "./calloutSpace.ts";
import { placeCallouts } from "./callouts.ts";
import de from "./data/divisions/de.ts";
import fr from "./data/divisions/fr.ts";
import br from "./data/divisions/br.ts";
import { HANDLE_CLEARANCE, HANDLE_RADIUS_RATIO } from "./handles.ts";
import { mapOutlines, parseMapRings, segmentMeetsRing } from "./outlines.ts";

const box = { x: 0, y: 0, width: 1000, height: 800 };
const radius = 10;
const inset = radius * CALLOUT_INSET;
const entry = (item: string, x: number, y: number) => ({ item, centroid: [x, y] as const });
const closestPair = (spots: ReadonlyArray<{ hx: number; hy: number }>) =>
  Math.min(...spots.flatMap((a, i) => spots.slice(i + 1).map((b) => Math.hypot(a.hx - b.hx, a.hy - b.hy))));
const leaderLength = (spot: { x: number; y: number; hx: number; hy: number }) =>
  Math.hypot(spot.hx - spot.x, spot.hy - spot.y);
/** A square of land, as the four corners of a ring. */
const blockOfLand = (minX: number, minY: number, maxX: number, maxY: number): CalloutLand => ({
  rings: parseMapRings(`M${minX} ${minY}L${maxX} ${minY}L${maxX} ${maxY}L${minX} ${maxY}Z`),
});
const crossingLeaders = (spots: ReadonlyArray<{ x: number; y: number; hx: number; hy: number }>) => {
  const turn = (p: number[], q: number[], r: number[]) =>
    (q[0]! - p[0]!) * (r[1]! - p[1]!) - (q[1]! - p[1]!) * (r[0]! - p[0]!);
  let crossings = 0;
  for (let i = 0; i < spots.length; i += 1) {
    for (let j = i + 1; j < spots.length; j += 1) {
      const a = [spots[i]!.x, spots[i]!.y];
      const b = [spots[i]!.hx, spots[i]!.hy];
      const c = [spots[j]!.x, spots[j]!.y];
      const d = [spots[j]!.hx, spots[j]!.hy];
      if (turn(a, b, c) > 0 !== turn(a, b, d) > 0 && turn(c, d, a) > 0 !== turn(c, d, b) > 0) crossings += 1;
    }
  }
  return crossings;
};

/*
 * The brief: numbers in the water and not crossing, crossing as few regions as
 * they can, gathered where there is space. An early answer sent each number to
 * one of four sides of the frame, which is not the same thing: the numbers go
 * where the room is.
 */
describe("where a circle may sit", () => {
  it("leaves out every place the circle would touch land", () => {
    const land = [blockOfLand(400, 300, 600, 500)];
    const places = calloutSpaces(radius, box, { bottom: 0, right: 0 }, land);
    for (const place of places) {
      const touching = place.x > 400 - radius && place.x < 600 + radius && place.y > 300 - radius && place.y < 500 + radius;
      expect(touching, `${place.x},${place.y}`).toBe(false);
    }
    expect(places.length).toBeGreaterThan(0);
  });

  it("keeps the credit's corner clear", () => {
    const keepOut = { bottom: 300, right: 60 };
    for (const place of calloutSpaces(radius, box, keepOut, [])) {
      const inCorner = place.x > box.width - keepOut.bottom - radius && place.y > box.height - keepOut.right - radius;
      expect(inCorner, `${place.x},${place.y}`).toBe(false);
    }
  });

  /* A number sitting on land beats a number that is not drawn at all. */
  it("falls back to the whole grid when the land fills the frame", () => {
    const covered = [blockOfLand(-100, -100, 1100, 900)];
    expect(calloutSpaces(radius, box, { bottom: 0, right: 0 }, covered).length).toBeGreaterThan(0);
  });
});

describe("callouts in the space around a map", () => {
  it("puts the circle in the space beside its region, not out at the frame's edge", () => {
    const land = [blockOfLand(400, 300, 600, 500)];
    const [spot] = placeCallouts([entry("middle", 500, 400)], radius, box, undefined, land);
    /* Just off the coast: nothing like the 400 units the frame's edge is away. */
    expect(leaderLength(spot!)).toBeLessThan(200);
    expect(spot!.hx).toBeGreaterThan(inset + 1);
  });

  it("keeps every circle out of the land it is pointing at", () => {
    const land = [blockOfLand(300, 300, 700, 500)];
    const coast = [entry("a", 350, 400), entry("b", 500, 400), entry("c", 650, 400)];
    const placed = placeCallouts(coast, radius, box, undefined, land);
    for (const spot of placed) {
      const onLand = spot.hx > 300 && spot.hx < 700 && spot.hy > 300 && spot.hy < 500;
      expect(onLand, spot.item).toBe(false);
    }
  });

  it("keeps the circles a clearance apart", () => {
    const crowd = Array.from({ length: 12 }, (_, i) => entry(String(i), 480 + (i % 3) * 8, 300 + i * 9));
    const placed = placeCallouts(crowd, radius, box);
    expect(closestPair(placed)).toBeGreaterThanOrEqual(radius * HANDLE_CLEARANCE - 1e-6);
  });

  it("stays inside the frame, and keeps the credit's corner clear", () => {
    const keepOut = { bottom: 300, right: 60 };
    const crowd = Array.from({ length: 8 }, (_, i) => entry(String(i), 700 + i * 30, 700 + i * 10));
    for (const spot of placeCallouts(crowd, radius, box, keepOut)) {
      expect(spot.hx).toBeGreaterThanOrEqual(inset - 1e-6);
      expect(spot.hx).toBeLessThanOrEqual(box.width - inset + 1e-6);
      expect(spot.hy).toBeGreaterThanOrEqual(inset - 1e-6);
      expect(spot.hy).toBeLessThanOrEqual(box.height - inset + 1e-6);
      const inCorner = spot.hx > box.width - keepOut.bottom - radius && spot.hy > box.height - keepOut.right - radius;
      expect(inCorner, spot.item).toBe(false);
    }
  });

  /* A member's own map, zoomed to what they picked, can hold fewer circles than it has places. */
  it("still draws every region when the frame has less room than that", () => {
    const tight = { x: 0, y: 0, width: 120, height: 120 };
    const many = Array.from({ length: 10 }, (_, i) => entry(String(i), 60, 20 + i * 8));
    const placed = placeCallouts(many, radius, tight);
    expect(placed).toHaveLength(10);
    expect(placed.map((spot) => spot.item)).toEqual(many.map(({ item }) => item));
  });

  it("gives the leader back from the region itself, in the order it was asked", () => {
    const placed = placeCallouts([entry("a", 300, 120), entry("b", 880, 500)], radius, box);
    expect(placed.map((spot) => spot.item)).toEqual(["a", "b"]);
    expect([placed[0]!.x, placed[0]!.y]).toEqual([300, 120]);
  });
});

describe("a leader and the land it crosses", () => {
  const wall = { minX: 10, minY: 10, maxX: 20, maxY: 20 };

  it("knows when a line passes through a box and when it misses", () => {
    expect(segmentCrossesBox([0, 15], [30, 15], wall)).toBe(true);
    expect(segmentCrossesBox([0, 5], [30, 5], wall)).toBe(false);
    /* Ending inside counts: the leader is over that land when it arrives. */
    expect(segmentCrossesBox([0, 15], [15, 15], wall)).toBe(true);
    /* A line that stops short of the box does not. */
    expect(segmentCrossesBox([0, 15], [9, 15], wall)).toBe(false);
  });

  it("points a region away from the land rather than across it", () => {
    const frame = { x: 0, y: 0, width: 100, height: 100 };
    /* An island at the left, with a wall of land between it and the right edge. */
    const land = [blockOfLand(38, 45, 42, 55), blockOfLand(55, 0, 70, 100)];
    const [spot] = placeCallouts([entry("a", 40, 50)], 3, frame, undefined, land);
    expect(segmentCrossesBox([spot!.x, spot!.y], [spot!.hx, spot!.hy], { minX: 55, minY: 0, maxX: 70, maxY: 100 })).toBe(
      false,
    );
  });

  it("keeps two leaders from crossing each other", () => {
    const frame = { x: 0, y: 0, width: 100, height: 100 };
    const placed = placeCallouts([entry("north", 50, 20), entry("south", 50, 80)], 3, frame);
    expect(crossingLeaders(placed)).toBe(0);
    /* And they keep their own order: the northern one is not placed below the southern. */
    expect(placed[0]!.hy).toBeLessThan(placed[1]!.hy);
  });
});

/*
 * Whole maps, which are the sheets these rules were written against.
 *
 * Measured on the four-sided band an early answer used, on a map of all
 * forty-seven Japanese prefectures: 32 pairs of leaders crossing each other, 44
 * leaders raking over another region, three circles sitting on the land, and a
 * mean leader of 369 units on a 1,000-unit canvas, because every number was at
 * the frame's edge whether or not there was sea beside its own coast. The bounds
 * are set with room to spare above what it does now, so these fail on a return
 * to that rather than on a tidy-up.
 */
describe.each([
  { name: "the départements of France", map: fr, meanLeader: 220, raked: 200 },
  { name: "the states of Germany", map: de, meanLeader: 200, raked: 15 },
  { name: "the states of Brazil", map: br, meanLeader: 160, raked: 15 },
])("$name", ({ map, meanLeader, raked: rakedLimit }) => {
  const canvas = { x: 0, y: 0, width: map.width, height: map.height };
  const r = map.width * HANDLE_RADIUS_RATIO * 0.38;
  const land = mapOutlines(map);
  const placed = placeCallouts(
    map.regions.map((region) => ({ item: region.code, centroid: region.centroid })),
    r,
    canvas,
    { bottom: map.width * 0.25, right: 2 * r },
    land,
  );

  it("numbers every region, in order, none overlapping another", () => {
    expect(placed.map((spot) => spot.item)).toEqual(map.regions.map((region) => region.code));
    expect(closestPair(placed)).toBeGreaterThanOrEqual(r * HANDLE_CLEARANCE - 1e-6);
  });

  it("puts every number in the water", () => {
    const onLand = placed.filter((spot) =>
      land.some(({ rings }) => rings.some((ring) => segmentMeetsRing(spot.hx, spot.hy, spot.hx, spot.hy, ring))),
    );
    expect(onLand.map((spot) => spot.item)).toEqual([]);
  });

  it("keeps the leaders short, off each other and off the land", () => {
    const mean = placed.reduce((total, spot) => total + leaderLength(spot), 0) / placed.length;
    expect(mean).toBeLessThan(meanLeader);
    expect(crossingLeaders(placed)).toBe(0);
    const raked = placed.reduce((total, spot, i) => {
      const others = land.filter((_, k) => k !== i);
      return total + others.filter(({ rings }) => rings.some((ring) => segmentMeetsRing(spot.x, spot.y, spot.hx, spot.hy, ring))).length;
    }, 0);
    expect(raked).toBeLessThan(rakedLimit);
  });
});

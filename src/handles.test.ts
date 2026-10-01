import { describe, expect, it } from "vitest";

import ca from "./data/divisions/ca.ts";
import { HANDLE_CLEARANCE, HANDLE_SLOTS, orderByPosition, placeHandles } from "./handles.ts";

const RADIUS = 10;

function place(points: ReadonlyArray<readonly [number, number]>) {
  return placeHandles(
    points.map((centroid, index) => ({ item: index, centroid })),
    RADIUS,
  );
}

/** The smallest gap between any two handles, in radii. */
function tightestGap(spots: ReturnType<typeof place>): number {
  let tightest = Infinity;
  for (let i = 0; i < spots.length; i += 1) {
    for (let j = i + 1; j < spots.length; j += 1) {
      const gap = Math.hypot(spots[i]!.hx - spots[j]!.hx, spots[i]!.hy - spots[j]!.hy) / RADIUS;
      tightest = Math.min(tightest, gap);
    }
  }
  return tightest;
}

describe("handle clearance", () => {
  /*
   * Two circles of radius r touch at 2r. The rule this replaced allowed 1.9,
   * so every pair it declared clear was already a tenth of a handle into its
   * neighbour - the overlap that showed up even when the fallback worked.
   */
  it("asks for more than two radii, which is where circles touch", () => {
    expect(HANDLE_CLEARANCE).toBeGreaterThan(2);
  });

  it("keeps handles apart when regions sit on top of each other", () => {
    // Four centroids within a single handle's width - the Maritimes case: Prince Edward Island and Nova Scotia.
    const spots = place([
      [100, 100],
      [104, 103],
      [98, 106],
      [102, 97],
    ]);
    expect(spots).toHaveLength(4);
    expect(tightestGap(spots)).toBeGreaterThanOrEqual(HANDLE_CLEARANCE);
  });

  /*
   * The old placement had exactly two positions, so a third crowded region
   * found both taken and went back on top of the first. Any board of four has
   * to come out with four handles you can tell apart.
   */
  it("finds room for a third and fourth, not just a second", () => {
    const spots = place([[0, 0], [0, 0], [0, 0], [0, 0]]);
    expect(tightestGap(spots)).toBeGreaterThanOrEqual(HANDLE_CLEARANCE);
  });

  it("leaves a lone handle directly above its region", () => {
    const [only] = place([[50, 50]]);
    expect(only!.hx).toBe(50);
    expect(only!.hy).toBeLessThan(50);
  });

  /*
   * The two properties have to agree. Handles are numbered west to east so
   * they read as a row, and only a sideways nudge can push one past the
   * neighbour it was meant to follow - so every vertical escape is spent
   * before the first sideways one is considered.
   */
  it("exhausts the vertical positions before moving a handle sideways", () => {
    const firstSideways = HANDLE_SLOTS.findIndex(([dx]) => dx !== 0);
    expect(firstSideways).toBeGreaterThanOrEqual(4);
    for (const [dx] of HANDLE_SLOTS.slice(0, firstSideways)) expect(dx).toBe(0);
  });

  it("keeps a crowded column numbered left to right", () => {
    // Four regions in a vertical line: every handle should stay in its column.
    const spots = place([[100, 100], [100, 104], [100, 108], [100, 112]]);
    expect(spots.every((spot) => spot.hx === 100)).toBe(true);
    expect(tightestGap(spots)).toBeGreaterThanOrEqual(HANDLE_CLEARANCE);
  });

  it("keeps handles inside the frame when it can", () => {
    // A region hard against the top edge: above would crop, below fits.
    const spots = placeHandles(
      [{ item: "edge", centroid: [100, 5] as const }],
      RADIUS,
      { x: 0, y: 0, width: 200, height: 200 },
    );
    expect(spots[0]!.hy).toBeGreaterThan(5);
    expect(spots[0]!.hy - RADIUS).toBeGreaterThanOrEqual(0);
  });
});

describe("numbering the handles", () => {
  const provinces = ca.regions;
  const centreOf = (code: string) => provinces.find((region) => region.code === code)?.centroid;

  /*
   * The complaint this fixes: handles were numbered by the shuffle, so a round read 3 2 4 1 across the map. West to
   * east, whatever order they arrive in.
   */
  it("orders the choices west to east", () => {
    const byX = [...provinces].sort((a, b) => a.centroid[0] - b.centroid[0]);
    const west = byX[0]!;
    const east = byX[byX.length - 1]!;
    const middle = byX[Math.floor(byX.length / 2)]!;

    // Handed to it in the wrong order on purpose.
    const ordered = orderByPosition([east.code, west.code, middle.code], centreOf);
    expect(ordered).toEqual([west.code, middle.code, east.code]);
  });

  it("keeps every choice it was given", () => {
    const options = provinces.slice(0, 4).map((region) => region.code);
    const ordered = orderByPosition(options, centreOf);
    expect(ordered).toHaveLength(4);
    expect(new Set(ordered)).toEqual(new Set(options));
  });

  // A choice that names no region must not vanish from the board: a dropped choice is a question that cannot be answered correctly.
  it("keeps a choice that resolves to no region, at the end", () => {
    const ordered = orderByPosition(["nowhere", provinces[0]!.code], centreOf);
    expect(ordered).toHaveLength(2);
    expect(ordered[1]).toBe("nowhere");
  });

  it("breaks a tie north to south", () => {
    expect(orderByPosition(["low", "high"], (code) => (code === "low" ? [5, 9] : [5, 1]))).toEqual(["high", "low"]);
  });

  it("does not disturb the array it was given", () => {
    const options = [provinces[10]!.code, provinces[0]!.code];
    const before = [...options];
    orderByPosition(options, centreOf);
    expect(options).toEqual(before);
  });
});

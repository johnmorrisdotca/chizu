import { describe, expect, it } from "vitest";

import us from "./data/divisions/us.ts";
import { DIVISIONS_LOADERS } from "./data/loaders.ts";
import { applyInsetTransform, insetFor, insetTransform, insetTransformAttribute } from "./insets.ts";

describe("where a map puts the regions it draws in a box", () => {
  /* The bug this guards: a box that sat on a neighbouring region, so the two read as one place. */
  it("puts every box where no other region reaches", async () => {
    for (const load of Object.values(DIVISIONS_LOADERS)) {
      const map = (await load()).default;
      // Only a region drawn wholly in a box is out of the way. A box holding just a region's outlying islands leaves the region itself in place, so it is checked against every box like any other - including its own.
      const inBoxes = new Set(map.insets.filter((inset) => inset.outlyingBelow === undefined).map((inset) => inset.code));
      for (const inset of map.insets) {
        const trespassers = map.regions.filter((region) => {
          if (inBoxes.has(region.code)) return false;
          const [x0, y0, x1, y1] = region.bbox;
          return x0 < inset.box.x + inset.box.width && x1 > inset.box.x && y0 < inset.box.y + inset.box.height && y1 > inset.box.y;
        });
        expect(trespassers.map((region) => region.code), `${map.id} ${inset.code}`).toEqual([]);
      }
    }
  });

  it("keeps every box inside the frame the map is drawn in", async () => {
    for (const load of Object.values(DIVISIONS_LOADERS)) {
      const map = (await load()).default;
      for (const inset of map.insets) {
        expect(inset.box.x).toBeGreaterThanOrEqual(0);
        expect(inset.box.y).toBeGreaterThanOrEqual(0);
        expect(inset.box.x + inset.box.width).toBeLessThanOrEqual(map.width);
        expect(inset.box.y + inset.box.height).toBeLessThanOrEqual(map.height);
      }
    }
  });

  // Two boxes that overlapped would read as one frame with two scales in it.
  it("keeps the boxes off each other", () => {
    const boxes = us.insets.map((inset) => inset.box);
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i]!;
        const b = boxes[j]!;
        const apart = a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y;
        expect(apart, `${i} and ${j}`).toBe(true);
      }
    }
  });

  it("names the regions a map draws apart, and nothing else", () => {
    expect(insetFor(us, "AK")?.box.x).toBe(20);
    expect(insetFor(us, "HI")).not.toBeNull();
    expect(insetFor(us, "TX")).toBeNull();
    expect(insetFor({ insets: [{ code: 47, box: { x: 1, y: 2, width: 3, height: 4 } }] as never }, "47")).not.toBeNull();
  });
});

describe("seating a region in its box", () => {
  const box = { x: 100, y: 200, width: 50, height: 50 };

  it("shrinks what is too big and centres it", () => {
    const transform = insetTransform([0, 0, 100, 100], box);
    expect(transform.scale).toBe(0.5);
    expect(applyInsetTransform([0, 0], transform)).toEqual([100, 200]);
    expect(applyInsetTransform([100, 100], transform)).toEqual([150, 250]);
  });

  /* A small region should sit in the middle of its frame, not be blown up to fill it. */
  it("never magnifies", () => {
    const transform = insetTransform([0, 0, 10, 10], box);
    expect(transform.scale).toBe(1);
    expect(applyInsetTransform([5, 5], transform)).toEqual([125, 225]);
  });

  /* Unless the box asks: two islands forty units across are specks at true scale. */
  it("magnifies when the box says it may", () => {
    const transform = insetTransform([0, 0, 10, 10], box, true);
    expect(transform.scale).toBe(5);
    expect(applyInsetTransform([0, 0], transform)).toEqual([100, 200]);
    expect(applyInsetTransform([10, 10], transform)).toEqual([150, 250]);
  });
});

describe("writing the move for an SVG element", () => {
  it("says it as a transform attribute", () => {
    expect(insetTransformAttribute({ scale: 0.5, x: 100, y: 200 })).toBe("translate(100 200) scale(0.5)");
  });
});

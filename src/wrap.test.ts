import { describe, expect, it } from "vitest";

import us from "./data/divisions/us.ts";
import world from "./data/world.ts";
import { mapWrapsAround, nearestWrappedBox, wrapAcross, wrapIntoBox, wrapOffsets } from "./wrap.ts";

const WIDTH = 1000;
const box = (x: number, width: number) => ({ x, y: 0, width, height: 489 });

/* A map of the earth pans east and west without stopping, so that a reader can choose how they wish to see it. */
describe("a map that goes round the earth", () => {
  it("is the world and nothing else", () => {
    expect(mapWrapsAround(world)).toBe(true);
    /* A country map that wrapped would draw Alaska twice, out in the Pacific. */
    expect(mapWrapsAround(us)).toBe(false);
  });

  it("brings a pan that has gone round back onto the canvas", () => {
    expect(wrapAcross(1200, WIDTH)).toBe(200);
    expect(wrapAcross(-200, WIDTH)).toBe(800);
    expect(wrapAcross(0, WIDTH)).toBe(0);
    /* Exactly one turn round is the start again, not the far edge. */
    expect(wrapAcross(WIDTH, WIDTH)).toBe(0);
  });
});

describe("how many copies of the canvas a window sees", () => {
  it("draws the world once while the window is wholly on it", () => {
    expect(wrapOffsets(box(0, WIDTH), WIDTH)).toEqual([0]);
    expect(wrapOffsets(box(200, 500), WIDTH)).toEqual([0]);
  });

  it("draws a second copy where the window overhangs", () => {
    expect(wrapOffsets(box(-300, WIDTH), WIDTH)).toEqual([-WIDTH, 0]);
    expect(wrapOffsets(box(900, 200), WIDTH)).toEqual([0, WIDTH]);
  });

  /* A seam touched along one line shows nothing of the copy beyond it. */
  it("does not draw a copy the window only touches", () => {
    expect(wrapOffsets(box(0, WIDTH), WIDTH)).toEqual([0]);
    expect(wrapOffsets(box(-WIDTH, WIDTH), WIDTH)).toEqual([-WIDTH]);
  });

  it("refuses to loop for ever on a canvas with no width", () => {
    expect(wrapOffsets(box(0, WIDTH), 0)).toEqual([0]);
  });
});

describe("finding a place on the copy that is on screen", () => {
  it("leaves a place the window already holds where it is", () => {
    expect(wrapIntoBox(300, box(200, 500), WIDTH)).toBe(300);
  });

  /* Panned past the date line, New Zealand is on screen a canvas east of where
     the projection stored it - the country is shown, so it gets its number. */
  it("finds the copy the window is showing", () => {
    expect(wrapIntoBox(60, box(900, 200), WIDTH)).toBe(1060);
    expect(wrapIntoBox(950, box(-300, 400), WIDTH)).toBe(-50);
  });

  it("says nothing when no copy of the place is on screen", () => {
    expect(wrapIntoBox(500, box(0, 200), WIDTH)).toBeNull();
  });
});

describe("travelling the short way round", () => {
  it("leaves a journey that does not cross the seam alone", () => {
    expect(nearestWrappedBox(box(100, 200), box(400, 200), WIDTH)).toEqual(box(400, 200));
  });

  /* Japan to Hawaii is a hop east, not a sweep back across Africa. */
  it("slides the destination onto the nearest copy", () => {
    expect(nearestWrappedBox(box(900, 200), box(50, 200), WIDTH).x).toBe(1050);
    expect(nearestWrappedBox(box(0, 200), box(900, 200), WIDTH).x).toBe(-100);
  });

  it("keeps the window's own size and height", () => {
    const moved = nearestWrappedBox(box(900, 200), box(50, 200), WIDTH);
    expect(moved.width).toBe(200);
    expect(moved.height).toBe(489);
  });
});

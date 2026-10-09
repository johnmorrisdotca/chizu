import { describe, expect, it } from "vitest";

import us from "./data/divisions/us.ts";
import world from "./data/world.ts";
import {
  MAP_ZOOM_LEVELS,
  boxCentre,
  boxIsWholeMap,
  boxToViewBox,
  focusBox,
  focusRegionFit,
  isMapZoom,
  regionBox,
  regionCentre,
  shapeGlyphBox,
  stepMapZoom,
  wholeMapBox,
  zoomBox,
  zoomToFit,
} from "./frame.ts";
import { insetFor } from "./insets.ts";
import { drawnBounds } from "./outlines.ts";

/* A country drawn with two regions in boxes of their own (Alaska and Hawaii), and the world, which wraps. */
const MAP = us;
const whole = wholeMapBox(MAP);
const AK = us.insets.find((inset) => inset.code === "AK")!.box;
const bboxOf = (code: string) => MAP.regions.find((entry) => entry.code === code)!.bbox;
const sample = ["TX", "AK", "DC", "WY", "NY", "HI"];

describe("windows", () => {
  it("writes a window as a viewBox", () => {
    expect(boxToViewBox({ x: 1, y: 2, width: 3, height: 4 })).toBe("1 2 3 4");
  });

  it("is the whole canvas, and knows it", () => {
    expect(whole).toEqual({ x: 0, y: 0, width: MAP.width, height: MAP.height });
    expect(boxIsWholeMap(MAP, whole)).toBe(true);
    expect(boxIsWholeMap(MAP, zoomBox(MAP, 2, boxCentre(whole)))).toBe(false);
  });

  it("frames the regions asked for with room round them, on the map, and the whole map for none", () => {
    expect(focusBox(MAP, [])).toEqual(whole);
    expect(focusBox(MAP, ["nowhere"])).toEqual(whole);
    const box = focusBox(MAP, ["NY", "PA"]);
    expect(box.width).toBeLessThan(whole.width);
    for (const code of ["NY", "PA"]) {
      const [x0, y0, x1, y1] = bboxOf(code);
      expect(x0).toBeGreaterThanOrEqual(box.x - 1);
      expect(y0).toBeGreaterThanOrEqual(box.y - 1);
      expect(x1).toBeLessThanOrEqual(box.x + box.width + 1);
      expect(y1).toBeLessThanOrEqual(box.y + box.height + 1);
    }
    // Kept on the map, so a coastal region does not frame open sea.
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(whole.width + 0.001);
    // A set that needs the whole map gets it.
    expect(focusBox(MAP, MAP.regions.map((region) => region.code))).toEqual(whole);
  });
});

describe("zooming the map", () => {
  it("draws the whole country at one", () => {
    expect(zoomBox(MAP, 1, boxCentre(whole))).toEqual(whole);
  });

  it("halves each side at two, and thirds them at three", () => {
    const two = zoomBox(MAP, 2, boxCentre(whole));
    expect(two.width).toBeCloseTo(whole.width / 2);
    expect(two.height).toBeCloseTo(whole.height / 2);
    expect(zoomBox(MAP, 3, boxCentre(whole)).width).toBeCloseTo(whole.width / 3);
  });

  it("keeps what it was looking at in the middle", () => {
    const centre = { x: whole.width / 2, y: whole.height / 2 };
    expect(boxCentre(zoomBox(MAP, 2, centre))).toEqual(centre);
  });

  /*
   * A centre near a coast would frame open sea; at 3x more than half the view could be empty. Clamping the window
   * rather than the centre means a drag that runs off the edge simply stops there.
   */
  it("keeps the window on the map at every edge", () => {
    for (const centre of [
      { x: -500, y: -500 },
      { x: whole.width + 500, y: whole.height + 500 },
    ]) {
      const box = zoomBox(MAP, 3, centre);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(whole.width + 0.001);
      expect(box.y + box.height).toBeLessThanOrEqual(whole.height + 0.001);
    }
  });
});

describe("the zoom steps", () => {
  const closest = MAP_ZOOM_LEVELS[MAP_ZOOM_LEVELS.length - 1];

  it("stops at each end rather than wrapping", () => {
    expect(stepMapZoom(1, -1)).toBe(1);
    expect(stepMapZoom(closest, 1)).toBe(closest);
    expect(stepMapZoom(1, 1)).toBe(2);
    expect(stepMapZoom(closest, -1)).toBe(MAP_ZOOM_LEVELS[MAP_ZOOM_LEVELS.length - 2]);
  });

  // Three was not enough for the world, where a country can be a dozen pixels across.
  it("goes in to five, a step at a time", () => {
    expect([...MAP_ZOOM_LEVELS]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("knows its own levels", () => {
    for (const level of MAP_ZOOM_LEVELS) expect(isMapZoom(level)).toBe(true);
    expect(isMapZoom(closest + 1)).toBe(false);
    expect(isMapZoom(0)).toBe(false);
    expect(isMapZoom(1.5)).toBe(false);
  });
});

describe("zooming to a region", () => {
  /*
   * Where it is drawn, not where it is. Alaska is drawn in a box under the lower forty-eight, so centring on its true
   * position took the reader to open sea with the region they had just chosen off screen.
   */
  it("centres on the inset box for a region drawn in one", () => {
    expect(regionCentre(MAP, "AK")).toEqual({ x: AK.x + AK.width / 2, y: AK.y + AK.height / 2 });
  });

  it("finds the middle of one that exists", () => {
    const [x0, y0, x1, y1] = bboxOf("TX");
    expect(regionCentre(MAP, "TX")).toEqual({ x: (x0 + x1) / 2, y: (y0 + y1) / 2 });
  });

  it("has no centre for nothing, or for a code this map does not hold", () => {
    expect(regionCentre(MAP, null)).toBeNull();
    expect(regionCentre(MAP, "ZZ")).toBeNull();
  });
});

/*
 * A panel draws the chosen region on its own so its shape can be seen. It once drew a whole country with the region a
 * speck in the middle, for two reasons: the room around it was measured off its longest side and added to both, and the
 * window was near enough square while the frame it was drawn in is two and a half times as wide.
 */
describe("framing one region on its own", () => {
  const FRAME = 2.5;

  it("takes the shape of the frame, so nothing is added at the sides", () => {
    for (const code of sample) {
      const box = regionBox(MAP, code, FRAME);
      expect(box.width / box.height).toBeCloseTo(FRAME);
    }
  });

  it("fills the side that limits it, whatever shape the region is", () => {
    // Texas is squarish, Wyoming is small, New York is wide-ish, DC is a speck: each fills the height of a wide frame.
    for (const code of ["TX", "WY", "NY", "DC"]) {
      const [, minY, , maxY] = bboxOf(code);
      const box = regionBox(MAP, code, FRAME);
      expect((maxY - minY) / box.height).toBeGreaterThan(0.8);
    }
  });

  it("never asks for a window larger than the country", () => {
    for (const code of sample) {
      const box = regionBox(MAP, code, FRAME);
      expect(box.width, code).toBeLessThan(whole.width);
      expect(box.height, code).toBeLessThan(whole.height);
    }
  });

  it("keeps the region in the middle of what it frames", () => {
    const [minX, minY, maxX, maxY] = bboxOf("WY");
    const centre = boxCentre(regionBox(MAP, "WY", FRAME));
    expect(centre.x).toBeCloseTo((minX + maxX) / 2);
    expect(centre.y).toBeCloseTo((minY + maxY) / 2);
  });

  /*
   * Alaska is drawn in a box under the lower forty-eight. Framing its own geometry would take the reader to open sea;
   * framing the box it sits in would leave the sea around it in shot, since it is smaller than its box.
   */
  it("frames a seated region where it is drawn, on the shape rather than the box", () => {
    const box = regionBox(MAP, "AK", FRAME);
    const centre = boxCentre(box);
    expect(centre.x).toBeCloseTo(AK.x + AK.width / 2);
    expect(centre.y).toBeCloseTo(AK.y + AK.height / 2);
    expect(box.height).toBeLessThan(AK.height * 1.3);
  });

  it("falls back to the whole map for a code this map does not hold", () => {
    expect(regionBox(MAP, "ZZ", FRAME)).toEqual(whole);
  });
});

/* An icon is the opposite job to a panel's frame: a square every shape fills, so a small region is as legible in a list as a large one. */
describe("one region's outline as an icon", () => {
  it("is square, whatever shape the region is", () => {
    for (const code of sample) {
      const box = shapeGlyphBox(bboxOf(code));
      expect(box.width).toBeCloseTo(box.height);
    }
  });

  it("is filled by the region's longest side, so every shape is drawn large", () => {
    for (const code of sample) {
      const [minX, minY, maxX, maxY] = bboxOf(code);
      const box = shapeGlyphBox(bboxOf(code));
      expect(Math.max(maxX - minX, maxY - minY) / box.width).toBeGreaterThan(0.85);
    }
  });

  it("centres the region in it", () => {
    const [minX, minY, maxX, maxY] = bboxOf("WY");
    const centre = boxCentre(shapeGlyphBox(bboxOf("WY")));
    expect(centre.x).toBeCloseTo((minX + maxX) / 2);
    expect(centre.y).toBeCloseTo((minY + maxY) / 2);
  });

  it("still has a size for a shape with none", () => {
    expect(shapeGlyphBox([10, 10, 10, 10]).width).toBeGreaterThan(0);
  });
});

/** Opening a region from its heading: the reader wants the Northeast filling the view, not the country with eleven states lit somewhere in it. */
describe("framing a whole group of regions", () => {
  it("shows the whole country when given nothing", () => {
    expect(zoomToFit(MAP, [])).toEqual({ zoom: 1, centre: boxCentre(whole) });
  });

  it("goes in on the Northeast and keeps every state inside the window", () => {
    const codes = MAP.regions.filter((region) => region.group === "Northeast").map((region) => region.code);
    expect(codes.length).toBeGreaterThan(5);
    const fit = zoomToFit(MAP, codes);
    expect(fit.zoom).toBeGreaterThan(1);
    const window = zoomBox(MAP, fit.zoom, fit.centre);
    for (const code of codes) {
      const [minX, minY, maxX, maxY] = bboxOf(code);
      expect(minX, `${code} left`).toBeGreaterThanOrEqual(window.x - 1);
      expect(minY, `${code} top`).toBeGreaterThanOrEqual(window.y - 1);
      expect(maxX, `${code} right`).toBeLessThanOrEqual(window.x + window.width + 1);
      expect(maxY, `${code} bottom`).toBeLessThanOrEqual(window.y + window.height + 1);
    }
  });

  // Where it is drawn, not where it is: the true position is open sea.
  it("frames Hawaii in its inset box rather than out in the Pacific", () => {
    const seated = insetFor(MAP, "HI");
    expect(seated).toBeTruthy();
    const { centre } = zoomToFit(MAP, ["HI"]);
    expect(centre.x).toBeGreaterThanOrEqual(seated!.box.x);
    expect(centre.x).toBeLessThanOrEqual(seated!.box.x + seated!.box.width);
    expect(centre.y).toBeGreaterThanOrEqual(seated!.box.y);
    expect(centre.y).toBeLessThanOrEqual(seated!.box.y + seated!.box.height);
  });

  it("stays at one for a set that will not fit closer, rather than cutting it", () => {
    expect(zoomToFit(MAP, MAP.regions.map((r) => r.code)).zoom).toBe(1);
  });
});

/*
 * The clamp is for dragging. A region opened from its address is a fit and asked for that region in the middle; an inset
 * is at the bottom of the canvas, so a clamped fit shoved it into the bottom third every time.
 */
describe("a fit may overhang the map", () => {
  const hawaii = zoomToFit(MAP, ["HI"]);

  it("puts the fitted region in the middle of the window", () => {
    const window = zoomBox(MAP, hawaii.zoom, hawaii.centre, false);
    expect(boxCentre(window).x).toBeCloseTo(hawaii.centre.x);
    expect(boxCentre(window).y).toBeCloseTo(hawaii.centre.y);
  });

  it("is the thing the clamp was moving", () => {
    const clamped = zoomBox(MAP, hawaii.zoom, hawaii.centre);
    expect(boxCentre(clamped).y).toBeLessThan(hawaii.centre.y);
    expect(clamped.y + clamped.height).toBeLessThanOrEqual(whole.height + 0.001);
  });

  it("still clamps by default, so a drag cannot run off the map", () => {
    const far = zoomBox(MAP, 3, { x: -500, y: -500 });
    expect(far.x).toBe(0);
    expect(far.y).toBe(0);
  });
});

/* A map of the earth pans east and west without stopping, so that a reader can choose how they wish to see it. */
describe("the window on a map that goes round the earth", () => {
  const earth = wholeMapBox(world);

  it("still holds every other map inside its own edges", () => {
    expect(zoomBox(MAP, 3, { x: -500, y: 0 }, true).x).toBe(0);
  });

  it("lets the world past its edges, east and west", () => {
    expect(zoomBox(world, 3, { x: 0, y: 200 }, true).x).toBeLessThan(0);
    expect(zoomBox(world, 3, { x: earth.width, y: 200 }, true).x).toBeGreaterThan(earth.width - earth.width / 3);
  });

  // The whole earth fits the frame at the first step, and which ocean sits in the middle is still the reader's to choose.
  it("turns at the first step as well as the closest", () => {
    const turned = zoomBox(world, 1, { x: 200, y: earth.height / 2 }, true);
    expect(turned.width).toBe(earth.width);
    expect(turned.x).toBe(200 - earth.width / 2);
  });

  // There is no sea beyond the poles for the window to hang over.
  it("holds north and south whatever it is asked", () => {
    expect(zoomBox(world, 3, { x: 0, y: -400 }, false).y).toBe(0);
    expect(zoomBox(world, 3, { x: 0, y: 9000 }, false).y).toBe(earth.height - earth.height / 3);
  });
});

/*
 * Choosing a country once left the map at 1x with a small country small in the whole-world view, while choosing a
 * group of them (a region opened through `zoomToFit`) zoomed in correctly: a single chosen place only recentred at
 * whatever zoom the reader already had. `focusRegionFit` is the same fit, for one place instead of several.
 */
describe("choosing one place zooms in to fit it", () => {
  it("zooms in on Wyoming rather than leaving it at the whole-country view", () => {
    const fit = focusRegionFit(MAP, "WY");
    expect(fit).not.toBeNull();
    expect(fit!.zoom).toBeGreaterThan(MAP_ZOOM_LEVELS[0]);
  });

  it("zooms in on a small country on the world map (Cyprus), not just a recentre", () => {
    const fit = focusRegionFit(world, "CY");
    expect(fit).not.toBeNull();
    expect(fit!.zoom).toBeGreaterThan(MAP_ZOOM_LEVELS[0]);
  });

  it("still frames a large country, Canada, without cutting it off", () => {
    const fit = focusRegionFit(world, "CA");
    expect(fit).not.toBeNull();
    const window = zoomBox(world, fit!.zoom, fit!.centre, false);
    const region = world.regions.find((entry) => entry.code === "CA")!;
    const [minX, minY, maxX, maxY] = region.bbox;
    expect(minX).toBeGreaterThanOrEqual(window.x - 1);
    expect(minY).toBeGreaterThanOrEqual(window.y - 1);
    expect(maxX).toBeLessThanOrEqual(window.x + window.width + 1);
    expect(maxY).toBeLessThanOrEqual(window.y + window.height + 1);
    expect(window.width).toBeLessThanOrEqual(wholeMapBox(world).width);
  });

  it("frames an inset's box too, the same as any other place chosen alone", () => {
    expect(focusRegionFit(MAP, "AK")!.zoom).toBeGreaterThan(MAP_ZOOM_LEVELS[0]);
  });

  it("has nothing to fit for no code, or one this map does not hold", () => {
    expect(focusRegionFit(MAP, null)).toBeNull();
    expect(focusRegionFit(MAP, "ZZ")).toBeNull();
  });
});

describe("framing a region whose outlying islands are drawn in a box", () => {
  /* Before Japan, no map boxed only part of a region, and framing Tokyo took the reader to Ogasawara's box. */
  it("frames Tokyo on the Tokyo left in place, and Okinawa on its box", async () => {
    const japan = (await import("./data/divisions/jp.ts")).default;
    const tokyo = japan.regions.find((region) => region.code === "13")!;
    const box = japan.insets.find((inset) => inset.code === "13")!.box;
    const centre = regionCentre(japan, "13")!;
    // Tokyo in place is the city and the Izu Islands down to Torishima, all west of the box that holds Ogasawara.
    expect(centre.x).toBeLessThan(box.x);
    const [, , inPlaceRight] = drawnBounds(tokyo, insetFor(japan, "13"));
    expect(inPlaceRight).toBeLessThan(box.x);
    const frame = regionBox(japan, "13");
    expect(frame.x + frame.width).toBeLessThan(box.x + box.width);
    expect(frame.width).toBeLessThan(tokyo.bbox[2] - tokyo.bbox[0]);
    const okinawa = japan.insets.find((inset) => inset.code === "47")!.box;
    expect(regionCentre(japan, "47")).toEqual({ x: okinawa.x + okinawa.width / 2, y: okinawa.y + okinawa.height / 2 });
    expect(zoomToFit(japan, ["13"]).zoom).toBeGreaterThan(1);
  });
});

import { describe, expect, it } from "vitest";

import { DIVISIONS_LOADERS } from "./data/loaders.ts";
import us from "./data/divisions/us.ts";
import world from "./data/world.ts";
import {
  circleMeetsRing,
  distanceToRing,
  landAnchor,
  mainlandBounds,
  mapOutlines,
  mapRegionPieces,
  parseMapRings,
  pointInRing,
  segmentMeetsRing,
  shiftedOutlines,
} from "./outlines.ts";
import type { ChizuInset, ChizuMap } from "./types.ts";

const square = "M10 10L30 10L30 30L10 30Z";
const islands = `${square}M50 50L60 50L60 60L50 60Z`;

describe("reading a map's outlines", () => {
  it("splits a path into its rings, with the box around each", () => {
    const rings = parseMapRings(islands);
    expect(rings).toHaveLength(2);
    expect([rings[0]!.minX, rings[0]!.minY, rings[0]!.maxX, rings[0]!.maxY]).toEqual([10, 10, 30, 30]);
    expect([rings[1]!.minX, rings[1]!.minY, rings[1]!.maxX, rings[1]!.maxY]).toEqual([50, 50, 60, 60]);
    /* Each keeps the text it was drawn from, so a part of a region can be drawn on its own. */
    expect(rings.map((ring) => ring.d).join("")).toBe(islands);
  });

  it("carries an inset region's outline into the box it is drawn in", () => {
    const [ring] = parseMapRings(square, { scale: 2, x: 100, y: 200 });
    expect([ring!.minX, ring!.minY, ring!.maxX, ring!.maxY]).toEqual([120, 220, 160, 260]);
  });

  it("knows the inside from the outside", () => {
    const [ring] = parseMapRings(square);
    expect(pointInRing(20, 20, ring!)).toBe(true);
    expect(pointInRing(40, 20, ring!)).toBe(false);
  });

  it("measures how far a point is from the coast", () => {
    const [ring] = parseMapRings(square);
    expect(distanceToRing(35, 20, ring!)).toBeCloseTo(5, 6);
    expect(circleMeetsRing(35, 20, 4, ring!)).toBe(false);
    expect(circleMeetsRing(35, 20, 6, ring!)).toBe(true);
    /* Inside counts as touching, however far from an edge. */
    expect(circleMeetsRing(20, 20, 1, ring!)).toBe(true);
  });

  it("knows when a line passes over the land", () => {
    const [ring] = parseMapRings(square);
    expect(segmentMeetsRing(0, 20, 40, 20, ring!)).toBe(true);
    expect(segmentMeetsRing(0, 40, 40, 40, ring!)).toBe(false);
    /* A line that stops inside is over it when it arrives. */
    expect(segmentMeetsRing(0, 20, 20, 20, ring!)).toBe(true);
    /* And one that lies wholly inside, crossing no edge at all. */
    expect(segmentMeetsRing(15, 20, 25, 20, ring!)).toBe(true);
  });
});

describe("a map's outlines", () => {
  /*
   * Alaska is drawn in a box off the lower forty-eight rather than where the projection puts it, and a circle placed
   * against its bounds would sit in that box on top of it. The outlines have to say where the land is drawn, not where
   * it is.
   */
  it("seats an inset region's outline where the map draws it", () => {
    const seated = us.insets.find((inset) => inset.code === "AK")!;
    const at = us.regions.findIndex((region) => region.code === "AK");
    const drawn = mapOutlines(us)[at]!;
    const inPlace = mapOutlines({ regions: us.regions, insets: [] })[at]!;
    const [minX, minY, maxX, maxY] = [Math.min(...drawn.rings.map((r) => r.minX)), Math.min(...drawn.rings.map((r) => r.minY)), Math.max(...drawn.rings.map((r) => r.maxX)), Math.max(...drawn.rings.map((r) => r.maxY))];
    expect(minX).toBeGreaterThanOrEqual(seated.box.x - 1);
    expect(minY).toBeGreaterThanOrEqual(seated.box.y - 1);
    expect(maxX).toBeLessThanOrEqual(seated.box.x + seated.box.width + 1);
    expect(maxY).toBeLessThanOrEqual(seated.box.y + seated.box.height + 1);
    expect(Math.min(...inPlace.rings.map((r) => r.minY))).not.toBeCloseTo(minY, 1);
  });

  it("parses a map's paths once", () => {
    expect(mapOutlines(us)).toBe(mapOutlines(us));
  });
});

/*
 * A region whose outlying islands belong in a box of their own, down their own chain, and not in the sea off its
 * mainland: a mainland at the top of a canvas with two islands far below it, in a map of one region.
 */
describe("a region whose outlying islands are drawn in a box", () => {
  const mainland = "M100 100L300 100L300 300L100 300Z";
  const islands = "M500 900L540 900L540 930L500 930ZM560 940L590 940L590 960L560 960Z";
  const region = { code: "X", name: "X", group: "g", path: mainland + islands, bbox: [100, 100, 590, 960] as [number, number, number, number], centroid: [200, 200] as [number, number], neighbors: [] };
  const inset: ChizuInset = { code: "X", box: { x: 700, y: 700, width: 200, height: 150 }, outlyingBelow: 800, magnify: true };

  it("draws the region where it is and the islands in the box", () => {
    const pieces = mapRegionPieces(region, inset);
    expect(pieces).toHaveLength(2);
    const [inPlace, seated] = pieces;
    expect(inPlace!.transform).toBeNull();
    // The mainland is untouched: its rings are where the path drew them.
    for (const ring of parseMapRings(inPlace!.d)) expect(ring.minY).toBeLessThan(inset.outlyingBelow!);
    // And the islands are inside the frame, magnified enough to read.
    expect(seated!.transform!.scale).toBeGreaterThan(1);
    for (const ring of parseMapRings(seated!.d, seated!.transform)) {
      expect(ring.minX).toBeGreaterThanOrEqual(inset.box.x - 1);
      expect(ring.minY).toBeGreaterThanOrEqual(inset.box.y - 1);
      expect(ring.maxX).toBeLessThanOrEqual(inset.box.x + inset.box.width + 1);
      expect(ring.maxY).toBeLessThanOrEqual(inset.box.y + inset.box.height + 1);
    }
  });

  it("leaves nothing of the region down where the islands were", () => {
    const map = { regions: [region], insets: [inset] };
    for (const ring of mapOutlines(map)[0]!.rings) expect(ring.minY).toBeLessThan(inset.outlyingBelow!);
    // Which is the thing that changed: drawn without the box, they are down there.
    expect(mapOutlines({ regions: [region], insets: [] })[0]!.rings.some((ring) => ring.minY >= inset.outlyingBelow!)).toBe(true);
  });

  // A number still points at the region itself, not at the box.
  it("keeps the region's whole outline, in both places", () => {
    const pieces = mapRegionPieces(region, inset);
    expect(pieces.flatMap((piece) => parseMapRings(piece.d)).length).toBe(parseMapRings(region.path).length);
  });

  it("with no line to split on, moves the whole region into the box, and magnifies it only when the box says it may", () => {
    const whole = mapRegionPieces(region, { code: "X", box: inset.box });
    expect(whole).toHaveLength(1);
    expect(whole[0]!.transform!.scale).toBeLessThanOrEqual(1);
    expect(mapRegionPieces(region, null)).toEqual([{ d: region.path, transform: null }]);
  });
});

/*
 * A leader has to end on the place it names. A stored centroid is the average of the whole outline, so it lands in the
 * sea for a chain or a crescent: 15 of the world's 173 countries (Indonesia, Japan, Malaysia, the Philippines, Vietnam,
 * Israel, France, Croatia among them).
 */
describe("where a leader ends", () => {
  it("picks a point inside the land, well away from the coast", () => {
    const [ring] = parseMapRings(square);
    const anchor = landAnchor([ring!])!;
    expect(pointInRing(anchor[0], anchor[1], ring!)).toBe(true);
    /* The middle of a 20-unit square is 10 from its edges; anything near one would do worse. */
    expect(distanceToRing(anchor[0], anchor[1], ring!)).toBeGreaterThan(8);
  });

  it("stays out of the bay a crescent wraps around", () => {
    /* A C, open to the right, with its hollow at (75, 50). */
    const [ring] = parseMapRings("M10 10L90 10L90 30L40 30L40 70L90 70L90 90L10 90Z");
    const anchor = landAnchor([ring!])!;
    expect(pointInRing(anchor[0], anchor[1], ring!)).toBe(true);
    expect(anchor[0]).toBeLessThan(40);
  });

  it("takes the region's largest outline, not an outlying island", () => {
    const anchor = landAnchor(parseMapRings(islands))!;
    expect(anchor[0]).toBeLessThan(40);
    expect(anchor[1]).toBeLessThan(40);
  });

  it("lands on the land for every region of every map of regions, and of the world", async () => {
    const maps: ChizuMap[] = [world];
    for (const load of Object.values(DIVISIONS_LOADERS)) maps.push((await load()).default);
    for (const map of maps) {
      const adrift = mapOutlines(map).filter(({ rings, anchor }) => !anchor || !rings.some((ring) => pointInRing(anchor[0], anchor[1], ring)));
      expect(adrift, map.id).toHaveLength(0);
    }
  }, 60000);

  it("is on the land where the stored centroid is in the sea", () => {
    const stored = (code: string) => world.regions.find((region) => region.code === code)!.centroid;
    const outlines = mapOutlines(world);
    const adriftBefore = world.regions.filter((region, at) => !outlines[at]!.rings.some((ring) => pointInRing(region.centroid[0], region.centroid[1], ring)));
    // The world's crescents and chains are exactly why the anchor exists.
    expect(adriftBefore.length).toBeGreaterThan(5);
    expect(adriftBefore.map((region) => region.code)).toContain("ID");
    expect(stored("ID")).toBeDefined();
  });
});

/*
 * A picture of one region, at the size of a letter. Framed on its whole reach, a prefecture whose far islands run three
 * hundred kilometres past its mainland fills a quarter of the square; framed on the mainland and what is near, it fills
 * most of it.
 */
describe("framing a region on its own", () => {
  it("frames the mainland and what sits beside it", () => {
    /* A 20-unit island with a speck just off it, and another far away. */
    const near = parseMapRings("M10 10L30 10L30 30L10 30ZM34 14L38 14L38 18L34 18Z");
    expect(mainlandBounds(near)).toEqual([10, 10, 38, 30]);
  });

  it("leaves out what is drawn far away, which is framed apart anyway", () => {
    const far = parseMapRings("M10 10L30 10L30 30L10 30ZM200 200L210 200L210 210L200 210Z");
    expect(mainlandBounds(far)).toEqual([10, 10, 30, 30]);
  });

  it("frames an archipelago on its main islands and what is near them, not on the whole reach of its chain", () => {
    const share = (code: string) => {
      const region = world.regions.find((entry) => entry.code === code)!;
      const [x0, y0, x1, y1] = region.bbox;
      const bounds = mainlandBounds(parseMapRings(region.path))!;
      return Math.max(bounds[2] - bounds[0], bounds[3] - bounds[1]) / Math.max(x1 - x0, y1 - y0);
    };
    // Indonesia's chain is drawn 2.2 times longer than its biggest island and what is next to it; the Philippines' farthest islands go past the frame.
    expect(share("ID")).toBeLessThan(0.6);
    expect(share("PH")).toBeLessThan(0.9);
    // A country in one piece is its whole reach.
    expect(share("GR")).toBe(1);
  });
});

/*
 * A second copy of the world, for the window that has panned across the cut in
 * the projection. See `wrap`.
 */
describe("the same outlines, one canvas east", () => {
  const rings = () => parseMapRings("M0 0L10 0L10 10L0 10Z");
  const outline = () => [{ rings: rings(), anchor: [5, 5] as [number, number] }];

  it("hands back the outlines themselves when nothing moves", () => {
    const at = outline();
    expect(shiftedOutlines(at, 0)).toBe(at);
  });

  it("moves the points, the box and the anchor together", () => {
    const moved = shiftedOutlines(outline(), 1000)[0]!;
    expect(moved.rings[0]!.minX).toBe(1000);
    expect(moved.rings[0]!.maxX).toBe(1010);
    expect(moved.rings[0]!.points.slice(0, 2)).toEqual([1000, 0]);
    expect(moved.anchor).toEqual([1005, 5]);
  });

  /* North and south do not move: the earth wraps one way. */
  it("leaves the latitudes alone", () => {
    const moved = shiftedOutlines(outline(), -1000)[0]!;
    expect(moved.rings[0]!.minY).toBe(0);
    expect(moved.rings[0]!.maxY).toBe(10);
  });

  /*
   * The path text is written out again rather than carried over. A ring whose
   * `d` said one thing and whose points said another would draw a coast a
   * canvas away from the coast it measures, and nothing would say why.
   */
  it("keeps the path text agreeing with the points", () => {
    const moved = shiftedOutlines(outline(), 1000)[0]!;
    const reparsed = parseMapRings(moved.rings[0]!.d)[0]!;
    expect(reparsed.points).toEqual(moved.rings[0]!.points);
  });

  /* Walked once rather than on every frame of a drag. */
  it("keeps what it has already shifted", () => {
    const at = outline();
    expect(shiftedOutlines(at, 1000)).toBe(shiftedOutlines(at, 1000));
  });
});

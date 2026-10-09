import { insetTransform, type InsetTransform } from "./insets.ts";
import type { ChizuInset, ChizuMap } from "./types.ts";

/**
 * A drawn map's outlines as points, rather than as the boxes around them.
 *
 * Everything that has to know where the land is would read `bbox` - one box
 * per region - and a box is a poor answer on an archipelago: a prefecture's
 * reaches three hundred kilometres past the mainland to its far islands, an
 * inland sea is inside four of them at once, and every bay on a coast reads as
 * land. That is water a number could sit in.
 *
 * The paths are `M`/`L`/`Z` polylines - the data build writes no curves - so a
 * ring is just its points, and a country of 68 rings is a few thousand points.
 * Small enough to ask the coastline itself.
 */

/**
 * One closed outline: a region's mainland, or one of its islands.
 *
 * @example
 * ```ts
 * import { parseMapRings, type MapRing } from "@johnmorrisdotca/chizu";
 *
 * const [ring]: MapRing[] = parseMapRings("M0,0L10,0L10,5L0,5Z");
 * console.log(ring!.minX, ring!.minY, ring!.maxX, ring!.maxY);
 * // 0 0 10 5
 * ```
 */
export type MapRing = {
  /** The ring as the path draws it, so a part of a region can be redrawn on its own. */
  d: string;
  points: readonly number[];
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

/**
 * The rings of one region's path, in the order it draws them, each with its own box.
 *
 * @example
 * ```ts
 * import { parseMapRings } from "@johnmorrisdotca/chizu";
 *
 * // Two islands: two rings, each with its own box.
 * console.log(parseMapRings("M0,0L10,0L10,10Z M20,20L30,20L30,30Z").map((ring) => [ring.minX, ring.maxX]));
 * // [ [ 0, 10 ], [ 20, 30 ] ]
 * ```
 */
export function parseMapRings(path: string, transform?: InsetTransform | null): MapRing[] {
  const rings: MapRing[] = [];
  for (const part of path.split(/(?=M)/)) {
    const numbers = part.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    if (numbers.length < 6) continue;
    const points: number[] = [];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i + 1 < numbers.length; i += 2) {
      const x = transform ? transform.x + numbers[i]! * transform.scale : numbers[i]!;
      const y = transform ? transform.y + numbers[i + 1]! * transform.scale : numbers[i + 1]!;
      points.push(x, y);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    rings.push({ d: part, points, minX, minY, maxX, maxY });
  }
  return rings;
}

/**
 * Whether a point is inside a ring, by the crossing rule.
 *
 * @example
 * ```ts
 * import { parseMapRings, pointInRing } from "@johnmorrisdotca/chizu";
 *
 * const [square] = parseMapRings("M0,0L10,0L10,10L0,10Z");
 * console.log(pointInRing(5, 5, square!), pointInRing(15, 5, square!));
 * // true false
 * ```
 */
export function pointInRing(x: number, y: number, ring: MapRing): boolean {
  if (x < ring.minX || x > ring.maxX || y < ring.minY || y > ring.maxY) return false;
  const points = ring.points;
  let within = false;
  for (let i = 0, j = points.length - 2; i < points.length; j = i, i += 2) {
    const xi = points[i]!;
    const yi = points[i + 1]!;
    const xj = points[j]!;
    const yj = points[j + 1]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) within = !within;
  }
  return within;
}

/**
 * How far a point is from a ring's outline, ignoring which side of it the point is on.
 *
 * @example
 * ```ts
 * import { distanceToRing, parseMapRings } from "@johnmorrisdotca/chizu";
 *
 * const [square] = parseMapRings("M0,0L10,0L10,10L0,10Z");
 * console.log(distanceToRing(13, 5, square!), distanceToRing(5, 5, square!));
 * // 3 5
 * ```
 */
export function distanceToRing(x: number, y: number, ring: MapRing): number {
  const points = ring.points;
  let best = Infinity;
  for (let i = 0, j = points.length - 2; i < points.length; j = i, i += 2) {
    const xi = points[i]!;
    const yi = points[i + 1]!;
    const dx = points[j]! - xi;
    const dy = points[j + 1]! - yi;
    const length = dx * dx + dy * dy;
    const t = length > 0 ? Math.max(0, Math.min(1, ((x - xi) * dx + (y - yi) * dy) / length)) : 0;
    const distance = Math.hypot(x - (xi + t * dx), y - (yi + t * dy));
    if (distance < best) best = distance;
  }
  return best;
}

/**
 * Whether a circle of this radius at this point touches the land inside a ring.
 *
 * @example
 * ```ts
 * import { circleMeetsRing, parseMapRings } from "@johnmorrisdotca/chizu";
 *
 * const [square] = parseMapRings("M0,0L10,0L10,10L0,10Z");
 * console.log(circleMeetsRing(13, 5, 2, square!), circleMeetsRing(13, 5, 4, square!));
 * // false true
 * ```
 */
export function circleMeetsRing(x: number, y: number, radius: number, ring: MapRing): boolean {
  return seaAround(x, y, radius, ring) < radius;
}

/**
 * How much water is around a point before this ring's land, never looking
 * further than `reach` - a place far from every coast only has to be known to
 * be far, and walking six thousand points to find out how far is the bill this
 * runs up on every draw.
 *
 * @example
 * ```ts
 * import { parseMapRings, seaAround } from "@johnmorrisdotca/chizu";
 *
 * const [square] = parseMapRings("M0,0L10,0L10,10L0,10Z");
 * console.log(seaAround(16, 5, 10, square!));
 * // 6
 * ```
 */
export function seaAround(x: number, y: number, reach: number, ring: MapRing): number {
  if (x + reach < ring.minX || x - reach > ring.maxX || y + reach < ring.minY || y - reach > ring.maxY) return reach;
  if (pointInRing(x, y, ring)) return 0;
  return Math.min(reach, distanceToRing(x, y, ring));
}

/**
 * Whether a straight line from one point to another passes over the land inside a ring.
 *
 * @example
 * ```ts
 * import { parseMapRings, segmentMeetsRing } from "@johnmorrisdotca/chizu";
 *
 * const [square] = parseMapRings("M0,0L10,0L10,10L0,10Z");
 * console.log(segmentMeetsRing(-5, 5, 15, 5, square!), segmentMeetsRing(-5, 20, 15, 20, square!));
 * // true false
 * ```
 */
export function segmentMeetsRing(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  ring: MapRing,
): boolean {
  if (Math.max(ax, bx) < ring.minX || Math.min(ax, bx) > ring.maxX) return false;
  if (Math.max(ay, by) < ring.minY || Math.min(ay, by) > ring.maxY) return false;
  const points = ring.points;
  const turn = (px: number, py: number, qx: number, qy: number, rx: number, ry: number) =>
    (qx - px) * (ry - py) - (qy - py) * (rx - px);
  for (let i = 0, j = points.length - 2; i < points.length; j = i, i += 2) {
    const cx = points[i]!;
    const cy = points[i + 1]!;
    const dx = points[j]!;
    const dy = points[j + 1]!;
    const d1 = turn(ax, ay, bx, by, cx, cy);
    const d2 = turn(ax, ay, bx, by, dx, dy);
    const d3 = turn(cx, cy, dx, dy, ax, ay);
    const d4 = turn(cx, cy, dx, dy, bx, by);
    if (d1 > 0 !== d2 > 0 && d3 > 0 !== d4 > 0) return true;
  }
  /* Both ends inside and no edge crossed: the line is over the land the whole way. */
  return pointInRing(ax, ay, ring);
}

/**
 * The box around a region as anyone would picture it: its largest outline, and
 * whatever else is close enough to belong in the same glance.
 *
 * A region's own bounds are its whole reach, which is the wrong frame for a
 * picture of it. Kagoshima's run from the foot of Kyushu to the Amami islands,
 * three hundred kilometres south, so the prefecture drew at a quarter of the
 * size it could with two specks under it.
 *
 * `reach` is how far a ring may sit from the mainland and still be framed with
 * it, as a share of the mainland's own longer side - so a near island comes
 * along and a far one is left out of the picture, which is where the map itself
 * now draws it anyway.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { mainlandBounds, mapOutlines } from "@johnmorrisdotca/chizu";
 *
 * const index = WORLD.regions.findIndex((region) => region.code === "FR");
 * // France on the world reaches French Guiana; its mainland does not.
 * const mainland = mainlandBounds(mapOutlines(WORLD)[index]!.rings)!;
 * console.log(mainland[3] - mainland[1] < WORLD.regions[index]!.bbox[3] - WORLD.regions[index]!.bbox[1]);
 * // true
 * ```
 */
export function mainlandBounds(
  rings: readonly MapRing[],
  reach = 1,
): [number, number, number, number] | null {
  let widest: MapRing | null = null;
  for (const ring of rings) {
    const area = (ring.maxX - ring.minX) * (ring.maxY - ring.minY);
    if (!widest || area > (widest.maxX - widest.minX) * (widest.maxY - widest.minY)) widest = ring;
  }
  if (!widest) return null;
  const span = Math.max(widest.maxX - widest.minX, widest.maxY - widest.minY) * reach;
  const near = rings.filter(
    (ring) =>
      ring.minX >= widest!.minX - span &&
      ring.maxX <= widest!.maxX + span &&
      ring.minY >= widest!.minY - span &&
      ring.maxY <= widest!.maxY + span,
  );
  return [
    Math.min(...near.map((ring) => ring.minX)),
    Math.min(...near.map((ring) => ring.minY)),
    Math.max(...near.map((ring) => ring.maxX)),
    Math.max(...near.map((ring) => ring.maxY)),
  ];
}

/**
 * A point on the region's own land, for a leader to end at.
 *
 * `region.map.centroid` is the average of a whole outline, so it falls in open
 * water whenever a place is a chain or a crescent: measured on 2026-09-18, 15
 * of the world's 173 countries - Indonesia, Japan, Malaysia, the Philippines,
 * Vietnam, Israel, France, Croatia among them - and a leader drawn to it ends
 * in the sea between the islands it is naming.
 *
 * The biggest ring is the region as anyone would point at it, and inside it the
 * chosen point is the one furthest from its coast: the pole of inaccessibility,
 * found by quartering the ring's box and keeping the best square, which is a
 * few hundred steps and exact enough for a circle's leader. A ring so thin that
 * no sample lands inside it - a sandbar - falls back to the ring's own middle.
 *
 * @example
 * ```ts
 * import { landAnchor, parseMapRings } from "@johnmorrisdotca/chizu";
 *
 * // The point deepest in the land of the widest ring.
 * console.log(landAnchor(parseMapRings("M0,0L20,0L20,10L0,10Z")));
 * // [ 5, 5 ]
 * ```
 */
export function landAnchor(rings: readonly MapRing[]): [number, number] | null {
  let widest: MapRing | null = null;
  for (const ring of rings) {
    const area = (ring.maxX - ring.minX) * (ring.maxY - ring.minY);
    if (!widest || area > (widest.maxX - widest.minX) * (widest.maxY - widest.minY)) widest = ring;
  }
  if (!widest) return null;
  let best: { x: number; y: number; sea: number } | null = null;
  let { minX, minY, maxX, maxY } = widest;
  for (let pass = 0; pass < 4; pass += 1) {
    const stepX = (maxX - minX) / 8;
    const stepY = (maxY - minY) / 8;
    for (let ix = 0; ix <= 8; ix += 1) {
      for (let iy = 0; iy <= 8; iy += 1) {
        const x = minX + ix * stepX;
        const y = minY + iy * stepY;
        if (!pointInRing(x, y, widest)) continue;
        const sea = distanceToRing(x, y, widest);
        if (!best || sea > best.sea) best = { x, y, sea };
      }
    }
    if (!best) break;
    /* Close in on the best square found so far and look again, twice as finely. */
    minX = Math.max(widest.minX, best.x - stepX);
    maxX = Math.min(widest.maxX, best.x + stepX);
    minY = Math.max(widest.minY, best.y - stepY);
    maxY = Math.min(widest.maxY, best.y + stepY);
  }
  if (best) return [best.x, best.y];
  return [(widest.minX + widest.maxX) / 2, (widest.minY + widest.maxY) / 2];
}

/**
 * How one region is drawn: usually in one piece, where it is.
 *
 * A region in a box of its own is that one piece moved into the box. A region
 * with outlying islands in a box - a prefecture whose far islands belong down
 * their own chain rather than in the sea off the mainland - is two: the region
 * where it is, and the islands in their frame. Both carry the same region, so
 * whichever piece is clicked is the same place.
 *
 * @example
 * ```ts
 * import { loadDivisions } from "@johnmorrisdotca/chizu/load";
 * import { insetFor, mapRegionPieces, type MapPiece } from "@johnmorrisdotca/chizu";
 *
 * const japan = (await loadDivisions("jp"))!;
 * const tokyo = japan.regions.find((region) => region.code === "13")!;
 * const pieces: MapPiece[] = mapRegionPieces(tokyo, insetFor(japan, "13"));
 * console.log(pieces.map((piece) => (piece.transform ? "in its box" : "in place")).join(", "));
 * // in place, in its box
 * ```
 */
export type MapPiece = { d: string; transform: InsetTransform | null };

/**
 *
 * @example
 * ```ts
 * import { loadDivisions } from "@johnmorrisdotca/chizu/load";
 * import { insetFor, mapRegionPieces } from "@johnmorrisdotca/chizu";
 *
 * const us = (await loadDivisions("us"))!;
 * const alaska = us.regions.find((region) => region.code === "AK")!;
 * console.log(mapRegionPieces(alaska, insetFor(us, "AK")).length, mapRegionPieces(alaska, null)[0]!.transform);
 * // 1 null
 * ```
 */
export function mapRegionPieces(
  region: { path: string; bbox: readonly [number, number, number, number] },
  inset: ChizuInset | null,
): MapPiece[] {
  if (!inset) return [{ d: region.path, transform: null }];
  if (inset.outlyingBelow === undefined) {
    return [{ d: region.path, transform: insetTransform(region.bbox, inset.box, inset.magnify) }];
  }
  const rings = parseMapRings(region.path);
  const outlying = rings.filter((ring) => ring.minY >= inset.outlyingBelow!);
  const rest = rings.filter((ring) => ring.minY < inset.outlyingBelow!);
  if (outlying.length === 0 || rest.length === 0) return [{ d: region.path, transform: null }];
  const bounds = [
    Math.min(...outlying.map((ring) => ring.minX)),
    Math.min(...outlying.map((ring) => ring.minY)),
    Math.max(...outlying.map((ring) => ring.maxX)),
    Math.max(...outlying.map((ring) => ring.maxY)),
  ] as const;
  return [
    { d: rest.map((ring) => ring.d).join(""), transform: null },
    { d: outlying.map((ring) => ring.d).join(""), transform: insetTransform(bounds, inset.box, inset.magnify) },
  ];
}

/**
 * A map's outlines, drawn where they are drawn: a region in a box carried into it, outlying islands in a box carried
 * into theirs, everything else where the projection put it.
 *
 * Kept against the map itself, so a page that redraws on every pick parses its paths once. Canada's are 76,000 points
 * and cost 16ms to walk, a third of a frame, on a keystroke.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { mapOutlines, type MapOutline } from "@johnmorrisdotca/chizu";
 *
 * const japan: MapOutline = mapOutlines(WORLD)[WORLD.regions.findIndex((region) => region.code === "JP")]!;
 * console.log(japan.rings.length > 1, japan.anchor !== null);
 * // true true
 * ```
 */
export type MapOutline = {
  rings: MapRing[];
  /** Where a leader to this region should end: a point on the land, as drawn. */
  anchor: [number, number] | null;
};

const outlineCache = new WeakMap<object, MapOutline[]>();

/**
 * The outlines of every region of a map, in the map's order, with a point on each one's land.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { mapOutlines } from "@johnmorrisdotca/chizu";
 *
 * const outlines = mapOutlines(WORLD);
 * console.log(outlines.length === WORLD.regions.length, mapOutlines(WORLD) === outlines);
 * // true true
 * ```
 */
export function mapOutlines(map: Pick<ChizuMap, "regions" | "insets">): MapOutline[] {
  const known = outlineCache.get(map);
  if (known) return known;
  const byCode = new Map(map.insets.map((inset) => [String(inset.code), inset]));
  const outlines = map.regions.map((region) => {
    const rings = mapRegionPieces(region, byCode.get(String(region.code)) ?? null).flatMap((piece) => parseMapRings(piece.d, piece.transform));
    return { rings, anchor: landAnchor(rings) };
  });
  outlineCache.set(map, outlines);
  return outlines;
}

/**
 * The same outlines, drawn one canvas east or west.
 *
 * Only the world asks for these, and only while the window overhangs the cut -
 * but while it does, the copy on screen is land like any other and the numbers
 * have to keep out of it. Placing them against the projection's own coordinates
 * alone would put a number over whatever the second copy is drawing, which at
 * the date line is Kamchatka, Alaska and the whole Pacific rim.
 *
 * The world is 9,683 points, so a shift is cheap; it is cached anyway, because
 * the alternative is walking them again on every drag frame.
 */
const shiftCache = new WeakMap<object, Map<number, MapOutline[]>>();

/** A ring's points back as the polyline the map build writes. */
function ringPath(points: readonly number[]): string {
  const parts: string[] = [];
  for (let i = 0; i + 1 < points.length; i += 2) parts.push(`${points[i]} ${points[i + 1]}`);
  return `M${parts.join("L")}Z`;
}

/**
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { mapOutlines, shiftedOutlines } from "@johnmorrisdotca/chizu";
 *
 * // The world's outlines one turn of the earth to the east, for the copy drawn beside it.
 * const shifted = shiftedOutlines(mapOutlines(WORLD), WORLD.width);
 * console.log(Math.round(shifted[0]!.rings[0]!.minX - mapOutlines(WORLD)[0]!.rings[0]!.minX));
 * // 1000
 * ```
 */
export function shiftedOutlines(outlines: readonly MapOutline[], by: number): MapOutline[] {
  if (by === 0) return outlines as MapOutline[];
  const held = shiftCache.get(outlines) ?? new Map<number, MapOutline[]>();
  const known = held.get(by);
  if (known) return known;
  const moved = outlines.map((outline) => ({
    rings: outline.rings.map((ring) => {
      const points = ring.points.map((value, at) => (at % 2 === 0 ? value + by : value));
      return {
        /* Written out again rather than carried over: a ring whose `d` said one
           thing and whose points said another would draw the coast a canvas
           away from the coast it measures, and nothing would say why. */
        d: ringPath(points),
        points,
        minX: ring.minX + by,
        minY: ring.minY,
        maxX: ring.maxX + by,
        maxY: ring.maxY,
      };
    }),
    anchor: outline.anchor ? ([outline.anchor[0] + by, outline.anchor[1]] as [number, number]) : null,
  }));
  held.set(by, moved);
  shiftCache.set(outlines, held);
  return moved;
}

/**
 * The box round a region where it is *drawn*, to frame it by: its own box when it is drawn where it is, its box
 * carried into its inset when it is drawn whole in one, and the box round the part left in place when only its
 * outlying islands are boxed (Tokyo is framed on Tokyo, not on Ogasawara, and not on both with an ocean between).
 */
export function drawnBounds(
  region: { path: string; bbox: readonly [number, number, number, number] },
  inset: ChizuInset | null,
): [number, number, number, number] {
  const [x0, y0, x1, y1] = region.bbox;
  if (!inset) return [x0, y0, x1, y1];
  const pieces = mapRegionPieces(region, inset);
  const inPlace = inset.outlyingBelow === undefined ? [] : pieces.filter((piece) => piece.transform === null);
  if (inPlace.length === 0) {
    const transform = insetTransform(region.bbox, inset.box, inset.magnify);
    return [x0 * transform.scale + transform.x, y0 * transform.scale + transform.y, x1 * transform.scale + transform.x, y1 * transform.scale + transform.y];
  }
  const rings = inPlace.flatMap((piece) => parseMapRings(piece.d));
  return [Math.min(...rings.map((ring) => ring.minX)), Math.min(...rings.map((ring) => ring.minY)), Math.max(...rings.map((ring) => ring.maxX)), Math.max(...rings.map((ring) => ring.maxY))];
}

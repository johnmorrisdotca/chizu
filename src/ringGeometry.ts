import type { InsetTransform } from "./insets.ts";

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
 *
 * @param path - The native SVG outline path to parse.
 * @param transform - The native inset scale and translation to apply.
 * @returns The rings of one region's path, in the order it draws them, each with its own box.
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
 *
 * @param x - The horizontal native map coordinate.
 * @param y - The vertical native map coordinate.
 * @param ring - A closed outline ring in native map units.
 * @returns Whether a point is inside a ring, by the crossing rule.
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
 *
 * @param x - The horizontal native map coordinate.
 * @param y - The vertical native map coordinate.
 * @param ring - A closed outline ring in native map units.
 * @returns How far a point is from a ring's outline, ignoring which side of it the point is on.
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
 *
 * @param x - The horizontal native map coordinate.
 * @param y - The vertical native map coordinate.
 * @param radius - The circle or label radius in native map units.
 * @param ring - A closed outline ring in native map units.
 * @returns Whether a circle of this radius at this point touches the land inside a ring.
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
 *
 * @param x - The horizontal native map coordinate.
 * @param y - The vertical native map coordinate.
 * @param reach - The maximum native map-unit search distance.
 * @param ring - A closed outline ring in native map units.
 * @returns How much water is around a point before this ring's land, never looking further than `reach` - a place far from every coast only has to be known to be far, and walking six thousand points to find out how far is the bill this runs up on every draw.
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
 *
 * @param ax - The first segment endpoint’s horizontal map coordinate.
 * @param ay - The first segment endpoint’s vertical map coordinate.
 * @param bx - The second segment endpoint’s horizontal map coordinate.
 * @param by - The second segment endpoint’s vertical map coordinate.
 * @param ring - A closed outline ring in native map units.
 * @returns Whether a straight line from one point to another passes over the land inside a ring.
 */
export function segmentMeetsRing(ax: number, ay: number, bx: number, by: number, ring: MapRing): boolean {
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

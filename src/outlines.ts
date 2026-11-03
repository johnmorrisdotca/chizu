import { type InsetTransform, insetTransform } from "./insets.ts";
import type { MapRing } from "./ringGeometry.ts";
import { distanceToRing, parseMapRings, pointInRing } from "./ringGeometry.ts";
import type { ChizuInset, ChizuMap } from "./types.ts";

export type { MapRing } from "./ringGeometry.ts";
export {
  circleMeetsRing,
  distanceToRing,
  parseMapRings,
  pointInRing,
  seaAround,
  segmentMeetsRing,
} from "./ringGeometry.ts";

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
 *
 * @param rings - Closed outline rings in native map units.
 * @param reach - The maximum native map-unit search distance.
 * @returns Bounds around the mainland and nearby pieces, or null when no ring exists.
 */
export function mainlandBounds(rings: readonly MapRing[], reach = 1): [number, number, number, number] | null {
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
 *
 * @param rings - Closed outline rings in native map units.
 * @returns A point on the widest ring’s land, or null when no ring exists.
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
 * The region’s separate drawn pieces, including the geometry moved into its inset boxes.
 *
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
 *
 * @param region - The native region, or built-in map selector where the signature requires text.
 * @param inset - The native inset placement and optional restriction to part of a region.
 * @returns The region’s separate drawn pieces, including the geometry moved into its inset boxes.
 */
export function mapRegionPieces(
  region: { path: string; bbox: readonly [number, number, number, number] },
  inset: ChizuInset | readonly ChizuInset[] | null,
): MapPiece[] {
  const insets = inset === null ? [] : Array.isArray(inset) ? (inset as readonly ChizuInset[]) : [inset as ChizuInset];
  if (insets.length === 0) return [{ d: region.path, transform: null }];
  const whole = insets.find((one) => one.outlyingBelow === undefined && one.within === undefined);
  if (whole) return [{ d: region.path, transform: insetTransform(region.bbox, whole.box, whole.magnify) }];
  let rest = parseMapRings(region.path);
  const boxed: MapPiece[] = [];
  for (const one of insets) {
    const takes = (ring: MapRing) =>
      one.within !== undefined
        ? ring.minX >= one.within.x &&
          ring.maxX <= one.within.x + one.within.width &&
          ring.minY >= one.within.y &&
          ring.maxY <= one.within.y + one.within.height
        : ring.minY >= one.outlyingBelow!;
    const taken = rest.filter(takes);
    rest = rest.filter((ring) => !takes(ring));
    if (taken.length === 0) continue;
    const bounds = [
      Math.min(...taken.map((ring) => ring.minX)),
      Math.min(...taken.map((ring) => ring.minY)),
      Math.max(...taken.map((ring) => ring.maxX)),
      Math.max(...taken.map((ring) => ring.maxY)),
    ] as const;
    boxed.push({ d: taken.map((ring) => ring.d).join(""), transform: insetTransform(bounds, one.box, one.magnify) });
  }
  if (boxed.length === 0) return [{ d: region.path, transform: null }];
  return rest.length > 0 ? [{ d: rest.map((ring) => ring.d).join(""), transform: null }, ...boxed] : boxed;
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
 *
 * @param map - The native map or map fields required by this signature; coordinates and region codes belong to its canvas.
 * @returns The outlines of every region of a map, in the map's order, with a point on each one's land.
 */
export function mapOutlines(map: Pick<ChizuMap, "regions" | "insets">): MapOutline[] {
  const known = outlineCache.get(map);
  if (known) return known;
  const outlines = map.regions.map((region) => {
    const rings = mapRegionPieces(
      region,
      map.insets.filter((inset) => String(inset.code) === String(region.code)),
    ).flatMap((piece) => parseMapRings(piece.d, piece.transform));
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
 * Copies of the outlines translated horizontally by the supplied map-unit offset.
 *
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
 *
 * @param outlines - Native parsed region outlines, including their region identifiers.
 * @param by - The second segment endpoint’s vertical map coordinate.
 * @returns Copies of the outlines translated horizontally by the supplied map-unit offset.
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
  inset: ChizuInset | readonly ChizuInset[] | null,
): [number, number, number, number] {
  const [x0, y0, x1, y1] = region.bbox;
  const pieces = mapRegionPieces(region, inset);
  if (pieces.length === 1 && pieces[0]!.transform === null) return [x0, y0, x1, y1];
  // The part left in place when there is one; otherwise the first box, which holds the region's main part.
  const inPlace = pieces.filter((piece) => piece.transform === null);
  const framed = inPlace.length > 0 ? inPlace : [pieces[0]!];
  const rings = framed.flatMap((piece) => parseMapRings(piece.d, piece.transform));
  return [
    Math.min(...rings.map((ring) => ring.minX)),
    Math.min(...rings.map((ring) => ring.minY)),
    Math.max(...rings.map((ring) => ring.maxX)),
    Math.max(...rings.map((ring) => ring.maxY)),
  ];
}

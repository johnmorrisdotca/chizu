import { HANDLE_CLEARANCE } from "./handles.ts";
import { seaAround, type MapRing } from "./outlines.ts";
import type { MapBox } from "./types.ts";

/**
 * Where a numbered circle may sit on a map: in the water, off the land.
 *
 * Split from the placing of them, which is a different question - this one is
 * only ever asked of the map, never of what is being numbered, and the answer
 * is the same for every circle on it.
 */

/** How far in from the frame's edge the outermost circle's centre sits, in radii. */
export const CALLOUT_INSET = 1.6;

/** The sea kept between a circle's edge and the land, in radii. */
const CALLOUT_SEA = 0.3;

/**
 * The sea a circle would like around it, in radii, and what having less costs
 * it - so that open water wins over a bay with barely the room, without a bay
 * being refused when it is the only water a region has.
 *
 * A sheet whose numbers sat on the coast read as numbers on the land: they need
 * to be well away from the shore, so the sea a circle has is weighed, up to this.
 */
export const CALLOUT_ROOMY = 2;
/**
 * How finely the frame is searched for room, as a share of the spacing between
 * two circles. Half a spacing is close enough that a coastal region finds the
 * water beside it rather than a circle's width out to sea, and coarse enough
 * that the whole search stays a few thousand steps on a draw.
 */
const SEARCH_STEP = 0.5;

/**
 * The lengths of frame kept clear at the bottom-right corner, in the map's
 * units: up the right edge before the corner and along the bottom edge after
 * it, which is where the credit line is drawn.
 */
export type CalloutKeepOut = { bottom: number; right: number };

/** A box, which is what a leader is kept off and what the credit's corner is. */
export type CalloutObstacle = { minX: number; minY: number; maxX: number; maxY: number };

/**
 * One drawn region, as the outlines it is actually drawn with.
 *
 * A circle keeps out of the rings themselves, so the Seto Inland Sea, Tokyo
 * Bay and the gap between Kyushu and Shikoku are all places a number can go.
 * A leader is only measured against the boxes around those rings, because
 * "cross minimal number of states" is a count of places rather than a question
 * about a coastline, and the leaders are costed thousands of times a draw.
 */
export type CalloutLand = { rings: readonly MapRing[] };

/** Whether two leaders cross. Touching at an end is not crossing. */
export function segmentsCross(
  a: readonly [number, number],
  b: readonly [number, number],
  c: readonly [number, number],
  d: readonly [number, number],
): boolean {
  const turn = (p: readonly [number, number], q: readonly [number, number], r: readonly [number, number]) =>
    (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const d1 = turn(a, b, c);
  const d2 = turn(a, b, d);
  const d3 = turn(c, d, a);
  const d4 = turn(c, d, b);
  return d1 > 0 !== d2 > 0 && d3 > 0 !== d4 > 0;
}

/** How far a point is from a segment. */
function pointToSegment(point: readonly [number, number], a: readonly [number, number], b: readonly [number, number]): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length = dx * dx + dy * dy;
  const t = length === 0 ? 0 : Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / length));
  return Math.hypot(point[0] - (a[0] + t * dx), point[1] - (a[1] + t * dy));
}

/**
 * How close two leaders come, where they do not cross: the nearest any point
 * of one gets to the other. Zero when they cross.
 */
export function segmentsGap(
  a: readonly [number, number],
  b: readonly [number, number],
  c: readonly [number, number],
  d: readonly [number, number],
): number {
  if (segmentsCross(a, b, c, d)) return 0;
  return Math.min(pointToSegment(a, c, d), pointToSegment(b, c, d), pointToSegment(c, a, b), pointToSegment(d, a, b));
}

/** Whether a circle of this radius at this point reaches into the box. */
function circleMeetsBox(point: readonly [number, number], radius: number, box: CalloutObstacle): boolean {
  const x = Math.min(Math.max(point[0], box.minX), box.maxX);
  const y = Math.min(Math.max(point[1], box.minY), box.maxY);
  return Math.hypot(point[0] - x, point[1] - y) < radius;
}

/** Whether a straight leader from `a` to `b` passes through this box. */
export function segmentCrossesBox(
  a: readonly [number, number],
  b: readonly [number, number],
  box: CalloutObstacle,
): boolean {
  /* Liang-Barsky: the segment is clipped to the box, and survives if any of it is left. */
  let t0 = 0;
  let t1 = 1;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const edges: Array<[number, number]> = [
    [-dx, a[0] - box.minX],
    [dx, box.maxX - a[0]],
    [-dy, a[1] - box.minY],
    [dy, box.maxY - a[1]],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
  }
  return t1 > t0;
}

/**
 * One place a circle could sit, and where it sits on the search grid.
 *
 * The row and column are carried rather than recovered, so asking whether a
 * place is too near a circle already put down is a look at the handful of
 * cells around it instead of a walk through every circle on the map.
 */
export type CalloutPlace = {
  x: number;
  y: number;
  row: number;
  col: number;
  /** Water between the circle's edge and the nearest land, in radii, up to `CALLOUT_ROOMY`. */
  sea: number;
};

/**
 * Every place in the frame where a circle fits clear of the land and of the
 * credit's corner, on a grid fine enough to find the water beside a coast.
 *
 * A frame with no room at all - a map zoomed until the land fills it - gets
 * the grid unfiltered rather than nothing, because a number on land is still
 * better than a number that is not drawn.
 */
export function calloutSpaces(
  radius: number,
  box: MapBox,
  keepOut: CalloutKeepOut,
  land: readonly CalloutLand[],
): CalloutPlace[] {
  return calloutGrid(radius, box, keepOut, land).places;
}

/** The same places, with the grid they were found on. */
export function calloutGrid(
  radius: number,
  box: MapBox,
  keepOut: CalloutKeepOut,
  land: readonly CalloutLand[],
): { places: CalloutPlace[]; cols: number; step: number } {
  const inset = radius * CALLOUT_INSET;
  const minX = box.x + inset;
  const minY = box.y + inset;
  const maxX = box.x + box.width - inset;
  const maxY = box.y + box.height - inset;
  const step = radius * HANDLE_CLEARANCE * SEARCH_STEP;
  /* Evenly spaced from edge to edge, so the outermost ring of places is the frame's own band. */
  const cols = Math.max(1, Math.round((maxX - minX) / step) + 1);
  const rows = Math.max(1, Math.round((maxY - minY) / step) + 1);
  const credit: CalloutObstacle = {
    minX: box.x + box.width - keepOut.bottom,
    minY: box.y + box.height - keepOut.right,
    maxX: box.x + box.width,
    maxY: box.y + box.height,
  };
  const guarded = keepOut.bottom > 0 || keepOut.right > 0;
  const clear = radius * (1 + CALLOUT_SEA);
  const roomy = radius * (1 + CALLOUT_ROOMY);
  const rings = land.flatMap(({ rings: own }) => own);
  const all: CalloutPlace[] = [];
  const free: CalloutPlace[] = [];
  for (let row = 0; row < rows; row += 1) {
    const y = rows === 1 ? (minY + maxY) / 2 : minY + ((maxY - minY) * row) / (rows - 1);
    for (let col = 0; col < cols; col += 1) {
      const x = cols === 1 ? (minX + maxX) / 2 : minX + ((maxX - minX) * col) / (cols - 1);
      let water = roomy;
      for (const ring of rings) {
        water = Math.min(water, seaAround(x, y, water, ring));
        if (water < clear) break;
      }
      const place: CalloutPlace = { x, y, row, col, sea: (water - radius) / radius };
      all.push(place);
      if (guarded && circleMeetsBox([x, y], radius, credit)) continue;
      if (water < clear) continue;
      free.push(place);
    }
  }
  return {
    places: free.length > 0 ? free : all,
    cols,
    /* The shorter of the two strides, so a cell's reach is never underestimated. */
    step: Math.min(cols > 1 ? (maxX - minX) / (cols - 1) : step, rows > 1 ? (maxY - minY) / (rows - 1) : step),
  };
}

/** The box around a set of boxes. */

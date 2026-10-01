import type { ChizuMap, MapBox } from "./types.ts";

/**
 * The board whose east edge is its west edge.
 *
 * Every other map has four edges and a reader who reaches one has reached the end of the country. The earth has no such
 * edge: a map of it is a cylinder cut open somewhere, and where it was cut is an accident of the projection rather than
 * a fact about the world. Cut at the date line, Asia is split down the middle and the Pacific is two strips nobody can
 * see at once, so "where is Fiji" is a question the map itself makes harder to answer. So a map that `wraps` pans east
 * and west without stopping, and its canvas is simply drawn again either side of itself wherever the window overhangs.
 * A country map that wrapped would draw Japan twice out at sea, so only the world does.
 */

/** Whether this map's east and west edges are the same edge. */
export function mapWrapsAround(map: Pick<ChizuMap, "wraps">): boolean {
  return map.wraps;
}

/**
 * How many copies of the canvas may be drawn at once. Two is the real answer (a window can overhang one side or the
 * other, never both, because it is never wider than the world); the guard is against a window that has gone wrong, so
 * that a zero-width canvas asks for no loop without end inside a render.
 */
const MOST_COPIES = 4;

/** A coordinate brought back onto the canvas, for a pan that has gone round. */
export function wrapAcross(x: number, width: number): number {
  if (!(width > 0)) return x;
  return ((x % width) + width) % width;
}

/**
 * The copies of the canvas this window sees, as x offsets in map units: `[0]` while the window is wholly on the
 * canvas, which is most of the time. The second copy is only drawn once the reader has panned across the cut.
 */
export function wrapOffsets(box: MapBox, width: number): number[] {
  if (!(width > 0) || !(box.width > 0)) return [0];
  const first = Math.floor(box.x / width);
  // Ceiling less one, so a window ending exactly on a seam does not draw a copy it touches along a single line.
  const last = Math.max(first, Math.ceil((box.x + box.width) / width) - 1);
  const offsets: number[] = [];
  for (let at = first; at <= last && offsets.length < MOST_COPIES; at += 1) offsets.push(at * width);
  return offsets;
}

/**
 * The copy of a point that this window shows, or null when it shows none. What a number and its leader are placed
 * against: a country the window does not hold gets neither, and on a wrapped map "does the window hold it" is a
 * question about every copy, not only the one the projection drew.
 */
export function wrapIntoBox(x: number, box: MapBox, width: number): number | null {
  if (!(width > 0)) return x >= box.x && x <= box.x + box.width ? x : null;
  const onCanvas = wrapAcross(x, width);
  for (const offset of wrapOffsets(box, width)) {
    const at = onCanvas + offset;
    if (at >= box.x && at <= box.x + box.width) return at;
  }
  return null;
}

/**
 * The copy of a window nearest another one. Travelling from Japan to Hawaii is a short hop east across the date line,
 * and their stored coordinates are at opposite ends of the canvas, so easing between the two as they are stored
 * sweeps the whole earth the wrong way. Sliding the destination onto the nearest copy makes the journey the short one.
 */
export function nearestWrappedBox(from: MapBox, to: MapBox, width: number): MapBox {
  if (!(width > 0)) return to;
  const by = Math.round((from.x - to.x) / width) * width;
  return by === 0 ? to : { ...to, x: to.x + by };
}

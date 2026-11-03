import type { Point } from "./calloutPolish.ts";
import { CALLOUT_ROOMY, type CalloutLand, type CalloutObstacle, type CalloutPlace } from "./calloutSpace.ts";
import { distanceToRing, type MapRing, pointInRing, segmentMeetsRing } from "./outlines.ts";

/** How far inside its region a leader's start sits, in radii, where the region is big enough. */
const START_INSET_RADII = 0.6;
/** The spacing of the starts tried inside a region, in radii. */
const START_STEP_RADII = 0.5;
/** At most this many starts per region, spread over it. */
const START_LIMIT = 28;

/**
 * Where a leader may start inside a region: its anchor first, then points
 * spread over the land at least `START_INSET_RADII` in from its coast - or,
 * for a region too small for that, half as far as its own middle is.
 */
export function leaderStarts(anchor: Point, ring: MapRing | null, radius: number): Point[] {
  if (!ring) return [anchor];
  const middle = distanceToRing(anchor[0], anchor[1], ring);
  const inset = Math.min(radius * START_INSET_RADII, middle * 0.5);
  const step = Math.max(radius * 0.15, Math.min(radius * START_STEP_RADII, middle * 0.5));
  const inside: Point[] = [];
  for (let x = ring.minX + step / 2; x < ring.maxX; x += step) {
    for (let y = ring.minY + step / 2; y < ring.maxY; y += step) {
      if (!pointInRing(x, y, ring) || distanceToRing(x, y, ring) < inset) continue;
      inside.push([x, y]);
    }
  }
  /* Spread: each next start is the one furthest from every start already kept. */
  const kept: Point[] = [anchor];
  const nearest = inside.map((point) => Math.hypot(point[0] - anchor[0], point[1] - anchor[1]));
  while (kept.length < START_LIMIT && inside.length > 0) {
    let best = -1;
    for (let k = 0; k < inside.length; k += 1) if (best < 0 || nearest[k]! > nearest[best]!) best = k;
    if (best < 0 || nearest[best]! < step) break;
    const chosen = inside[best]!;
    kept.push(chosen);
    for (let k = 0; k < inside.length; k += 1) {
      nearest[k] = Math.min(nearest[k]!, Math.hypot(inside[k]![0] - chosen[0], inside[k]![1] - chosen[1]));
    }
  }
  return kept;
}

/** Each region's starts, from the ring its anchor is in. */
export function regionStarts(
  entries: ReadonlyArray<{ centroid: Point }>,
  ownRegion: readonly number[],
  land: readonly CalloutLand[],
  radius: number,
): Point[][] {
  return entries.map(({ centroid }, i) => {
    const own = ownRegion[i]!;
    const ring = own < 0 ? null : (land[own]!.rings.find((one) => pointInRing(centroid[0], centroid[1], one)) ?? null);
    return leaderStarts(centroid, ring, radius);
  });
}

/**
 * What a leader costs from one of its starts to a place: its length, the
 * regions it crosses, and a tight bay - the walk's own price, with the land
 * measured against the coastline rather than the boxes the walk uses, since a
 * leader leaving from a coast lies inside its neighbour's box without touching
 * its land. Kept once worked out: the polish asks for the same few thousand.
 */
export function coastlineLeaderCost(context: {
  starts: ReadonlyArray<readonly Point[]>;
  spaces: readonly CalloutPlace[];
  land: readonly CalloutLand[];
  ownRegion: readonly number[];
  bounds: readonly CalloutObstacle[];
  landCost: number;
  tightCost: number;
}): (i: number, start: number, place: number) => number {
  const { starts, spaces, land, ownRegion, bounds, landCost, tightCost } = context;
  const known = starts.map(() => new Map<number, number>());
  return (i, start, place) => {
    const key = start * spaces.length + place;
    const held = known[i]!.get(key);
    if (held !== undefined) return held;
    const [ax, ay] = starts[i]![start]!;
    const spot = spaces[place]!;
    let crossed = 0;
    for (let k = 0; k < land.length; k += 1) {
      if (k === ownRegion[i]) continue;
      const box = bounds[k]!;
      if (Math.max(ax, spot.x) < box.minX || Math.min(ax, spot.x) > box.maxX) continue;
      if (Math.max(ay, spot.y) < box.minY || Math.min(ay, spot.y) > box.maxY) continue;
      if (land[k]!.rings.some((ring) => segmentMeetsRing(ax, ay, spot.x, spot.y, ring))) crossed += 1;
    }
    const cost =
      Math.hypot(spot.x - ax, spot.y - ay) +
      landCost * crossed +
      tightCost * Math.max(0, (CALLOUT_ROOMY - spot.sea) / CALLOUT_ROOMY);
    known[i]!.set(key, cost);
    return cost;
  };
}

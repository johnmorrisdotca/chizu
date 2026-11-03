import {
  boundsAround,
  CROSSING_COST_RADII,
  IMPROVEMENT_PASSES,
  LAND_COST_RADII,
  landCrossed,
  NEAR_CAP,
  NEAR_COST_SHARE,
  NEAR_RADII,
  NO_KEEP_OUT,
  SHORTLIST,
  TIGHT_COST_RADII,
  UNPICK_PASSES,
} from "./calloutCosts.ts";
import { coastlineLeaderCost, polishCallouts, regionStarts } from "./calloutPolish.ts";
import {
  CALLOUT_ROOMY,
  type CalloutKeepOut,
  type CalloutLand,
  calloutGrid,
  segmentsCross,
  segmentsGap,
} from "./calloutSpace.ts";
import { HANDLE_CLEARANCE, type HandleSpot } from "./handles.ts";
import { pointInRing } from "./outlines.ts";
import type { MapBox } from "./types.ts";

export type { HandleLayout } from "./calloutCosts.ts";
export { HANDLE_LAYOUTS } from "./calloutCosts.ts";

/**
 * Places every circle in the open space around the map.
 *
 * The hardest region chooses first: the one whose nearest room is furthest
 * away has nothing else to take, and a coastal region that picked early
 * would leave an inland one nowhere to go. Then the arrangement is walked
 * downhill - each circle offered a better place, each crossing pair offered
 * each other's - until nothing improves.
 *
 * @example
 * ```ts
 * import { placeCallouts } from "@johnmorrisdotca/chizu";
 *
 * const spots = placeCallouts([{ item: "a", centroid: [40, 50] }, { item: "b", centroid: [60, 50] }], 4, { x: 0, y: 0, width: 100, height: 100 });
 * console.log(spots.map((spot) => spot.item).join(" "));
 * // a b
 * ```
 *
 * @param entries - Native places to order or lay out.
 * @param radius - The circle or label radius in native map units.
 * @param box - The window in native map units, or the inset destination specified by this signature.
 * @param keepOut - The native frame areas reserved against callout placement.
 * @param land - Native land geometry or land obstacles that labels must avoid.
 * @param options - The optional native drawing, matching, layout or quiz settings described by this signature.
 * @returns Places every circle in the open space around the map.
 */
export function placeCallouts<T>(
  entries: ReadonlyArray<{ item: T; centroid: readonly [number, number] }>,
  radius: number,
  box: MapBox,
  keepOut: CalloutKeepOut = NO_KEEP_OUT,
  /** The drawn regions, for a circle to sit clear of and a leader to keep off. */
  land: readonly CalloutLand[] = [],
  /**
   * Whether to finish with `polishCallouts`: a printed sheet, where the
   * seconds it costs are spent once. The set builder redraws on every pick
   * and keeps to the walk.
   */
  options: { polish?: boolean } = {},
): Array<HandleSpot & { item: T }> {
  if (entries.length === 0) return [];
  const spacing = radius * HANDLE_CLEARANCE;
  const landCost = radius * LAND_COST_RADII;
  const tightCost = radius * TIGHT_COST_RADII;
  const crossingCost = radius * CROSSING_COST_RADII;
  const { places: spaces, cols: gridCols, step: gridStep } = calloutGrid(radius, box, keepOut, land);
  const boxes = land.map(({ rings }) => {
    const own = rings.map(({ minX, minY, maxX, maxY }) => ({ minX, minY, maxX, maxY }));
    return { bounds: boundsAround(own.length > 0 ? own : [{ minX: 0, minY: 0, maxX: -1, maxY: -1 }]), boxes: own };
  });
  /* A leader always leaves its own shape, so the region it starts in is never counted against it. */
  const ownRegion = entries.map(({ centroid }) =>
    land.findIndex(({ rings }) => rings.some((ring) => pointInRing(centroid[0], centroid[1], ring))),
  );

  /*
   * What one leader costs wherever it lands: its own length, and the land it
   * rakes over on the way. It never changes, so it is worked out once for each
   * pair and kept - the walk downhill below asks for the same few thousand of
   * these over and over.
   */
  const reachCost = entries.map(() => new Map<number, number>());
  const leaderCost = (i: number, place: number) => {
    const known = reachCost[i]!.get(place);
    if (known !== undefined) return known;
    const centroid = entries[i]!.centroid;
    const spot = spaces[place]!;
    const cost =
      Math.hypot(spot.x - centroid[0], spot.y - centroid[1]) +
      landCost * landCrossed(centroid, [spot.x, spot.y], boxes, ownRegion[i]!) +
      /* A tight bay is a place of last resort, not a place to prefer for being near. */
      tightCost * Math.max(0, (CALLOUT_ROOMY - spot.sea) / CALLOUT_ROOMY);
    reachCost[i]!.set(place, cost);
    return cost;
  };

  /*
   * The places nearest one region, nearest first.
   *
   * Taken from a window that widens until it holds enough of them, rather than
   * by putting every place in the frame in order: the world map has 173
   * countries and 2,652 places, and sorting the lot once per country was most
   * of half a second on its sheet.
   */
  const nearest = (i: number, wanted: number) => {
    const [cx, cy] = entries[i]!.centroid;
    const near: Array<{ index: number; distance: number }> = [];
    for (let reach = spacing * 4; near.length < Math.min(wanted, spaces.length); reach *= 2) {
      near.length = 0;
      const within = reach * reach;
      for (let index = 0; index < spaces.length; index += 1) {
        const { x, y } = spaces[index]!;
        const distance = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        if (distance <= within) near.push({ index, distance });
      }
      if (near.length >= spaces.length) break;
    }
    return near
      .sort((a, b) => a.distance - b.distance || a.index - b.index)
      .slice(0, wanted)
      .map(({ index }) => index);
  };

  /*
   * Each region's own shortlist: the nearest places to it, costed and put in
   * order of what they cost. A region is drawn to the room beside it, so the
   * places on the far side of the country are never worth the arithmetic.
   */
  const shortlists = entries.map((_, i) =>
    nearest(i, SHORTLIST)
      .map((index) => ({ index, cost: leaderCost(i, index) }))
      .sort((a, b) => a.cost - b.cost || a.index - b.index),
  );

  /*
   * Which circle is in which cell of the search grid, so that "is there room
   * here" is answered by the cells within reach rather than by every circle on
   * the map. The world sheet asked that question a few million times.
   */
  const at: number[] = new Array(entries.length).fill(-1);
  const inCell = new Map<number, number>();
  const cellKey = (row: number, col: number) => row * gridCols + col;
  const sit = (i: number, place: number) => {
    const held = at[i]!;
    if (held > -1) inCell.delete(cellKey(spaces[held]!.row, spaces[held]!.col));
    at[i] = place;
    inCell.set(cellKey(spaces[place]!.row, spaces[place]!.col), i);
  };
  const room = (place: number, mover: number, apart: number) => {
    const { x, y, row, col } = spaces[place]!;
    const reach = Math.ceil(apart / gridStep);
    for (let dr = -reach; dr <= reach; dr += 1) {
      for (let dc = -reach; dc <= reach; dc += 1) {
        const by = inCell.get(cellKey(row + dr, col + dc));
        if (by === undefined || by === mover) continue;
        const other = spaces[at[by]!]!;
        if (Math.hypot(other.x - x, other.y - y) < apart) return false;
        if (dr === 0 && dc === 0) return false;
      }
    }
    return true;
  };

  /* Furthest from its nearest room first: it is the one with no second choice. */
  const order = entries
    .map((_, i) => ({ i, reach: shortlists[i]![0]?.cost ?? 0 }))
    .sort((a, b) => b.reach - a.reach || a.i - b.i)
    .map(({ i }) => i);
  for (const i of order) {
    /*
     * A frame can hold fewer circles than it has regions - a map zoomed to
     * eight neighbouring regions - and then the circles close up rather than
     * some going undrawn.
     */
    let seat = -1;
    for (const apart of [spacing, spacing * 0.8, spacing * 0.6, 0]) {
      const liked = shortlists[i]!.find(({ index }) => room(index, i, apart));
      if (liked) {
        seat = liked.index;
        break;
      }
      /*
       * Its shortlist is all spoken for, so the whole frame is asked - by
       * distance, never by the order the grid happens to run in. Taking the
       * first free place on the grid put half of the western regions' numbers in
       * the top-left corner, each on a leader the height of the sheet.
       */
      const anywhere = nearest(i, spaces.length).find((index) => room(index, i, apart));
      if (anywhere !== undefined) {
        seat = anywhere;
        break;
      }
    }
    sit(i, seat > -1 ? seat : 0);
  }

  const near = radius * NEAR_RADII;
  /*
   * What this leader, placed here, does to the others: one for each it
   * crosses, and part of one for each it runs alongside - see `NEAR_RADII`.
   */
  const crossingsOf = (i: number, place: number, ignoring: number) => {
    const from = entries[i]!.centroid;
    const spot = spaces[place]!;
    const to: [number, number] = [spot.x, spot.y];
    let crossings = 0;
    let alongside = 0;
    for (let j = 0; j < entries.length; j += 1) {
      if (j === i || j === ignoring) continue;
      const other = spaces[at[j]!]!;
      const start = entries[j]!.centroid;
      const end: [number, number] = [other.x, other.y];
      if (segmentsCross(from, to, start, end)) {
        crossings += 1;
        continue;
      }
      /* Cheap first: two leaders whose boxes are further apart than `near` cannot run close. */
      if (
        Math.min(from[0], to[0]) - near > Math.max(start[0], end[0]) ||
        Math.max(from[0], to[0]) + near < Math.min(start[0], end[0]) ||
        Math.min(from[1], to[1]) - near > Math.max(start[1], end[1]) ||
        Math.max(from[1], to[1]) + near < Math.min(start[1], end[1])
      ) {
        continue;
      }
      const allowed = Math.min(near, Math.hypot(from[0] - start[0], from[1] - start[1]));
      const gap = segmentsGap(from, to, start, end);
      if (gap < allowed) alongside += NEAR_COST_SHARE * (1 - gap / allowed);
    }
    return { crossings, alongside: Math.min(NEAR_CAP, alongside) };
  };
  /* How many leaders this one crosses, placed here - the count no move is let raise. */
  const crossedBy = (i: number, place: number, ignoring = -1) => crossingsOf(i, place, ignoring).crossings;
  const costOf = (i: number, place: number, ignoring = -1) => {
    const { crossings, alongside } = crossingsOf(i, place, ignoring);
    return leaderCost(i, place) + crossingCost * (crossings + alongside);
  };

  /*
   * Downhill from there, in the two moves that undo the two faults: a circle
   * takes an empty place it likes better, and two whose leaders cross trade
   * places - the move that unpicks a crossing pair, which no single move can.
   */
  for (let pass = 0; pass < IMPROVEMENT_PASSES; pass += 1) {
    let improved = false;
    for (let i = 0; i < entries.length; i += 1) {
      const held = at[i]!;
      const was = costOf(i, held);
      let better = -1;
      /*
       * Cheapest place first, and the moment a place costs more to reach than
       * the whole of where the circle already is, so does every place after it
       * - crossings only ever add. That is what keeps this a few thousand steps
       * rather than a few million.
       */
      for (const { index, cost } of shortlists[i]!) {
        if (cost + 1e-9 >= was) break;
        if (index === held || !room(index, i, spacing)) continue;
        /* Room between two leaders is never bought with a crossing. */
        if (costOf(i, index) + 1e-9 < was && crossedBy(i, index) <= crossedBy(i, held)) {
          better = index;
          break;
        }
      }
      if (better < 0) continue;
      sit(i, better);
      improved = true;
    }
    for (let i = 0; i < entries.length; i += 1) {
      for (let j = i + 1; j < entries.length; j += 1) {
        const here = spaces[at[i]!]!;
        const there = spaces[at[j]!]!;
        /* Crossing, or running alongside: trading seats undoes either. */
        const a = entries[i]!.centroid;
        const c = entries[j]!.centroid;
        if (
          segmentsGap(a, [here.x, here.y], c, [there.x, there.y]) >=
          Math.min(near, Math.hypot(a[0] - c[0], a[1] - c[1]))
        )
          continue;
        const was = costOf(i, at[i]!, j) + costOf(j, at[j]!, i);
        const swapped = costOf(i, at[j]!, j) + costOf(j, at[i]!, i);
        if (swapped + 1e-9 >= was) continue;
        if (crossedBy(i, at[j]!, j) + crossedBy(j, at[i]!, i) > crossedBy(i, at[i]!, j) + crossedBy(j, at[j]!, i))
          continue;
        const held = at[i]!;
        const other = at[j]!;
        at[i] = -1;
        at[j] = -1;
        sit(i, other);
        sit(j, held);
        improved = true;
      }
    }
    if (!improved) break;
  }

  /*
   * Whatever still crosses, tried against the whole frame instead of a
   * shortlist.
   *
   * The two moves above are both local. A circle may only move to a place
   * that is completely free, and on a crowded band almost none are; a pair
   * may only trade seats with each other. So a crossing whose answer is "go
   * somewhere else entirely" - the open Atlantic rather than the strip of sea
   * this circle was born next to - is unreachable, because that place is not
   * among its ninety-six nearest. On the world sheet Egypt's number either
   * had to sit closer to the shore, so as not to touch India's leader, or go
   * across Africa to the Atlantic. The second of those is exactly the move a
   * shortlist cannot offer.
   *
   * Only circles that actually cross something are searched this way, and
   * only until nothing improves, so the whole-frame sort is paid for the
   * handful that need it rather than for every circle on the map.
   */
  for (let pass = 0; pass < UNPICK_PASSES; pass += 1) {
    let improved = false;
    for (let i = 0; i < entries.length; i += 1) {
      const held = at[i]!;
      const { crossings: crossed, alongside } = crossingsOf(i, held, -1);
      if (crossed === 0 && alongside === 0) continue;
      let bestCost = costOf(i, held);
      let better = -1;
      for (const index of nearest(i, spaces.length)) {
        if (index === held || !room(index, i, spacing)) continue;
        const cost = costOf(i, index);
        if (cost + 1e-9 < bestCost && crossedBy(i, index) <= crossed) {
          bestCost = cost;
          better = index;
        }
      }
      if (better < 0) continue;
      sit(i, better);
      improved = true;
    }
    if (!improved) break;
  }

  if (!options.polish) {
    return entries.map((entry, i) => {
      const spot = spaces[at[i]!]!;
      return { item: entry.item, x: entry.centroid[0], y: entry.centroid[1], hx: spot.x, hy: spot.y };
    });
  }

  const starts = regionStarts(entries, ownRegion, land, radius);
  const leaderFrom = coastlineLeaderCost({
    starts,
    spaces,
    land,
    ownRegion,
    bounds: boxes.map(({ bounds }) => bounds),
    landCost,
    tightCost,
  });
  const reseat = (seats: readonly number[]) => {
    inCell.clear();
    at.fill(-1);
    seats.forEach((place, i) => {
      sit(i, place);
    });
  };
  const from = polishCallouts({ starts, spaces, at, radius, spacing, reseat, room, nearest, leaderCost: leaderFrom });
  return entries.map((entry, i) => {
    const spot = spaces[at[i]!]!;
    const [x, y] = starts[i]![from[i]!]!;
    return { item: entry.item, x, y, hx: spot.x, hy: spot.y };
  });
}

import {
  CALLOUT_ROOMY,
  calloutGrid,
  segmentCrossesBox,
  segmentsCross,
  segmentsGap,
  type CalloutKeepOut,
  type CalloutLand,
  type CalloutObstacle,
} from "./calloutSpace.ts";
import { coastlineLeaderCost, polishCallouts, regionStarts } from "./calloutPolish.ts";
import { HANDLE_CLEARANCE, type HandleSpot } from "./handles.ts";
import { pointInRing } from "./outlines.ts";
import type { MapBox } from "./types.ts";

/**
 * Numbered circles in the open space around a map, not on it.
 *
 * The brief, from the printed practice sheets this was made for: a number
 * labelling a region should sit in the water and not on the land, no two
 * leader lines may cross, and a leader should cross as few other regions as it
 * can. And the numbers should gather where there is room, which is not the
 * same as sending them to the four corners of the frame.
 *
 * So a circle is not sent to a side of the frame at all. It goes to the
 * nearest place a circle actually fits - the sea off its own coast, the gap
 * between two islands, the empty half of the frame - and its leader is
 * whatever short line joins the two. On a map of Japan the numbers gather in
 * the Sea of Japan, off the Pacific coast and in the corners, because that is
 * where the space is, and the numbers for Kyushu's regions do not travel the
 * height of the sheet to reach an edge.
 *
 * Three things are weighed, in this order: a circle sits in water, no two
 * leaders cross, and a leader crosses as little land as it can.
 *
 * Geometry only, like `placeHandles`: a board keeps its on-region handles
 * because they are tap targets, and a printed sheet asks for these instead.
 */

/** How a map places its numbered handles: on each region, or in the space around it. */
export const HANDLE_LAYOUTS = {
  beside: "beside",
  around: "around",
} as const;
export type HandleLayout = (typeof HANDLE_LAYOUTS)[keyof typeof HANDLE_LAYOUTS];

const NO_KEEP_OUT: CalloutKeepOut = { bottom: 0, right: 0 };

/** What a circle pays for sitting in a tight bay rather than in open water, in radii. */
const TIGHT_COST_RADII = 3;

/** How many nearby places each region is costed against; the rest are further and lose. */
const SHORTLIST = 96;

/**
 * What a leader crossing one more region costs, and what crossing another
 * leader costs, both in radii so they weigh against the length of the leader
 * itself. A crossing pair makes the sheet unreadable rather than untidy, so it
 * is worth going a long way round to undo one.
 */
const LAND_COST_RADII = 4;
const CROSSING_COST_RADII = 40;

/**
 * Two leaders that run side by side without quite crossing.
 *
 * On a sheet of the Kanto region the leaders of Saitama, Tokyo and Kanagawa all
 * ran south into Sagami Bay, two of them under a third of a radius apart: to a
 * reader, one line with two numbers at the end of it. Nothing crossed, so
 * nothing cost anything, and the search had no reason to pull them apart.
 *
 * So a pair that comes closer than `NEAR_RADII` pays up to `NEAR_COST_SHARE`
 * of a crossing, more the closer it runs - and a pair whose own regions start
 * closer than that is only held to the room it started with. A leader's whole
 * charge for running alongside others is capped at `NEAR_CAP` of a crossing,
 * and no move may add a crossing to buy room: a crossing is the worse fault,
 * and on the world sheet a larger charge undid the uncrossed arrangement.
 * Measured over eight regional sheets, the whole-country sheet and the world
 * sheet, framed as they print: no pair closer than a radius, and no more land
 * crossed than before.
 */
const NEAR_RADII = 2.5;
const NEAR_COST_SHARE = 0.75;
const NEAR_CAP = 0.75;

/** How many times the arrangement is walked downhill before it is called settled. */
const IMPROVEMENT_PASSES = 8;

/**
 * How many times the leftover crossings are offered the whole frame.
 *
 * Few, because each pass sorts every place in the frame for every circle that
 * still crosses something - and because after two the arrangement has stopped
 * moving on every board measured.
 */
const UNPICK_PASSES = 3;

function boundsAround(boxes: readonly CalloutObstacle[]): CalloutObstacle {
  return {
    minX: Math.min(...boxes.map((box) => box.minX)),
    minY: Math.min(...boxes.map((box) => box.minY)),
    maxX: Math.max(...boxes.map((box) => box.maxX)),
    maxY: Math.max(...boxes.map((box) => box.maxY)),
  };
}

/**
 * How many regions a leader crosses on its way out, its own not counted.
 *
 * The region's own bounds answer first, against nothing but the box the leader
 * itself lies in. Almost every region is nowhere near a given leader, and this
 * is the arithmetic the whole placement is made of: the world's sheet asks it
 * four million times.
 */
function landCrossed(
  from: readonly [number, number],
  to: readonly [number, number],
  land: readonly { bounds: CalloutObstacle; boxes: readonly CalloutObstacle[] }[],
  own: number,
): number {
  const minX = Math.min(from[0], to[0]);
  const maxX = Math.max(from[0], to[0]);
  const minY = Math.min(from[1], to[1]);
  const maxY = Math.max(from[1], to[1]);
  let crossed = 0;
  for (let i = 0; i < land.length; i += 1) {
    if (i === own) continue;
    const { bounds, boxes } = land[i]!;
    if (maxX < bounds.minX || minX > bounds.maxX || maxY < bounds.minY || minY > bounds.maxY) continue;
    for (const box of boxes) {
      if (maxX < box.minX || minX > box.maxX || maxY < box.minY || minY > box.maxY) continue;
      if (segmentCrossesBox(from, to, box)) {
        crossed += 1;
        break;
      }
    }
  }
  return crossed;
}

/**
 * Places every circle in the open space around the map.
 *
 * The hardest region chooses first: the one whose nearest room is furthest
 * away has nothing else to take, and a coastal region that picked early
 * would leave an inland one nowhere to go. Then the arrangement is walked
 * downhill - each circle offered a better place, each crossing pair offered
 * each other's - until nothing improves.
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
        if (segmentsGap(a, [here.x, here.y], c, [there.x, there.y]) >= Math.min(near, Math.hypot(a[0] - c[0], a[1] - c[1]))) continue;
        const was = costOf(i, at[i]!, j) + costOf(j, at[j]!, i);
        const swapped = costOf(i, at[j]!, j) + costOf(j, at[i]!, i);
        if (swapped + 1e-9 >= was) continue;
        if (crossedBy(i, at[j]!, j) + crossedBy(j, at[i]!, i) > crossedBy(i, at[i]!, j) + crossedBy(j, at[j]!, i)) continue;
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
    seats.forEach((place, i) => sit(i, place));
  };
  const from = polishCallouts({ starts, spaces, at, radius, spacing, reseat, room, nearest, leaderCost: leaderFrom });
  return entries.map((entry, i) => {
    const spot = spaces[at[i]!]!;
    const [x, y] = starts[i]![from[i]!]!;
    return { item: entry.item, x, y, hx: spot.x, hy: spot.y };
  });
}

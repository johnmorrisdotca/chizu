import { type CalloutKeepOut, type CalloutObstacle, segmentCrossesBox } from "./calloutSpace.ts";

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

/**
 * How a map places its numbered handles: on each region, or in the space around it.
 *
 * @example
 * ```ts
 * import { HANDLE_LAYOUTS } from "@johnmorrisdotca/chizu";
 *
 * console.log(Object.values(HANDLE_LAYOUTS).join(" "));
 * // beside around
 * ```
 */
export const HANDLE_LAYOUTS = {
  beside: "beside",
  around: "around",
} as const;
/**
 * The native ordering, candidate positions and constraints used to place numbered callouts.
 *
 *
 * @example
 * ```ts
 * import type { HandleLayout } from "@johnmorrisdotca/chizu";
 *
 * const layout: HandleLayout = "around";
 * console.log(layout);
 * // around
 * ```
 */
export type HandleLayout = (typeof HANDLE_LAYOUTS)[keyof typeof HANDLE_LAYOUTS];

export const NO_KEEP_OUT: CalloutKeepOut = { bottom: 0, right: 0 };

/** What a circle pays for sitting in a tight bay rather than in open water, in radii. */
export const TIGHT_COST_RADII = 3;

/** How many nearby places each region is costed against; the rest are further and lose. */
export const SHORTLIST = 96;

/**
 * What a leader crossing one more region costs, and what crossing another
 * leader costs, both in radii so they weigh against the length of the leader
 * itself. A crossing pair makes the sheet unreadable rather than untidy, so it
 * is worth going a long way round to undo one.
 */
export const LAND_COST_RADII = 4;
export const CROSSING_COST_RADII = 40;

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
export const NEAR_RADII = 2.5;
export const NEAR_COST_SHARE = 0.75;
export const NEAR_CAP = 0.75;

/** How many times the arrangement is walked downhill before it is called settled. */
export const IMPROVEMENT_PASSES = 8;

/**
 * How many times the leftover crossings are offered the whole frame.
 *
 * Few, because each pass sorts every place in the frame for every circle that
 * still crosses something - and because after two the arrangement has stopped
 * moving on every board measured.
 */
export const UNPICK_PASSES = 3;

export function boundsAround(boxes: readonly CalloutObstacle[]): CalloutObstacle {
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
export function landCrossed(
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

import { placeCallouts } from "./callouts.ts";
import type { CalloutKeepOut, CalloutLand } from "./calloutSpace.ts";
import { wholeMapBox } from "./frame.ts";
import { orderByPosition } from "./handles.ts";
import { mapOutlines, shiftedOutlines } from "./outlines.ts";
import type { ChizuFeature, ChizuMap, MapBox } from "./types.ts";
import { mapWrapsAround, wrapIntoBox, wrapOffsets } from "./wrap.ts";

/**
 * One numbered circle placed in open water, and the leader line that joins it to its region.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { layoutCallouts, type CalloutSpot } from "@johnmorrisdotca/chizu";
 *
 * const [first]: CalloutSpot[] = layoutCallouts(WORLD, { codes: ["JP"] });
 * console.log(first!.code, first!.number);
 * // JP 1
 * ```
 */
export type CalloutSpot = {
  /** The region it names. */
  code: string;
  /** Its number: where it was in the list asked for, from 1 (or its place from the west, with `numbering: "west-to-east"`). */
  number: number;
  /** Where its leader starts: a point on the region's own land, as drawn. */
  start: [number, number];
  /** The circle's centre. */
  circle: [number, number];
  /** The circle's radius, in the map's units. */
  radius: number;
};

/**
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { layoutCallouts, type CalloutRequest } from "@johnmorrisdotca/chizu";
 *
 * const request: CalloutRequest = { codes: ["BR", "AR", "CL"], numbering: "west-to-east" };
 * console.log(layoutCallouts(WORLD, request).map((spot) => `${spot.number} ${spot.code}`).join(", "));
 * // 1 CL, 2 AR, 3 BR
 * ```
 */
export type CalloutRequest = {
  /** The regions to number. A region the window does not show is not numbered. */
  codes: readonly string[];
  /** The window the map is drawn in: circles are placed inside it. Default: the whole map. */
  box?: MapBox;
  /** The circle's radius as a share of the window's width. Default 0.03. */
  radiusRatio?: number;
  /**
   * Finish with the slow pass that clears every near-miss: no two leaders closer than a circle's radius, no leader
   * through another number, each leader leaving its region from the coast nearest its number. Worth its seconds on a
   * sheet that is printed once; a map redrawn on every tap keeps to the quick walk. Default false.
   */
  polish?: boolean;
  /** Lengths of the window's bottom-right corner to keep clear, in map units, for a credit line: up the right edge and along the bottom. */
  keepOut?: CalloutKeepOut;
  /** `given` numbers the regions in the order they were asked for; `west-to-east` numbers them as they run across the map. Default `given`. */
  numbering?: "given" | "west-to-east";
  /**
   * Named features that may be numbered too (a layer's `features`, or `featuresShown` of it): a code in `codes` that is
   * not a region's is looked for here, and its leader starts where its name goes, in the sea for a sea, on the line for
   * a river. The land the circles keep off is still the map's own.
   */
  features?: readonly Pick<ChizuFeature, "code" | "centroid">[];
};

/**
 * The share of the window's width a circle's radius is, unless asked otherwise.
 *
 * @example
 * ```ts
 * import { CALLOUT_RADIUS_RATIO } from "@johnmorrisdotca/chizu";
 *
 * console.log(CALLOUT_RADIUS_RATIO);
 * // 0.03
 * ```
 */
export const CALLOUT_RADIUS_RATIO = 0.03;

/**
 * Numbered circles in the open space around and between the regions of a map, each with a leader line to its region.
 *
 * A circle sits in the water and not on the land, no two leaders cross, and a leader crosses as little land as it can
 * (see `placeCallouts` for how the three are weighed). The result is geometry only: draw it with `drawChizu`'s
 * `callouts` option or with anything else that draws circles and lines. It is the same arrangement for the same map,
 * window and list, every time, with no randomness in it that is not seeded.
 *
 * On a map that wraps, a window that overhangs the cut shows land twice, so both copies keep the circles out, and a
 * region is numbered where the window shows it.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { layoutCallouts } from "@johnmorrisdotca/chizu";
 *
 * const spots = layoutCallouts(WORLD, { codes: ["JP", "BR", "EG", "AU"], radiusRatio: 0.02 });
 * console.log(spots.map((spot) => `${spot.number} ${spot.code}`).join(", "));
 * // 1 JP, 2 BR, 3 EG, 4 AU
 * ```
 */
export function layoutCallouts(map: Pick<ChizuMap, "regions" | "insets" | "width" | "height" | "wraps">, request: CalloutRequest): CalloutSpot[] {
  const box = request.box ?? wholeMapBox(map);
  const radius = box.width * (request.radiusRatio ?? CALLOUT_RADIUS_RATIO);
  const outlines = mapOutlines(map);
  const offsets = mapWrapsAround(map) ? wrapOffsets(box, map.width) : [0];
  const land: CalloutLand[] = offsets.flatMap((offset) => shiftedOutlines(outlines, offset).map(({ rings }) => ({ rings })));

  const wanted = request.codes.map((code, order) => ({ code: String(code), order }));
  const entries: Array<{ item: { code: string; order: number }; centroid: [number, number] }> = [];
  for (const { code, order } of wanted) {
    const at = map.regions.findIndex((region) => String(region.code) === code);
    const feature = at < 0 ? request.features?.find((one) => one.code === code) : undefined;
    if (at < 0 && !feature) continue;
    const anchor = feature ? feature.centroid : (outlines[at]!.anchor ?? map.regions[at]!.centroid);
    const x = mapWrapsAround(map) ? wrapIntoBox(anchor[0], box, map.width) : anchor[0] >= box.x && anchor[0] <= box.x + box.width ? anchor[0] : null;
    if (x === null || anchor[1] < box.y || anchor[1] > box.y + box.height) continue;
    // `x` is the copy of the canvas the window shows, which on a wrapped map is not always the one the anchor is stored in.
    entries.push({ item: { code, order }, centroid: [x, anchor[1]] });
  }

  const placed = placeCallouts(entries, radius, box, request.keepOut, land, { polish: request.polish ?? false });
  const spots = placed.map(({ item, x, y, hx, hy }) => ({ code: item.code, order: item.order, start: [x, y] as [number, number], circle: [hx, hy] as [number, number], radius }));
  const sequence = request.numbering === "west-to-east" ? orderByPosition(spots, (spot) => spot.start) : spots;
  return sequence.map(({ order, ...spot }, index) => ({ ...spot, number: request.numbering === "west-to-east" ? index + 1 : order + 1 }));
}

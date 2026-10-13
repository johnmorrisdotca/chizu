import type { ChizuInset, ChizuMap, MapBox } from "./types.ts";

/**
 * The regions a map draws in a box of its own, and where that box sits.
 *
 * A projection puts Okinawa where it really is, which on a map framed to the mainland is on top of Kagoshima, and puts
 * Alaska and Hawaii in the Pacific off California, Alaska hard against the left edge and wider than Texas. Every
 * published map of these countries does the same thing about it: draw them beside the mainland in a box, at a size
 * that fits, and say so with a frame. A map's `insets` list says which regions and where; the functions here carry a
 * region's own geometry into its box, and everything that frames, outlines or numbers a map reads them, so a region
 * is looked for where it is drawn and not out at sea where its projection put it.
 *
 * The boxes are chosen against the data rather than by eye: a test checks that no other region's bounds reach into one.
 */

/**
 * The inset a region is drawn in, or null when it is drawn where it is.
 *
 * @example
 * ```ts
 * import { loadDivisions } from "@johnmorrisdotca/chizu/load";
 * import { insetFor } from "@johnmorrisdotca/chizu";
 *
 * const us = (await loadDivisions("us"))!;
 * console.log(insetFor(us, "AK")?.box, insetFor(us, "TX"));
 * // { x: 20, y: 610, width: 360, height: 120 } null
 * ```
 *
 * @param map - The native map or map fields required by this signature; coordinates and region codes belong to its canvas.
 * @param code - The native region or country code; null clears a region selection where accepted.
 * @returns The region’s first inset, or null when it has no inset.
 */
export function insetFor(map: Pick<ChizuMap, "insets">, code: string | number): ChizuInset | null {
  return map.insets.find((inset) => String(inset.code) === String(code)) ?? null;
}

/**
 * Every box a region is drawn in, in the map's order: none for most, one for Alaska, three for Okinawa (its main
 * islands, the Sakishima Islands and the Daito Islands, each in a box of its own) and three for Tokyo's far islands.
 *
 * @example
 * ```ts
 * import { loadDivisions } from "@johnmorrisdotca/chizu/load";
 * import { insetsFor } from "@johnmorrisdotca/chizu";
 *
 * const japan = (await loadDivisions("jp"))!;
 * console.log(insetsFor(japan, "47").length, insetsFor(japan, "13").length, insetsFor(japan, "1").length);
 * // 3 3 0
 * ```
 *
 * @param map - The native map or map fields required by this signature; coordinates and region codes belong to its canvas.
 * @param code - The native region or country code; null clears a region selection where accepted.
 * @returns Every box a region is drawn in, in the map's order: none for most, one for Alaska, three for Okinawa (its main islands, the Sakishima Islands and the Daito Islands, each in a box of its own) and three for Tokyo's far islands.
 */
export function insetsFor(map: Pick<ChizuMap, "insets">, code: string | number): ChizuInset[] {
  return map.insets.filter((inset) => String(inset.code) === String(code));
}

/**
 * Whether a box holds its region whole, rather than only some of its pieces (`outlyingBelow`, `within`).
 *
 * @example
 * ```ts
 * import { insetHoldsWhole } from "@johnmorrisdotca/chizu";
 *
 * const box = { x: 0, y: 0, width: 10, height: 10 };
 * console.log(insetHoldsWhole({ code: "AK", box }), insetHoldsWhole({ code: "46", box, outlyingBelow: 900 }));
 * // true false
 * ```
 *
 * @param inset - The native inset placement and optional restriction to part of a region.
 * @returns Whether a box holds its region whole, rather than only some of its pieces (`outlyingBelow`, `within`).
 */
export function insetHoldsWhole(inset: ChizuInset): boolean {
  return inset.outlyingBelow === undefined && inset.within === undefined;
}

/**
 * What to do to a region's own geometry to seat it in its box: a scale, and a move.
 *
 * @example
 * ```ts
 * import { insetTransformAttribute, type InsetTransform } from "@johnmorrisdotca/chizu";
 *
 * const move: InsetTransform = { scale: 0.5, x: 20, y: 610 };
 * console.log(insetTransformAttribute(move));
 * // translate(20 610) scale(0.5)
 * ```
 */
export type InsetTransform = { scale: number; x: number; y: number };

/**
 * What to do to a region's own geometry to seat it in its box: shrink it to fit if it is too big, centre it in the
 * frame, and leave it at its own size unless the box says it may be magnified.
 *
 * @example
 * ```ts
 * import { insetTransform } from "@johnmorrisdotca/chizu";
 *
 * // A region 400 wide seated in a box 200 wide is halved and centred.
 * console.log(insetTransform([0, 0, 400, 100], { x: 10, y: 10, width: 200, height: 100 }));
 * // { scale: 0.5, x: 10, y: 35 }
 * ```
 *
 * @param bbox - The native left, top, right and bottom bounds of the geometry.
 * @param box - The window in native map units, or the inset destination specified by this signature.
 * @param magnify - Whether the inset may enlarge its geometry instead of only shrinking it.
 * @returns What to do to a region's own geometry to seat it in its box: shrink it to fit if it is too big, centre it in the frame, and leave it at its own size unless the box says it may be magnified.
 */
export function insetTransform(bbox: readonly [number, number, number, number], box: MapBox, magnify = false): InsetTransform {
  const width = Math.max(bbox[2] - bbox[0], 0.001);
  const height = Math.max(bbox[3] - bbox[1], 0.001);
  const fits = Math.min(box.width / width, box.height / height);
  const scale = magnify ? fits : Math.min(1, fits);
  return {
    scale,
    x: box.x + (box.width - width * scale) / 2 - bbox[0] * scale,
    y: box.y + (box.height - height * scale) / 2 - bbox[1] * scale,
  };
}

/**
 * The same move, applied to a point: a centroid, so a handle follows its region.
 *
 * @example
 * ```ts
 * import { applyInsetTransform } from "@johnmorrisdotca/chizu";
 *
 * console.log(applyInsetTransform([100, 40], { scale: 0.5, x: 10, y: 20 }));
 * // [ 60, 40 ]
 * ```
 *
 * @param point - The point in native canvas coordinates.
 * @param transform - The native inset scale and translation to apply.
 * @returns The same move, applied to a point: a centroid, so a handle follows its region.
 */
export function applyInsetTransform(point: readonly [number, number], transform: InsetTransform): [number, number] {
  return [point[0] * transform.scale + transform.x, point[1] * transform.scale + transform.y];
}

/**
 * The SVG `transform` attribute the move is written as.
 *
 * @example
 * ```ts
 * import { insetTransformAttribute } from "@johnmorrisdotca/chizu";
 *
 * console.log(insetTransformAttribute({ scale: 0.25, x: 400, y: 640 }));
 * // translate(400 640) scale(0.25)
 * ```
 *
 * @param transform - The native inset scale and translation to apply.
 * @returns The SVG `transform` attribute the move is written as.
 */
export function insetTransformAttribute(transform: InsetTransform): string {
  return `translate(${transform.x} ${transform.y}) scale(${transform.scale})`;
}

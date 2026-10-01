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

/** The inset a region is drawn in, or null when it is drawn where it is. */
export function insetFor(map: Pick<ChizuMap, "insets">, code: string | number): ChizuInset | null {
  return map.insets.find((inset) => String(inset.code) === String(code)) ?? null;
}

/** What to do to a region's own geometry to seat it in its box: a scale, and a move. */
export type InsetTransform = { scale: number; x: number; y: number };

/**
 * What to do to a region's own geometry to seat it in its box: shrink it to fit if it is too big, centre it in the
 * frame, and leave it at its own size unless the box says it may be magnified.
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

/** The same move, applied to a point: a centroid, so a handle follows its region. */
export function applyInsetTransform(point: readonly [number, number], transform: InsetTransform): [number, number] {
  return [point[0] * transform.scale + transform.x, point[1] * transform.scale + transform.y];
}

/** The SVG `transform` attribute the move is written as. */
export function insetTransformAttribute(transform: InsetTransform): string {
  return `translate(${transform.x} ${transform.y}) scale(${transform.scale})`;
}

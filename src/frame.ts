import { insetFor } from "./insets.ts";
import { drawnBounds } from "./outlines.ts";
import type { ChizuMap, MapBox } from "./types.ts";
import { mapWrapsAround } from "./wrap.ts";

/**
 * Framing a map: which window of its canvas to show.
 *
 * Every function takes the map itself, so a round of American states is framed against the American canvas and never
 * the world's. The ratios are the ones the first board this was made for used, kept so that its framing is unchanged.
 * A "window" is a `MapBox`, and `boxToViewBox` writes one as an SVG `viewBox`.
 */

/**
 * A window as an SVG `viewBox` attribute.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { boxToViewBox, focusBox } from "@johnmorrisdotca/chizu";
 *
 * console.log(boxToViewBox({ x: 10, y: 20.5, width: 300, height: 200 }));
 * // 10 20.5 300 200
 * ```
 */
export function boxToViewBox(box: MapBox): string {
  return `${box.x} ${box.y} ${box.width} ${box.height}`;
}

const FOCUS_PADDING_RATIO = 0.55;
const MIN_FOCUS_SPAN_RATIO = 0.22;

type Frameable = Pick<ChizuMap, "width" | "height" | "regions" | "insets" | "wraps">;

/**
 * The whole canvas as a window.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { wholeMapBox } from "@johnmorrisdotca/chizu";
 *
 * console.log(wholeMapBox(WORLD));
 * // { x: 0, y: 0, width: 1000, height: 489 }
 * ```
 */
export function wholeMapBox(map: Pick<ChizuMap, "width" | "height">): MapBox {
  return { x: 0, y: 0, width: map.width, height: map.height };
}

const matching = (map: Pick<ChizuMap, "regions">, codes: ReadonlyArray<string | number>) =>
  map.regions.filter((region) => codes.some((code) => String(code) === String(region.code)));

/**
 * The window that frames these regions, or the whole map when none are given.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { boxToViewBox, focusBox } from "@johnmorrisdotca/chizu";
 *
 * console.log(boxToViewBox(focusBox(WORLD, ["DE", "PL"])).split(" ").map((n) => Math.round(Number(n))).join(" "));
 * // 1 50 220 220
 * ```
 */
export function focusBox(map: Frameable, codes: ReadonlyArray<string | number>): MapBox {
  const whole = wholeMapBox(map);
  const framed = matching(map, codes);
  if (framed.length === 0) return whole;

  const minX = Math.min(...framed.map((entry) => entry.bbox[0]));
  const minY = Math.min(...framed.map((entry) => entry.bbox[1]));
  const maxX = Math.max(...framed.map((entry) => entry.bbox[2]));
  const maxY = Math.max(...framed.map((entry) => entry.bbox[3]));

  const padding = Math.max(maxX - minX, maxY - minY) * FOCUS_PADDING_RATIO;
  const minimumSpan = map.width * MIN_FOCUS_SPAN_RATIO;
  const width = Math.max(maxX - minX + padding * 2, minimumSpan);
  const height = Math.max(maxY - minY + padding * 2, minimumSpan);
  if (width >= map.width && height >= map.height) return whole;

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  // Kept on the map, so a coastal region does not frame open sea.
  return {
    x: Math.min(Math.max(centerX - width / 2, 0), Math.max(0, map.width - width)),
    y: Math.min(Math.max(centerY - height / 2, 0), Math.max(0, map.height - height)),
    width,
    height,
  };
}

/**
 * True when the box shows the whole map rather than a zoomed-in window.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { boxIsWholeMap, focusBox, wholeMapBox } from "@johnmorrisdotca/chizu";
 *
 * console.log(boxIsWholeMap(WORLD, wholeMapBox(WORLD)), boxIsWholeMap(WORLD, focusBox(WORLD, ["JP"])));
 * // true false
 * ```
 */
export function boxIsWholeMap(map: Pick<ChizuMap, "width" | "height">, box: MapBox): boolean {
  return box.width >= map.width && box.height >= map.height;
}

/**
 * How far in the map is drawn, as steps rather than a free zoom. A free zoom would offer a hundred framings of which a
 * few are useful: the steps are those, plus the whole map to come back to. Ten whole steps, 1× to 10×: the maps are
 * vector outlines whose lines keep their width on the screen at any step, and at 5× a city prefecture, a ward or a
 * country such as Luxembourg or Singapore was still a few pixels across. The first step is always 1× and the last the
 * deepest, so code that reads `MAP_ZOOM_LEVELS[0]` and `MAP_ZOOM_LEVELS.at(-1)` for its buttons follows the ladder.
 *
 * @example
 * ```ts
 * import { MAP_ZOOM_LEVELS } from "@johnmorrisdotca/chizu";
 *
 * console.log(MAP_ZOOM_LEVELS.join(" "));
 * // 1 2 3 4 5 6 7 8 9 10
 * ```
 */
export const MAP_ZOOM_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

/**
 *
 * @example
 * ```ts
 * import { stepMapZoom, type MapZoom } from "@johnmorrisdotca/chizu";
 *
 * const zoom: MapZoom = 2;
 * console.log(stepMapZoom(zoom, 1));
 * // 3
 * ```
 */
export type MapZoom = (typeof MAP_ZOOM_LEVELS)[number];

/**
 * Whether a number is one of the zoom steps.
 *
 * @example
 * ```ts
 * import { isMapZoom } from "@johnmorrisdotca/chizu";
 *
 * console.log(isMapZoom(3), isMapZoom(2.5), isMapZoom(11));
 * // true false false
 * ```
 */
export function isMapZoom(value: number): value is MapZoom {
  return (MAP_ZOOM_LEVELS as readonly number[]).includes(value);
}

/**
 * One step in or out, clamped: the ends stay put rather than wrapping.
 *
 * @example
 * ```ts
 * import { stepMapZoom } from "@johnmorrisdotca/chizu";
 *
 * console.log(stepMapZoom(1, 1), stepMapZoom(10, 1), stepMapZoom(1, -1));
 * // 2 10 1
 * ```
 */
export function stepMapZoom(zoom: MapZoom, by: 1 | -1): MapZoom {
  const at = MAP_ZOOM_LEVELS.indexOf(zoom);
  return MAP_ZOOM_LEVELS[Math.min(MAP_ZOOM_LEVELS.length - 1, Math.max(0, at + by))]!;
}

/**
 * The window a zoom step and a centre make.
 *
 * Kept on the map: a centre near a coast would otherwise frame open sea. Clamping the window rather than the centre
 * means a drag that runs off the edge simply stops there, which is what a reader expects of every other map they have
 * used. On a map that wraps, east and west never stop, so only north and south are held. `clamp` is off for a fit: a
 * region opened from its address asked for that region in the middle, and a clamp that pushes the window back onto the
 * map puts it somewhere else.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { zoomBox } from "@johnmorrisdotca/chizu";
 *
 * console.log(zoomBox(WORLD, 2, { x: 500, y: 200 }));
 * // { x: 250, y: 77.75, width: 500, height: 244.5 }
 * ```
 */
export function zoomBox(map: Frameable, zoom: MapZoom, centre: { x: number; y: number }, clamp = true): MapBox {
  const whole = wholeMapBox(map);
  const wraps = mapWrapsAround(map);
  // The world is pannable at every step, including the first: the whole earth fits the frame and which ocean is in the middle is still a choice.
  if (zoom <= 1 && !wraps) return whole;

  const width = whole.width / zoom;
  const height = whole.height / zoom;
  if (wraps) {
    return {
      x: centre.x - width / 2,
      y: Math.min(Math.max(centre.y - height / 2, 0), Math.max(0, whole.height - height)),
      width,
      height,
    };
  }
  if (!clamp) return { x: centre.x - width / 2, y: centre.y - height / 2, width, height };
  return {
    x: Math.min(Math.max(centre.x - width / 2, 0), whole.width - width),
    y: Math.min(Math.max(centre.y - height / 2, 0), whole.height - height),
    width,
    height,
  };
}

/**
 * Where a box is looking, which is what a zoom step keeps hold of.
 *
 * @example
 * ```ts
 * import { boxCentre } from "@johnmorrisdotca/chizu";
 *
 * console.log(boxCentre({ x: 100, y: 50, width: 200, height: 100 }));
 * // { x: 200, y: 100 }
 * ```
 */
export function boxCentre(box: MapBox): { x: number; y: number } {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

const FIT_MARGIN_RATIO = 0.15;

/**
 * The zoom step and centre that show all of these regions at once: for opening a region from its heading, which
 * wants it filling the view and not the whole map with a few regions lit somewhere in it.
 *
 * It picks the closest step whose window still holds everything, with the same room around it that a focus box leaves;
 * a set that will not fit at 2× is shown at 1× rather than cut. Measured where the regions are *drawn*, so an inset's
 * region is its box and not its true position out at sea. The room is a share of each side, and a set that cannot fit
 * closer with the margin gets one more try at the bare shape before it is shown at 1×: the margin is what makes a fit
 * comfortable, not what makes it a fit.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { zoomToFit } from "@johnmorrisdotca/chizu";
 *
 * const fit = zoomToFit(WORLD, ["GB", "IE"]);
 * console.log(fit.zoom, Math.round(fit.centre.x), Math.round(fit.centre.y));
 * // 10 58 148
 * ```
 */
export function zoomToFit(map: Frameable, codes: ReadonlyArray<string | number>): { zoom: MapZoom; centre: { x: number; y: number } } {
  const whole = wholeMapBox(map);
  const drawn = matching(map, codes).map((region) => {
    const seated = insetFor(map, region.code);
    if (seated && seated.outlyingBelow === undefined) return [seated.box.x, seated.box.y, seated.box.x + seated.box.width, seated.box.y + seated.box.height];
    return drawnBounds(region, seated);
  });
  if (drawn.length === 0) return { zoom: MAP_ZOOM_LEVELS[0], centre: boxCentre(whole) };

  const minX = Math.min(...drawn.map((box) => box[0]!));
  const minY = Math.min(...drawn.map((box) => box[1]!));
  const maxX = Math.max(...drawn.map((box) => box[2]!));
  const maxY = Math.max(...drawn.map((box) => box[3]!));
  const centre = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };

  const bestFit = (marginRatio: number) => {
    const needWidth = (maxX - minX) * (1 + marginRatio * 2);
    const needHeight = (maxY - minY) * (1 + marginRatio * 2);
    return [...MAP_ZOOM_LEVELS].reverse().find((level) => whole.width / level >= needWidth && whole.height / level >= needHeight);
  };
  const padded = bestFit(FIT_MARGIN_RATIO) ?? MAP_ZOOM_LEVELS[0];
  const zoom = padded === MAP_ZOOM_LEVELS[0] ? (bestFit(0) ?? padded) : padded;
  return { zoom, centre };
}

/**
 * What choosing one place computes: zoom in to fit it, whatever zoom the reader was already at. `null` for a code the
 * map does not hold, so a caller can tell "nothing to focus" from "fit the whole thing", which `zoomToFit` cannot.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { focusRegionFit } from "@johnmorrisdotca/chizu";
 *
 * console.log(focusRegionFit(WORLD, "JP")?.zoom, focusRegionFit(WORLD, "XX"));
 * // 8 null
 * ```
 */
export function focusRegionFit(map: Frameable, code: string | number | null): { zoom: MapZoom; centre: { x: number; y: number } } | null {
  if (code === null) return null;
  if (!map.regions.some((region) => String(region.code) === String(code))) return null;
  return zoomToFit(map, [code]);
}

/**
 * The middle of a region, for zooming to whatever somebody just chose: where it is *drawn*, not where it is. Okinawa
 * is drawn in a box in the Sea of Japan and Alaska in one below the lower forty-eight, so centring on their true
 * positions would take the reader to open sea; Tokyo, whose far islands are boxed, is centred on the Tokyo left in place.
 *
 * @example
 * ```ts
 * import { loadDivisions } from "@johnmorrisdotca/chizu/load";
 * import { regionCentre } from "@johnmorrisdotca/chizu";
 *
 * const japan = (await loadDivisions("jp"))!;
 * // Okinawa is drawn in a box, so its centre is the box's.
 * console.log(regionCentre(japan, "47"));
 * // { x: 247.5, y: 125 }
 * ```
 */
export function regionCentre(map: Frameable, code: string | number | null): { x: number; y: number } | null {
  if (code === null) return null;
  const seated = insetFor(map, code);
  if (seated && seated.outlyingBelow === undefined) return boxCentre(seated.box);
  const region = map.regions.find((entry) => String(entry.code) === String(code));
  if (!region) return null;
  const [minX, minY, maxX, maxY] = drawnBounds(region, seated);
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}

const SHAPE_MARGIN_RATIO = 0.1;

/**
 * A window tight on one region, for drawing it on its own.
 *
 * Two things decide it, and getting either wrong draws a country instead of a shape. The room around the region is a
 * fraction of *that side* of it, not of its longest side. And the window takes the shape of the frame it will be drawn
 * in (`aspect`, how much wider than tall), because an SVG scaled to fit keeps its window's proportions and fills the
 * rest of the frame with whatever is next to it. With both right the region fills the side that limits it, and the
 * room left over falls on the other side, where it does what the room was for: the neighbours show in outline, so it
 * is a place rather than a blob. Framed where it is drawn, so a region in an inset is framed there.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { boxToViewBox, regionBox } from "@johnmorrisdotca/chizu";
 *
 * const box = regionBox(WORLD, "IT", 4 / 3);
 * console.log((box.width / box.height).toFixed(3));
 * // 1.333
 * ```
 */
export function regionBox(map: Frameable, code: string | number, aspect = 1): MapBox {
  const region = map.regions.find((entry) => String(entry.code) === String(code));
  if (!region) return wholeMapBox(map);

  const [minX, minY, maxX, maxY] = drawnBounds(region, insetFor(map, code));
  const source = { minX, minY, maxX, maxY };

  const spanX = Math.max(source.maxX - source.minX, 0.001);
  const spanY = Math.max(source.maxY - source.minY, 0.001);
  let width = spanX * (1 + SHAPE_MARGIN_RATIO * 2);
  let height = spanY * (1 + SHAPE_MARGIN_RATIO * 2);

  // Grown to the frame's shape, never cropped.
  const shape = Math.max(aspect, 0.001);
  if (width / height < shape) width = height * shape;
  else height = width / shape;

  return { x: (source.minX + source.maxX) / 2 - width / 2, y: (source.minY + source.maxY) / 2 - height / 2, width, height };
}

const GLYPH_MARGIN_RATIO = 0.06;

/**
 * A square window on one region's own outline, for drawing it as an icon: every shape gets the same box and fills it,
 * so a small region is as legible in a list as a large one.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { shapeGlyphBox } from "@johnmorrisdotca/chizu";
 *
 * const chile = WORLD.regions.find((region) => region.code === "CL")!;
 * const box = shapeGlyphBox(chile.bbox);
 * console.log(box.width === box.height);
 * // true
 * ```
 */
export function shapeGlyphBox(bbox: readonly [number, number, number, number]): MapBox {
  const [minX, minY, maxX, maxY] = bbox;
  const side = Math.max(maxX - minX, maxY - minY, 0.001) * (1 + GLYPH_MARGIN_RATIO * 2);
  return { x: (minX + maxX) / 2 - side / 2, y: (minY + maxY) / 2 - side / 2, width: side, height: side };
}

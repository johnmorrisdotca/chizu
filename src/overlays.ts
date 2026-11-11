// Overlays: lines, marks and shaded areas a host hands the map as numbers (latitude and longitude), drawn over the land
// in a group of their own, so they can be replaced without redrawing the map. The map knows nothing of what they mean
// (a satellite's track, the night side): it draws what it is given.

import { isChizuColour } from "./draw.ts";
import { projectPoint } from "./project.ts";
import { escapeXml, num } from "./svgText.ts";
import type { ChizuMap, MapBox } from "./types.ts";
import { mapWrapsAround } from "./wrap.ts";

/**
 * A point as latitude and longitude, in degrees: north and east positive.
 *
 * @example
 * ```ts
 * import type { ChizuLatLon } from "@johnmorrisdotca/chizu";
 *
 * const tokyo: ChizuLatLon = [35.68, 139.69];
 * console.log(tokyo[0]);
 * // 35.68
 * ```
 */
export type ChizuLatLon = readonly [lat: number, lon: number];

/**
 * One overlay. A `line` runs through its points in order and is split where it crosses the date line (a step of more than
 * 180 degrees of longitude); give each part of a track its own line for a style of its own. A `mark` is a dot at a point,
 * with an optional label. An `area` is a ring of points filled (the night side): it is drawn as given, so a ring round a
 * pole runs from -180 to 180 along its edge and back along the pole. Colours are CSS colours or `var(--name)`; widths and
 * sizes are in CSS pixels, so a small map reads as well as a large one.
 *
 * @example
 * ```ts
 * import type { ChizuOverlay } from "@johnmorrisdotca/chizu";
 *
 * const overlays: ChizuOverlay[] = [
 *   { kind: "line", points: [[0, 170], [10, -170]], color: "#c33", width: 2 },
 *   { kind: "mark", at: [35.68, 139.69], label: "Tokyo" },
 * ];
 * console.log(overlays.length);
 * // 2
 * ```
 */
export type ChizuOverlay =
  | {
      kind: "line";
      points: readonly ChizuLatLon[];
      color?: string;
      width?: number;
      dash?: readonly number[];
      id?: string;
    }
  | { kind: "mark"; at: ChizuLatLon; label?: string; color?: string; size?: number; id?: string }
  | { kind: "area"; ring: readonly ChizuLatLon[]; color?: string; opacity?: number; id?: string };

const RAD = Math.PI / 180;
// A mark's label, as a share of the window's width: big enough to read on a 240 by 120 inset.
const MARK_LABEL_RATIO = 0.035;

const finite = (point: ChizuLatLon | undefined): point is ChizuLatLon =>
  Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]) && Math.abs(point[0]) <= 90;

/**
 * Where a point falls on the map's canvas. On a world map that goes round (Miller's projection), the longitude is taken as
 * given, not folded back into the map's width, so a line or a ring stays whole; the copies round the world are drawn by
 * shifting it a whole width. Elsewhere, the map's own projection; null where it cannot draw the point.
 */
function place(map: ChizuMap, [lat, lon]: ChizuLatLon): [number, number] | null {
  const p = map.projection;
  if (p.kind === "miller") {
    // Miller's y runs to infinity at the poles: a ring round a pole is closed at the map's edge.
    const clamped = Math.max(-89.9, Math.min(89.9, lat));
    const y = 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * clamped * RAD));
    return [p.translate[0] + p.scale * (lon - p.centre) * RAD, p.translate[1] - p.scale * y];
  }
  return projectPoint(map, lon, lat);
}

/** A line's parts: a new part where it crosses the date line, or where a point cannot be drawn. */
function lineParts(map: ChizuMap, points: readonly ChizuLatLon[]): [number, number][][] {
  const parts: [number, number][][] = [];
  let part: [number, number][] = [];
  let last: ChizuLatLon | null = null;
  for (const point of points) {
    const at = finite(point) ? place(map, point) : null;
    if (at === null || (last !== null && Math.abs(point[1] - last[1]) > 180)) {
      if (part.length > 1) parts.push(part);
      part = [];
    }
    if (at !== null) part.push(at);
    last = at === null ? null : point;
  }
  if (part.length > 1) parts.push(part);
  return parts;
}

const pathOf = (points: readonly [number, number][], close: boolean): string =>
  `M${points.map(([x, y]) => `${num(x)} ${num(y)}`).join("L")}${close ? "Z" : ""}`;

const colourOf = (colour: string | undefined): string | null =>
  typeof colour === "string" && isChizuColour(colour) ? colour.trim() : null;

const pixels = (value: number | undefined, fallback: number, most: number): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.min(value, most) : fallback;

/**
 * The overlays as SVG: one group, `cz-overlays`, the areas first, then the lines, then the marks, each repeated at the
 * offsets a world map is drawn at. Points that are not numbers are left out.
 *
 * @param map - The map they are drawn on.
 * @param overlays - The overlays, in the order they are drawn within their kind.
 * @param box - The window shown, for the size of a mark's label.
 * @param offsets - The shifts the land is drawn at (`wrapOffsets`), so the overlays go round the world with it.
 * @returns The group, empty when there is nothing to draw.
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { overlaysSvg, wholeMapBox } from "@johnmorrisdotca/chizu";
 *
 * const svg = overlaysSvg(WORLD, [{ kind: "mark", at: [0, 0], label: "0, 0" }], wholeMapBox(WORLD), [0]);
 * console.log(svg.includes('class="cz-overlay-mark"'));
 * // true
 * ```
 */
export function overlaysSvg(
  map: ChizuMap,
  overlays: readonly ChizuOverlay[],
  box: MapBox,
  offsets: readonly number[],
): string {
  const wraps = mapWrapsAround(map);
  // A track given across the date line runs past the map's edge: one more copy each side keeps it drawn.
  const shifts = wraps
    ? [
        ...new Set([
          ...offsets,
          ...offsets.map((offset) => offset - map.width),
          ...offsets.map((offset) => offset + map.width),
        ]),
      ]
    : [0];
  const areas: string[] = [];
  const lines: string[] = [];
  const marks: string[] = [];
  const idOf = (id: string | undefined) => (typeof id === "string" && id !== "" ? ` data-id="${escapeXml(id)}"` : "");
  for (const overlay of overlays ?? []) {
    if (overlay === null || typeof overlay !== "object") continue;
    if (overlay.kind === "area" && Array.isArray(overlay.ring)) {
      const ring = overlay.ring.filter(finite).map((point) => place(map, point));
      if (ring.length < 3 || ring.some((at) => at === null)) continue;
      const colour = colourOf(overlay.color);
      const opacity =
        typeof overlay.opacity === "number" && overlay.opacity >= 0 && overlay.opacity <= 1 ? overlay.opacity : null;
      const d = pathOf(ring as [number, number][], true);
      for (const shift of shifts)
        areas.push(
          `<path class="cz-overlay-area" d="${d}"${shift === 0 ? "" : ` transform="translate(${num(shift)} 0)"`}${idOf(overlay.id)}${colour ? ` style="--cz-overlay:${escapeXml(colour)}"` : ""}${opacity === null ? "" : ` fill-opacity="${num(opacity)}"`}/>`,
        );
    } else if (overlay.kind === "line" && Array.isArray(overlay.points)) {
      const colour = colourOf(overlay.color);
      const width = pixels(overlay.width, 2, 12);
      const dash =
        Array.isArray(overlay.dash) && overlay.dash.every((one) => Number.isFinite(one) && one >= 0)
          ? overlay.dash
              .slice(0, 8)
              .map((one) => num(one))
              .join(" ")
          : "";
      for (const part of lineParts(map, overlay.points)) {
        const d = pathOf(part, false);
        for (const shift of shifts)
          lines.push(
            `<path class="cz-overlay-line" d="${d}"${shift === 0 ? "" : ` transform="translate(${num(shift)} 0)"`}${idOf(overlay.id)} stroke-width="${num(width)}"${dash ? ` stroke-dasharray="${dash}"` : ""}${colour ? ` style="--cz-overlay:${escapeXml(colour)}"` : ""} vector-effect="non-scaling-stroke"/>`,
          );
      }
    } else if (overlay.kind === "mark" && finite(overlay.at)) {
      const at = place(map, overlay.at);
      if (at === null) continue;
      const colour = colourOf(overlay.color);
      const size = pixels(overlay.size, 8, 32);
      const label =
        typeof overlay.label === "string" && overlay.label.trim() !== "" ? overlay.label.trim().slice(0, 80) : null;
      const font = box.width * MARK_LABEL_RATIO;
      for (const shift of shifts) {
        const x = at[0] + shift;
        // A zero-length stroke with round ends is a dot of `size` pixels whatever the map's scale.
        marks.push(
          `<g class="cz-overlay-mark"${idOf(overlay.id)}${colour ? ` style="--cz-overlay:${escapeXml(colour)}"` : ""}><path d="M${num(x)} ${num(at[1])}h0" stroke-width="${num(size)}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>${label ? `<text x="${num(x + font * 0.6)}" y="${num(at[1] - font * 0.4)}" font-size="${num(font)}">${escapeXml(label)}</text>` : ""}</g>`,
        );
      }
    }
  }
  return `<g class="cz-overlays">${areas.join("")}${lines.join("")}${marks.join("")}</g>`;
}

/**
 * Draw a mounted map's overlays again in place, leaving the land as it is: the `cz-overlays` group of the drawing in
 * `stage` is replaced, or added after the rest. False where the stage has no drawing yet.
 *
 * @param stage - The element the map is drawn in.
 * @param map - The map drawn.
 * @param overlays - The overlays now.
 * @param box - The window shown.
 * @param offsets - The shifts the land is drawn at.
 * @returns Whether they were drawn.
 */
export function redrawOverlays(
  stage: Element,
  map: ChizuMap,
  overlays: readonly ChizuOverlay[],
  box: MapBox,
  offsets: readonly number[],
): boolean {
  const svg = stage.querySelector("svg");
  if (!svg) return false;
  const drawn = overlaysSvg(map, overlays, box, offsets);
  const group = svg.querySelector(":scope > .cz-overlays");
  if (group) group.outerHTML = drawn;
  else svg.insertAdjacentHTML("beforeend", drawn);
  return true;
}

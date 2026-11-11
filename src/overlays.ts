// Overlays: lines, marks and shaded areas a host hands the map as numbers (latitude and longitude), drawn over the land
// in a group of their own, so they can be replaced without redrawing the map. The map knows nothing of what they mean
// (a satellite's track, the night side): it draws what it is given.

import { isChizuColour } from "./draw.ts";
import { projectPoint } from "./project.ts";
import { escapeXml, num } from "./svgText.ts";
import type { ChizuMap, MapBox } from "./types.ts";
import { mapWrapsAround } from "./wrap.ts";

/**
 * A point as latitude and longitude, in degrees: north and east positive. Latitude first, the reverse of
 * `projectPoint(map, lon, lat)`.
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
 * One overlay. A `line` runs through its points in order, unbroken across the date line: each step is taken the short
 * way round (170 to -170 is 20 degrees east, and 350 to 10 is 20 degrees too), so a track that goes round the world is
 * one line; give each part of a track its own line for a style of its own. A `mark` is a dot at a point, with an optional
 * label; its longitude may be any number of turns round. An `area` is a ring of points filled (the night side), drawn
 * as given: its longitudes must run on without a jump (170 to 190, not 170 to -170, which fills a band round the
 * whole map), and a ring round a pole runs along its edge from -180 to 180 and back along the pole. Latitudes past a
 * pole are held to it. Colours are CSS colours or `var(--name)`; widths and sizes are in CSS pixels, so a small map reads
 * as well as a large one; `opacity` is the area's fill opacity, 0 to 1.
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
  Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]);

// A longitude folded into the half-turn either side of a centre: 350 about 0 is -10.
const fold = (lon: number, centre: number): number => centre + ((((lon - centre + 180) % 360) + 360) % 360) - 180;

/**
 * A run of points made continuous in longitude: the first folded about the map's centre, each next one moved a whole
 * turn so no step is more than half of one (170, 190, 210, not 170, -170, -150). The latitude is held to the poles.
 */
function unwrap(points: readonly ChizuLatLon[], centre: number): ChizuLatLon[] {
  const out: ChizuLatLon[] = [];
  for (const [lat, lon] of points) {
    const held = Math.max(-90, Math.min(90, lat));
    const last = out[out.length - 1];
    out.push([held, last === undefined ? fold(lon, centre) : fold(lon, last[1])]);
  }
  return out;
}

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
  return projectPoint(map, lon, Math.max(-90, Math.min(90, lat)));
}

/** A line's parts: one continuous run across the date line, a new part only where a point cannot be drawn. */
function lineParts(map: ChizuMap, points: readonly ChizuLatLon[]): [number, number][][] {
  const parts: [number, number][][] = [];
  let part: [number, number][] = [];
  const centre = map.projection.kind === "miller" ? map.projection.centre : 0;
  for (const point of unwrap(points.filter(finite), centre)) {
    const at = place(map, point);
    if (at === null) {
      if (part.length > 1) parts.push(part);
      part = [];
    } else part.push(at);
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
 * whole-width shifts round a world map that reach the window. Points that are not numbers are left out; a latitude past
 * a pole is held to it.
 *
 * @param map - The map they are drawn on.
 * @param overlays - The overlays, in the order they are drawn within their kind.
 * @param box - The window shown: the copies round a world map reach it, and a mark's label is sized to it.
 * @returns The group, empty when there is nothing to draw.
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { overlaysSvg, wholeMapBox } from "@johnmorrisdotca/chizu";
 *
 * const svg = overlaysSvg(WORLD, [{ kind: "mark", at: [0, 0], label: "0, 0" }], wholeMapBox(WORLD));
 * console.log(svg.includes('class="cz-overlay-mark"'));
 * // true
 * ```
 */
export function overlaysSvg(map: ChizuMap, overlays: readonly ChizuOverlay[], box: MapBox): string {
  const wraps = mapWrapsAround(map);
  const centre = map.projection.kind === "miller" ? map.projection.centre : 0;
  // The whole-width shifts at which a shape spanning these x values shows in the window: a track two orbits long
  // spans two widths and is drawn at each shift that reaches the window.
  const copies = (xs: readonly number[]): number[] => {
    if (!wraps || xs.length === 0) return [0];
    const least = Math.min(...xs);
    const most = Math.max(...xs);
    const out: number[] = [];
    for (
      let k = Math.floor((box.x - most) / map.width);
      k <= Math.ceil((box.x + box.width - least) / map.width);
      k += 1
    )
      out.push(k * map.width);
    return out;
  };
  const shifted = (shift: number) => (shift === 0 ? "" : ` transform="translate(${num(shift)} 0)"`);
  const areas: string[] = [];
  const lines: string[] = [];
  const marks: string[] = [];
  const idOf = (id: string | undefined) => (typeof id === "string" && id !== "" ? ` data-id="${escapeXml(id)}"` : "");
  const styleOf = (colour: string | null, opacity: number | null) => {
    const parts = [
      ...(colour ? [`--cz-overlay:${escapeXml(colour)}`] : []),
      ...(opacity === null ? [] : [`--cz-overlay-opacity:${num(opacity)}`]),
    ];
    return parts.length === 0 ? "" : ` style="${parts.join(";")}"`;
  };
  for (const overlay of overlays ?? []) {
    if (overlay === null || typeof overlay !== "object") continue;
    if (overlay.kind === "area" && Array.isArray(overlay.ring)) {
      // Drawn as given, moved as a whole so its first point lies within half a turn of the map's centre.
      const given = overlay.ring.filter(finite);
      const move = given.length > 0 ? fold(given[0]![1], centre) - given[0]![1] : 0;
      const ring = given.map(([lat, lon]) => place(map, [Math.max(-90, Math.min(90, lat)), lon + move]));
      if (ring.length < 3 || ring.some((at) => at === null)) continue;
      const points = ring as [number, number][];
      const opacity =
        typeof overlay.opacity === "number" && overlay.opacity >= 0 && overlay.opacity <= 1 ? overlay.opacity : null;
      const d = pathOf(points, true);
      for (const shift of copies(points.map(([x]) => x)))
        areas.push(
          `<path class="cz-overlay-area" d="${d}"${shifted(shift)}${idOf(overlay.id)}${styleOf(colourOf(overlay.color), opacity)}/>`,
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
        for (const shift of copies(part.map(([x]) => x)))
          lines.push(
            `<path class="cz-overlay-line" d="${d}"${shifted(shift)}${idOf(overlay.id)} stroke-width="${num(width)}"${dash ? ` stroke-dasharray="${dash}"` : ""}${styleOf(colour, null)} vector-effect="non-scaling-stroke"/>`,
          );
      }
    } else if (overlay.kind === "mark" && finite(overlay.at)) {
      const at = place(map, [Math.max(-90, Math.min(90, overlay.at[0])), fold(overlay.at[1], centre)]);
      if (at === null) continue;
      const size = pixels(overlay.size, 8, 32);
      const label =
        typeof overlay.label === "string" && overlay.label.trim() !== "" ? overlay.label.trim().slice(0, 80) : null;
      const font = box.width * MARK_LABEL_RATIO;
      for (const shift of copies([at[0]])) {
        const x = at[0] + shift;
        // A zero-length stroke with round ends is a dot of `size` pixels whatever the map's scale.
        marks.push(
          `<g class="cz-overlay-mark"${idOf(overlay.id)}${styleOf(colourOf(overlay.color), null)}><path d="M${num(x)} ${num(at[1])}h0" stroke-width="${num(size)}" stroke-linecap="round" vector-effect="non-scaling-stroke"/>${label ? `<text x="${num(x + font * 0.6)}" y="${num(at[1] - font * 0.4)}" font-size="${num(font)}">${escapeXml(label)}</text>` : ""}</g>`,
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
 * @returns Whether they were drawn.
 */
export function redrawOverlays(stage: Element, map: ChizuMap, overlays: readonly ChizuOverlay[], box: MapBox): boolean {
  const svg = stage.querySelector("svg");
  if (!svg) return false;
  const drawn = overlaysSvg(map, overlays, box);
  const group = svg.querySelector(":scope > .cz-overlays");
  if (group) group.outerHTML = drawn;
  else svg.insertAdjacentHTML("beforeend", drawn);
  return true;
}

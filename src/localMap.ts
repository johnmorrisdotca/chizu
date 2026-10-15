import { localCanvas, localConvergence, type ChizuLocalCanvas } from "./local.ts";
import { readLocalShapes, type ChizuGeoJson, type ChizuLocalShape } from "./localGeo.ts";
import { cleanSvgMarkup, splitPicture } from "./localMarker.ts";
import { projectPoint } from "./project.ts";
import type { ChizuMap, ChizuRegion } from "./types.ts";

/**
 * A picture to put on a local map, given as the caller has it. See `ChizuLocalMarker` for what it becomes.
 *
 * @example
 * ```ts
 * import { localMap, type ChizuLocalMarkerInput } from "@johnmorrisdotca/chizu";
 *
 * // A 100 m by 60 m pitch, drawn in metres, turned 30° east of north.
 * const pitch: ChizuLocalMarkerInput = {
 *   at: [139.7006, 35.7004],
 *   svg: '<svg viewBox="0 0 100 60"><rect width="100" height="60" fill="#9bd18a"/><line x1="50" y1="0" x2="50" y2="60" stroke="#fff"/></svg>',
 *   bearing: 30,
 *   name: "Pitch",
 * };
 * console.log(localMap({ centre: [139.7006, 35.7004], widthMetres: 300, markers: [pitch] }).markers.length);
 * // 1
 * ```
 */
export type ChizuLocalMarkerInput = {
  /** A name for it: its `<title>`, its label and what a screen reader hears. */
  name?: string;
  nameJa?: string;
  id?: string;
  /** Where its anchor goes: longitude and latitude, in degrees. */
  at: readonly [number, number];
  /** Its picture: a whole `<svg viewBox="…">…</svg>`, or bare markup with `viewBox` given. Cleaned on the way in (no script, style sheet, image or outside reference). */
  svg: string;
  /** The picture's own window, for bare markup (or to override the `<svg>`'s): `[x, y, width, height]` in the picture's units. */
  viewBox?: readonly [number, number, number, number];
  /** How many metres a unit of the picture is. Default 1, so a picture drawn in metres is true to size. */
  metresPerUnit?: number;
  /** Or how big the picture's window is on the ground, `[width, height]` in metres: the scale is worked out from the width (the height only checks). */
  size?: readonly [number, number];
  /** The direction the picture's top points, in degrees clockwise from true north. Default 0. */
  bearing?: number;
  /** The point of the picture, in its own units, that sits on `at`. Default the middle of its window. */
  anchor?: readonly [number, number];
  /** Classes for your own style: letters, digits, `-` and `_`. */
  class?: string | readonly string[];
};

/**
 * A picture placed on a local map: where it is on the canvas, how many canvas units a unit of the picture is, and the
 * turn that puts its top towards its bearing (the bearing less the map's grid convergence, `localConvergence`).
 *
 * @example
 * ```ts
 * import { localMap, type ChizuLocalMarker } from "@johnmorrisdotca/chizu";
 *
 * const field = '<svg viewBox="0 0 100 50"><rect width="100" height="50"/></svg>';
 * const marker: ChizuLocalMarker = localMap({ centre: [139.7, 35.7], widthMetres: 400, markers: [{ at: [139.7, 35.7], svg: field, bearing: 90 }] }).markers[0]!;
 * console.log(marker.id, marker.scale, marker.rotation);
 * // marker-1 2.5 90
 * ```
 */
export type ChizuLocalMarker = {
  id: string;
  name?: string;
  nameJa?: string;
  classes: string[];
  /** Where its anchor is on the canvas. */
  at: [number, number];
  /** The bearing it was given. */
  bearing: number;
  /** The turn on the canvas, in degrees clockwise. */
  rotation: number;
  /** Canvas units to a unit of the picture. */
  scale: number;
  /** The point of the picture that sits on `at`, in its own units. */
  anchor: [number, number];
  /** The picture's window: `[x, y, width, height]` in its own units. */
  viewBox: [number, number, number, number];
  /** The cleaned markup, ready to sit in an `<svg>`. */
  markup: string;
  /** The box round the turned picture on the canvas: left, top, right, bottom. */
  bbox: [number, number, number, number];
};

/**
 * What a local map is made of.
 *
 * @example
 * ```ts
 * import { localMap, type ChizuLocalOptions } from "@johnmorrisdotca/chizu";
 *
 * const options: ChizuLocalOptions = {
 *   centre: [139.7006, 35.7004],
 *   widthMetres: 400,
 *   name: "Made-up ground",
 *   data: { type: "Feature", id: "hall", properties: { kind: "building" }, geometry: { type: "Polygon", coordinates: [[[139.7, 35.7], [139.701, 35.7], [139.701, 35.7006], [139.7, 35.7006], [139.7, 35.7]]] } },
 *   credits: ["Made-up shapes, for this example"],
 * };
 * console.log(localMap(options).regions.map((region) => region.code));
 * // [ 'hall' ]
 * ```
 */
export type ChizuLocalOptions = ChizuLocalCanvas & {
  /** The map's id. Default `local`. */
  id?: string;
  /** Its name in English and Japanese, for the drawing's label. */
  name?: string;
  nameJa?: string;
  /** What to draw: GeoJSON (one value or a list), read in the order given, which is the order it is painted in. */
  data?: ChizuGeoJson | readonly ChizuGeoJson[];
  /** Pictures to place, painted over the shapes. */
  markers?: readonly ChizuLocalMarkerInput[];
  /** The credit lines for the data, shown in the drawing: `"Data © OpenStreetMap contributors, ODbL"`. Chizu fetches nothing and adds no data of its own: the caller says what it drew from. */
  credits?: readonly string[];
};

/**
 * A map of a small place: a `ChizuMap` (so every function of the engine takes it) whose canvas is a city or a venue in
 * a local projection, whose `regions` are the polygons of the data, and which also holds the lines, points, pictures and
 * credits that `drawLocal` draws.
 *
 * @example
 * ```ts
 * import { localMap, type ChizuLocalMap } from "@johnmorrisdotca/chizu";
 *
 * const map: ChizuLocalMap = localMap({ centre: [139.7006, 35.7004], widthMetres: 500 });
 * console.log(map.kind, map.viewBox, map.projection.kind === "local" && map.projection.metresPerUnit);
 * // local 0 0 1000 1000 0.5
 * ```
 */
export interface ChizuLocalMap extends ChizuMap {
  kind: "local";
  /** Every shape of the data, in the order given: areas, lines and points. */
  shapes: ChizuLocalShape[];
  markers: ChizuLocalMarker[];
  credits: string[];
  /** What was left out of the data, and why, one line each. */
  problems: string[];
}

const round = (value: number) => Math.round(value * 1000) / 1000;
const classesOf = (value: unknown): string[] => (Array.isArray(value) ? value : typeof value === "string" ? value.split(/\s+/) : []).filter((one): one is string => typeof one === "string" && /^[A-Za-z_][\w-]{0,40}$/.test(one)).slice(0, 8);

/**
 * A local map: the ground of a city or a venue, from caller-given GeoJSON and pictures, in a projection made for a small
 * piece of the earth. Nothing is fetched and no map data is added: what is drawn is what is passed in, with the credit
 * lines the caller passes. A unit of the canvas is `metresPerUnit` metres (default: the longer side over 1,000),
 * stated in `projection`, so a distance on the canvas is a distance on the ground. `projectPoint` and `unprojectPoint`
 * work on it, and `mapBoxFromLocal` and `localCanvasFromBox` hand over to and from a world or country map.
 *
 * @param options - The centre, the width in metres, the data and pictures, and the credit lines.
 * @returns The local map: a canvas in metres with its projection, shapes, pictures and credits.
 *
 * @example
 * ```ts
 * import { groundDistance, localMap, projectPoint } from "@johnmorrisdotca/chizu";
 *
 * const map = localMap({ centre: [-0.2795, 51.556], widthMetres: 1000, metresPerUnit: 1 });
 * const a = projectPoint(map, -0.2795, 51.556)!;
 * const b = projectPoint(map, -0.2795, 51.557)!;
 * // 0.001° of latitude is 111 m, and the canvas is in metres.
 * console.log(Math.round(Math.hypot(b[0] - a[0], b[1] - a[1])), Math.round(groundDistance([-0.2795, 51.556], [-0.2795, 51.557])));
 * // 111 111
 * ```
 */
export function localMap(options: ChizuLocalOptions): ChizuLocalMap {
  const canvas = localCanvas(options);
  const { shapes, problems } = options.data ? readLocalShapes(options.data, canvas.projection) : { shapes: [], problems: [] };
  const regions: ChizuRegion[] = shapes
    .filter((shape) => shape.kind === "area")
    .map((shape) => ({
      code: shape.id,
      name: shape.name ?? shape.id,
      ...(shape.nameJa ? { nameJa: shape.nameJa } : {}),
      group: shape.type ?? "area",
      path: shape.path,
      bbox: shape.bbox,
      centroid: shape.centroid,
      neighbors: [],
    }));

  const markers: ChizuLocalMarker[] = [];
  (options.markers ?? []).forEach((input, index) => {
    const label = input.id ?? `marker-${index + 1}`;
    const at = Array.isArray(input.at) && input.at.length >= 2 ? projectPoint(canvas, Number(input.at[0]), Number(input.at[1])) : null;
    if (!at || !at.every(Number.isFinite)) return void problems.push(`${label}: no place to put it`);
    if (typeof input.svg !== "string" || input.svg.length > 500_000) return void problems.push(`${label}: no picture, or one over 500 kB`);
    const picture = splitPicture(input.svg, input.viewBox);
    if (!picture) return void problems.push(`${label}: the picture says no size; give a viewBox`);
    const [vx, vy, vw, vh] = picture.viewBox;
    const unit = input.size ? input.size[0] / vw : (input.metresPerUnit ?? 1);
    if (!(unit > 0) || !Number.isFinite(unit)) return void problems.push(`${label}: its size in metres must be above zero`);
    const scale = unit / canvas.projection.metresPerUnit;
    const bearing = Number.isFinite(input.bearing) ? Number(input.bearing) : 0;
    const rotation = round(bearing - localConvergence(canvas.projection.centre, Number(input.at[0]), Number(input.at[1])));
    const anchor: [number, number] = input.anchor && input.anchor.every(Number.isFinite) ? [input.anchor[0], input.anchor[1]] : [vx + vw / 2, vy + vh / 2];
    const turn = (rotation * Math.PI) / 180;
    const corners = [[vx, vy], [vx + vw, vy], [vx, vy + vh], [vx + vw, vy + vh]].map(([x, y]) => {
      const dx = (x! - anchor[0]) * scale;
      const dy = (y! - anchor[1]) * scale;
      return [at[0] + dx * Math.cos(turn) - dy * Math.sin(turn), at[1] + dx * Math.sin(turn) + dy * Math.cos(turn)] as const;
    });
    markers.push({
      id: label.slice(0, 80),
      ...(typeof input.name === "string" && input.name.trim() ? { name: input.name.trim().slice(0, 200) } : {}),
      ...(typeof input.nameJa === "string" && input.nameJa.trim() ? { nameJa: input.nameJa.trim().slice(0, 200) } : {}),
      classes: classesOf(input.class),
      at: [round(at[0]), round(at[1])],
      bearing,
      rotation,
      scale: Math.round(scale * 1e6) / 1e6,
      anchor,
      viewBox: picture.viewBox,
      markup: cleanSvgMarkup(picture.markup, `cz-m${index + 1}-`),
      bbox: [round(Math.min(...corners.map((c) => c[0]))), round(Math.min(...corners.map((c) => c[1]))), round(Math.max(...corners.map((c) => c[0]))), round(Math.max(...corners.map((c) => c[1])))],
    });
  });

  const credits = (options.credits ?? []).filter((line): line is string => typeof line === "string" && line.trim() !== "").map((line) => line.trim().slice(0, 300));
  return {
    id: options.id ?? "local",
    kind: "local",
    name: options.name ?? "",
    ...(options.nameJa ? { nameJa: options.nameJa } : {}),
    regionName: "Area",
    regionNamePlural: "Areas",
    viewBox: canvas.viewBox,
    width: canvas.width,
    height: canvas.height,
    wraps: false,
    projection: canvas.projection,
    insets: [],
    source: credits.length > 0 ? credits.join("; ") : "Shapes given by the caller",
    regions,
    shapes,
    markers,
    credits,
    problems,
  };
}

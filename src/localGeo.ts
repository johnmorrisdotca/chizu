import type { ChizuProjection } from "./types.ts";
import { projectPoint } from "./project.ts";

/**
 * GEOJSON ON A LOCAL CANVAS: the caller's own shapes (a stadium's footprint, a pitch, the water beside it, a road, a
 * gate) projected onto the canvas as the paths the rest of chizu reads. Nothing is fetched and nothing is guessed: a
 * shape that cannot be drawn is left out and said so, in `problems`.
 */

/**
 * GeoJSON as the engine reads it: a Feature, a FeatureCollection, or a bare geometry, in the loose shape
 * `JSON.parse` and an imported `.json` file give (`type` is any string, and is checked as the data is read).
 * Points, MultiPoints, LineStrings, MultiLineStrings, Polygons, MultiPolygons and GeometryCollections are drawn;
 * coordinates are `[longitude, latitude]` in degrees, a third number (height) is ignored.
 *
 * @example
 * ```ts
 * import { localMap, type ChizuGeoJson } from "@johnmorrisdotca/chizu";
 *
 * const pitch: ChizuGeoJson = {
 *   type: "Feature",
 *   id: "pitch",
 *   properties: { name: "Pitch", kind: "pitch" },
 *   geometry: { type: "Polygon", coordinates: [[[139.7, 35.7], [139.7012, 35.7], [139.7012, 35.7008], [139.7, 35.7008], [139.7, 35.7]]] },
 * };
 * console.log(localMap({ centre: [139.7006, 35.7004], widthMetres: 200, data: pitch }).shapes.map((shape) => shape.kind));
 * // [ 'area' ]
 * ```
 */
export type ChizuGeoJson = {
  type: string;
  id?: string | number;
  properties?: Readonly<Record<string, unknown>> | null;
  geometry?: ChizuGeoJson | null;
  geometries?: readonly ChizuGeoJson[];
  features?: readonly ChizuGeoJson[];
  coordinates?: unknown;
};

/**
 * One shape of a local map, in the canvas's units: an `area` (a closed outline, filled), a `line` (an open one) or a
 * `point`. Its `id` is the Feature's `id` (or its `properties.id`, or `f1`, `f2` in the order given); `name` and
 * `nameJa` are its `properties.name` and `properties.nameJa` (or `name:ja`); `type` is `properties.kind` (`water`,
 * `building`, `pitch`, `green`, `road` have a look of their own); `classes` are `properties.class`.
 *
 * @example
 * ```ts
 * import { localMap, type ChizuLocalShape } from "@johnmorrisdotca/chizu";
 *
 * const gate = { type: "Feature", id: "gate", properties: { name: "North gate" }, geometry: { type: "Point", coordinates: [139.7006, 35.7007] } };
 * const shape: ChizuLocalShape = localMap({ centre: [139.7006, 35.7004], widthMetres: 200, data: gate }).shapes[0]!;
 * console.log(shape.id, shape.kind, shape.name, shape.centroid.map(Math.round));
 * // gate point North gate [ 500, 334 ]
 * ```
 */
export type ChizuLocalShape = {
  id: string;
  kind: "area" | "line" | "point";
  /** An area's closed outlines (`M x,y L … Z`, a ring each; a hole is a ring drawn with the even-odd rule) or a line's open ones; empty for a point. */
  path: string;
  /** The box round it on the canvas: left, top, right, bottom. */
  bbox: [number, number, number, number];
  /** Its middle: an area's centre of mass, a line's half-way point, a point itself. */
  centroid: [number, number];
  name?: string;
  nameJa?: string;
  type?: string;
  classes: string[];
};

const num = (value: number) => String(Math.round(value * 1000) / 1000);
const GEOMETRIES = new Set(["Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon"]);

type Pt = [number, number];

/** The shapes of a GeoJSON value, in the order given, projected by `projection`, and what was left out and why. */
export function readLocalShapes(data: ChizuGeoJson | readonly ChizuGeoJson[], projection: ChizuProjection): { shapes: ChizuLocalShape[]; problems: string[] } {
  const shapes: ChizuLocalShape[] = [];
  const problems: string[] = [];
  const taken = new Set<string>();
  const map = { projection };

  const place = (position: unknown): Pt | null => {
    if (!Array.isArray(position) || position.length < 2) return null;
    const lon = Number(position[0]);
    const lat = Number(position[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || Math.abs(lat) > 90 || Math.abs(lon) > 360) return null;
    return projectPoint(map, lon, lat);
  };
  const points = (list: unknown): Pt[] => (Array.isArray(list) ? list.map(place).filter((point): point is Pt => point !== null) : []);
  const ring = (list: unknown): Pt[] => {
    const all = points(list);
    const out = all.filter((point, i) => i === 0 || point[0] !== all[i - 1]![0] || point[1] !== all[i - 1]![1]);
    if (out.length > 1 && out[0]![0] === out.at(-1)![0] && out[0]![1] === out.at(-1)![1]) out.pop();
    return out;
  };
  const text = (value: unknown) => (typeof value === "string" && value.trim() !== "" ? value.trim().slice(0, 200) : undefined);
  const word = (value: unknown, most: number) => (typeof value === "string" && /^[A-Za-z_][\w-]*$/.test(value) && value.length <= most ? value : undefined);

  const add = (feature: ChizuGeoJson, geometry: ChizuGeoJson, suffix: string) => {
    const properties = feature.properties && typeof feature.properties === "object" ? feature.properties : {};
    const given = feature.id ?? (typeof properties.id === "string" || typeof properties.id === "number" ? properties.id : undefined);
    let id = given !== undefined && String(given) !== "" ? String(given).slice(0, 80) : `f${shapes.length + 1}`;
    id = `${id}${suffix}`;
    while (taken.has(id)) id = `${id}-${taken.size + 1}`;
    const where = `${id} (${geometry.type})`;
    const classes = (Array.isArray(properties.class) ? properties.class : typeof properties.class === "string" ? properties.class.split(/\s+/) : []).map((one) => word(one, 40)).filter((one): one is string => one !== undefined).slice(0, 8);
    const common = { id, name: text(properties.name), nameJa: text(properties.nameJa) ?? text(properties["name:ja"]), type: word(typeof properties.kind === "string" ? properties.kind.toLowerCase() : undefined, 30), classes };
    const finish = (kind: ChizuLocalShape["kind"], path: string, all: Pt[], centroid: Pt) => {
      if (all.length === 0) return false;
      taken.add(id);
      const xs = all.map((p) => p[0]);
      const ys = all.map((p) => p[1]);
      shapes.push({ ...common, kind, path, bbox: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], centroid });
      return true;
    };
    const coordinates = geometry.coordinates;
    if (geometry.type === "Point" || geometry.type === "MultiPoint") {
      const list = geometry.type === "Point" ? [place(coordinates)].filter((p): p is Pt => p !== null) : points(coordinates);
      if (list.length === 0 || !finish("point", "", list, centroidOf(list))) problems.push(`${where}: no position that can be drawn`);
      return;
    }
    if (geometry.type === "LineString" || geometry.type === "MultiLineString") {
      const parts = (geometry.type === "LineString" ? [coordinates] : Array.isArray(coordinates) ? coordinates : []).map(points).filter((part) => part.length >= 2);
      if (parts.length === 0) return void problems.push(`${where}: a line needs two positions`);
      const all = parts.flat();
      finish("line", parts.map((part) => "M" + part.map(([x, y]) => `${num(x)},${num(y)}`).join("L")).join(" "), all, midway(parts));
      return;
    }
    // Polygon, MultiPolygon
    const polygons = (geometry.type === "Polygon" ? [coordinates] : Array.isArray(coordinates) ? coordinates : []).map((rings) => (Array.isArray(rings) ? rings.map(ring).filter((one) => one.length >= 3) : []));
    const usable = polygons.filter((rings) => rings.length > 0);
    if (usable.length === 0) return void problems.push(`${where}: a polygon needs a ring of three different positions`);
    const rings = usable.flat();
    const centre = massOf(usable.map((rs) => rs[0]!));
    finish("area", rings.map((r) => "M" + r.map(([x, y]) => `${num(x)},${num(y)}`).join("L") + "Z").join(" "), rings.flat(), centre);
  };

  const walk = (node: ChizuGeoJson, inherit: ChizuGeoJson | null) => {
    if (!node || typeof node !== "object" || typeof node.type !== "string") return void problems.push("something that is not GeoJSON was skipped");
    if (node.type === "FeatureCollection") return void (Array.isArray(node.features) ? node.features : []).forEach((one) => walk(one, null));
    if (node.type === "Feature") {
      const geometry = node.geometry;
      if (!geometry) return void problems.push(`${node.id ?? `f${shapes.length + 1}`}: a Feature with no geometry was skipped`);
      return walk(geometry, node);
    }
    const feature = inherit ?? { type: "Feature", properties: {}, geometry: node };
    if (node.type === "GeometryCollection") {
      (Array.isArray(node.geometries) ? node.geometries : []).forEach((member, i) => {
        if (member && GEOMETRIES.has(member.type)) add(feature, member, `.${i + 1}`);
        else problems.push(`a ${String(member?.type)} inside a GeometryCollection was skipped`);
      });
      return;
    }
    if (GEOMETRIES.has(node.type)) return add(feature, node, "");
    problems.push(`a ${node.type} was skipped: only Point, LineString, Polygon and their Multi forms are drawn`);
  };
  for (const one of Array.isArray(data) ? data : [data]) walk(one as ChizuGeoJson, null);
  return { shapes, problems };
}

function centroidOf(list: readonly Pt[]): Pt {
  return [list.reduce((sum, p) => sum + p[0], 0) / list.length, list.reduce((sum, p) => sum + p[1], 0) / list.length];
}

/** The centre of mass of outlines, by area; the average of their points where they have none. */
function massOf(rings: readonly (readonly Pt[])[]): Pt {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (const r of rings) {
    for (let i = 0; i < r.length; i += 1) {
      const [x0, y0] = r[i]!;
      const [x1, y1] = r[(i + 1) % r.length]!;
      const cross = x0 * y1 - x1 * y0;
      area += cross;
      cx += (x0 + x1) * cross;
      cy += (y0 + y1) * cross;
    }
  }
  return Math.abs(area) < 1e-9 ? centroidOf(rings.flat()) : [cx / (3 * area), cy / (3 * area)];
}

/** The point half way along the longest of some lines. */
function midway(parts: readonly (readonly Pt[])[]): Pt {
  const length = (part: readonly Pt[]) => part.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - part[i]![0], p[1] - part[i]![1]), 0);
  const longest = parts.reduce((best, part) => (length(part) > length(best) ? part : best), parts[0]!);
  let left = length(longest) / 2;
  for (let i = 1; i < longest.length; i += 1) {
    const step = Math.hypot(longest[i]![0] - longest[i - 1]![0], longest[i]![1] - longest[i - 1]![1]);
    if (left <= step && step > 0) {
      const t = left / step;
      return [longest[i - 1]![0] + (longest[i]![0] - longest[i - 1]![0]) * t, longest[i - 1]![1] + (longest[i]![1] - longest[i - 1]![1]) * t];
    }
    left -= step;
  }
  return longest.at(-1)!;
}

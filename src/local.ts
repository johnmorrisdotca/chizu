import { LOCAL_RADIUS, localLonLat, localMetres, projectPoint, unprojectPoint } from "./project.ts";
import type { ChizuMap, ChizuProjection, MapBox } from "./types.ts";

/**
 * THE CITY SCALE: a projection for a small piece of the earth, a few hundred metres to a few tens of kilometres across,
 * where a country's map is far too coarse. Natural Earth stops at 1:10m (about a kilometre); past it a map is whatever
 * the caller has to draw, and these are the numbers that put it in the right place.
 *
 * The projection is a transverse Mercator on the WGS 84 ellipsoid centred on the place (Krüger's series, scale one on the
 * central meridian), closed-form both ways and conformal: a square stays a square, so a pitch keeps its angles. A canvas
 * unit is a stated number of metres. Held to a geodesic computed on the ellipsoid (Vincenty's): within 0.5% for any two
 * points up to 50 km apart, anywhere from the equator to 70°, and in practice to a few millimetres. Where it cannot say
 * (a quarter of the earth from the centre) it answers `null`, never a guess.
 */

const RAD = Math.PI / 180;

/**
 * What a local map is made of: where, how big in metres, and how many metres a unit of its canvas is.
 *
 * @example
 * ```ts
 * import { localMap, type ChizuLocalOptions } from "@johnmorrisdotca/chizu";
 *
 * // A canvas 600 m across and 400 m tall, round Tokyo Station, one unit to the metre.
 * const options: ChizuLocalOptions = { centre: [139.7671, 35.6812], widthMetres: 600, heightMetres: 400, metresPerUnit: 1 };
 * console.log(localMap(options).viewBox);
 * // 0 0 600 400
 * ```
 */
export type ChizuLocalCanvas = {
  /** The middle of the canvas: longitude and latitude, in degrees. */
  centre: readonly [number, number];
  /** How wide the canvas is on the ground, in metres. */
  widthMetres: number;
  /** How tall it is on the ground, in metres. Default: as wide. */
  heightMetres?: number;
  /** How many metres a unit of the canvas is, stated in the map's `projection`. Default: the longer side over 1,000, so a local canvas is 1,000 across like every other map's. */
  metresPerUnit?: number;
};

/** The canvas of a local map, worked out: the projection and the size in units. */
export function localCanvas(canvas: ChizuLocalCanvas): Pick<ChizuMap, "width" | "height" | "viewBox"> & { projection: Extract<ChizuProjection, { kind: "local" }> } {
  const { centre, widthMetres } = canvas;
  const heightMetres = canvas.heightMetres ?? widthMetres;
  if (!(widthMetres > 0) || !(heightMetres > 0) || !Number.isFinite(widthMetres) || !Number.isFinite(heightMetres)) throw new RangeError("a local map needs a width and a height in metres, above zero");
  if (!Number.isFinite(centre[0]) || !Number.isFinite(centre[1]) || Math.abs(centre[1]) > 89 || Math.abs(centre[0]) > 360) throw new RangeError("a local map needs a centre of longitude and latitude, the latitude within 89°");
  const metresPerUnit = canvas.metresPerUnit ?? Math.max(widthMetres, heightMetres) / 1000;
  if (!(metresPerUnit > 0) || !Number.isFinite(metresPerUnit)) throw new RangeError("metresPerUnit must be above zero");
  const width = round(widthMetres / metresPerUnit);
  const height = round(heightMetres / metresPerUnit);
  return {
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    projection: { kind: "local", centre: [centre[0], centre[1]], radius: LOCAL_RADIUS, metresPerUnit, translate: [width / 2, height / 2] },
  };
}

const round = (value: number) => Math.round(value * 1000) / 1000;

/**
 * How far, in metres, two places are from each other, along the ground: the local projection centred half way between
 * them, so within a hair of the ellipsoid up to 400 km. Past 400 km it falls back to the great circle on
 * the mean sphere, which is within 0.5% of the ellipsoid's.
 *
 * @param a - The first place, as [longitude, latitude] in degrees.
 * @param b - The second place, as [longitude, latitude] in degrees.
 * @returns The distance along the ground, in metres.
 *
 * @example
 * ```ts
 * import { groundDistance } from "@johnmorrisdotca/chizu";
 *
 * // Tokyo Station to Shinjuku Station, about 6.1 km.
 * console.log(Math.round(groundDistance([139.7671, 35.6812], [139.7006, 35.6896]) / 100) / 10);
 * // 6.1
 * ```
 */
export function groundDistance(a: readonly [number, number], b: readonly [number, number]): number {
  const f1 = a[1] * RAD;
  const f2 = b[1] * RAD;
  const dl = (b[0] - a[0]) * RAD;
  const h = Math.sin((f2 - f1) / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2;
  const sphere = 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(h)));
  if (sphere > 400_000) return sphere;
  const mid: [number, number] = [a[0] + ((((b[0] - a[0] + 180) % 360) + 360) % 360 - 180) / 2, (a[1] + b[1]) / 2];
  const p = localMetres(mid, LOCAL_RADIUS, a[0], a[1]);
  const q = localMetres(mid, LOCAL_RADIUS, b[0], b[1]);
  return p && q ? Math.hypot(q[0] - p[0], q[1] - p[1]) : sphere;
}

/**
 * The angle, in degrees, between true north and the canvas's up at a place: how much a thing that points at a true
 * bearing is turned on a local map. Zero on the central meridian, a few hundredths of a degree a kilometre or two east
 * or west of it; positive east of the centre in the northern hemisphere, where the meridians lean in towards the pole.
 * A marker at a bearing is turned by its bearing less this (`localMap` does it).
 *
 * @param centre - The centre of the local map, as [longitude, latitude] in degrees.
 * @param lon - The longitude of the place, in degrees.
 * @param lat - The latitude of the place, in degrees.
 * @returns The angle, in degrees, between the grid's north and true north there; positive east of the centre.
 *
 * @example
 * ```ts
 * import { localConvergence } from "@johnmorrisdotca/chizu";
 *
 * console.log(localConvergence([139.7671, 35.6812], 139.7671, 35.69), localConvergence([139.7671, 35.6812], 139.85, 35.69) > 0);
 * // 0 true
 * ```
 */
export function localConvergence(centre: readonly [number, number], lon: number, lat: number): number {
  const dl = (((lon - centre[0] + 180) % 360) + 360) % 360 - 180;
  return Math.atan(Math.tan(dl * RAD) * Math.sin(lat * RAD)) / RAD;
}

/**
 * How many metres of ground a window on a world or country map shows, across and down: the number to compare with a
 * city's size when deciding that a map has been zoomed past what Natural Earth can say and a local map should take
 * over. `null` for a map whose canvas cannot be read back to longitude and latitude (a country's regions).
 *
 * @param map - A world or country map.
 * @param box - A window on that map.
 * @returns The width and height of the window in metres, or `null` when the map cannot be read back to longitude and latitude.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { mapBoxMetres, zoomBox } from "@johnmorrisdotca/chizu";
 *
 * const window = zoomBox(WORLD, 10, { x: 457.5, y: 212.5 });
 * console.log(Math.round(mapBoxMetres(WORLD, window)!.width / 100_000) * 100, "km across");
 * // 3300 km across
 * ```
 */
export function mapBoxMetres(map: Pick<ChizuMap, "projection">, box: MapBox): { width: number; height: number } | null {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const d = Math.max(box.width, box.height) / 200;
  const c = unprojectPoint(map, cx, cy);
  const e = unprojectPoint(map, cx + d, cy);
  const n = unprojectPoint(map, cx, cy - d);
  if (!c || !e || !n) return null;
  return { width: (groundDistance(c, e) / d) * box.width, height: (groundDistance(c, n) / d) * box.height };
}

/**
 * The local canvas that shows the ground a window on a world or country map shows, so a page can hand over from the
 * map to the city at the moment it has zoomed past what the map knows, with nothing jumping: at its own 1× the local map
 * covers the same ground as the window did. `null` where `mapBoxMetres` is.
 *
 * @param map - A world or country map.
 * @param box - A window on that map.
 * @returns A local canvas covering the window, or `null` when the map cannot be read back or the window is near a pole.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { localCanvasFromBox, projectPoint } from "@johnmorrisdotca/chizu";
 *
 * const [x, y] = projectPoint(WORLD, 139.7671, 35.6812)!;
 * const canvas = localCanvasFromBox(WORLD, { x: x - 1, y: y - 1, width: 2, height: 2 })!;
 * console.log(canvas.centre.map((value) => value.toFixed(2)).join(", "), Math.round(canvas.widthMetres / 10_000) * 10, "km");
 * // 139.77, 35.68 70 km
 * ```
 */
export function localCanvasFromBox(map: Pick<ChizuMap, "projection">, box: MapBox): Required<ChizuLocalCanvas> | null {
  const metres = mapBoxMetres(map, box);
  const centre = unprojectPoint(map, box.x + box.width / 2, box.y + box.height / 2);
  if (!metres || !centre || Math.abs(centre[1]) > 89) return null;
  return { centre, widthMetres: metres.width, heightMetres: metres.height, metresPerUnit: Math.max(metres.width, metres.height) / 1000 };
}

/**
 * The window on a world or country map that a local map covers, the way back from the city: the smallest window that
 * holds the ground of the local window (all of the canvas unless `box` is given). `null` where the map cannot be read
 * back to longitude and latitude.
 *
 * @param map - The world or country map to hand over to.
 * @param local - The local map to hand back from.
 * @param box - A window on the local map; the whole canvas when left out.
 * @returns The window on the world or country map, or `null` where the local map or the map cannot be read back.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { localMap, mapBoxFromLocal } from "@johnmorrisdotca/chizu";
 *
 * const city = localMap({ centre: [139.7671, 35.6812], widthMetres: 20_000 });
 * const window = mapBoxFromLocal(WORLD, city)!;
 * console.log(window.width < 5, window.x < 457.5 && 457.5 < window.x + window.width);
 * // true true
 * ```
 */
export function mapBoxFromLocal(map: Pick<ChizuMap, "projection">, local: Pick<ChizuMap, "projection" | "width" | "height">, box?: MapBox): MapBox | null {
  const p = local.projection;
  if (p.kind !== "local") return null;
  const window = box ?? { x: 0, y: 0, width: local.width, height: local.height };
  const corners: Array<[number, number]> = [
    [window.x, window.y],
    [window.x + window.width, window.y],
    [window.x, window.y + window.height],
    [window.x + window.width, window.y + window.height],
  ];
  const points = corners.map(([x, y]) => {
    const [lon, lat] = localLonLat(p.centre, p.radius, (x - p.translate[0]) * p.metresPerUnit, (p.translate[1] - y) * p.metresPerUnit);
    return projectPoint(map, lon, lat);
  });
  if (points.some((point) => point === null)) return null;
  const xs = points.map((point) => point![0]);
  const ys = points.map((point) => point![1]);
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}

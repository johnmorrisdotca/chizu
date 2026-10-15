import type { ChizuMap } from "./types.ts";

/**
 * Where a place on the earth is on a map's canvas, and back: so that a member's home town, a photograph or a
 * battle can be pinned on the world map the regions are drawn on.
 *
 * A map keeps how its canvas was made (`projection`). Three are closed formulas and are done here with no dependency:
 * Miller's cylindrical projection round a centre longitude (the world), a Lambert azimuthal equal-area
 * projection round a centre (a country alone), and a transverse Mercator round a centre for a city or a venue
 * (`localMap`). A map's regions (a country's provinces) were fitted with a projection
 * of their own and are not reversible from here: `projectPoint` answers `null` for them, never a guess.
 *
 * The tests hold both formulas to d3-geo's own, point for point.
 */

const RAD = Math.PI / 180;

/** A longitude brought into -180 to 180. */
function wrapLongitude(lon: number): number {
  return ((((lon + 180) % 360) + 360) % 360) - 180;
}

/**
 * Where a longitude and latitude (in degrees) fall on the map's canvas, as `[x, y]`; `null` for a map whose canvas
 * cannot be reversed from here. On the world a point just east of the seam is at the far left of the canvas and one just
 * west of it at the far right, and the canvas repeats either side, so a page that pans past the edge adds or takes away
 * `width` (`wrapAcross`).
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { projectPoint } from "@johnmorrisdotca/chizu";
 *
 * const tokyo = projectPoint(WORLD, 139.69, 35.69)!;
 * console.log(tokyo.map((value) => value.toFixed(1)).join(", "));
 * // 457.5, 212.5
 * ```
 *
 * @param map - The native map or map fields required by this signature; coordinates and region codes belong to its canvas.
 * @param lon - Longitude in degrees, in [longitude, latitude] order.
 * @param lat - Latitude in degrees, in [longitude, latitude] order.
 * @returns The native [x, y] point, or null when the map’s projection is not reversible here.
 */
export function projectPoint(map: Pick<ChizuMap, "projection">, lon: number, lat: number): [number, number] | null {
  const p = map.projection;
  if (p.kind === "miller") {
    const x = wrapLongitude(lon - p.centre) * RAD;
    const y = 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * RAD));
    return [p.translate[0] + p.scale * x, p.translate[1] - p.scale * y];
  }
  if (p.kind === "azimuthal-equal-area") {
    const [lon0, lat0] = p.centre;
    const l = (lon - lon0) * RAD;
    const f = lat * RAD;
    const f0 = lat0 * RAD;
    const cosc = Math.sin(f0) * Math.sin(f) + Math.cos(f0) * Math.cos(f) * Math.cos(l);
    if (cosc <= -1 + 1e-12) return null; // the one point opposite the centre, which the projection cannot draw
    const k = Math.sqrt(2 / (1 + cosc));
    const x = k * Math.cos(f) * Math.sin(l);
    const y = k * (Math.cos(f0) * Math.sin(f) - Math.sin(f0) * Math.cos(f) * Math.cos(l));
    return [p.translate[0] + p.scale * x, p.translate[1] - p.scale * y];
  }
  if (p.kind === "local") {
    const m = localMetres(p.centre, p.radius, lon, lat);
    return m ? [p.translate[0] + m[0] / p.metresPerUnit, p.translate[1] - m[1] / p.metresPerUnit] : null;
  }
  return null;
}

/**
 * The longitude and latitude (in degrees) of a point on the map's canvas, as `[lon, lat]`; `null` where `projectPoint` is.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { projectPoint, unprojectPoint } from "@johnmorrisdotca/chizu";
 *
 * const [x, y] = projectPoint(WORLD, 2.35, 48.86)!;
 * console.log(unprojectPoint(WORLD, x, y)!.map((value) => value.toFixed(2)).join(", "));
 * // 2.35, 48.86
 * ```
 *
 * @param map - The native map or map fields required by this signature; coordinates and region codes belong to its canvas.
 * @param x - The horizontal native map coordinate.
 * @param y - The vertical native map coordinate.
 * @returns The [longitude, latitude] pair in degrees, or null when the map’s projection is not reversible here.
 */
export function unprojectPoint(map: Pick<ChizuMap, "projection">, x: number, y: number): [number, number] | null {
  const p = map.projection;
  if (p.kind === "miller") {
    const l = (x - p.translate[0]) / p.scale;
    const yy = (p.translate[1] - y) / p.scale;
    const f = 2.5 * Math.atan(Math.exp(0.8 * yy)) - 0.625 * Math.PI;
    return [wrapLongitude(p.centre + l / RAD), f / RAD];
  }
  if (p.kind === "azimuthal-equal-area") {
    const [lon0, lat0] = p.centre;
    const f0 = lat0 * RAD;
    const X = (x - p.translate[0]) / p.scale;
    const Y = (p.translate[1] - y) / p.scale;
    const rho = Math.hypot(X, Y);
    if (rho === 0) return [lon0, lat0];
    if (rho > 2) return null; // off the disc the projection covers
    const c = 2 * Math.asin(rho / 2);
    const f = Math.asin(Math.cos(c) * Math.sin(f0) + (Y * Math.sin(c) * Math.cos(f0)) / rho);
    const l = Math.atan2(X * Math.sin(c), rho * Math.cos(f0) * Math.cos(c) - Y * Math.sin(f0) * Math.sin(c));
    return [wrapLongitude(lon0 + l / RAD), f / RAD];
  }
  if (p.kind === "local") {
    const [lon, lat] = localLonLat(p.centre, p.radius, (x - p.translate[0]) * p.metresPerUnit, (p.translate[1] - y) * p.metresPerUnit);
    return [lon, lat];
  }
  return null;
}

/**
 * The rectifying radius of the WGS 84 ellipsoid, in metres: the radius of the sphere whose great circle is as long as
 * the ellipsoid's meridian. It is the scale of a transverse Mercator on this ellipsoid, and what a local map's
 * projection stores as `radius`.
 */
export const LOCAL_RADIUS = 6367449.14577;

// Krüger's series for the transverse Mercator on the WGS 84 ellipsoid (n is its third flattening), to the fourth order in n:
// exact to a few nanometres at 100 km and to a millimetre at 1,000 km from the centre.
const N3 = 0.0016792203863837;
const ALPHA = [N3 / 2 - (2 * N3 ** 2) / 3 + (5 * N3 ** 3) / 16 + (41 * N3 ** 4) / 180, (13 * N3 ** 2) / 48 - (3 * N3 ** 3) / 5 + (557 * N3 ** 4) / 1440, (61 * N3 ** 3) / 240 - (103 * N3 ** 4) / 140, (49561 * N3 ** 4) / 161280];
const BETA = [N3 / 2 - (2 * N3 ** 2) / 3 + (37 * N3 ** 3) / 96 - N3 ** 4 / 360, N3 ** 2 / 48 + N3 ** 3 / 15 - (437 * N3 ** 4) / 1440, (17 * N3 ** 3) / 480 - (37 * N3 ** 4) / 840, (4397 * N3 ** 4) / 161280];
const DELTA = [2 * N3 - (2 * N3 ** 2) / 3 - 2 * N3 ** 3 + (116 * N3 ** 4) / 45, (7 * N3 ** 2) / 3 - (8 * N3 ** 3) / 5 - (227 * N3 ** 4) / 45, (56 * N3 ** 3) / 15 - (136 * N3 ** 4) / 35, (4279 * N3 ** 4) / 630];
const E_CONF = (2 * Math.sqrt(N3)) / (1 + N3);

/** The conformal latitude's northing term ξ' and easting term η' of a point east of the central meridian by `dl` radians. */
function krueger(dl: number, f: number): [number, number] {
  const t = Math.sinh(Math.atanh(Math.sin(f)) - E_CONF * Math.atanh(E_CONF * Math.sin(f)));
  const xi = Math.atan2(t, Math.cos(dl));
  const eta = Math.atanh(Math.sin(dl) / Math.hypot(1, t));
  let x = xi;
  let y = eta;
  ALPHA.forEach((a, j) => {
    x += a * Math.sin(2 * (j + 1) * xi) * Math.cosh(2 * (j + 1) * eta);
    y += a * Math.cos(2 * (j + 1) * xi) * Math.sinh(2 * (j + 1) * eta);
  });
  return [x, y];
}

/**
 * The ground a longitude and latitude are, in metres east and north of a local map's centre (a transverse Mercator on the
 * WGS 84 ellipsoid, scale one on the central meridian: conformal, and true to the ellipsoid's metres to a millimetre
 * anywhere within hundreds of kilometres). Null where the projection cannot say, a quarter of the earth away.
 */
export function localMetres(centre: readonly [number, number], radius: number, lon: number, lat: number): [number, number] | null {
  const dl = ((((lon - centre[0] + 180) % 360) + 360) % 360 - 180) * RAD;
  if (Math.abs(dl) > 1.2 || Math.abs(lat) > 90) return null;
  const [xi, eta] = krueger(dl, lat * RAD);
  const [xi0] = krueger(0, centre[1] * RAD);
  return [radius * eta, radius * (xi - xi0)];
}

/** The longitude and latitude of the place east and north of the centre by these metres: the inverse of `localMetres`. */
export function localLonLat(centre: readonly [number, number], radius: number, east: number, north: number): [number, number] {
  const [xi0] = krueger(0, centre[1] * RAD);
  const xi = north / radius + xi0;
  const eta = east / radius;
  let xp = xi;
  let ep = eta;
  BETA.forEach((b, j) => {
    xp -= b * Math.sin(2 * (j + 1) * xi) * Math.cosh(2 * (j + 1) * eta);
    ep -= b * Math.cos(2 * (j + 1) * xi) * Math.sinh(2 * (j + 1) * eta);
  });
  const chi = Math.asin(Math.sin(xp) / Math.cosh(ep));
  let f = chi;
  DELTA.forEach((d, j) => {
    f += d * Math.sin(2 * (j + 1) * chi);
  });
  const l = Math.atan2(Math.sinh(ep), Math.cos(xp));
  return [((((centre[0] + l / RAD + 180) % 360) + 360) % 360) - 180, f / RAD];
}

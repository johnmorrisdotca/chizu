import type { ChizuMap } from "./types.ts";

/**
 * Where a place on the earth is on a map's canvas, and back: so that a member's home town, a photograph or a
 * battle can be pinned on the world map the regions are drawn on.
 *
 * A map keeps how its canvas was made (`projection`). Two are closed formulas and are done here with no dependency:
 * Miller's cylindrical projection round a centre longitude (the world), and a Lambert azimuthal equal-area
 * projection round a centre (a country alone). A map's regions (a country's provinces) were fitted with a projection
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
  return null;
}

/** The longitude and latitude (in degrees) of a point on the map's canvas, as `[lon, lat]`; `null` where `projectPoint` is. */
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
  return null;
}

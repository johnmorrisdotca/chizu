/**
 * The world as longitude and latitude in degrees: every country a GeoJSON feature (Natural Earth, 1:110m), with no
 * projection. For an orthographic globe or any spherical view, pair this with d3-geo's `geoOrthographic`; for a flat
 * map, use the projected `@johnmorrisdotca/chizu/world` instead. Its own entry, so the outlines load only on the page
 * that draws them.
 */

import worldGeo from "./data/world-geo.data.ts";

export { worldGeo as WORLD_GEO };
export default worldGeo;

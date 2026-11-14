/**
 * The world as longitude and latitude from the 1:50m outlines, for a globe zoomed in: the 177 countries of
 * `@johnmorrisdotca/chizu/world-geo` (the 1:110m world) with the same properties, and the 65 smaller countries and
 * territories that file leaves off, rounded to 0.01 degree and simplified with the borders between countries kept
 * identical. Its own entry, so it loads only on the page that draws it.
 */

import worldGeoDetail from "./data/world-geo-detail.data.ts";

export type { ChizuGeoCollection, ChizuGeoFeature, ChizuGeoProperties } from "./geo-types.ts";
export { worldGeoDetail as WORLD_GEO_DETAIL };
export default worldGeoDetail;

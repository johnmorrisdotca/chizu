/**
 * The world as longitude and latitude from the 1:50m outlines, for a globe zoomed in: the same 177 countries and
 * properties as `@johnmorrisdotca/chizu/world-geo` (which is the 1:110m world), rounded to 0.01 degree and simplified
 * with the borders between countries kept identical. Its own entry, so it loads only on the page that draws it.
 */

import worldGeoDetail from "./data/world-geo-detail.data.ts";

export type { ChizuGeoCollection, ChizuGeoFeature, ChizuGeoProperties } from "./geo-types.ts";
export { worldGeoDetail as WORLD_GEO_DETAIL };
export default worldGeoDetail;

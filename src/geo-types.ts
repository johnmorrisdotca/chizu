/**
 * The properties of one feature of a map in longitude and latitude: a region's `code` (the same as in the flat map of
 * the same country) and its ISO 3166-2 code, `iso`, where it has one, its names in English and Japanese; a country of
 * the world also has `iso3` and its larger part of the world, `group` and `groupJa`.
 *
 * @example
 * ```ts
 * import type { ChizuGeoProperties } from "@johnmorrisdotca/chizu/divisions-geo";
 *
 * const label = (p: ChizuGeoProperties): string => `${p.nameJa ?? p.name} (${p.code})`;
 * console.log(label({ code: "13", iso: "JP-13", name: "Tokyo", nameJa: "東京都" }));
 * // 東京都 (13)
 * ```
 */
export interface ChizuGeoProperties {
  code: string;
  iso?: string;
  name: string;
  nameJa?: string;
  iso3?: string;
  group?: string;
  groupJa?: string;
}

/**
 * One region or country as a GeoJSON feature, in WGS84 `[longitude, latitude]` degrees: a `Polygon` or `MultiPolygon`.
 *
 * @example
 * ```ts
 * import type { ChizuGeoFeature } from "@johnmorrisdotca/chizu/divisions-geo";
 *
 * const feature: ChizuGeoFeature = {
 *   type: "Feature",
 *   properties: { code: "A", name: "A square" },
 *   geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] },
 * };
 * console.log(feature.geometry.type, feature.geometry.coordinates[0].length);
 * // Polygon 4
 * ```
 */
export interface ChizuGeoFeature {
  type: "Feature";
  properties: ChizuGeoProperties;
  geometry: { type: "Polygon"; coordinates: number[][][] } | { type: "MultiPolygon"; coordinates: number[][][][] };
}

/**
 * A map as longitude and latitude: the regions of one country, or the countries of the world, as a GeoJSON
 * `FeatureCollection` with no projection. Rings are closed, the border two regions share is the same list of points in
 * both, and `source` says where the outlines are from and how they were simplified.
 *
 * @example
 * ```ts
 * import type { ChizuGeoCollection } from "@johnmorrisdotca/chizu/divisions-geo";
 *
 * const none: ChizuGeoCollection = { type: "FeatureCollection", features: [], source: "an empty map" };
 * console.log(none.features.length, none.source);
 * // 0 an empty map
 * ```
 */
export interface ChizuGeoCollection {
  type: "FeatureCollection";
  features: ChizuGeoFeature[];
  source: string;
}

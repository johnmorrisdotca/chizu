import { describe, expect, it } from "vitest";
import worldGeoDetail, { WORLD_GEO_DETAIL } from "./world-geo-detail-entry.ts";
import worldGeo from "./world-geo-entry.ts";

function eachPosition(coordinates: unknown, at: (position: number[]) => void): void {
  if (!Array.isArray(coordinates)) throw new Error("geometry coordinates are not nested arrays");
  if (typeof coordinates[0] === "number") {
    at(coordinates as number[]);
    return;
  }
  for (const part of coordinates) eachPosition(part, at);
}

describe("the world as longitude and latitude, finer", () => {
  it("has every country of the coarse world with the same properties, and the smaller ones the 1:50m outlines add, from the 1:50m outlines", () => {
    expect(WORLD_GEO_DETAIL).toBe(worldGeoDetail);
    expect(worldGeoDetail.features).toHaveLength(242);
    expect(new Set(worldGeoDetail.features.map((feature) => feature.properties.code)).size).toBe(242);
    expect(worldGeoDetail.source).toContain("1:50m");
    expect(worldGeoDetail.source).toContain("Natural Earth 5.1.2");
    const coarse = new Map(worldGeo.features.map((feature) => [feature.properties.code, feature.properties]));
    const fine = new Map(worldGeoDetail.features.map((feature) => [feature.properties.code, feature.properties]));
    for (const [code, properties] of coarse) expect(fine.get(code), code).toEqual(properties);
  });

  it("has more points than the coarse world, all in degrees, with closed rings", () => {
    const count = (collection: { features: { geometry: { coordinates: unknown } }[] }): number => {
      let n = 0;
      for (const feature of collection.features) eachPosition(feature.geometry.coordinates, () => (n += 1));
      return n;
    };
    expect(count(worldGeoDetail)).toBeGreaterThan(count(worldGeo) * 3);
    for (const feature of worldGeoDetail.features) {
      const polygons =
        feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
      for (const polygon of polygons as number[][][][])
        for (const ring of polygon) {
          expect(ring[0], feature.properties.code).toEqual(ring[ring.length - 1]);
          for (const [lon, lat] of ring)
            expect(Math.abs(lon!) <= 180 && Math.abs(lat!) <= 90, feature.properties.code).toBe(true);
        }
    }
  });
});

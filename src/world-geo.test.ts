import { geoArea, geoOrthographic, geoPath } from "d3-geo";
import { describe, expect, it } from "vitest";

import WORLD from "./data/world.data.ts";
import worldGeo from "./world-geo-entry.ts";

function eachPosition(coordinates: unknown, at: (position: number[]) => void): void {
  if (!Array.isArray(coordinates)) throw new Error("geometry coordinates are not nested arrays");
  if (typeof coordinates[0] === "number") {
    at(coordinates as number[]);
    return;
  }
  for (const part of coordinates) eachPosition(part, at);
}

describe("the world as longitude and latitude", () => {
  it("has all 177 Natural Earth 1:110m countries, with English and Japanese names", () => {
    expect(worldGeo.type).toBe("FeatureCollection");
    expect(worldGeo.features).toHaveLength(177);
    expect(new Set(worldGeo.features.map((feature) => feature.properties.code)).size).toBe(177);
    expect(worldGeo.source).toContain("Natural Earth 5.1.2");
    expect(worldGeo.source).toContain("1:110m");
    const japan = worldGeo.features.find((feature) => feature.properties.code === "JP");
    expect(japan?.properties).toMatchObject({ code: "JP", iso3: "JPN", name: "Japan", nameJa: "日本" });
  });

  it("is the flat world's 173 countries and the four it leaves out", () => {
    const flat = new Set(WORLD.regions.map((region) => region.code));
    const all = new Set(worldGeo.features.map((feature) => feature.properties.code));
    for (const code of flat) expect(all.has(code), code).toBe(true);
    expect([...all].filter((code) => !flat.has(code)).sort()).toEqual(["AQ", "CYN", "SOL", "TF"]);
  });

  it("keeps every outline as Polygon or MultiPolygon coordinates in degrees", () => {
    for (const feature of worldGeo.features) {
      expect(["Polygon", "MultiPolygon"], feature.properties.code).toContain(feature.geometry.type);
      eachPosition(feature.geometry.coordinates, ([lon, lat]) => {
        expect(lon, feature.properties.code).toBeGreaterThanOrEqual(-180);
        expect(lon, feature.properties.code).toBeLessThanOrEqual(180);
        expect(lat, feature.properties.code).toBeGreaterThanOrEqual(-90);
        expect(lat, feature.properties.code).toBeLessThanOrEqual(90);
      });
    }
  });

  it("closes every ring and keeps each outline the right way round, Antarctica to the pole", () => {
    for (const feature of worldGeo.features) {
      const polygons =
        feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
      for (const polygon of polygons as number[][][][])
        for (const ring of polygon) expect(ring[0], feature.properties.code).toEqual(ring[ring.length - 1]);
      expect(geoArea(feature as never), feature.properties.code).toBeLessThan(2 * Math.PI);
    }
    const antarctica = worldGeo.features.find((feature) => feature.properties.code === "AQ")!;
    expect(geoArea(antarctica as never)).toBeGreaterThan(0.2);
  });

  it("draws Japan on an orthographic globe with d3-geo", () => {
    const japan = worldGeo.features.find((feature) => feature.properties.code === "JP")!;
    const path = geoPath(geoOrthographic().rotate([-139.7, -35.7]))(japan as never);
    expect(path).toMatch(/^M/);
  });
});

import { geoOrthographic, geoPath } from "d3-geo";
import { describe, expect, it } from "vitest";

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
  it("has the same 173 country identities, with English and Japanese names", () => {
    expect(worldGeo.type).toBe("FeatureCollection");
    expect(worldGeo.features).toHaveLength(173);
    expect(new Set(worldGeo.features.map((feature) => feature.properties.code)).size).toBe(173);
    expect(worldGeo.source).toContain("Natural Earth 5.1.2");
    expect(worldGeo.source).toContain("1:110m");
    const japan = worldGeo.features.find((feature) => feature.properties.code === "JP");
    expect(japan?.properties).toMatchObject({ code: "JP", iso3: "JPN", name: "Japan", nameJa: "日本" });
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

  it("draws Japan on an orthographic globe with d3-geo", () => {
    const japan = worldGeo.features.find((feature) => feature.properties.code === "JP")!;
    const path = geoPath(geoOrthographic().rotate([-139.7, -35.7]))(japan as never);
    expect(path).toMatch(/^M/);
  });
});

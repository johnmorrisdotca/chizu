import { describe, expect, it } from "vitest";
import { focusBox, regionBox } from "./frame.ts";
import { PAIRS, vincenty } from "./local.fixture.ts";
import { groundDistance, localConvergence } from "./local.ts";
import { localMap } from "./localMap.ts";
import { projectPoint, unprojectPoint } from "./project.ts";

describe("the local projection", () => {
  it("is within 0.5% of the ellipsoid's geodesic between two places up to 50 km apart, whichever way they lie", () => {
    for (const pair of PAIRS) {
      const map = localMap({ centre: pair.centre, widthMetres: pair.widthMetres, metresPerUnit: 1 });
      const p = projectPoint(map, pair.a[0], pair.a[1])!;
      const q = projectPoint(map, pair.b[0], pair.b[1])!;
      const onCanvas = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const truth = vincenty(pair.a, pair.b);
      expect(Math.abs(onCanvas - truth) / truth, pair.where).toBeLessThan(0.005);
      expect(Math.abs(onCanvas - truth) / truth, pair.where).toBeLessThan(0.0002);
      expect(Math.abs(groundDistance(pair.a, pair.b) - truth) / truth, pair.where).toBeLessThan(0.005);
    }
  });

  it("is within 0.01% inside 5 km of the centre, which is the size of a venue and its streets", () => {
    for (const lat of [0, 35.7, 51.5, 60, 69.6, -33.9]) {
      const centre: [number, number] = [10, lat];
      const map = localMap({ centre, widthMetres: 10_000, metresPerUnit: 1 });
      for (const [dx, dy] of [
        [0.04, 0],
        [0, 0.04],
        [0.03, 0.03],
        [-0.04, 0.02],
      ] as const) {
        const a = centre;
        const b: [number, number] = [centre[0] + dx, centre[1] + dy];
        const p = projectPoint(map, a[0], a[1])!;
        const q = projectPoint(map, b[0], b[1])!;
        const truth = vincenty(a, b);
        expect(Math.abs(Math.hypot(q[0] - p[0], q[1] - p[1]) - truth) / truth, `${lat} ${dx} ${dy}`).toBeLessThan(
          0.0001,
        );
      }
    }
  });

  it("puts the centre in the middle of the canvas, north up and east right, and states how many metres a unit is", () => {
    const map = localMap({ centre: [139.7, 35.7], widthMetres: 800, heightMetres: 400 });
    expect(map.projection).toMatchObject({ kind: "local", metresPerUnit: 0.8, translate: [500, 250] });
    expect(map.viewBox).toBe("0 0 1000 500");
    expect(projectPoint(map, 139.7, 35.7)).toEqual([500, 250]);
    const north = projectPoint(map, 139.7, 35.701)!;
    const east = projectPoint(map, 139.701, 35.7)!;
    expect(north[1]).toBeLessThan(250);
    expect(Math.abs(north[0] - 500)).toBeLessThan(1e-9);
    expect(east[0]).toBeGreaterThan(500);
    // The grid bends away from a straight east: 90 m along it, by a part of a millimetre.
    expect(Math.abs(east[1] - 250)).toBeLessThan(0.01);
  });

  it("gives back the longitude and latitude it was given, to a hundred-millionth of a degree, a long way from the centre too", () => {
    const map = localMap({ centre: [-0.2795, 51.556], widthMetres: 3000, metresPerUnit: 1 });
    for (const [lon, lat] of [
      [-0.2795, 51.556],
      [-0.25, 51.57],
      [-0.3, 51.54],
      [-0.16, 51.6],
      [-0.4, 51.5],
    ] as const) {
      const [x, y] = projectPoint(map, lon, lat)!;
      const [lon2, lat2] = unprojectPoint(map, x, y)!;
      expect(Math.abs(lon2 - lon)).toBeLessThan(1e-8);
      expect(Math.abs(lat2 - lat)).toBeLessThan(1e-8);
    }
  });

  it("refuses a canvas that is not one, and a centre that is not a place", () => {
    expect(() => localMap({ centre: [0, 0], widthMetres: 0 })).toThrow(RangeError);
    expect(() => localMap({ centre: [0, 0], widthMetres: 100, heightMetres: -1 })).toThrow(RangeError);
    expect(() => localMap({ centre: [0, 95], widthMetres: 100 })).toThrow(RangeError);
    expect(() => localMap({ centre: [0, 0], widthMetres: 100, metresPerUnit: 0 })).toThrow(RangeError);
  });

  it("knows how far the grid is turned from true north: none on the central meridian, more further east and further north", () => {
    const centre: [number, number] = [10, 60];
    expect(localConvergence(centre, 10, 60.1)).toBe(0);
    const near = localConvergence(centre, 10.1, 60);
    expect(near).toBeGreaterThan(0.08);
    expect(near).toBeLessThan(0.09);
    expect(localConvergence(centre, 9.9, 60)).toBeCloseTo(-near, 12);
    expect(localConvergence(centre, 10.1, 70)).toBeGreaterThan(near);
  });
});

describe("GeoJSON on the canvas", () => {
  const ring = (lon: number, lat: number, dx: number, dy: number) => [
    [lon, lat],
    [lon + dx, lat],
    [lon + dx, lat + dy],
    [lon, lat + dy],
    [lon, lat],
  ];
  const centre: [number, number] = [139.7, 35.7];

  it("turns a polygon into a path that comes back to its own longitudes and latitudes", () => {
    const coordinates = ring(139.699, 35.699, 0.002, 0.0015);
    const map = localMap({
      centre,
      widthMetres: 500,
      data: { type: "Feature", id: "yard", geometry: { type: "Polygon", coordinates: [coordinates] } },
    });
    const [shape] = map.shapes;
    expect(shape).toMatchObject({ id: "yard", kind: "area" });
    const numbers = shape!.path.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    const corners: Array<[number, number]> = [];
    for (let i = 0; i < numbers.length; i += 2) corners.push([numbers[i]!, numbers[i + 1]!]);
    expect(corners).toHaveLength(4);
    corners.forEach(([x, y], i) => {
      const [lon, lat] = unprojectPoint(map, x, y)!;
      // The path is written to a thousandth of a unit, half a millimetre here.
      expect(Math.abs(lon - coordinates[i]![0]!)).toBeLessThan(1e-7);
      expect(Math.abs(lat - coordinates[i]![1]!)).toBeLessThan(1e-7);
    });
    // The same shape is a region, so the engine's framing and callouts take it.
    expect(map.regions.map((region) => region.code)).toEqual(["yard"]);
    expect(map.regions[0]!.bbox).toEqual(shape!.bbox);
    const box = focusBox(map, ["yard"]);
    expect(box.width).toBeGreaterThan(0);
    expect(regionBox(map, "yard").width).toBeGreaterThan(0);
  });

  it("keeps a hole as a second ring, a MultiPolygon as pieces, lines open and points as points", () => {
    const outer = ring(139.698, 35.698, 0.004, 0.004);
    const hole = ring(139.699, 35.699, 0.002, 0.002);
    const map = localMap({
      centre,
      widthMetres: 800,
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            id: "ring",
            properties: { name: "Ring" },
            geometry: { type: "Polygon", coordinates: [outer, hole] },
          },
          {
            type: "Feature",
            id: "two",
            geometry: {
              type: "MultiPolygon",
              coordinates: [[ring(139.7, 35.7, 0.0005, 0.0005)], [ring(139.701, 35.701, 0.0005, 0.0005)]],
            },
          },
          {
            type: "Feature",
            id: "lane",
            geometry: {
              type: "LineString",
              coordinates: [
                [139.698, 35.7],
                [139.7, 35.7005],
                [139.702, 35.7],
              ],
            },
          },
          {
            type: "Feature",
            id: "gates",
            geometry: {
              type: "MultiPoint",
              coordinates: [
                [139.699, 35.699],
                [139.701, 35.701],
              ],
            },
          },
          { type: "Feature", id: "mark", geometry: { type: "Point", coordinates: [139.7, 35.7, 12] } },
        ],
      },
    });
    const byId = Object.fromEntries(map.shapes.map((shape) => [shape.id, shape]));
    expect(byId.ring!.path.match(/M/g)).toHaveLength(2);
    expect(byId.ring!.path.match(/Z/g)).toHaveLength(2);
    expect(byId.two!.path.match(/M/g)).toHaveLength(2);
    expect(byId.lane).toMatchObject({ kind: "line" });
    expect(byId.lane!.path.includes("Z")).toBe(false);
    expect(byId.lane!.centroid[0]).toBeCloseTo(500, 0);
    expect(byId.gates).toMatchObject({ kind: "point", path: "" });
    expect(byId.mark!.centroid).toEqual([500, 500]);
    expect(map.regions.map((region) => region.code)).toEqual(["ring", "two"]);
    expect(map.problems).toEqual([]);
  });

  it("reads a bare geometry, a list, a GeometryCollection and numbers what has no id, in the order given", () => {
    const map = localMap({
      centre,
      widthMetres: 500,
      data: [
        { type: "Point", coordinates: [139.7, 35.7] },
        {
          type: "Feature",
          properties: { id: "named" },
          geometry: {
            type: "GeometryCollection",
            geometries: [
              { type: "Point", coordinates: [139.7, 35.7] },
              {
                type: "LineString",
                coordinates: [
                  [139.699, 35.7],
                  [139.701, 35.7],
                ],
              },
            ],
          },
        },
        { type: "Feature", id: 7, geometry: { type: "Point", coordinates: [139.7, 35.7] } },
        { type: "Feature", id: 7, geometry: { type: "Point", coordinates: [139.701, 35.7] } },
      ],
    });
    expect(map.shapes.map((shape) => shape.id)).toEqual(["f1", "named.1", "named.2", "7", "7-5"]);
  });

  it("leaves out what cannot be drawn, and says so rather than guessing", () => {
    const map = localMap({
      centre,
      widthMetres: 500,
      data: [
        {
          type: "Feature",
          id: "flat",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [139.7, 35.7],
                [139.7, 35.7],
                [139.7, 35.7],
                [139.7, 35.7],
              ],
            ],
          },
        },
        { type: "Feature", id: "stub", geometry: { type: "LineString", coordinates: [[139.7, 35.7]] } },
        { type: "Feature", id: "far", geometry: { type: "Point", coordinates: [139.7, 135] } },
        { type: "Feature", id: "none", geometry: null },
        { type: "Topology" },
        { type: "Feature", id: "fine", geometry: { type: "Point", coordinates: [139.7, 35.7] } },
      ],
    });
    expect(map.shapes.map((shape) => shape.id)).toEqual(["fine"]);
    expect(map.problems).toHaveLength(5);
    expect(map.problems.join("\n")).toMatch(/flat[\s\S]*stub[\s\S]*far[\s\S]*none[\s\S]*Topology/);
  });

  it("takes the name, the Japanese name, the kind and the classes from the properties, and only safe words", () => {
    const map = localMap({
      centre,
      widthMetres: 500,
      data: {
        type: "Feature",
        id: "a",
        properties: { name: " Hall ", "name:ja": "ホール", kind: "Building", class: 'stand north bad"class <x>' },
        geometry: { type: "Point", coordinates: [139.7, 35.7] },
      },
    });
    expect(map.shapes[0]).toMatchObject({
      name: "Hall",
      nameJa: "ホール",
      type: "building",
      classes: ["stand", "north"],
    });
  });
});

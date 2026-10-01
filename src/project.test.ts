import { geoAzimuthalEqualArea, geoProjection } from "d3-geo";
import { describe, expect, it } from "vitest";

import { COUNTRY_LOADERS } from "./data/loaders.ts";
import world from "./data/world.ts";
import { mapOutlines, pointInRing } from "./outlines.ts";
import { projectPoint, unprojectPoint } from "./project.ts";
import { seededRandom } from "./random.ts";
import type { ChizuMap } from "./types.ts";

/** Miller's cylindrical projection as the build writes it: the formula d3-geo-projection has, which is the one the data was made with. */
function millerRaw(lambda: number, phi: number): [number, number] {
  return [lambda, 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * phi))];
}

const points = (count: number, seed: number, latMost = 80): Array<[number, number]> => {
  const random = seededRandom(seed);
  return Array.from({ length: count }, () => [random() * 358 - 179, (random() * 2 - 1) * latMost] as [number, number]);
};

describe("a longitude and latitude on the world", () => {
  const p = world.projection;
  if (p.kind !== "miller") throw new Error("the world is drawn in Miller's projection");
  const reference = geoProjection(millerRaw).scale(p.scale).translate(p.translate).rotate([-p.centre, 0]);

  it("is where d3-geo's own projection puts it, to a hundredth of a unit, over a thousand points", () => {
    for (const [lon, lat] of points(1000, 1)) {
      const mine = projectPoint(world, lon, lat)!;
      const theirs = reference([lon, lat])!;
      expect(mine[0], `${lon},${lat}`).toBeCloseTo(theirs[0], 2);
      expect(mine[1], `${lon},${lat}`).toBeCloseTo(theirs[1], 2);
    }
  });

  it("puts the centre longitude in the middle of the canvas", () => {
    expect(projectPoint(world, 155, 0)![0]).toBeCloseTo(world.width / 2, 6);
  });

  it("is invertible", () => {
    for (const [lon, lat] of points(200, 2)) {
      const back = unprojectPoint(world, ...projectPoint(world, lon, lat)!)!;
      expect(back[0]).toBeCloseTo(lon, 6);
      expect(back[1]).toBeCloseTo(lat, 6);
    }
  });

  it("puts a town inside the country it is in", () => {
    const outlines = mapOutlines(world);
    const inside = (code: string, lon: number, lat: number) => {
      const at = world.regions.findIndex((region) => region.code === code);
      const [x, y] = projectPoint(world, lon, lat)!;
      return outlines[at]!.rings.some((ring) => pointInRing(x, y, ring));
    };
    expect(inside("JP", 139.69, 35.69)).toBe(true); // Tokyo
    expect(inside("CA", -79.38, 43.65)).toBe(true); // Toronto
    expect(inside("BR", -46.63, -23.55)).toBe(true); // São Paulo
    expect(inside("AU", 151.21, -33.87)).toBe(true); // Sydney
    expect(inside("FR", 2.35, 48.86)).toBe(true); // Paris
    expect(inside("DE", 2.35, 48.86)).toBe(false); // and not in Germany
  });

  it("puts a place just east of the seam at the far left and just west of it at the far right", () => {
    const seam = p.centre - 180;
    expect(projectPoint(world, seam + 1, 0)![0]).toBeLessThan(world.width * 0.01);
    expect(projectPoint(world, seam - 1, 0)![0]).toBeGreaterThan(world.width * 0.99);
  });
});

describe("a longitude and latitude on a country alone", () => {
  it("is where d3-geo's own projection puts it, for a dozen countries", async () => {
    for (const code of ["jp", "fr", "us", "ru", "cl", "nz", "no", "au", "br", "eg", "in", "sg"]) {
      const map = (await COUNTRY_LOADERS[code]!()).default as ChizuMap;
      const p = map.projection;
      if (p.kind !== "azimuthal-equal-area") throw new Error(code);
      const reference = geoAzimuthalEqualArea().rotate([-p.centre[0], -p.centre[1]]).scale(p.scale).translate(p.translate);
      for (const [lon, lat] of points(60, 3, 85)) {
        const theirs = reference([lon, lat]);
        if (!theirs) continue;
        const mine = projectPoint(map, lon, lat);
        if (mine === null) continue;
        expect(mine[0], `${code} ${lon},${lat}`).toBeCloseTo(theirs[0], 2);
        expect(mine[1], `${code} ${lon},${lat}`).toBeCloseTo(theirs[1], 2);
      }
    }
  });

  it("puts the country's own towns inside its drawn outline, and brings them back", async () => {
    const jp = (await COUNTRY_LOADERS.jp!()).default;
    const [x, y] = projectPoint(jp, 135.5, 34.69)!; // Osaka
    expect(mapOutlines(jp)[0]!.rings.some((ring) => pointInRing(x, y, ring))).toBe(true);
    const back = unprojectPoint(jp, x, y)!;
    expect(back[0]).toBeCloseTo(135.5, 6);
    expect(back[1]).toBeCloseTo(34.69, 6);
  });

  it("is invertible everywhere the projection covers", async () => {
    const nz = (await COUNTRY_LOADERS.nz!()).default;
    for (const [lon, lat] of points(100, 4, 60)) {
      const there = projectPoint(nz, lon, lat);
      if (there === null) continue;
      const back = unprojectPoint(nz, there[0], there[1]);
      if (back === null) continue;
      expect(back[0]).toBeCloseTo(lon, 5);
      expect(back[1]).toBeCloseTo(lat, 5);
    }
  });
});

describe("a map fitted with a projection that is not a closed formula here", () => {
  it("answers null and never a guess", async () => {
    const { default: de } = await import("./data/divisions/de.ts");
    expect(de.projection.kind).toBe("other");
    expect(projectPoint(de, 10, 51)).toBeNull();
    expect(unprojectPoint(de, 500, 500)).toBeNull();
  });
});

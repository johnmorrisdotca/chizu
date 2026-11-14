import { describe, expect, it } from "vitest";

import { DIVISIONS_LOADERS } from "./data/loaders.data.ts";
import { DIVISIONS_GEO_CODES, loadDivisionsGeo } from "./divisions-geo-entry.ts";

function eachPosition(coordinates: unknown, at: (position: number[]) => void): void {
  if (!Array.isArray(coordinates)) throw new Error("geometry coordinates are not nested arrays");
  if (typeof coordinates[0] === "number") {
    at(coordinates as number[]);
    return;
  }
  for (const part of coordinates) eachPosition(part, at);
}

/**
 * The most points of one region that lie on the middle of an edge of another region without being a point of it, in each
 * country's file. A border simplified on one side only leaves such points (a simplifying that does not share its borders
 * makes hundreds in a country). Natural Earth has a few of its own: these are the counts it has, rounded to the grid and
 * before any simplifying, and a border simplified away takes them with it, so a country may have fewer. Spain's one is
 * a coincidence of the grid: a coast point of A Coruña lies exactly half way along an edge of Pontevedra's, at an inlet.
 */
const MOST: Record<string, number> = {
  AR: 6,
  BR: 3,
  CA: 4,
  CH: 1,
  CO: 8,
  DE: 9,
  ES: 1,
  GB: 10,
  IE: 4,
  IT: 6,
  MX: 6,
  PE: 2,
  PH: 4,
  RU: 4,
  SE: 2,
  TH: 6,
  US: 1,
};

describe("the regions as longitude and latitude", () => {
  it("has the 32 countries that have regions, and says nothing of one that has none", async () => {
    expect(DIVISIONS_GEO_CODES).toEqual(Object.keys(DIVISIONS_LOADERS).map((code) => code.toUpperCase()));
    expect(DIVISIONS_GEO_CODES).toHaveLength(32);
    expect(await loadDivisionsGeo("xx")).toBeNull();
  });

  for (const code of DIVISIONS_GEO_CODES) {
    describe(code, () => {
      it("has the flat map's regions, with its codes, names and ISO codes", async () => {
        const flat = (await DIVISIONS_LOADERS[code.toLowerCase()]!()).default;
        const geo = (await loadDivisionsGeo(code.toLowerCase()))!;
        expect(geo.type).toBe("FeatureCollection");
        expect(geo.source).toContain("Natural Earth 5.1.2");
        expect(geo.features.map((feature) => feature.properties.code)).toEqual(
          flat.regions.map((region) => region.code),
        );
        for (const [index, feature] of geo.features.entries()) {
          const region = flat.regions[index]!;
          expect(feature.properties, region.code).toEqual({
            code: region.code,
            ...(region.iso ? { iso: region.iso } : {}),
            name: region.name,
            ...(region.nameJa ? { nameJa: region.nameJa } : {}),
          });
        }
      });

      it("keeps every outline as closed Polygon or MultiPolygon rings in degrees, none empty or not a number", async () => {
        const geo = (await loadDivisionsGeo(code))!;
        for (const feature of geo.features) {
          const where = feature.properties.code;
          expect(["Polygon", "MultiPolygon"], where).toContain(feature.geometry.type);
          let points = 0;
          eachPosition(feature.geometry.coordinates, ([lon, lat]) => {
            points += 1;
            expect(Number.isFinite(lon) && Number.isFinite(lat), where).toBe(true);
            expect(Math.abs(lon!) <= 180 && Math.abs(lat!) <= 90, where).toBe(true);
          });
          expect(points, where).toBeGreaterThanOrEqual(4);
          const polygons =
            feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
          for (const polygon of polygons as number[][][][])
            for (const ring of polygon) {
              expect(ring.length, where).toBeGreaterThanOrEqual(4);
              expect(ring[0], where).toEqual(ring[ring.length - 1]);
            }
        }
      });

      it("keeps the border two regions share as the same line in both: no point of one lies on the middle of an edge of another", async () => {
        const geo = (await loadDivisionsGeo(code))!;
        const key = (x: number, y: number): string => `${Math.floor(x / 0.5)},${Math.floor(y / 0.5)}`;
        const rings = geo.features.map(
          (feature) =>
            (feature.geometry.type === "Polygon"
              ? [feature.geometry.coordinates]
              : feature.geometry.coordinates
            ).flat() as number[][][],
        );
        const segments = new Map<string, { f: number; a: number[]; b: number[] }[]>();
        const owned = new Set<string>();
        rings.forEach((own, f) => {
          for (const ring of own)
            for (let i = 0; i + 1 < ring.length; i += 1) {
              const a = ring[i]!;
              const b = ring[i + 1]!;
              owned.add(`${f}:${a[0]},${a[1]}`);
              for (
                let cx = Math.floor(Math.min(a[0]!, b[0]!) / 0.5);
                cx <= Math.floor(Math.max(a[0]!, b[0]!) / 0.5);
                cx += 1
              )
                for (
                  let cy = Math.floor(Math.min(a[1]!, b[1]!) / 0.5);
                  cy <= Math.floor(Math.max(a[1]!, b[1]!) / 0.5);
                  cy += 1
                ) {
                  const k = `${cx},${cy}`;
                  const list = segments.get(k) ?? [];
                  list.push({ f, a, b });
                  segments.set(k, list);
                }
            }
        });
        let found = 0;
        rings.forEach((own, f) => {
          for (const ring of own)
            for (let i = 0; i + 1 < ring.length; i += 1) {
              const p = ring[i]!;
              for (const s of segments.get(key(p[0]!, p[1]!)) ?? []) {
                if (s.f === f || owned.has(`${s.f}:${p[0]},${p[1]}`)) continue;
                const dx = s.b[0]! - s.a[0]!;
                const dy = s.b[1]! - s.a[1]!;
                const length = Math.hypot(dx, dy);
                if (length === 0 || Math.abs((p[0]! - s.a[0]!) * dy - (p[1]! - s.a[1]!) * dx) / length > 1e-7) continue;
                const along = ((p[0]! - s.a[0]!) * dx + (p[1]! - s.a[1]!) * dy) / (length * length);
                if (along > 0 && along < 1) {
                  found += 1;
                  break;
                }
              }
            }
        });
        expect(found).toBeLessThanOrEqual(MOST[code] ?? 0);
      });
    });
  }
});

import { describe, expect, it } from "vitest";

// @ts-expect-error the generator is plain JavaScript
import { simplifyShared } from "../scripts/build-data/geo.mjs";

type Geometry = { type: "Polygon"; coordinates: number[][][] } | { type: "MultiPolygon"; coordinates: number[][][][] };
type Feature = { geometry: Geometry };

// two regions side by side that share the line x = 1, drawn as a wiggle of 0.01 degree (about 1.1 km) up it
const border = Array.from({ length: 9 }, (_, i) => [i % 2 === 0 ? 1.01 : 0.99, (i + 1) / 10]);
const left: Feature = {
  geometry: { type: "Polygon", coordinates: [[[0, 0], [1, 0], ...border, [1, 1], [0, 1], [0, 0]]] },
};
const right: Feature = {
  geometry: { type: "Polygon", coordinates: [[[1, 0], [2, 0], [2, 1], [1, 1], ...[...border].reverse(), [1, 0]]] },
};
const points = (geometry: unknown): string[] =>
  (geometry as { coordinates: number[][][] }).coordinates[0]!.map((p) => `${p}`);
const onBorder = (list: string[]): string[] =>
  list.filter((p) => p.startsWith("1.01,") || p.startsWith("0.99,")).sort();

describe("simplifying regions that share borders", () => {
  it("keeps the points of a shared border the same in both regions, whatever the tolerance", () => {
    for (const toleranceKm of [0, 0.3, 0.9, 1.5, 5]) {
      const { geometries } = simplifyShared([left, right], { toleranceKm, precision: 2 });
      expect(onBorder(points(geometries[1])), `${toleranceKm} km`).toEqual(onBorder(points(geometries[0])));
    }
    // and with no tolerance the wiggle is all there, with a large one it is gone from both
    expect(
      onBorder(points(simplifyShared([left, right], { toleranceKm: 0, precision: 2 }).geometries[0])),
    ).toHaveLength(9);
    expect(
      onBorder(points(simplifyShared([left, right], { toleranceKm: 5, precision: 2 }).geometries[0])),
    ).toHaveLength(0);
  });

  it("drops points only within the tolerance: a bigger tolerance leaves fewer points and none lies further than it from the line kept", () => {
    const small = simplifyShared([left, right], { toleranceKm: 0.1, precision: 2 });
    const big = simplifyShared([left, right], { toleranceKm: 6, precision: 2 });
    expect(big.stats.after).toBeLessThan(small.stats.after);
    expect(small.stats.worstKm).toBeLessThanOrEqual(0.1 + 1e-9);
    expect(big.stats.worstKm).toBeLessThanOrEqual(6 + 1e-9);
    expect(big.stats.worstKm, "the wiggle was about 1.1 km").toBeGreaterThan(0.5);
  });

  it("rounds to the grid, leaves out a small ring when asked and keeps the largest piece of a feature whole", () => {
    const island: number[][][] = [
      [
        [5, 5],
        [5.02, 5],
        [5.02, 5.02],
        [5, 5.02],
        [5, 5],
      ],
    ];
    const main: number[][][] = [
      [
        [0, 0],
        [1.004, 0],
        [1.004, 1],
        [0, 1],
        [0, 0],
      ],
    ];
    const both: Feature = { geometry: { type: "MultiPolygon", coordinates: [main, island] } };
    const alone: Feature = { geometry: { type: "Polygon", coordinates: island } };
    const result = simplifyShared([both, alone], { toleranceKm: 0, precision: 2, minRingKm2: 100 });
    expect(result.stats.droppedRings, "the island of the first feature").toBe(1);
    // with the island gone what is left of the first is one Polygon, its corner rounded from 1.004 to 1
    expect(result.geometries[0]!.type).toBe("Polygon");
    expect((result.geometries[0] as { coordinates: number[][][] }).coordinates[0]).toContainEqual([1, 0]);
    expect(result.geometries[1]!.type, "a feature's largest piece is never left out").toBe("Polygon");
  });

  it("takes the spike out of an outline, so a point one region has and the next does not cannot make two borders of one", () => {
    // the left region's border has a spike (it goes out to (1.02, 0.5) and back along itself), the right one's does not
    const spiked: Feature = {
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 0.5],
            [1.02, 0.5],
            [1, 0.5],
            [1, 1],
            [0, 1],
            [0, 0],
          ],
        ],
      },
    };
    const plain: Feature = {
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [1, 0],
            [2, 0],
            [2, 1],
            [1, 1],
            [1, 0.5],
            [1, 0],
          ],
        ],
      },
    };
    const { geometries, stats } = simplifyShared([spiked, plain], { toleranceKm: 0, precision: 2 });
    expect(points(geometries[0])).not.toContain("1.02,0.5");
    expect(stats.notShared.after).toBeLessThanOrEqual(stats.notShared.before);
  });

  it("refuses a feature that comes out with no outline, and an outline that has edges its neighbour does not share more than it had", () => {
    const speck: Feature = {
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [5, 5],
            [5.001, 5],
            [5.001, 5.001],
            [5, 5],
          ],
        ],
      },
    };
    expect(() => simplifyShared([speck], { toleranceKm: 0, precision: 2 })).toThrow(/no outline/);
    const result = simplifyShared([left, right], { toleranceKm: 0.5, precision: 2 });
    expect(result.stats.notShared).toEqual({ before: 0, after: 0 });
  });
});

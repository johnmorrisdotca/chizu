import { describe, expect, it } from "vitest";
import WORLD from "./data/world.data.ts";
import { loadCountry, loadWorldDetail } from "./load-entry.ts";
import { projectPoint } from "./project.ts";
import { parseMapRings, pointInRing } from "./ringGeometry.ts";
import type { ChizuMap } from "./types.ts";

/** Whether a longitude and latitude is on the land of a region of a map drawn on the world's canvas. */
const on = (map: ChizuMap, code: string, lon: number, lat: number) => {
  const [x, y] = projectPoint(map, lon, lat)!;
  return parseMapRings(map.regions.find((region) => region.code === code)!.path).some((ring) =>
    pointInRing(x, y, ring),
  );
};

describe("Somaliland and the north of Cyprus (MODULES-1872)", () => {
  it("are drawn inside Somalia and Cyprus on the world, the finer world and each country's own map, with no hole", async () => {
    // Hargeisa and Berbera are Somaliland's; the Mesaoria plain and Famagusta are in the north of Cyprus
    for (const map of [WORLD as ChizuMap, await loadWorldDetail()]) {
      expect(on(map, "SO", 44.06, 9.56), `${map.id} Hargeisa`).toBe(true);
      expect(on(map, "SO", 45.0, 10.44), `${map.id} Berbera`).toBe(true);
      expect(on(map, "CY", 33.5, 35.25), `${map.id} the Mesaoria plain`).toBe(true);
      expect(on(map, "CY", 33.94, 35.12), `${map.id} Famagusta`).toBe(true);
    }
    for (const [code, lon, lat] of [
      ["so", 44.06, 9.56],
      ["cy", 33.5, 35.25],
    ] as const) {
      const alone = (await loadCountry(code))!;
      const [x, y] = projectPoint(alone, lon, lat)!;
      expect(
        parseMapRings(alone.regions[0]!.path).some((ring) => pointInRing(x, y, ring)),
        code,
      ).toBe(true);
    }
  });

  it("are still not countries of their own on any map", async () => {
    expect(WORLD.regions.some((region) => ["SOL", "CYN"].includes(region.code))).toBe(false);
    expect(await loadCountry("sol")).toBeNull();
    expect(await loadCountry("cyn")).toBeNull();
  });
});

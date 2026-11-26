import { describe, expect, it } from "vitest";
import { insetFor } from "./insets.ts";
import { DIVISIONS_CODES, loadCountry, loadDivisions } from "./load-entry.ts";

describe("the United States Minor Outlying Islands as nine places in nine boxes", () => {
  it("are a map beside the countries' regions, with a region for each place of ISO 3166-2:UM", async () => {
    const map = (await loadDivisions("um-islands"))!;
    expect(DIVISIONS_CODES).toContain("UM-ISLANDS");
    expect(map.id).toBe("divisions-um-islands");
    expect(map.regions.map((region) => region.iso)).toEqual([
      "UM-67",
      "UM-71",
      "UM-76",
      "UM-79",
      "UM-81",
      "UM-84",
      "UM-86",
      "UM-89",
      "UM-95",
    ]);
    expect(map.regions.map((region) => region.nameJa)).toEqual([
      "ジョンストン島",
      "ミッドウェー島",
      "ナヴァッサ島",
      "ウェーク島",
      "ベーカー島",
      "ハウランド島",
      "ジャーヴィス島",
      "キングマン・リーフ",
      "パルミラ環礁",
    ]);
    expect(map.regions.every((region) => region.path.startsWith("M") && region.type === "territory")).toBe(true);
  });

  it("draw every place, including the six that the country's own map leaves out", async () => {
    const map = (await loadDivisions("um-islands"))!;
    const alone = (await loadCountry("um"))!;
    // Palmyra, Kingman and Jarvis are on the country's own map; Midway, Johnston, Wake, Baker, Howland and Navassa are not
    expect(alone.regions[0]!.path.split("M").length - 1).toBeLessThan(13);
    expect(map.regions).toHaveLength(9);
    expect(map.regions.every((region) => region.bbox[2] > region.bbox[0] && region.bbox[3] > region.bbox[1])).toBe(
      true,
    );
  });

  it("put each region in a box of its own on the canvas, the boxes apart and the region inside its box", async () => {
    const map = (await loadDivisions("um-islands"))!;
    expect(map.insets).toHaveLength(9);
    for (const region of map.regions) {
      const box = insetFor(map, region.code)!.box;
      expect(box.x, region.code).toBeGreaterThanOrEqual(0);
      expect(box.y, region.code).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, region.code).toBeLessThanOrEqual(map.width);
      expect(box.y + box.height, region.code).toBeLessThanOrEqual(map.height);
      expect(region.bbox[0], region.code).toBeGreaterThanOrEqual(box.x);
      expect(region.bbox[2], region.code).toBeLessThanOrEqual(box.x + box.width);
      expect(region.bbox[1], region.code).toBeGreaterThanOrEqual(box.y);
      expect(region.bbox[3], region.code).toBeLessThanOrEqual(box.y + box.height);
    }
    for (const a of map.insets)
      for (const b of map.insets) {
        if (a === b) continue;
        const apart =
          a.box.x + a.box.width <= b.box.x ||
          b.box.x + b.box.width <= a.box.x ||
          a.box.y + a.box.height <= b.box.y ||
          b.box.y + b.box.height <= a.box.y;
        expect(apart, `${a.code} and ${b.code}`).toBe(true);
      }
  });
});

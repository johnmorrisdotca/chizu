import { describe, expect, it } from "vitest";
import WORLD from "./data/world.data.ts";
import WORLD_1990 from "./data/world-1990.data.ts";
import { projectPoint } from "./project.ts";
import type { ChizuMap, ChizuRegion } from "./types.ts";

const region = (map: ChizuMap, code: string): ChizuRegion => map.regions.find((one) => one.code === code)!;
/** Whether a place (longitude, latitude) is in the box of a region on the 1990 world. */
const inBox = (code: string, lon: number, lat: number) => {
  const [x, y] = projectPoint(WORLD_1990, lon, lat)!;
  const [x0, y0, x1, y1] = region(WORLD_1990, code).bbox;
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
};

describe("the world on 1 January 1990", () => {
  it("is the world's canvas with the dissolved countries in place of today's", () => {
    expect(WORLD_1990.id).toBe("world-1990");
    expect(WORLD_1990.viewBox).toBe(WORLD.viewBox);
    expect(WORLD_1990.projection).toEqual(WORLD.projection);
    const codes = WORLD_1990.regions.map((one) => one.code);
    for (const code of ["SUHH", "YUCS", "CSHH", "DDDE", "DE", "YDYE", "YE"]) expect(codes, code).toContain(code);
    for (const gone of [
      "RU",
      "UA",
      "BY",
      "EE",
      "LV",
      "LT",
      "MD",
      "GE",
      "AM",
      "AZ",
      "KZ",
      "UZ",
      "TM",
      "KG",
      "TJ",
      "CZ",
      "SK",
      "SI",
      "HR",
      "BA",
      "RS",
      "ME",
      "MK",
      "XK",
    ])
      expect(codes, gone).not.toContain(gone);
    expect(new Set(codes).size).toBe(codes.length);
    // 173 countries, 15 + 7 + 2 joined into 3, and Germany and Yemen each made two: 173 - 24 + 3 + 2 = 154
    expect(WORLD_1990.regions).toHaveLength(154);
    expect(region(WORLD_1990, "JP")).toEqual(WORLD.regions.find((one) => one.code === "JP")!);
  });

  it("names each former country in English and Japanese, as kuni does for the ones ISO 3166-3 lists", () => {
    expect(["SUHH", "YUCS", "CSHH", "DDDE", "DE", "YDYE", "YE"].map((code) => region(WORLD_1990, code).nameJa)).toEqual(
      ["ソビエト連邦", "ユーゴスラビア", "チェコスロバキア", "東ドイツ", "西ドイツ", "南イエメン", "北イエメン"],
    );
    expect(region(WORLD_1990, "DDDE").name).toBe("East Germany");
    expect(region(WORLD_1990, "SUHH").group).toBe("Europe");
  });

  it("draw the former countries where they were", () => {
    expect(inBox("SUHH", 37.6, 55.75)).toBe(true); // Moscow
    expect(inBox("SUHH", 30.5, 50.45)).toBe(true); // Kyiv
    expect(inBox("SUHH", 69.2, 41.3)).toBe(true); // Tashkent
    expect(inBox("YUCS", 20.46, 44.8)).toBe(true); // Belgrade
    expect(inBox("YUCS", 14.5, 46.05)).toBe(true); // Ljubljana
    expect(inBox("CSHH", 14.42, 50.09)).toBe(true); // Prague
    expect(inBox("CSHH", 17.1, 48.15)).toBe(true); // Bratislava
    expect(inBox("DDDE", 13.4, 52.52)).toBe(true); // Berlin
    expect(inBox("DDDE", 11.97, 51.48)).toBe(true); // Halle
    expect(inBox("DDDE", 8.68, 50.11)).toBe(false); // Frankfurt is west
    expect(inBox("DE", 8.68, 50.11)).toBe(true);
    expect(inBox("DE", 11.58, 48.14)).toBe(true); // Munich
    expect(inBox("YDYE", 45.03, 12.78)).toBe(true); // Aden
    expect(inBox("YE", 44.2, 15.35)).toBe(true); // Sana'a
  });

  it("have neighbours that are all in the map, and none that bordered only inside a joined country", () => {
    const codes = new Set(WORLD_1990.regions.map((one) => one.code));
    for (const one of WORLD_1990.regions) {
      for (const near of one.neighbors) expect(codes.has(near), `${one.code} -> ${near}`).toBe(true);
      expect(one.neighbors).not.toContain(one.code);
    }
    expect(region(WORLD_1990, "PL").neighbors).toEqual(["CSHH", "DDDE", "SUHH"]);
    expect(region(WORLD_1990, "DDDE").neighbors).toEqual(["CSHH", "DE", "PL"]);
    expect(region(WORLD_1990, "FI").neighbors).toContain("SUHH");
    expect(region(WORLD_1990, "SA").neighbors).toEqual(expect.arrayContaining(["YE", "YDYE"]));
  });

  it("leaves today's world as it is", () => {
    expect(WORLD.regions.some((one) => one.code === "SUHH")).toBe(false);
    expect(WORLD.regions).toHaveLength(173);
  });
});

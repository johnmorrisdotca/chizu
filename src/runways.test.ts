import { describe, expect, it } from "vitest";
import { AIRPORTS } from "./airports-entry.ts";
import world from "./data/world.data.ts";
import { drawChizu } from "./draw.ts";
import { wholeMapBox } from "./frame.ts";
import { localMap } from "./localMap.ts";
import type { ChizuPort } from "./ports.ts";
import { runwaysSvg } from "./runways.ts";
import { RUNWAYS } from "./runways-entry.ts";

const haneda = AIRPORTS.find((one) => one.id === "hnd")!;
const harbour: ChizuPort = {
  id: "yokohama",
  kind: "harbour",
  name: { en: "Yokohama" },
  country: "JP",
  lat: 35.4,
  lon: 139.7,
  tier: 1,
};

/** The ground distance between two points in metres, by the haversine: the check the drawing is held to. */
function metres(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const rad = Math.PI / 180;
  const h =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h));
}
const attribute = (tag: string, name: string) => Number(new RegExp(`${name}="([^"]+)"`).exec(tag)![1]);

describe("a runway drawn from its two ends", () => {
  const map = localMap({ centre: [haneda.lon, haneda.lat], widthMetres: 12000, metresPerUnit: 10 });
  const box = wholeMapBox(map);
  const svg = runwaysSvg(map, [haneda], RUNWAYS, box, [0], {});
  const lines = svg.match(/<line [^>]*\/>/g) ?? [];

  it("draws each of Haneda's four runways", () => {
    expect(svg.startsWith('<g class="cz-runways">')).toBe(true);
    expect(lines).toHaveLength(4);
    expect(lines.every((line) => line.includes('data-airport="hnd"'))).toBe(true);
  });
  it("is as long as the ground between its ends, as the satellite shows it (within 0.5%)", () => {
    RUNWAYS.hnd!.forEach(([lon1, lat1, lon2, lat2], index) => {
      const line = lines[index]!;
      const drawn =
        Math.hypot(attribute(line, "x2") - attribute(line, "x1"), attribute(line, "y2") - attribute(line, "y1")) * 10;
      expect(Math.abs(drawn / metres(lon1, lat1, lon2, lat2) - 1)).toBeLessThan(0.005);
    });
  });
  it("is as wide as it is on the ground", () => {
    expect(RUNWAYS.hnd![0]![4]).toBe(61);
    expect(attribute(lines[0]!, "stroke-width")).toBeCloseTo(6.1, 1);
  });
  it("is no thinner than a hairline in a wide window", () => {
    const wide = localMap({ centre: [haneda.lon, haneda.lat], widthMetres: 200000 });
    const wideLines = runwaysSvg(wide, [haneda], RUNWAYS, wholeMapBox(wide), [0], {}).match(/<line [^>]*\/>/g) ?? [];
    expect(wideLines.length).toBe(4);
    expect(attribute(wideLines[0]!, "stroke-width")).toBeCloseTo(1.2, 1);
  });
});

describe("where runways are drawn", () => {
  it("leaves them out until the window shows a few hundred kilometres: none on the whole world", () => {
    expect(runwaysSvg(world, [haneda], RUNWAYS, wholeMapBox(world), [0], {})).toBe("");
    const far = localMap({ centre: [haneda.lon, haneda.lat], widthMetres: 400000 });
    expect(runwaysSvg(far, [haneda], RUNWAYS, wholeMapBox(far), [0], {})).toBe("");
  });
  it("passes over a harbour, an airport with no runways, and a tier the window does not show", () => {
    const near = localMap({ centre: [haneda.lon, haneda.lat], widthMetres: 12000 });
    const box = wholeMapBox(near);
    expect(runwaysSvg(near, [harbour], { yokohama: RUNWAYS.hnd! }, box, [0], {})).toBe("");
    expect(runwaysSvg(near, [haneda], {}, box, [0], {})).toBe("");
    expect(runwaysSvg(near, [{ ...haneda, tier: 3 }], RUNWAYS, box, [0], { tier: 2 })).toBe("");
  });
  it("leaves out a runway that lies off the window", () => {
    const away = localMap({ centre: [haneda.lon + 0.5, haneda.lat], widthMetres: 12000 });
    expect(runwaysSvg(away, [haneda], RUNWAYS, wholeMapBox(away), [0], {})).toBe("");
  });
});

describe("drawChizu's runways", () => {
  it("draws them under the airport marks, and a drawing without them is as it was", () => {
    const near = localMap({ centre: [haneda.lon, haneda.lat], widthMetres: 12000 });
    const plain = drawChizu(near, { ports: [haneda] });
    expect(plain).not.toContain("cz-runway");
    const drawn = drawChizu(near, { ports: [haneda], runways: RUNWAYS });
    expect(drawn.indexOf("cz-runways")).toBeGreaterThan(-1);
    expect(drawn.indexOf("cz-runways")).toBeLessThan(drawn.indexOf("cz-ports"));
    expect(drawChizu(near, { ports: [haneda], runways: {} })).toBe(plain);
  });
});

describe("the runways' data", () => {
  it("belong to the airports shipped, each end within 8 km of its airport, as long as a runway is", () => {
    const ids = new Set(AIRPORTS.map((one) => one.id));
    for (const [id, list] of Object.entries(RUNWAYS)) {
      expect(ids.has(id), id).toBe(true);
      const airport = AIRPORTS.find((one) => one.id === id)!;
      for (const [lon1, lat1, lon2, lat2, width] of list) {
        expect(metres(lon1, lat1, airport.lon, airport.lat), id).toBeLessThan(8000);
        expect(metres(lon2, lat2, airport.lon, airport.lat), id).toBeLessThan(8000);
        const length = metres(lon1, lat1, lon2, lat2);
        expect(length, id).toBeGreaterThan(300);
        expect(length, id).toBeLessThan(7000);
        expect(width, id).toBeGreaterThanOrEqual(0);
        expect(width, id).toBeLessThan(150);
      }
    }
  });
  it("hold 1,057 runways at 575 of the 600 airports", () => {
    expect(Object.keys(RUNWAYS)).toHaveLength(575);
    expect(Object.values(RUNWAYS).flat()).toHaveLength(1057);
  });
});

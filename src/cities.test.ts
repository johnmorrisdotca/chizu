import { cities1m } from "@johnmorrisdotca/kuni/cities/1m";
import { cities100k } from "@johnmorrisdotca/kuni/cities/100k";
import { capitalCities } from "@johnmorrisdotca/kuni/cities/capitals";
import { describe, expect, it } from "vitest";
import { type ChizuCity, cityPopulationFloor, placeCities, windowKilometres } from "./cities.ts";
import japan from "./data/countries/jp.data.ts";
import japanRegions from "./data/divisions/jp.data.ts";
import world from "./data/world.data.ts";
import { drawChizu } from "./draw.ts";
import { focusBox, wholeMapBox, zoomBox } from "./frame.ts";
import { projectPoint } from "./project.ts";
import type { MapBox } from "./types.ts";

const KUNI: readonly ChizuCity[] = [
  ...new Map([...capitalCities(), ...cities1m()].map((one) => [one.id, one])).values(),
];
// kuni's cities as loadKuniCities gives them by default: every capital, and every city of 100,000 or more.
const KUNI_DEFAULT: readonly ChizuCity[] = [
  ...new Map([...capitalCities(), ...cities1m(), ...cities100k()].map((one) => [one.id, one])).values(),
];
const tokyo: ChizuCity = {
  id: "Q1490",
  name: { en: "Tokyo", ja: "東京" },
  lat: 35.69,
  lon: 139.69,
  population: 14_000_000,
};
const yokohama: ChizuCity = {
  id: "Q38283",
  name: { en: "Yokohama", ja: "横浜" },
  lat: 35.44,
  lon: 139.64,
  population: 3_700_000,
};

type Rect = { x0: number; y0: number; x1: number; y1: number };

/** The boxes the drawing's names take, read back from the SVG, as the layer measured them. */
function nameBoxes(svg: string, box: MapBox, ja: boolean): Rect[] {
  const size = box.width * 0.0115;
  return [
    ...svg.matchAll(/<text class="cz-city-label" x="([\d.-]+)" y="([\d.-]+)"[^>]*text-anchor="(\w+)"[^>]*>([^<]*)</g),
  ].map(([, x, y, anchor, name]) => {
    const wide = [...(name ?? "")].length * size * (ja ? 1.05 : 0.62);
    const left = anchor === "start" ? Number(x) : anchor === "end" ? Number(x) - wide : Number(x) - wide / 2;
    return { x0: left, y0: Number(y) - (size * 1.3) / 2, x1: left + wide, y1: Number(y) + (size * 1.3) / 2 };
  });
}

const overlap = (a: Rect, b: Rect) =>
  a.x0 < b.x1 - 1e-6 && a.x1 > b.x0 + 1e-6 && a.y0 < b.y1 - 1e-6 && a.y1 > b.y0 + 1e-6;

describe("the ground a window shows", () => {
  it("is the earth's width on the whole world and a few hundred kilometres round a city", () => {
    expect(windowKilometres(world, wholeMapBox(world))).toBeGreaterThan(30_000);
    const near = zoomBox(world, 10, { x: 457.5, y: 212.5 });
    expect(windowKilometres(world, near)).toBeLessThan(4_000);
  });

  it("is unknown on a country's regions, whose canvas cannot be read back", () => {
    expect(windowKilometres(japanRegions, wholeMapBox(japanRegions))).toBeNull();
  });

  it("sets a population floor that falls as the window closes in, from five million to 15,000", () => {
    expect(cityPopulationFloor(40_000)).toBeGreaterThan(4_900_000);
    expect(cityPopulationFloor(100_000)).toBe(5_000_000);
    expect(cityPopulationFloor(400)).toBe(15_000);
    expect(cityPopulationFloor(50)).toBe(15_000);
    expect(cityPopulationFloor(4_000)).toBeGreaterThan(cityPopulationFloor(1_000));
  });
});

describe("placing cities", () => {
  it("names a city to the right of its dot, in the page's language", () => {
    const [placed] = placeCities(world, [tokyo], wholeMapBox(world), [0], { language: "ja" });
    expect(placed).toMatchObject({ name: "東京", side: "right" });
  });

  it("prints the English name on a Japanese page where there is no Japanese one", () => {
    const city: ChizuCity = { ...tokyo, name: { en: "Tokyo" } };
    expect(placeCities(world, [city], wholeMapBox(world), [0], { language: "ja" })[0]?.name).toBe("Tokyo");
  });

  it("names the more populous of two close cities first and moves or drops the other", () => {
    const box = zoomBox(world, 6, { x: 457.5, y: 212.5 });
    const placed = placeCities(world, [yokohama, tokyo], box, [0], { language: "en", minPopulation: 0 });
    expect(placed[0]?.city.id).toBe("Q1490");
    const crowded = placeCities(world, [yokohama, tokyo], wholeMapBox(world), [0], {
      language: "en",
      minPopulation: 0,
    });
    expect(crowded.map((one) => one.city.id)).toEqual(["Q1490"]);
  });

  it("leaves out cities below the floor and cities outside the window", () => {
    const small: ChizuCity = { ...yokohama, id: "small", population: 20_000 };
    expect(placeCities(world, [small], wholeMapBox(world), [0], { language: "en" })).toEqual([]);
    const paris = projectPoint(world, 2.35, 48.86)!;
    expect(
      placeCities(world, [tokyo], zoomBox(world, 10, { x: paris[0], y: paris[1] }), [0], { language: "en" }),
    ).toEqual([]);
  });

  it("names only a country's own cities on a map of that country alone", () => {
    const seoul: ChizuCity = {
      id: "Q8684",
      name: { en: "Seoul" },
      lat: 37.57,
      lon: 126.98,
      population: 9_500_000,
      country: "KR",
    };
    const named = placeCities(japan, [{ ...tokyo, country: "JP" }, seoul], wholeMapBox(japan), [0], { language: "en" });
    expect(named.map((one) => one.city.id)).toEqual(["Q1490"]);
    expect(placeCities(japan, [tokyo], wholeMapBox(japan), [0], { language: "en" })).toEqual([]);
    expect(placeCities(world, [seoul], wholeMapBox(world), [0], { language: "en" })).toHaveLength(1);
  });

  it("labels a city by its short Japanese name where given, with the full name as its title", () => {
    const short: ChizuCity = { ...tokyo, name: { en: "Tokyo", ja: "東京都", jaShort: "東京" } };
    expect(placeCities(world, [short], wholeMapBox(world), [0], { language: "ja" })[0]?.name).toBe("東京");
    const svg = drawChizu(world, { cities: [short], language: "ja" });
    expect(svg).toContain("<title>東京都</title>");
    expect(svg).toMatch(/<text class="cz-city-label"[^>]*>東京<\/text>/);
    // English is unchanged.
    expect(placeCities(world, [short], wholeMapBox(world), [0], { language: "en" })[0]?.name).toBe("Tokyo");
  });

  it("prints English for an empty Japanese name, and skips a city with no name", () => {
    const blank: ChizuCity = { ...tokyo, name: { en: "Tokyo", ja: "" } };
    expect(placeCities(world, [blank], wholeMapBox(world), [0], { language: "ja" })[0]?.name).toBe("Tokyo");
    const nameless = { ...tokyo, name: undefined } as unknown as ChizuCity;
    expect(placeCities(world, [nameless], wholeMapBox(world), [0], { language: "en" })).toEqual([]);
  });

  it("gives the same answer from the same list, drawn again and again", () => {
    const first = placeCities(world, KUNI, wholeMapBox(world), [0], { language: "en" });
    const again = placeCities(world, KUNI, wholeMapBox(world), [0], { language: "en" });
    expect(again).toEqual(first);
  });

  it("places nothing on a country's regions", () => {
    expect(placeCities(japanRegions, [tokyo], wholeMapBox(japanRegions), [0], { language: "en" })).toEqual([]);
  });

  it("names more of kuni's cities as the window closes in", () => {
    const whole = placeCities(world, KUNI, wholeMapBox(world), [0], { language: "en" }).length;
    const europe = placeCities(world, KUNI, focusBox(world, ["FR", "DE", "IT", "ES", "PL"]), [0], {
      language: "en",
    }).length;
    const japanAlone = placeCities(japan, KUNI, wholeMapBox(japan), [0], { language: "ja" }).length;
    expect(whole).toBeGreaterThan(10);
    const wholeDefault = placeCities(world, KUNI_DEFAULT, wholeMapBox(world), [0], { language: "en" }).length;
    expect(wholeDefault).toBeGreaterThanOrEqual(30);
    expect(wholeDefault).toBeLessThanOrEqual(50);
    expect(europe).toBeGreaterThan(10);
    expect(japanAlone).toBeGreaterThan(5);
  });
});

describe("the city layer in a drawing", () => {
  it("is drawn only when cities are given, so a map without them is drawn as before", () => {
    expect(drawChizu(world)).toBe(drawChizu(world, { cities: [] }));
    expect(drawChizu(world)).not.toContain("cz-cities");
    expect(drawChizu(world, { cities: [tokyo] })).toContain(
      '<g class="cz-city" data-city="Q1490"><title>Tokyo</title>',
    );
  });

  it("rings a national capital and can draw the dots without names", () => {
    const capital = { ...tokyo, capital: "national" };
    expect(drawChizu(world, { cities: [capital] })).toContain('class="cz-city-ring"');
    expect(drawChizu(world, { cities: [tokyo], cityOptions: { labels: false } })).not.toContain("cz-city-label");
  });

  it("never prints one name over another, on the world, on Europe and on Japan alone, in both languages", () => {
    const cases: [typeof world, MapBox][] = [
      [world, wholeMapBox(world)],
      [world, focusBox(world, ["FR", "DE", "IT", "ES", "PL"])],
      [japan, wholeMapBox(japan)],
    ];
    for (const [map, box] of cases) {
      for (const language of ["en", "ja"] as const) {
        const rects = nameBoxes(drawChizu(map, { box, cities: KUNI, language }), box, language === "ja");
        expect(rects.length).toBeGreaterThan(3);
        for (let i = 0; i < rects.length; i += 1)
          for (let j = i + 1; j < rects.length; j += 1)
            expect(overlap(rects[i]!, rects[j]!), `${map.id} ${language}`).toBe(false);
      }
    }
  });

  it("keeps a regions map's capitals and seats when the cities name nothing there", async () => {
    const { loadFeatures } = await import("./load-entry.ts");
    const layer = await loadFeatures("divisions-jp");
    const svg = drawChizu(japanRegions, { features: ["capitals"], featureLayer: layer, cities: KUNI });
    expect(svg).not.toContain("cz-cities");
    expect(svg).toContain('data-group="capitals"');
  });

  it("names the capitals itself, so the features' capitals are not drawn twice", async () => {
    const { loadFeatures } = await import("./load-entry.ts");
    const layer = await loadFeatures("world");
    const svg = drawChizu(world, { features: ["all"], featureLayer: layer, cities: KUNI });
    expect(svg).not.toContain('data-group="capitals"');
    expect(svg).toContain("cz-cities");
  });

  it("escapes a name that holds markup", () => {
    const odd: ChizuCity = { ...tokyo, name: { en: "<b>&" } };
    const svg = drawChizu(world, { cities: [odd] });
    expect(svg).toContain("&lt;b&gt;&amp;");
    expect(svg).not.toContain("<b>&");
  });
});

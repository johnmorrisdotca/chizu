import { describe, expect, it } from "vitest";
import { windowKilometres } from "./cities.ts";
import japan from "./data/countries/jp.data.ts";
import japanRegions from "./data/divisions/jp.data.ts";
import world from "./data/world.data.ts";
import { drawChizu } from "./draw.ts";
import { wholeMapBox, zoomBox } from "./frame.ts";
import { type ChizuPort, placePorts, portName, portsInTier, portsSvg, portTierFor } from "./ports.ts";
import { projectPoint } from "./project.ts";

const haneda: ChizuPort = {
  id: "hnd",
  kind: "airport",
  code: "HND",
  name: { en: "Tokyo International Airport", ja: "東京国際空港" },
  country: "JP",
  lat: 35.5523,
  lon: 139.7798,
  tier: 1,
};
const yokohama: ChizuPort = {
  id: "yokohama",
  kind: "harbour",
  name: { en: "Yokohama" },
  country: "JP",
  lat: 35.4364,
  lon: 139.6674,
  tier: 1,
};
const incheon: ChizuPort = {
  id: "icn",
  kind: "airport",
  code: "ICN",
  name: { en: "Incheon International Airport" },
  country: "KR",
  lat: 37.4602,
  lon: 126.4407,
  tier: 3,
};

describe("the tier a window calls for", () => {
  it("is 1 across more than 3,000 km, 2 across more than 1,000 km and 3 below", () => {
    expect([40000, 3001, 3000, 1001, 1000, 5].map(portTierFor)).toEqual([1, 1, 2, 2, 3, 3]);
  });
  it("keeps the places of a tier and the tiers above it, in the list's order", () => {
    const list = [incheon, haneda, yokohama];
    expect(portsInTier(list, 1).map((port) => port.id)).toEqual(["hnd", "yokohama"]);
    expect(portsInTier(list, 3).map((port) => port.id)).toEqual(["icn", "hnd", "yokohama"]);
  });
});

describe("a place's name", () => {
  it("is Japanese on a Japanese page where it has one, else English", () => {
    expect(portName(haneda, "ja")).toBe("東京国際空港");
    expect(portName(yokohama, "ja")).toBe("Yokohama");
    expect(portName(haneda, "en")).toBe("Tokyo International Airport");
  });
});

describe("placing airports and harbours", () => {
  it("marks the tiers the window's ground calls for: the whole world shows tier 1 only", () => {
    const placed = placePorts(world, [haneda, incheon], wholeMapBox(world), [0]);
    expect(placed.map((one) => one.port.id)).toEqual(["hnd"]);
  });
  it("shows every tier when one is asked for", () => {
    const placed = placePorts(world, [haneda, incheon], wholeMapBox(world), [0], { tier: 3 });
    expect(placed.map((one) => one.port.id)).toEqual(["hnd", "icn"]);
  });
  it("shows only the kinds asked for", () => {
    const box = wholeMapBox(world);
    expect(placePorts(world, [haneda, yokohama], box, [0], { tier: 3, kinds: ["harbour"] })).toHaveLength(1);
  });
  it("leaves out a mark that would sit on one already placed, the earlier in the list winning", () => {
    const box = wholeMapBox(world);
    expect(placePorts(world, [haneda, yokohama], box, [0]).map((one) => one.port.id)).toEqual(["hnd"]);
    expect(placePorts(world, [yokohama, haneda], box, [0]).map((one) => one.port.id)).toEqual(["yokohama"]);
  });
  it("marks both when the window is close enough to tell them apart", () => {
    const [x, y] = projectPoint(world, 139.72, 35.5)!;
    const wide = zoomBox(world, 10, { x, y });
    const box = { x: x - wide.width / 20, y: y - wide.height / 20, width: wide.width / 10, height: wide.height / 10 };
    expect(windowKilometres(world, box)!).toBeLessThan(1000);
    expect(placePorts(world, [haneda, yokohama], box, [0]).map((one) => one.port.id)).toEqual(["hnd", "yokohama"]);
  });
  it("leaves out places off the window", () => {
    const [x, y] = [0, 0];
    const box = { x, y, width: 50, height: 25 };
    expect(placePorts(world, [haneda], box, [0])).toEqual([]);
  });
  it("names only a country's own places on a map of that country alone", () => {
    const placed = placePorts(japan, [haneda, incheon], wholeMapBox(japan), [0], { tier: 3 });
    expect(placed.map((one) => one.port.id)).toEqual(["hnd"]);
  });
  it("places nothing on a country's regions, whose canvas cannot be read back", () => {
    expect(placePorts(japanRegions, [haneda], wholeMapBox(japanRegions), [0])).toEqual([]);
  });
});

describe("the places as SVG", () => {
  it("draws an airport as a diamond and a harbour as a ring, each with its name as its title", () => {
    const box = wholeMapBox(world);
    const svg = portsSvg(world, [haneda, yokohama], box, [0], { language: "ja", tier: 3 });
    expect(svg.startsWith('<g class="cz-ports">')).toBe(true);
    expect(svg).toContain(
      '<g class="cz-port cz-airport" data-port="hnd" data-kind="airport"><title>東京国際空港</title><path d="M',
    );
    expect(portsSvg(world, [yokohama], box, [0], { language: "en" })).toContain(
      '<g class="cz-port cz-harbour" data-port="yokohama" data-kind="harbour"><title>Yokohama</title><circle ',
    );
  });
  it("is empty when no place fits, and escapes what it prints", () => {
    const box = wholeMapBox(world);
    expect(portsSvg(world, [], box, [0], { language: "en" })).toBe("");
    const odd = { ...haneda, id: 'a"b', name: { en: "<Air & Sea>" } };
    const svg = portsSvg(world, [odd], box, [0], { language: "en" });
    expect(svg).toContain("&lt;Air &amp; Sea&gt;");
    expect(svg).toContain('data-port="a&quot;b"');
  });
});

describe("drawChizu's ports", () => {
  it("draws the layer after the cities and before the overlays, and a drawing without ports is as it was", () => {
    const plain = drawChizu(world);
    expect(plain).not.toContain("cz-ports");
    const drawn = drawChizu(world, { ports: [haneda], overlays: [{ kind: "mark", at: [139.7, 35.7] }] });
    expect(drawn).toContain('class="cz-ports"');
    expect(drawn.indexOf("cz-ports")).toBeLessThan(drawn.indexOf("cz-overlays"));
    expect(drawChizu(world, { ports: [] })).toBe(plain);
  });
  it("takes the tier from portOptions and the language from the drawing", () => {
    const svg = drawChizu(world, { ports: [haneda, incheon], portOptions: { tier: 3 }, language: "ja" });
    expect(svg).toContain('data-port="icn"');
    expect(svg).toContain("<title>東京国際空港</title>");
    expect(drawChizu(world, { ports: [haneda, incheon] })).not.toContain('data-port="icn"');
  });
});

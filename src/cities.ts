import { projectPoint, unprojectPoint } from "./project.ts";
import type { ChizuLanguage } from "./strings.ts";
import { escapeXml, num } from "./svgText.ts";
import type { ChizuMap, MapBox } from "./types.ts";

/**
 * CITY NAMES ON A MAP: a layer of dots and names drawn from a list of cities the page hands over. Chizu has no city
 * data of its own; the list is usually kuni's (`@johnmorrisdotca/chizu/cities` loads it), and any list of the same
 * shape will do. More cities are named as the window shows less ground, the most populous first, and a name is placed
 * to the right of its dot, else to the left, above or below, and the city is left out when none of those is free.
 */

/**
 * One city as the layer reads it: the fields of kuni's `City` that a map needs, so a kuni city is one as it is.
 *
 * @example
 * ```ts
 * import type { ChizuCity } from "@johnmorrisdotca/chizu";
 *
 * const paris: ChizuCity = { id: "Q90", name: { en: "Paris", ja: "パリ" }, lat: 48.857, lon: 2.352, population: 2_145_906, capital: "national" };
 * console.log(paris.name.en);
 * // Paris
 * ```
 */
export type ChizuCity = {
  /** Stable and unique in the list: the drawing's `data-city`. */
  id: string;
  /**
   * Its name in English, and in Japanese where it is known; a Japanese page prints the English name where there is none.
   * `jaShort` is the Japanese name a map labels it by (東京 for 東京都, 大阪 for 大阪市: kuni 1.6.3 gives it); where it is
   * given, the label is it and the full name is the dot's title.
   */
  name: { en: string; ja?: string; jaShort?: string };
  /** Latitude in degrees, north positive. */
  lat: number;
  /** Longitude in degrees, east positive. */
  lon: number;
  /** The people living there; `null` or absent where it is not known, which puts the city last. */
  population?: number | null;
  /** `national` for a country's capital, drawn with a ring; any other value, or none, is a plain dot. */
  capital?: string | null;
  /** Its country's ISO 3166-1 alpha-2 code, `JP`: a map of one country alone names only that country's cities. */
  country?: string;
};

/**
 * How the city layer is drawn: `drawChizu`'s `cityOptions`.
 *
 * @example
 * ```ts
 * import type { ChizuCityOptions } from "@johnmorrisdotca/chizu";
 *
 * const options: ChizuCityOptions = { minPopulation: 500_000 };
 * console.log(options.minPopulation);
 * // 500000
 * ```
 */
export type ChizuCityOptions = {
  /** Name only cities of at least this many people, at every zoom. Default: chosen from how much ground the window shows. */
  minPopulation?: number;
  /** Print the names; false draws the dots alone. Default true. */
  labels?: boolean;
};

/**
 * A city `placeCities` named: where its dot is on the canvas, the name printed and the side of the dot it is on.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { placeCities, wholeMapBox, type ChizuCityPlaced } from "@johnmorrisdotca/chizu";
 *
 * const tokyo = { id: "Q1490", name: { en: "Tokyo" }, lat: 35.69, lon: 139.69, population: 14_000_000 };
 * const placed: ChizuCityPlaced[] = placeCities(WORLD, [tokyo], wholeMapBox(WORLD), [0], { language: "en" });
 * console.log(placed[0]?.side);
 * // right
 * ```
 */
export type ChizuCityPlaced = {
  /** The city, as it was given. */
  city: ChizuCity;
  /** Its dot's place on the canvas, in the copy of the canvas it was named in. */
  x: number;
  y: number;
  /** The name printed: Japanese on a Japanese page where the city has one (its short form, `jaShort`, where given), else English. */
  name: string;
  /** Which side of the dot the name is on: tried right, left, above, below in that order. */
  side: "right" | "left" | "above" | "below";
};

const EARTH_KM_PER_DEGREE = 111.32;
const RAD = Math.PI / 180;

/** A dot's title: the full Japanese name where the label is its short form (東京都 under 東京), else the label. */
const titleOf = (city: ChizuCity, label: string, language: ChizuLanguage): string =>
  language === "ja" && city.name?.jaShort && city.name.ja && label === city.name.jaShort ? city.name.ja : label;

/** The city names' font size, and a dot's radius, as a share of the window's width. */
const CITY_LABEL_RATIO = 0.0115;
const CITY_DOT_RATIO = 0.0032;
/** A name's width per letter (Latin, and Japanese), its line's height, and its halo's spill, each in ems. */
const CITY_EM_LATIN = 0.62;
const CITY_EM_JA = 1.05;
const CITY_LINE = 1.3;
const CITY_PAD = 0.18;
/** The halo round a name, in ems: set on each name, so it keeps its weight at every zoom as the name does. */
const CITY_HALO = 0.22;

/**
 * How many kilometres of ground the window shows from side to side, at its middle; `null` for a map whose canvas
 * cannot be read back to longitude and latitude (a country's regions).
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { windowKilometres, wholeMapBox } from "@johnmorrisdotca/chizu";
 *
 * console.log(Math.round(windowKilometres(WORLD, wholeMapBox(WORLD))! / 1000) > 30);
 * // true
 * ```
 *
 * @param map - The map whose canvas the window is on.
 * @param box - The window.
 * @returns Kilometres across, or null.
 */
export function windowKilometres(map: Pick<ChizuMap, "projection">, box: MapBox): number | null {
  const middle = unprojectPoint(map, box.x + box.width / 2, box.y + box.height / 2);
  if (!middle) return null;
  const [lon, lat] = middle;
  const step = 0.05;
  const here = projectPoint(map, lon, lat);
  const east = projectPoint(map, lon + step, lat);
  if (!here || !east) return null;
  const units = Math.hypot(east[0] - here[0], east[1] - here[1]);
  if (units === 0) return null;
  const kmPerUnit = (step * EARTH_KM_PER_DEGREE * Math.max(0.05, Math.cos(lat * RAD))) / units;
  return box.width * kmPerUnit;
}

/**
 * The smallest city named in a window that shows `kilometres` of ground across: five million people on the whole
 * world, falling with the ground shown, to 15,000 when a window shows 400 km.
 *
 * @example
 * ```ts
 * import { cityPopulationFloor } from "@johnmorrisdotca/chizu";
 *
 * console.log(cityPopulationFloor(400));
 * // 15000
 * ```
 *
 * @param kilometres - The ground the window shows across, in kilometres.
 * @returns The smallest population named.
 */
export function cityPopulationFloor(kilometres: number): number {
  const floor = 15_000 * (Math.max(1, kilometres) / 400) ** 1.26;
  return Math.round(Math.min(5_000_000, Math.max(15_000, floor)));
}

/**
 * The countries whose cities a map may name: `null` for any (the world, a local map); on a map of one country alone,
 * that country's code, since the land round it is not drawn and a neighbour's city would sit in an empty sea.
 */
function countriesNamed(
  map: Pick<ChizuMap, "projection"> & Partial<Pick<ChizuMap, "kind" | "regions">>,
): Set<string> | null {
  if (map.kind !== "country") return null;
  return new Set((map.regions ?? []).map((region) => String(region.code)).filter((code) => /^[A-Z]{2}$/.test(code)));
}

/** The order cities are placed in: national capitals that clear the floor and the most populous before the rest. */
const rankOf = (city: ChizuCity) => (city.population ?? 0) * (city.capital === "national" ? 2 : 1);

/**
 * A list of cities in placing order, with each one's rank, made once per list: a mounted map draws on every pan and zoom
 * step, and a list of kuni's has about 9,000 cities.
 */
const ranked = new WeakMap<readonly ChizuCity[], { city: ChizuCity; rank: number }[]>();
function rankedCities(cities: readonly ChizuCity[]): { city: ChizuCity; rank: number }[] {
  let list = ranked.get(cities);
  if (list === undefined) {
    list = cities
      .map((city) => ({ city, rank: rankOf(city) }))
      .sort((a, b) => b.rank - a.rank || (a.city.id < b.city.id ? -1 : a.city.id > b.city.id ? 1 : 0));
    ranked.set(cities, list);
  }
  return list;
}

/** How many of a ranked list have a rank of at least `floor`: they are all at its start. */
function countAtLeast(list: readonly { rank: number }[], floor: number): number {
  let low = 0;
  let high = list.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (list[middle]!.rank >= floor) low = middle + 1;
    else high = middle;
  }
  return low;
}

type Box = { x0: number; y0: number; x1: number; y1: number };
const overlaps = (a: Box, b: Box) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

/**
 * Which cities a window names, and where each name goes: in rank order, each name on the first free side of its dot
 * (right, left, above, below), and a city left out when none is free. On a map of one country alone, only that
 * country's cities are named. A name never covers another name or another
 * city's dot, and no two dots touch. Cities off the window, or on a map that cannot place a point, are left out.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { placeCities, wholeMapBox } from "@johnmorrisdotca/chizu";
 *
 * const placed = placeCities(WORLD, [{ id: "Q1490", name: { en: "Tokyo", ja: "東京" }, lat: 35.69, lon: 139.69, population: 14_000_000 }], wholeMapBox(WORLD), [0], { language: "ja" });
 * console.log(placed[0]?.name, placed[0]?.side);
 * // 東京 right
 * ```
 *
 * @param map - The map the cities go on.
 * @param cities - The cities to choose from.
 * @param box - The window.
 * @param offsets - The copies of the canvas drawn across a wrapping map (`[0]` for one).
 * @param options - The language, and an optional population floor.
 * @returns The cities named, with their place and side.
 */
export function placeCities(
  map: Pick<ChizuMap, "projection"> & Partial<Pick<ChizuMap, "kind" | "regions">>,
  cities: readonly ChizuCity[],
  box: MapBox,
  offsets: readonly number[],
  options: { language: ChizuLanguage; minPopulation?: number },
): ChizuCityPlaced[] {
  const kilometres = windowKilometres(map, box);
  if (kilometres === null) return [];
  const floor = options.minPopulation ?? cityPopulationFloor(kilometres);
  const size = box.width * CITY_LABEL_RATIO;
  const dot = box.width * CITY_DOT_RATIO;
  const gap = dot * 1.6;
  const ja = options.language === "ja";
  const countries = countriesNamed(map);
  const list = rankedCities(cities);
  // A city of `floor` people or more has a rank of at least `floor` (a capital's counts double), so the rest of the
  // sorted list is never looked at.
  const reach = countAtLeast(list, floor);
  const labels: Box[] = [];
  const dots: Box[] = [];
  const placed: ChizuCityPlaced[] = [];
  for (let at = 0; at < reach; at += 1) {
    const city = list[at]!.city;
    if ((city.population ?? 0) < floor || !Number.isFinite(city.lat) || !Number.isFinite(city.lon)) continue;
    if (countries !== null && (typeof city.country !== "string" || !countries.has(city.country.toUpperCase())))
      continue;
    const point = projectPoint(map, city.lon, city.lat);
    if (!point) continue;
    // A national capital's ring is the dot it is kept clear by.
    const reachOf = city.capital === "national" ? dot * 1.7 : dot;
    for (const offset of offsets) {
      const x = point[0] + offset;
      const y = point[1];
      if (x < box.x || x > box.x + box.width || y < box.y || y > box.y + box.height) continue;
      const own: Box = { x0: x - reachOf, y0: y - reachOf, x1: x + reachOf, y1: y + reachOf };
      if (labels.some((other) => overlaps(own, other)) || dots.some((other) => overlaps(own, other))) continue;
      // The name, only once the city is in the window: Japanese where there is one (an empty one is none), else English.
      const name = (ja && (city.name?.jaShort || city.name?.ja)) || city.name?.en;
      if (!name) break;
      // The room a name takes as a browser draws it: a line is taller than the font's size, and its halo spills over.
      const wide = [...name].length * size * (ja ? CITY_EM_JA : CITY_EM_LATIN);
      const tall = size * CITY_LINE;
      const pad = size * CITY_PAD;
      const sides: [ChizuCityPlaced["side"], Box][] = [
        ["right", { x0: x + gap - pad, y0: y - tall / 2, x1: x + gap + wide + pad, y1: y + tall / 2 }],
        ["left", { x0: x - gap - wide - pad, y0: y - tall / 2, x1: x - gap + pad, y1: y + tall / 2 }],
        ["above", { x0: x - wide / 2 - pad, y0: y - gap - tall, x1: x + wide / 2 + pad, y1: y - gap }],
        ["below", { x0: x - wide / 2 - pad, y0: y + gap, x1: x + wide / 2 + pad, y1: y + gap + tall }],
      ];
      const free = sides.find(
        ([, rect]) =>
          rect.x0 >= box.x &&
          rect.x1 <= box.x + box.width &&
          rect.y0 >= box.y &&
          rect.y1 <= box.y + box.height &&
          !labels.some((other) => overlaps(rect, other)) &&
          !dots.some((other) => overlaps(rect, other)),
      );
      if (!free) continue;
      labels.push(free[1]);
      dots.push(own);
      placed.push({ city, x, y, name, side: free[0] });
    }
  }
  return placed;
}

/**
 * The city layer as SVG, for `drawChizu`: a `<g class="cz-cities">` holding a `<g class="cz-city" data-city="…">` for
 * each city named, its dot (a ring round it for a national capital), its `<title>` and its name. Empty when no city
 * fits the window.
 *
 * @param map - The map the cities go on.
 * @param cities - The cities to choose from.
 * @param box - The window.
 * @param offsets - The copies of the canvas across a wrapping map.
 * @param options - The language and the layer's options.
 * @returns The SVG text, or "".
 */
export function citiesSvg(
  map: Pick<ChizuMap, "projection"> & Partial<Pick<ChizuMap, "kind" | "regions">>,
  cities: readonly ChizuCity[],
  box: MapBox,
  offsets: readonly number[],
  options: { language: ChizuLanguage } & ChizuCityOptions,
): string {
  const placed = placeCities(map, cities, box, offsets, options);
  if (placed.length === 0) return "";
  const size = box.width * CITY_LABEL_RATIO;
  const dot = box.width * CITY_DOT_RATIO;
  const gap = dot * 1.6;
  const showNames = options.labels !== false;
  const parts = placed.map(({ city, x, y, name, side }) => {
    const ring =
      city.capital === "national"
        ? `<circle class="cz-city-ring" cx="${num(x)}" cy="${num(y)}" r="${num(dot * 1.7)}"/>`
        : "";
    const at =
      side === "right"
        ? { x: x + gap, y, anchor: "start" }
        : side === "left"
          ? { x: x - gap, y, anchor: "end" }
          : side === "above"
            ? { x, y: y - gap - (size * CITY_LINE) / 2, anchor: "middle" }
            : { x, y: y + gap + (size * CITY_LINE) / 2, anchor: "middle" };
    const text = showNames
      ? `<text class="cz-city-label" x="${num(at.x)}" y="${num(at.y)}" font-size="${num(size)}" stroke-width="${num(size * CITY_HALO)}" text-anchor="${at.anchor}" data-side="${side}">${escapeXml(name)}</text>`
      : "";
    return `<g class="cz-city${city.capital === "national" ? " cz-city-capital" : ""}" data-city="${escapeXml(city.id)}"><title>${escapeXml(titleOf(city, name, options.language))}</title>${ring}<circle class="cz-city-dot" cx="${num(x)}" cy="${num(y)}" r="${num(dot)}"/>${text}</g>`;
  });
  return `<g class="cz-cities">${parts.join("")}</g>`;
}

import { countriesNamed, windowKilometres } from "./cities.ts";
import { projectPoint } from "./project.ts";
import type { ChizuLanguage } from "./strings.ts";
import { escapeXml, num } from "./svgText.ts";
import type { ChizuMap, MapBox } from "./types.ts";

/**
 * AIRPORTS AND HARBOURS: marks for the world's busiest airports and its largest harbours, from lists the page hands over
 * (`@johnmorrisdotca/chizu/airports` and `@johnmorrisdotca/chizu/harbours` have them, and any list of the same shape
 * will do). Each place has a tier, 1 the largest; a window showing less ground draws more tiers, in the order the list
 * gives, and a mark is left out where it would sit on one already drawn. A place has no name on the map until you ask
 * for it, so the names stay the cities'.
 */

/**
 * One airport or harbour: the fields a map needs, with its names in English and Japanese. A list is ordered by
 * importance (an airport by passengers a year, a harbour by Natural Earth's size), the order marks win a crowded place in.
 *
 * @example
 * ```ts
 * import type { ChizuPort } from "@johnmorrisdotca/chizu";
 *
 * const haneda: ChizuPort = { id: "hnd", kind: "airport", code: "HND", name: { en: "Tokyo International Airport", ja: "東京国際空港" }, country: "JP", lat: 35.5523, lon: 139.7798, tier: 1 };
 * console.log(haneda.name.ja);
 * // 東京国際空港
 * ```
 */
export type ChizuPort = {
  /** Stable and unique within its kind: an airport's lower-case IATA code (`hnd`), else its ICAO code; a harbour's name as a slug (`yokohama`). The drawing's `data-port`. */
  id: string;
  kind: "airport" | "harbour";
  /** An airport's IATA code (`HND`), else its ICAO code; none for a harbour. */
  code?: string;
  /** English, and Japanese where Wikidata has a label; a Japanese page prints the English name where there is none. */
  name: { en: string; ja?: string };
  /** Its country's ISO 3166-1 alpha-2 code, or Natural Earth's `SOL` (Somaliland) or `CYN` (Northern Cyprus), which have none. */
  country: string;
  /** Latitude in degrees, north positive. */
  lat: number;
  /** Longitude in degrees, east positive. */
  lon: number;
  /** 1 the largest. An airport's tiers end at its 150th, 300th and 600th by passengers; a harbour's at Natural Earth's size 4, 5 and the rest. */
  tier: 1 | 2 | 3;
  /** An airport's passengers a year in `year`, where Wikidata has it. */
  passengers?: number;
  year?: number;
};

/**
 * How the marks are chosen and drawn: `drawChizu`'s `portOptions`.
 *
 * @example
 * ```ts
 * import type { ChizuPortOptions } from "@johnmorrisdotca/chizu";
 *
 * const options: ChizuPortOptions = { tier: 1, kinds: ["airport"] };
 * console.log(options.tier);
 * // 1
 * ```
 */
export type ChizuPortOptions = {
  /** Draw the places of this tier and the tiers above it, at every zoom. Default: chosen from how much ground the window shows. */
  tier?: 1 | 2 | 3;
  /** Draw only these kinds. Default both. */
  kinds?: readonly ChizuPort["kind"][];
};

/**
 * A placed mark: where it is on the canvas, in the copy of the canvas it was drawn in.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { placePorts, wholeMapBox, type ChizuPortPlaced } from "@johnmorrisdotca/chizu";
 *
 * const kobe = { id: "kobe", kind: "harbour", name: { en: "Kobe" }, country: "JP", lat: 34.68, lon: 135.2, tier: 1 } as const;
 * const placed: ChizuPortPlaced[] = placePorts(WORLD, [kobe], wholeMapBox(WORLD), [0]);
 * console.log(placed[0]?.port.id, placed.length);
 * // kobe 1
 * ```
 */
export type ChizuPortPlaced = { port: ChizuPort; x: number; y: number };

/** A window this many kilometres across or wider draws tier 1 only; this or wider, tiers 1 and 2; less, all three. */
const TIER_KM = [3000, 1000] as const;
/** A mark's half-width, as a share of the window's width. */
const PORT_MARK_RATIO = 0.0042;

/**
 * The tier a window shows: 1 across more than 3,000 km, 2 across more than 1,000 km, else 3.
 *
 * @example
 * ```ts
 * import { portTierFor } from "@johnmorrisdotca/chizu";
 *
 * console.log(portTierFor(8000), portTierFor(2000), portTierFor(300));
 * // 1 2 3
 * ```
 *
 * @param kilometres - The ground the window shows across, in kilometres (`windowKilometres`).
 * @returns 1, 2 or 3.
 */
export function portTierFor(kilometres: number): 1 | 2 | 3 {
  return kilometres > TIER_KM[0] ? 1 : kilometres > TIER_KM[1] ? 2 : 3;
}

/**
 * The places of a tier and the tiers above it, in the list's order.
 *
 * @example
 * ```ts
 * import { portsInTier, type ChizuPort } from "@johnmorrisdotca/chizu";
 *
 * const make = (id: string, tier: 1 | 2 | 3): ChizuPort => ({ id, kind: "harbour", name: { en: id }, country: "JP", lat: 35, lon: 139, tier });
 * console.log(portsInTier([make("a", 1), make("b", 3)], 2).map((port) => port.id).join(" "));
 * // a
 * ```
 *
 * @param ports - The places to choose from.
 * @param tier - The last tier kept.
 * @returns The places whose tier is at most `tier`.
 */
export function portsInTier(ports: readonly ChizuPort[], tier: 1 | 2 | 3): ChizuPort[] {
  return ports.filter((port) => port.tier <= tier);
}

/**
 * Which places a window marks and where: the tier the window's ground calls for (or `options.tier`), in the list's order,
 * each place left out where its mark would touch one already placed. Places off the window, or on a map that cannot
 * place a point, are left out; on a map of one country alone, only that country's.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { placePorts, wholeMapBox } from "@johnmorrisdotca/chizu";
 *
 * const port = { id: "yokohama", kind: "harbour", name: { en: "Yokohama" }, country: "JP", lat: 35.45, lon: 139.65, tier: 1 } as const;
 * console.log(placePorts(WORLD, [port], wholeMapBox(WORLD), [0]).map((placed) => placed.port.id).join(" "));
 * // yokohama
 * ```
 *
 * @param map - The map the places go on.
 * @param ports - The places to choose from, most important first.
 * @param box - The window.
 * @param offsets - The copies of the canvas drawn across a wrapping map (`[0]` for one).
 * @param options - The tier and the kinds.
 * @returns The places marked, with their place on the canvas.
 */
export function placePorts(
  map: Pick<ChizuMap, "projection"> & Partial<Pick<ChizuMap, "kind" | "regions">>,
  ports: readonly ChizuPort[],
  box: MapBox,
  offsets: readonly number[],
  options: ChizuPortOptions = {},
): ChizuPortPlaced[] {
  const kilometres = windowKilometres(map, box);
  if (kilometres === null) return [];
  const tier = options.tier ?? portTierFor(kilometres);
  const reach = box.width * PORT_MARK_RATIO * 2;
  const countries = countriesNamed(map);
  const placed: ChizuPortPlaced[] = [];
  for (const port of ports) {
    if (port.tier > tier || (options.kinds && !options.kinds.includes(port.kind))) continue;
    if (countries !== null && !countries.has(port.country.toUpperCase())) continue;
    const point = projectPoint(map, port.lon, port.lat);
    if (!point) continue;
    for (const offset of offsets) {
      const x = point[0] + offset;
      const y = point[1];
      if (x < box.x || x > box.x + box.width || y < box.y || y > box.y + box.height) continue;
      if (placed.some((other) => Math.abs(other.x - x) < reach && Math.abs(other.y - y) < reach)) continue;
      placed.push({ port, x, y });
    }
  }
  return placed;
}

/**
 * A place's name in a language: Japanese on a Japanese page where it has one, else English.
 *
 * @example
 * ```ts
 * import { portName, type ChizuPort } from "@johnmorrisdotca/chizu";
 *
 * const port: ChizuPort = { id: "yokohama", kind: "harbour", name: { en: "Yokohama", ja: "横浜港" }, country: "JP", lat: 35.45, lon: 139.65, tier: 1 };
 * console.log(portName(port, "en"), portName(port, "ja"));
 * // Yokohama 横浜港
 * ```
 *
 * @param port - The place.
 * @param language - `en` or `ja`.
 * @returns Its name.
 */
export function portName(port: Pick<ChizuPort, "name">, language: ChizuLanguage): string {
  return (language === "ja" && port.name.ja) || port.name.en;
}

/**
 * The places as SVG, for `drawChizu`: a `<g class="cz-ports">` holding a `<g class="cz-port cz-airport|cz-harbour" data-port="…">`
 * for each mark, a diamond for an airport and a ring for a harbour, each with its `<title>`. Empty when none fits.
 *
 * @param map - The map the places go on.
 * @param ports - The places to choose from.
 * @param box - The window.
 * @param offsets - The copies of the canvas across a wrapping map.
 * @param options - The language and the layer's options.
 * @returns The SVG text, or "".
 */
export function portsSvg(
  map: Pick<ChizuMap, "projection"> & Partial<Pick<ChizuMap, "kind" | "regions">>,
  ports: readonly ChizuPort[],
  box: MapBox,
  offsets: readonly number[],
  options: { language: ChizuLanguage } & ChizuPortOptions,
): string {
  const placed = placePorts(map, ports, box, offsets, options);
  if (placed.length === 0) return "";
  const r = box.width * PORT_MARK_RATIO;
  const marks = placed.map(({ port, x, y }) => {
    const shape =
      port.kind === "airport"
        ? `<path d="M${num(x)},${num(y - r)} L${num(x + r)},${num(y)} L${num(x)},${num(y + r)} L${num(x - r)},${num(y)} Z"/>`
        : `<circle cx="${num(x)}" cy="${num(y)}" r="${num(r)}"/>`;
    return `<g class="cz-port cz-${port.kind}" data-port="${escapeXml(port.id)}" data-kind="${port.kind}"><title>${escapeXml(portName(port, options.language))}</title>${shape}</g>`;
  });
  return `<g class="cz-ports">${marks.join("")}</g>`;
}

/**
 * THE SHAPES chizu's maps and engine share. Plain data: a map is a canvas (a width and a height in its own units,
 * 1000 across or tall at most for a country) and the regions drawn on it, each region an SVG path in the canvas's
 * coordinates with the box round it, a centre, and the codes of the regions it touches. Nothing here knows which
 * country it is, so the same engine frames, zooms and numbers a world, a country's provinces or a map of your own.
 */

/**
 * A window on a map, in the map's own units: what an SVG `viewBox` says.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { boxToViewBox, type MapBox } from "@johnmorrisdotca/chizu";
 *
 * const window: MapBox = { x: 0, y: 0, width: WORLD.width / 2, height: WORLD.height / 2 };
 * console.log(boxToViewBox(window));
 * // 0 0 500 244.5
 * ```
 */
export type MapBox = { x: number; y: number; width: number; height: number };

/**
 * The box round a shape: left, top, right, bottom.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import type { Bounds } from "@johnmorrisdotca/chizu";
 *
 * const [left, top, right, bottom]: Bounds = WORLD.regions.find((region) => region.code === "JP")!.bbox;
 * console.log(right > left && bottom > top);
 * // true
 * ```
 */
export type Bounds = readonly [number, number, number, number];

/**
 * One place on a map: a country on the world, a province or state on a country.
 *
 * @example
 * ```ts
 * import { loadDivisions } from "@johnmorrisdotca/chizu/load";
 * import type { ChizuRegion } from "@johnmorrisdotca/chizu";
 *
 * const canada = (await loadDivisions("ca"))!;
 * const ontario: ChizuRegion = canada.regions.find((region) => region.code === "ON")!;
 * console.log(ontario.iso, ontario.name, ontario.nameJa, ontario.group, ontario.neighbors.join(" "));
 * // CA-ON Ontario オンタリオ州 Central MB QC
 * ```
 */
export interface ChizuRegion {
  /** Its code within its map: an ISO 3166-1 alpha-2 code on the world (`JP`), the postal or ISO 3166-2 part on a country (`ON`), the prefecture number in Japan (`13`). */
  code: string;
  /**
   * Its ISO 3166-2 code, the full form (`JP-13`, `CA-ON`, `US-TX`), on a country's regions, from kuni 国
   * (`@johnmorrisdotca/kuni`) at build time, so a figure keyed by ISO code joins to the map and a region joins to
   * kuni. Where Natural Earth draws one ISO subdivision as several regions (County Dublin's four councils), each
   * carries the code of the one it lies in. Absent where ISO 3166-2 has no code for the region drawn (a county
   * merged away, a territory with none); docs/iso-codes.md in the repository lists them with the reasons.
   */
  iso?: string;
  /** Its English name. */
  name: string;
  /** Its name in Japanese, where there is one. */
  nameJa?: string;
  /** The everyday short name where it is not `nameJa` (アメリカ for アメリカ合衆国). */
  nameShortJa?: string;
  /** How `nameShortJa ?? nameJa` is read, in kana, where it is written with kanji and the reading is known. */
  reading?: string;
  /** What kind of region it sits among, for choosing look-alikes: a continent on the world, a larger part of the country on a country's map. */
  group: string;
  /** `group` in Japanese, where it is known: the continent on the world (アジア), the region on Japan's map (関東地方), the Census region on the United States' (南部). */
  groupJa?: string;
  /** What kind of division it is, as Natural Earth names it, lower case: `province`, `state`, `prefecture`. */
  type?: string;
  /** The three-letter code, on the world and on a country's own map. */
  iso3?: string;
  /** Its outline, `M x,y L x,y … Z` with one piece for each part (islands are pieces), on the map's canvas. */
  path: string;
  /** The box round all of it. */
  bbox: [number, number, number, number];
  /** The middle of it, which falls in the sea when the place is a chain or a crescent: `landAnchor` finds a point on its land. */
  centroid: [number, number];
  /** The codes of the regions that share a border point with it, in order. */
  neighbors: string[];
}

/**
 * A region the map draws in a box of its own, instead of where its projection put it (Alaska, Hawaii, Okinawa).
 *
 * @example
 * ```ts
 * import { loadDivisions } from "@johnmorrisdotca/chizu/load";
 * import type { ChizuInset } from "@johnmorrisdotca/chizu";
 *
 * const japan = (await loadDivisions("jp"))!;
 * // Kagoshima stays where it is; only its islands south of Yakushima go in the box.
 * const kagoshima: ChizuInset = japan.insets.find((inset) => inset.code === "46")!;
 * console.log(kagoshima.box, kagoshima.outlyingBelow !== undefined);
 * // { x: 495, y: 10, width: 120, height: 230 } true
 * ```
 */
export interface ChizuInset {
  /** The region drawn in the box. */
  code: string;
  /** Where the box is on the map's canvas. */
  box: MapBox;
  /** Only the region's outlying islands go in the box: the pieces that begin below this line on the canvas. The rest stays where it is. */
  outlyingBelow?: number;
  /** Whether the box may make what it holds bigger than life. Off, a region is only ever shrunk to fit. */
  magnify?: boolean;
}

/**
 * How a map's canvas was made from the earth, enough to put a longitude and latitude on it (`projectPoint`):
 * Miller's cylindrical projection round a centre longitude (the world), or a Lambert azimuthal equal-area
 * projection round a centre (one country on its own).
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import type { ChizuProjection } from "@johnmorrisdotca/chizu";
 *
 * const projection: ChizuProjection = WORLD.projection;
 * console.log(projection.kind, projection.kind === "miller" ? projection.centre : "");
 * // miller 155
 * ```
 */
export type ChizuProjection =
  | { kind: "miller"; centre: number; scale: number; translate: [number, number] }
  | { kind: "azimuthal-equal-area"; centre: [number, number]; scale: number; translate: [number, number] }
  | { kind: "other"; description: string };

/**
 * A map: a canvas and its regions. What every file of data holds, and what every function of the engine takes.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import type { ChizuMap } from "@johnmorrisdotca/chizu";
 *
 * const map: ChizuMap = WORLD;
 * console.log(map.id, map.kind, map.viewBox, map.regions.length, map.wraps);
 * // world world 0 0 1000 489 173 true
 * ```
 */
export interface ChizuMap {
  /** `world`, `country-fr` (France alone, from Natural Earth's countries) or `divisions-fr` (its départements). */
  id: string;
  /** What its regions are: the whole `world`, a single `country`, or the `divisions` of one. */
  kind: "world" | "country" | "divisions";
  /** The map's name in English and Japanese. */
  name: string;
  nameJa?: string;
  /** What a region is called here, singular and plural, in English: `Country`, `Province`. */
  regionName: string;
  regionNamePlural: string;
  /** The canvas: `0 0 width height`. */
  viewBox: string;
  width: number;
  height: number;
  /** Whether its east edge is its west edge: a map of the earth is a cylinder cut open, and pans round without stopping. */
  wraps: boolean;
  projection: ChizuProjection;
  /** The regions drawn in boxes of their own. */
  insets: ChizuInset[];
  /** Where the outlines come from, in a line. */
  source: string;
  regions: ChizuRegion[];
}

/**
 * The part of a region the engine reads, so a map of your own regions needs no more than these.
 *
 * @example
 * ```ts
 * import { findQuestion, seededRandom, type ChizuPlace } from "@johnmorrisdotca/chizu";
 *
 * // Three places of your own, drawn on a canvas 100 wide: the engine needs no more than these fields.
 * const square = (code: string, x: number): ChizuPlace => ({
 *   code,
 *   path: `M${x},0L${x + 30},0L${x + 30},30L${x},30Z`,
 *   bbox: [x, 0, x + 30, 30],
 *   centroid: [x + 15, 15],
 *   neighbors: [],
 *   group: "squares",
 * });
 * const places = [square("a", 0), square("b", 35), square("c", 70)];
 * console.log(findQuestion({ width: 100, height: 30, regions: places.map((place) => ({ ...place, name: place.code })) }, "b", seededRandom(1), { count: 2 })?.choices.length);
 * // 3
 * ```
 */
export type ChizuPlace = Pick<ChizuRegion, "code" | "path" | "bbox" | "centroid" | "neighbors" | "group">;

/**
 * One country in the table of every country: its names, and which of the maps has it.
 *
 * @example
 * ```ts
 * import { CHIZU_COUNTRIES } from "@johnmorrisdotca/chizu/names";
 * import type { ChizuCountry } from "@johnmorrisdotca/chizu";
 *
 * const withRegions: ChizuCountry[] = CHIZU_COUNTRIES.filter((country) => country.hasDivisions);
 * console.log(withRegions.length, withRegions.map((country) => country.code).slice(0, 5).join(" "));
 * // 32 AR AT AU BE BR
 * ```
 */
export interface ChizuCountry {
  /** ISO 3166-1 alpha-2, or Natural Earth's own three letters where a territory has none. Lower case in a file's name. */
  code: string;
  iso3: string;
  name: string;
  nameJa: string;
  nameShortJa?: string;
  reading?: string;
  /** The continent. */
  group: string;
  /** Whether the coarse world map draws it (the smallest places are only in the country's own file). */
  onWorld: boolean;
  /** Whether it has a map of its own regions: its provinces, states or departments. */
  hasDivisions: boolean;
}

/**
 * A named group of places: a continent, a UN M49 subregion, or any set of codes a page names (the countries of the
 * EU, Japan's Kanto region). The continents and subregions are `CHIZU_CONTINENTS` and `CHIZU_SUBREGIONS`; a map's own
 * groups are `regionGroups(map)`; and any list of codes works with `groupMap`, `groupBox` and `groupTones`.
 *
 * @example
 * ```ts
 * import { CHIZU_SUBREGIONS } from "@johnmorrisdotca/chizu/names";
 * import type { ChizuGroup } from "@johnmorrisdotca/chizu";
 *
 * const eastAsia: ChizuGroup = CHIZU_SUBREGIONS.find((group) => group.code === "030")!;
 * console.log(eastAsia.name, eastAsia.nameJa, eastAsia.codes.join(" "));
 * // Eastern Asia 東アジア CN HK JP KP KR MN MO TW
 * ```
 */
export interface ChizuGroup {
  /** Its code: `AS` for a continent, the UN M49 number for a subregion (`030`), the English name for a group of a map's regions. */
  code: string;
  /** What kind of group it is. */
  kind: "continent" | "subregion" | "region";
  name: string;
  nameJa?: string;
  /** How `nameJa` is read, in kana. */
  reading?: string;
  /** The codes of the places in it, in order. */
  codes: string[];
}

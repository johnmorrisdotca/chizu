/**
 * THE SHAPES chizu's maps and engine share. Plain data: a map is a canvas (a width and a height in its own units,
 * 1000 across or tall at most for a country) and the regions drawn on it, each region an SVG path in the canvas's
 * coordinates with the box round it, a centre, and the codes of the regions it touches. Nothing here knows which
 * country it is, so the same engine frames, zooms and numbers a world, a country's provinces or a map of your own.
 */

/** A window on a map, in the map's own units: what an SVG `viewBox` says. */
export type MapBox = { x: number; y: number; width: number; height: number };

/** The box round a shape: left, top, right, bottom. */
export type Bounds = readonly [number, number, number, number];

/** One place on a map: a country on the world, a province or state on a country. */
export interface ChizuRegion {
  /** Its code within its map: an ISO 3166-1 alpha-2 code on the world (`JP`), the postal or ISO 3166-2 part on a country (`ON`). */
  code: string;
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

/** A region the map draws in a box of its own, instead of where its projection put it (Alaska, Hawaii, Okinawa). */
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
 */
export type ChizuProjection =
  | { kind: "miller"; centre: number; scale: number; translate: [number, number] }
  | { kind: "azimuthal-equal-area"; centre: [number, number]; scale: number; translate: [number, number] }
  | { kind: "other"; description: string };

/** A map: a canvas and its regions. What every file of data holds, and what every function of the engine takes. */
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

/** The part of a region the engine reads, so a map of your own regions needs no more than these. */
export type ChizuPlace = Pick<ChizuRegion, "code" | "path" | "bbox" | "centroid" | "neighbors" | "group">;

/** One country in the table of every country: its names, and which of the maps has it. */
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

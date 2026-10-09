// Builds every file of map data under src/data/ from Natural Earth: `pnpm data`.
//
//   src/data/world.ts                the world, every country a region (Natural Earth admin-0 at 1:110m)
//   src/data/countries/<xx>.ts       each country alone, finer (admin-0 at 1:50m, and at 1:10m for the small ones), on a canvas of its own
//   src/data/divisions/<xx>.ts       the provinces, states, prefectures or départements of 32 countries (admin-1 at 1:10m)
//   src/data/countries.ts            the table of every country: names in English and Japanese, and what it has
//   src/data/loaders.ts              one dynamic import for each file above
//
// SOURCE AND LICENCE. Natural Earth (naturalearthdata.com), release 5.1.2, read from the project's own repository at
// that tag, each file checked against the SHA-256 written in data-config.mjs. Natural Earth is in the public domain:
// "No permission is needed to use Natural Earth. Crediting the authors is unnecessary." Its names in other languages
// come from Wikidata, which is CC0. The names in English and Japanese, the readings, the continents and the ISO 3166-2
// codes are kuni's (@johnmorrisdotca/kuni, a development dependency pinned in package.json and in data-config.mjs),
// whose names are Unicode CLDR's and Wikidata's. The files are downloaded once into .cache/ (or CHIZU_CACHE) and the build reads
// that copy, so it makes the same files each time and needs the network only the first time.
//
// DETERMINISTIC. No clock, no randomness, no network after the download: the same Natural Earth files and the same
// d3-geo version (pinned by the lockfile) write the same bytes. `pnpm data` twice leaves the working tree clean.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";

import { CONTINENTS as KUNI_CONTINENTS, continentName, countries as kuniCountries, country as kuniCountry, subregionName } from "@johnmorrisdotca/kuni";
import { groupings as kuniGroupings } from "@johnmorrisdotca/kuni/groupings";
import { subdivision as kuniSubdivision } from "@johnmorrisdotca/kuni/subdivisions";
import { geoAlbers, geoArea, geoAzimuthalEqualArea, geoCentroid, geoConicEqualArea, geoDistance, geoMercator, geoPath, geoProjection } from "d3-geo";

import {
  AMAMI,
  CONTINENT_NAMES,
  DIVISION_CONFIGS,
  EXCLUDED,
  ISO_JOIN,
  JAPAN_GROUPING,
  JAPAN_OUTLYING,
  KANJI_READINGS,
  KUNI,
  KUNI_NAMES_KEPT_FROM_NATURAL_EARTH,
  NAME_FIXES,
  NATURAL_EARTH,
  REGION_GROUPS,
  SHORT_NAME_READINGS,
  GROUP_READINGS,
  SHORT_NAMES_NOT_EVERYDAY,
  SHORT_ENGLISH_NOT_FOR_MAPS,
  DISPLAY_NAMES,
  CONTINENT_OVERRIDES,
} from "./data-config.mjs";
import { featureSources, featuresOn } from "./build-features.mjs";
import { root, source } from "./natural-earth.mjs";

const out = join(root, "src", "data");
const PRECISION = 2;
const WORLD_WIDTH = 1000;
/** 155°E in the middle: the Pacific whole, Japan at the centre, the seam west of Iceland, as a Japanese classroom's wall map draws it. */
const CENTRE_LONGITUDE = 155;
/** A country alone is drawn on a canvas whose longer side is this. */
const COUNTRY_SIDE = 1000;
/** How far from a country's largest piece (in degrees of the earth's surface) another piece may lie and still be drawn on its own map. */
const NEAR_DEGREES = 9;
/** A country smaller than this (in square kilometres) is drawn from the 1:10m file: at 1:50m Singapore and Malta are hexagons. */
const SMALL_KM2 = 60000;
const EARTH_RADIUS_KM = 6371;
const CONTINENTS = ["Asia", "Europe", "Africa", "North America", "South America", "Oceania", "Antarctica"];

const round = (value) => Math.round(value * 10 ** PRECISION) / 10 ** PRECISION;
/*
 * The numbers a map keeps about its projection (to put a longitude and latitude on it) are rounded, because the last
 * digits of a fitted scale are not the same on every machine: a computer's trigonometry differs by a part in 10^12,
 * and `pnpm data` must write the same bytes on a Mac and on the CI runner. The paths are not affected (they are
 * rounded to two decimals from the exact projection, and are the same on both), and a rounded scale places a point
 * to a ten-thousandth of a unit.
 */
const fixed = (digits) => (value) => Math.round(value * 10 ** digits) / 10 ** digits;
const keepScale = fixed(2);
const keepTranslate = fixed(3);
const keepDegrees = fixed(6);

/**
 * A path as the engine wants it: `M x,y L x,y … Z` a piece, coordinates to two decimals, a point that rounding left on
 * top of the one before it taken out, and a piece with fewer than three corners left out.
 */
function tidy(d) {
  const pieces = [];
  for (const part of d.split(/(?=M)/)) {
    const numbers = part.match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g)?.map(Number) ?? [];
    const points = [];
    for (let i = 0; i + 1 < numbers.length; i += 2) {
      const x = round(numbers[i]);
      const y = round(numbers[i + 1]);
      const last = points.at(-1);
      if (last !== undefined && last[0] === x && last[1] === y) continue;
      points.push([x, y]);
    }
    if (points.length > 1 && points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1]) points.pop();
    if (points.length < 3) continue;
    pieces.push(`M${points.map(([x, y]) => `${x},${y}`).join("L")}Z`);
  }
  return pieces.join("");
}

function coordinatesOf(geometry) {
  const points = [];
  const walk = (node) => {
    if (!Array.isArray(node)) return;
    if (typeof node[0] === "number") points.push(node);
    else for (const child of node) walk(child);
  };
  walk(geometry?.coordinates);
  return points;
}

/** Two regions are neighbours when their outlines share a point (to three decimals of a degree). */
function neighboursBySharedPoints(features, codeOf) {
  const owners = new Map();
  features.forEach((feature, index) => {
    for (const [x, y] of coordinatesOf(feature.geometry)) {
      const key = `${x.toFixed(3)},${y.toFixed(3)}`;
      const held = owners.get(key);
      if (held === undefined) owners.set(key, new Set([index]));
      else held.add(index);
    }
  });
  const touching = features.map(() => new Set());
  for (const held of owners.values()) {
    if (held.size < 2) continue;
    for (const a of held) for (const b of held) if (a !== b) touching[a].add(b);
  }
  return touching.map((set) => [...set].map((index) => codeOf(features[index])).sort());
}

/** The shape of one region as the data holds it. */
function regionOf(draw, feature, fields) {
  const d = draw(feature);
  if (!d) throw new Error(`no path for ${fields.name}`);
  const [[minX, minY], [maxX, maxY]] = draw.bounds(feature);
  const [cx, cy] = draw.centroid(feature);
  return { ...fields, path: tidy(d), bbox: [round(minX), round(minY), round(maxX), round(maxY)], centroid: [round(cx), round(cy)] };
}

const literal = (value) => JSON.stringify(value);

/** A data module: one map, exported as the default. */
function writeMap(path, header, map, doc = "") {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run \`pnpm data\` to make it again.
 * ${header}
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "${"../".repeat(path.slice(out.length + 1).split("/").length)}types.ts";

${doc}const map: ChizuMap = ${literal(map)};

export default map;
`,
  );
}

/** A data module of one map's features, exported as the default. */
function writeFeatures(path, map, features) {
  mkdirSync(dirname(path), { recursive: true });
  const count = (group) => features.filter((feature) => feature.group === group).length;
  const layer = {
    map: map.id,
    source: `Natural Earth ${NATURAL_EARTH.version} physical vectors, 1:10m, on the canvas of ${map.id}; names from Natural Earth and Wikidata`,
    features,
  };
  writeFileSync(
    path,
    `/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run \`pnpm data\` to make it again.
 * The named features of ${map.name} (${map.id}): ${count("marine")} seas, ${count("lakes")} lakes, ${count("rivers")} rivers, ${count("landforms")} landforms, ${count("peaks")} peaks, ${count("capitals")} capitals and seats.
 * Natural Earth is in the public domain (naturalearthdata.com); Wikidata's names are CC0. See NOTICE.md.
 */
import type { ChizuFeatureLayer } from "../../types.ts";

const layer: ChizuFeatureLayer = ${literal(layer)};

export default layer;
`,
  );
}

// ---- The names -------------------------------------------------------------------------------------------------

/** kuni is read from node_modules, and must be the version this script was written for: a newer one is a change of names, made on purpose. */
function checkKuni() {
  const installed = JSON.parse(readFileSync(join(root, "node_modules", ...KUNI.package.split("/"), "package.json"), "utf8")).version;
  if (installed !== KUNI.version) throw new Error(`${KUNI.package} ${installed} is installed; this script reads ${KUNI.version} (data-config.mjs)`);
}

/** How a name written with kanji is read, for the few places kuni does not know: the hand-written table, or null. A katakana name is its own reading. */
function readingOf(name) {
  if (KANJI_READINGS[name]) return KANJI_READINGS[name];
  if (/\p{Script=Han}/u.test(name)) return null;
  return name.replace(/・/g, "");
}

/** A name written in kana alone, as it is read: without its middle dots, its spaces and a bracketed second name (ミャンマー (ビルマ) is read ミャンマー). Null for a name with kanji in it. */
function kanaReading(name) {
  const bare = name.replace(/\s*[(（][^)）]*[)）]\s*/gu, "").replace(/[・\s]/gu, "");
  return /^[\p{Script=Katakana}\p{Script=Hiragana}ー]+$/u.test(bare) ? bare : null;
}

/** The code a Natural Earth country goes by: ISO alpha-2, or its own three letters for a place with none. Each is made unique by the caller. */
function isoOf(properties) {
  const iso = properties.ISO_A2_EH;
  return iso && iso !== "-99" ? iso : properties.ADM0_A3;
}

function countriesFrom(collection) {
  const taken = new Set();
  const features = collection.features
    .filter((feature) => !EXCLUDED.has(isoOf(feature.properties)))
    // A sovereign's own entry first, so a code two entries claim (Australia's two island territories use AU) goes to the one that is the country.
    .sort((a, b) => Number(b.properties.NAME === b.properties.ADMIN) - Number(a.properties.NAME === a.properties.ADMIN))
    .map((feature) => {
      let code = isoOf(feature.properties);
      if (taken.has(code)) code = feature.properties.ADM0_A3;
      if (taken.has(code)) throw new Error(`code ${code} is used twice (${feature.properties.NAME})`);
      taken.add(code);
      return { ...feature, properties: { ...feature.properties, __code: code } };
    });
  return features;
}

/**
 * A country's names: kuni's, which are CLDR's and Wikidata's, so that chizu and kuni never name a country two ways.
 * The three places Natural Earth draws that have no ISO code (Ashmore and Cartier, the Indian Ocean Territories,
 * the Siachen Glacier) are not in kuni, and keep Natural Earth's names.
 */
function namesOf(properties, code) {
  const known = kuniCountry(code);
  if (!known) {
    const nameJa = properties.NAME_JA;
    const reading = readingOf(nameJa);
    if (!reading) throw new Error(`${code}: no reading for ${nameJa}; add it to KANJI_READINGS`);
    return { name: properties.NAME, nameJa, reading };
  }
  const display = DISPLAY_NAMES[code] ?? {};
  const short = display.nameShortJa ?? (SHORT_NAMES_NOT_EVERYDAY.has(code) ? undefined : known.shortName?.ja);
  const reading = display.reading ?? (short ? (kanaReading(short) ?? SHORT_NAME_READINGS[short]) : (known.reading ?? kanaReading(known.name.ja)));
  if (!reading) throw new Error(`${code}: no reading for ${short ?? known.name.ja}; add it to SHORT_NAME_READINGS`);
  const name = display.name ?? (known.shortName?.en && !SHORT_ENGLISH_NOT_FOR_MAPS[code] ? known.shortName.en : known.name.en);
  return { name, nameJa: known.name.ja, ...(short ? { nameShortJa: short } : {}), reading };
}

/** A country's continent and three-letter code: kuni's, or Natural Earth's for the three places kuni does not have. */
function identityOf(properties, code) {
  const known = kuniCountry(code);
  const continent = CONTINENT_OVERRIDES[code]?.continent ?? known?.continent;
  return {
    group: known ? CONTINENT_NAMES[continent] : properties.CONTINENT,
    ...(known ? { groupJa: continentName(continent, "ja") } : {}),
    iso3: known ? known.alpha3 : properties.ISO_A3_EH && properties.ISO_A3_EH !== "-99" ? properties.ISO_A3_EH : properties.ADM0_A3,
  };
}

/**
 * The ISO 3166-2 code of one region of a country: Natural Earth's, when kuni has it, or the line in ISO_JOIN that
 * says what it is instead, or why there is none. A region with neither stops the build, so a new region or a new
 * kuni can never leave a code quietly wrong.
 */
function regionIso(country, feature) {
  const key = `${country}:${feature.properties.__code}`;
  const join = ISO_JOIN[key];
  const iso = join ? join.iso : feature.properties.iso_3166_2;
  if (!iso) {
    if (join) return null;
    throw new Error(`${key} (${feature.properties.name}) has no ISO 3166-2 code: give it a line in ISO_JOIN`);
  }
  if (!kuniSubdivision(iso)) throw new Error(`${key} (${feature.properties.name}): ${iso} is not in kuni ${KUNI.version}; give it a line in ISO_JOIN`);
  return iso;
}

/**
 * A region's names. One that is exactly one ISO subdivision (no other region of its map shares the code) takes
 * kuni's, but for the few kuni has wrong; the rest keep Natural Earth's; and NAME_FIXES has the last word, for two
 * regions that would otherwise share a name.
 */
function regionNames(country, feature, iso, shared) {
  const p = feature.properties;
  let name = p.name_en || p.name || p.__code;
  let nameJa = p.name_ja || undefined;
  const known = iso && !shared ? kuniSubdivision(iso) : null;
  if (known) {
    const kept = KUNI_NAMES_KEPT_FROM_NATURAL_EARTH[iso] ?? {};
    if (!kept.en) name = known.name.en;
    if (!kept.ja && known.name.ja) nameJa = known.name.ja;
  }
  const fix = NAME_FIXES[`${country}:${p.__code}`];
  if (fix?.name) name = fix.name;
  if (fix?.nameJa) nameJa = fix.nameJa;
  return { name, ...(nameJa ? { nameJa } : {}), ...(fix?.unnamed ? { unnamed: true } : {}) };
}

/** Each region's ISO code, and whether another region of the same map carries it too. */
function isoCodes(country, features) {
  const codes = features.map((feature) => regionIso(country, feature));
  const counts = new Map();
  for (const code of codes) if (code) counts.set(code, (counts.get(code) ?? 0) + 1);
  return codes.map((code) => ({ iso: code, shared: code !== null && counts.get(code) > 1 }));
}

// ---- The world --------------------------------------------------------------------------------------------------

/** Miller's cylindrical projection, as d3-geo-projection writes it: nine lines against a dependency. */
function millerRaw(lambda, phi) {
  return [lambda, 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * phi))];
}
millerRaw.invert = (x, y) => [x, 2.5 * Math.atan(Math.exp(0.8 * y)) - 0.625 * Math.PI];

/** The projection the world was fitted with, which its finer drawing is made with too. */
let worldProjection = null;
/** Each map's projection, by its id, for drawing its features on the same canvas (build-features.mjs). */
const projections = new Map();

function buildWorld(collection) {
  const features = countriesFrom(collection);
  const all = { type: "FeatureCollection", features };
  const projection = geoProjection(millerRaw).scale(108.318).rotate([-CENTRE_LONGITUDE, 0]).fitWidth(WORLD_WIDTH, all);
  const draw = geoPath(projection);
  const height = Math.ceil(draw.bounds(all)[1][1]);
  const near = neighboursBySharedPoints(features, (feature) => feature.properties.__code);
  const regions = features.map((feature, index) => {
    const p = feature.properties;
    return regionOf(draw, feature, {
      code: p.__code,
      ...namesOf(p, p.__code),
      ...identityOf(p, p.__code),
      path: "",
      neighbors: near[index],
    });
  });
  // In the order a directory reads them: by continent, then by English name.
  regions.sort((a, b) => CONTINENTS.indexOf(a.group) - CONTINENTS.indexOf(b.group) || a.name.localeCompare(b.name, "en"));
  const [tx, ty] = projection.translate();
  worldProjection = projection;
  projections.set("world", projection);
  return {
    id: "world",
    kind: "world",
    name: "World",
    nameJa: "世界",
    regionName: "Country",
    regionNamePlural: "Countries",
    viewBox: `0 0 ${WORLD_WIDTH} ${height}`,
    width: WORLD_WIDTH,
    height,
    wraps: true,
    projection: { kind: "miller", centre: CENTRE_LONGITUDE, scale: keepScale(projection.scale()), translate: [keepTranslate(tx), keepTranslate(ty)] },
    insets: [],
    source: `Natural Earth ${NATURAL_EARTH.version} admin-0 countries, 1:110m, Miller cylindrical centred on ${CENTRE_LONGITUDE}°E`,
    regions,
  };
}

/**
 * The world again, the same countries on the same canvas in the same projection, drawn from the 1:50m countries: what
 * a page draws when it is zoomed in far enough that the 1:110m coasts look angular (`mountChizu`'s `detail`). Only the
 * outlines and the boxes round them are finer; the codes, names, groups and neighbours are the world's own, so a tone
 * or a choice made on one is the same on the other.
 */
function buildWorldDetail(collection, world) {
  const byCode = new Map(countriesFrom(collection).map((feature) => [feature.properties.__code, feature]));
  const draw = geoPath(worldProjection);
  const regions = world.regions.map((region) => {
    const feature = byCode.get(region.code);
    if (!feature) throw new Error(`the 1:50m countries have no ${region.code}`);
    const { path, bbox, centroid } = regionOf(draw, feature, { name: region.name });
    return { ...region, path, bbox, centroid };
  });
  return {
    ...world,
    id: "world-detail",
    source: `Natural Earth ${NATURAL_EARTH.version} admin-0 countries, 1:50m, on the world's canvas: the same Miller cylindrical centred on ${CENTRE_LONGITUDE}°E`,
    regions,
  };
}

// ---- Each country alone -----------------------------------------------------------------------------------------

const DEGREES = 180 / Math.PI;

function polygonsOf(geometry) {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

/** Roughly how close two pieces come, in degrees, from a sample of their corners. Cheap, and exact enough to tell a neighbouring island from a colony on the far side of the earth. */
function gapBetween(a, b) {
  const sample = (polygon) => {
    const ring = polygon[0];
    const step = Math.max(1, Math.floor(ring.length / 150));
    return ring.filter((_, i) => i % step === 0);
  };
  let best = Infinity;
  for (const p of sample(a)) for (const q of sample(b)) best = Math.min(best, geoDistance(p, q) * DEGREES);
  return best;
}

/**
 * The pieces of a country that are drawn on its own map: its largest piece, and every piece within `NEAR_DEGREES`
 * of it, or of a piece that is. France's Corsica comes, its Guiana, Réunion and Pacific islands do not (they are on
 * the world map). A country that is one piece or a handful close together is drawn whole.
 */
function corePieces(geometry) {
  const polygons = polygonsOf(geometry);
  const sizes = polygons.map((polygon) => geoArea({ type: "Polygon", coordinates: polygon }));
  const biggest = sizes.indexOf(Math.max(...sizes));
  const kept = new Set([biggest]);
  let grew = true;
  while (grew) {
    grew = false;
    for (let i = 0; i < polygons.length; i += 1) {
      if (kept.has(i)) continue;
      if ([...kept].some((k) => gapBetween(polygons[i], polygons[k]) <= NEAR_DEGREES)) {
        kept.add(i);
        grew = true;
      }
    }
  }
  return polygons.filter((_, i) => kept.has(i));
}

function buildCountry(feature, near, fine) {
  const p = feature.properties;
  const code = p.__code;
  const area = geoArea(feature) * EARTH_RADIUS_KM ** 2;
  const finer = area < SMALL_KM2 ? fine.get(p.ADM0_A3) : undefined;
  const pieces = corePieces((finer ?? feature).geometry);
  const geometry = { type: "MultiPolygon", coordinates: pieces };
  const [lon, lat] = geoCentroid(geometry);
  const projection = geoAzimuthalEqualArea().rotate([-lon, -lat]).fitExtent([[0, 0], [COUNTRY_SIDE, COUNTRY_SIDE]], geometry);
  const draw = geoPath(projection);
  const [[x0, y0], [x1, y1]] = draw.bounds(geometry);
  const [tx, ty] = projection.translate();
  projection.translate([tx - x0, ty - y0]);
  const width = Math.round(x1 - x0);
  const height = Math.round(y1 - y0);
  const shown = { ...feature, geometry };
  const region = regionOf(geoPath(projection), shown, {
    code,
    ...namesOf(p, code),
    ...identityOf(p, code),
    path: "",
    neighbors: near,
  });
  const names = namesOf(p, code);
  projections.set(`country-${code.toLowerCase()}`, projection);
  return {
    id: `country-${code.toLowerCase()}`,
    kind: "country",
    name: names.name,
    ...(names.nameJa ? { nameJa: names.nameShortJa ?? names.nameJa } : {}),
    regionName: "Country",
    regionNamePlural: "Countries",
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    wraps: false,
    projection: { kind: "azimuthal-equal-area", centre: [keepDegrees(lon), keepDegrees(lat)], scale: keepScale(projection.scale()), translate: projection.translate().map(keepTranslate) },
    insets: [],
    source: `Natural Earth ${NATURAL_EARTH.version} admin-0 countries, ${finer ? "1:10m" : "1:50m"}, Lambert azimuthal equal-area centred on the country, longer side ${COUNTRY_SIDE}`,
    regions: [region],
  };
}

// ---- The regions of a country ----------------------------------------------------------------------------------

function withRegionCodes(config, rawFeatures) {
  const counts = new Map();
  return rawFeatures.filter(config.filter).map((feature) => {
    let code = config.codeFn(feature);
    if (!code) code = (feature.properties.name_en || feature.properties.name || "REG").slice(0, 3).toUpperCase();
    const seen = counts.get(code) ?? 0;
    counts.set(code, seen + 1);
    if (seen > 0) code = `${code}_${seen + 1}`;
    return { ...feature, properties: { ...feature.properties, __code: code } };
  });
}

/** The larger part of the country a region is in, in English and, where it is known, Japanese: REGION_GROUPS's where it has the country, Natural Earth's otherwise. */
function groupOf(config, feature) {
  const groups = REGION_GROUPS[config.code];
  const group = groups?.members?.[feature.properties.__code] ?? config.regionFn(feature);
  if (groups?.members && !groups.members[feature.properties.__code]) throw new Error(`${config.code}:${feature.properties.__code} has no group in REGION_GROUPS`);
  const groupJa = groups?.names[group];
  if (groups && !groupJa) throw new Error(`${config.code}: no Japanese name for the group ${group}`);
  return { group, ...(groupJa ? { groupJa } : {}) };
}

/** The fields a region of a country's map carries before its outline: its codes, names, larger part and kind. */
function regionFields(config, feature, iso, shared) {
  const p = feature.properties;
  return {
    code: p.__code,
    ...(iso ? { iso } : {}),
    ...regionNames(config.code, feature, iso, shared),
    ...groupOf(config, feature),
    ...(p.type_en ? { type: p.type_en.toLowerCase() } : {}),
    path: "",
  };
}

function regionsOf(draw, features, config) {
  const near = neighboursBySharedPoints(features, (feature) => feature.properties.__code);
  const isos = isoCodes(config.code, features);
  const regions = features.map((feature, index) =>
    regionOf(draw, feature, { ...regionFields(config, feature, isos[index].iso, isos[index].shared), neighbors: near[index] }),
  );
  regions.sort((a, b) => a.code.localeCompare(b.code));
  return regions;
}

function buildDivisions(config, rawFeatures, countryNames) {
  const features = withRegionCodes(config, rawFeatures);
  if (features.length === 0) throw new Error(`no regions for ${config.code}`);
  const projection = config.projection().fitSize([config.width, config.height], { type: "FeatureCollection", features });
  const regions = regionsOf(geoPath(projection), features, config);
  projections.set(`divisions-${config.code.toLowerCase()}`, projection);
  return {
    id: `divisions-${config.code.toLowerCase()}`,
    kind: "divisions",
    name: config.countryName,
    ...(countryNames.get(config.code)?.nameJa ? { nameJa: countryNames.get(config.code).nameJa } : {}),
    regionName: config.divisionTypeName,
    regionNamePlural: config.divisionTypePlural,
    viewBox: `0 0 ${config.width} ${config.height}`,
    width: config.width,
    height: config.height,
    wraps: false,
    projection: { kind: "other", description: `d3-geo ${config.projection.toString().replace(/^\(\) => /, "").replace(/\s+/g, " ")}, fitted to ${config.width}x${config.height}` },
    insets: [],
    source: `Natural Earth ${NATURAL_EARTH.version} admin-1 states and provinces, 1:10m, fitted to ${config.width}x${config.height}`,
    regions,
  };
}

/**
 * The United States: the lower forty-eight and the District in an Albers equal-area conic, and Alaska and Hawaii each
 * in a conic of its own at the same scale, then drawn in boxes of their own under the lower forty-eight (the map's
 * `insets`), the way every published map of the country does it.
 */
function buildUnitedStates(rawFeatures, countryNames) {
  const config = { code: "US", regionFn: (f) => f.properties.region || "United States" };
  const states = withRegionCodes({ filter: (f) => f.properties.iso_a2 === "US", codeFn: (f) => f.properties.postal }, rawFeatures);
  const lower = states.filter((f) => f.properties.__code !== "AK" && f.properties.__code !== "HI");
  const width = 1000;
  const mainHeight = 600;
  const main = geoAlbers().fitExtent([[0, 0], [width, mainHeight]], { type: "FeatureCollection", features: lower });
  const k = main.scale();
  const alaska = geoConicEqualArea().parallels([55, 65]).rotate([154, 0]).center([0, 62]).scale(k).translate([0, 0]);
  const hawaii = geoConicEqualArea().parallels([8, 18]).rotate([157, 0]).center([0, 20]).scale(k).translate([0, 0]);
  const near = neighboursBySharedPoints(states, (feature) => feature.properties.__code);
  const isos = isoCodes(config.code, states);
  const regions = states.map((feature, index) => {
    const p = feature.properties;
    const projection = p.__code === "AK" ? alaska : p.__code === "HI" ? hawaii : main;
    return regionOf(geoPath(projection), feature, { ...regionFields(config, feature, isos[index].iso, isos[index].shared), neighbors: near[index] });
  });
  regions.sort((a, b) => a.code.localeCompare(b.code));
  projections.set("divisions-us", main);
  const height = 740;
  return {
    id: "divisions-us",
    kind: "divisions",
    name: "United States",
    ...(countryNames.get("US")?.nameJa ? { nameJa: countryNames.get("US").nameJa } : {}),
    regionName: "State",
    regionNamePlural: "States",
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    wraps: false,
    projection: { kind: "other", description: `d3-geo geoAlbers for the lower 48, a conic equal-area of its own for Alaska and for Hawaii, at one scale; fitted to ${width}x${mainHeight}` },
    insets: [
      { code: "AK", box: { x: 20, y: 610, width: 360, height: 120 } },
      { code: "HI", box: { x: 400, y: 640, width: 230, height: 90 } },
    ],
    source: `Natural Earth ${NATURAL_EARTH.version} admin-1 states and provinces, 1:10m; Alaska and Hawaii drawn in boxes under the lower 48`,
    regions,
  };
}

/** Okinawa's pieces that are the Amami Islands, which Natural Earth draws inside Okinawa, moved to Kagoshima (see AMAMI in data-config.mjs). */
function withAmamiInKagoshima(features) {
  const isAmami = (polygon) => {
    const ring = polygon[0];
    return Math.min(...ring.map(([lon]) => lon)) >= AMAMI.eastOf && Math.min(...ring.map(([, lat]) => lat)) >= AMAMI.northOf;
  };
  const okinawa = features.find((feature) => feature.properties.iso_3166_2 === "JP-47");
  const amami = polygonsOf(okinawa.geometry).filter(isAmami);
  if (amami.length === 0) throw new Error("no Amami Islands in Okinawa: has Natural Earth changed?");
  return features.map((feature) => {
    if (feature === okinawa) return { ...feature, geometry: { type: "MultiPolygon", coordinates: polygonsOf(feature.geometry).filter((polygon) => !isAmami(polygon)) } };
    if (feature.properties.iso_3166_2 === "JP-46") return { ...feature, geometry: { type: "MultiPolygon", coordinates: [...polygonsOf(feature.geometry), ...amami] } };
    return feature;
  });
}

/**
 * Japan's eight regions, from kuni's grouping (JAPAN_GROUPING in data-config.mjs): for each prefecture's ISO code, its
 * `group`, `groupJa` and `groupAliases`.
 */
function japanGroups() {
  const set = kuniGroupings({ kind: "subdivision" }).filter((one) => one.sets?.includes(JAPAN_GROUPING));
  if (set.length !== 8) throw new Error(`kuni's ${JAPAN_GROUPING} has ${set.length} regions, not 8`);
  const byIso = new Map();
  const bare = (name) => name.replace(/ region$/u, "").replace(/地方$/u, "");
  for (const region of set) {
    const others = (region.otherNames ?? []).flatMap((other) => [other.en, other.ja].filter(Boolean));
    const aliases = [...new Set([...others.flatMap((name) => [name, bare(name)]), bare(region.name.ja)])];
    const fields = { group: bare(region.name.en), groupJa: region.name.ja, ...(others.length > 0 ? { groupAliases: aliases } : {}) };
    for (const iso of region.members) byIso.set(iso, fields);
  }
  return (iso) => {
    const fields = byIso.get(iso);
    if (!fields) throw new Error(`${iso} is in none of kuni's ${JAPAN_GROUPING}`);
    return fields;
  };
}

/** A prefecture's pieces whose northern edge is south of a latitude: the outlying islands that go in a box. */
const northernEdge = (polygon) => Math.max(...polygon[0].map(([, lat]) => lat));

/**
 * Japan's forty-seven prefectures. The mainland, from Rebun to Yakushima and down the Izu Islands to Torishima, in
 * Mercator fitted to a canvas 1000 across, the framing of the Japanese study app this package came from. Okinawa
 * is drawn in a box off the south-east, where the map is open Pacific; Kagoshima's islands south of Yakushima in a
 * box above it, which is north, as they lie; Tokyo's islands south of Torishima (Ogasawara, the Volcano Islands and
 * Minamitorishima) in a box east of Tohoku. Codes are the prefecture numbers, `"1"` to `"47"`, with `iso` the
 * ISO 3166-2 code (`JP-01`); the names and readings are kuni's.
 */
function buildJapan(rawFeatures, countryNames) {
  const raw = rawFeatures.filter((feature) => feature.properties.iso_a2 === "JP");
  if (raw.length !== 47) throw new Error(`Japan: ${raw.length} prefectures in Natural Earth, not 47`);
  const features = withAmamiInKagoshima(raw).map((feature) => ({
    ...feature,
    properties: { ...feature.properties, __code: String(Number(feature.properties.iso_3166_2.slice(3))) },
  }));
  const mainland = features
    .filter((feature) => feature.properties.__code !== "47")
    .map((feature) => {
      const south = feature.properties.__code === "46" ? JAPAN_OUTLYING.kagoshimaSouthOf : feature.properties.__code === "13" ? JAPAN_OUTLYING.tokyoSouthOf : -90;
      return { ...feature, geometry: { type: "MultiPolygon", coordinates: polygonsOf(feature.geometry).filter((polygon) => northernEdge(polygon) >= south) } };
    });
  const width = 1000;
  const projection = geoMercator().fitWidth(width, { type: "FeatureCollection", features: mainland });
  const draw = geoPath(projection);
  const height = Math.ceil(draw.bounds({ type: "FeatureCollection", features: mainland })[1][1]);
  /* The line below which a prefecture's pieces are its outlying islands, on the canvas: a piece is outlying when its top is below it; and a rectangle of longitude and latitude on the canvas, for a box that takes the islands inside it. */
  const lineAt = (lon, lat) => round(projection([lon, lat])[1]);
  const near = neighboursBySharedPoints(features, (feature) => feature.properties.__code);
  const isos = isoCodes("JP", features);
  const japanGroup = japanGroups();
  const regions = features.map((feature, index) => {
    const p = feature.properties;
    const known = kuniSubdivision(isos[index].iso);
    if (!known?.name.ja || !known.reading) throw new Error(`Japan ${p.__code}: kuni has no Japanese name or reading`);
    return regionOf(draw, feature, {
      code: p.__code,
      iso: isos[index].iso,
      name: known.name.en,
      nameJa: known.name.ja,
      reading: known.reading,
      ...japanGroup(isos[index].iso),
      type: p.type_en.toLowerCase(),
      path: "",
      neighbors: near[index],
    });
  });
  regions.sort((a, b) => Number(a.code) - Number(b.code));
  projections.set("divisions-jp", projection);
  const [tx, ty] = projection.translate();
  return {
    id: "divisions-jp",
    kind: "divisions",
    name: "Japan",
    ...(countryNames.get("JP")?.nameJa ? { nameJa: countryNames.get("JP").nameJa } : {}),
    regionName: "Prefecture",
    regionNamePlural: "Prefectures",
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    wraps: false,
    projection: { kind: "other", description: `d3-geo geoMercator, fitted to the mainland ${width} across (scale ${keepScale(projection.scale())}, translate ${keepTranslate(tx)},${keepTranslate(ty)})` },
    insets: JAPAN_INSETS(lineAt, (lon0, lat0, lon1, lat1) => {
      const [x0, y1] = projection([lon0, lat0]).map(round);
      const [x1, y0] = projection([lon1, lat1]).map(round);
      return { x: x0, y: y0, width: round(x1 - x0), height: round(y1 - y0) };
    }),
    source: `Natural Earth ${NATURAL_EARTH.version} admin-1 states and provinces, 1:10m, the Amami Islands given back to Kagoshima; Okinawa, Kagoshima's islands south of Yakushima and Tokyo's south of Torishima drawn in boxes, each holding its own part of the sea`,
    regions,
  };
}

/**
 * Where Japan's boxes sit. In the Sea of Japan, where a Japanese atlas puts them, each where it lies from the others:
 * Okinawa's main islands large in the middle, the Sakishima Islands south-west of them, Kagoshima's islands south of
 * Yakushima (the Tokara and Amami Islands) north-east, and the Daito Islands east; at the bottom right
 * Tokyo's Ogasawara Islands (Chichijima, Hahajima) large, and beside them Nishinoshima and the Volcano Islands, and
 * Minamitorishima, 1,800 km out. Each box holds
 * the islands of its own part of the sea (`within`, a rectangle of longitude and latitude on the canvas), magnified
 * to fill it, so Okinawa's main island is a shape and not a speck. Chosen against the data: a test checks that no
 * other region reaches into a box.
 */
function JAPAN_INSETS(lineAt, area) {
  return [
    { code: "13", box: { x: 790, y: 880, width: 40, height: 200 }, within: area(141.9, 26.4, 142.5, 27.9), magnify: true },
    { code: "13", box: { x: 840, y: 880, width: 40, height: 140 }, within: area(140.6, 24, 141.7, 27.5), magnify: true },
    { code: "13", box: { x: 840, y: 1035, width: 35, height: 35 }, within: area(153.5, 24, 154.5, 24.7), magnify: true },
    { code: "46", box: { x: 300, y: 160, width: 110, height: 230 }, outlyingBelow: lineAt(130, JAPAN_OUTLYING.kagoshimaSouthOf), magnify: true },
    { code: "47", box: { x: 200, y: 420, width: 230, height: 280 }, within: area(126.5, 25.9, 128.6, 28.1), magnify: true },
    { code: "47", box: { x: 20, y: 570, width: 170, height: 125 }, within: area(122.5, 24, 125.7, 26.1), magnify: true },
    { code: "47", box: { x: 440, y: 450, width: 40, height: 50 }, within: area(130.9, 24.3, 131.6, 26.1), magnify: true },
  ];
}

// ---- The tables ------------------------------------------------------------------------------------------------

async function main() {
  checkKuni();
  const worldSource = await source("ne_110m_admin_0_countries.geojson");
  const countriesSource = await source("ne_50m_admin_0_countries.geojson");
  const fineSource = await source("ne_10m_admin_0_countries.geojson");
  const fine = new Map(fineSource.features.map((feature) => [feature.properties.ADM0_A3, feature]));
  const divisionsSource = await source("ne_10m_admin_1_states_provinces.geojson");

  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  const world = buildWorld(worldSource);
  writeMap(
    join(out, "world.ts"),
    `The world: ${world.regions.length} countries, ${world.source}.`,
    world,
    `/**
 * The world, every country a region, on one canvas ${world.width} wide that wraps round.
 *
 * @example
 * \`\`\`ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 *
 * const japan = WORLD.regions.find((region) => region.code === "JP")!;
 * console.log(WORLD.regions.length, WORLD.viewBox, japan.nameJa, japan.groupJa);
 * // ${world.regions.length} ${world.viewBox} 日本 アジア
 * \`\`\`
 */
`,
  );
  const onWorld = new Set(world.regions.map((r) => r.code));
  const worldDetail = buildWorldDetail(countriesSource, world);
  writeMap(
    join(out, "world-detail.ts"),
    `The world drawn finer, for a page zoomed in: ${worldDetail.regions.length} countries, ${worldDetail.source}.`,
    worldDetail,
    `/**
 * The world drawn finer: the same countries, canvas and projection as the world, from the 1:50m outlines.
 *
 * @example
 * \`\`\`ts
 * import { loadWorldDetail } from "@johnmorrisdotca/chizu/load";
 * import WORLD from "@johnmorrisdotca/chizu/world";
 *
 * const detail = await loadWorldDetail();
 * console.log(detail.id, detail.viewBox === WORLD.viewBox, detail.regions.length === WORLD.regions.length);
 * // world-detail true true
 * \`\`\`
 */
`,
  );

  const allMaps = [world];
  const countries = countriesFrom(countriesSource);
  const near = neighboursBySharedPoints(countries, (feature) => feature.properties.__code);
  const table = [];
  const loaders = { countries: [], divisions: [] };
  const countryNames = new Map();
  for (const [index, feature] of countries.entries()) {
    const p = feature.properties;
    const names = namesOf(p, p.__code);
    countryNames.set(p.__code, { ...names, nameJa: names.nameShortJa ?? names.nameJa });
    const map = buildCountry(feature, near[index], fine);
    const file = p.__code.toLowerCase();
    writeMap(join(out, "countries", `${file}.ts`), `${names.name}, alone: ${map.source}.`, map);
    allMaps.push(map);
    loaders.countries.push(file);
    table.push({
      code: p.__code,
      iso3: map.regions[0].iso3,
      ...names,
      nameJa: names.nameJa ?? names.name,
      group: map.regions[0].group,
      onWorld: onWorld.has(p.__code),
      hasDivisions: false,
    });
  }

  const configs = [...DIVISION_CONFIGS];
  const divisionCodes = new Set([...configs.map((c) => c.code), "US", "JP"]);
  for (const entry of table) entry.hasDivisions = divisionCodes.has(entry.code);
  const missing = [...divisionCodes].filter((code) => !table.some((entry) => entry.code === code));
  if (missing.length > 0) throw new Error(`regions asked for a country that has no map of its own: ${missing.join(" ")}`);
  const builtDivisions = [];
  for (const config of configs) builtDivisions.push(buildDivisions(config, divisionsSource.features, countryNames));
  builtDivisions.push(buildUnitedStates(divisionsSource.features, countryNames));
  builtDivisions.push(buildJapan(divisionsSource.features, countryNames));
  for (const map of builtDivisions) {
    const file = map.id.replace("divisions-", "");
    writeMap(join(out, "divisions", `${file}.ts`), `${map.name}: ${map.regions.length} ${map.regionNamePlural.toLowerCase()}, ${map.source}.`, map);
    allMaps.push(map);
    loaders.divisions.push(file);
  }
  loaders.divisions.sort();

  const sources = await featureSources({ divisions: [...divisionCodes] });
  loaders.features = [];
  for (const map of allMaps) {
    const avoid = map.insets.map((inset) => inset.box);
    const country = map.id === "world" ? null : (map.kind === "country" ? map.regions[0].code : map.id.slice("divisions-".length).toUpperCase());
    const features = featuresOn(map, projections.get(map.id), sources, { world: map.id === "world", avoid, country });
    if (features.length === 0) continue;
    writeFeatures(join(out, "features", `${map.id}.ts`), map, features);
    loaders.features.push(map.id);
  }
  loaders.features.sort();
  console.log(`features: ${loaders.features.length} maps · Japanese names ${JSON.stringify(sources.stats.japanese)} · readings ${JSON.stringify(sources.stats.readings)} · rivers ${JSON.stringify(sources.stats.rivers)}`);

  table.sort((a, b) => a.code.localeCompare(b.code));
  const inTable = new Set(table.map((entry) => entry.code));
  const groupsTable = (kind) => {
    const codes = kind === "continent" ? [...KUNI_CONTINENTS] : [...new Set(kuniCountries().map((one) => one.subregion).filter(Boolean))].sort();
    return codes.map((code) => {
      const nameJa = kind === "continent" ? continentName(code, "ja") : subregionName(code, "ja");
      const reading = kanaReading(nameJa) ?? GROUP_READINGS[nameJa];
      if (!reading) throw new Error(`no reading for ${nameJa}: add it to GROUP_READINGS`);
      return {
        code,
        kind,
        name: kind === "continent" ? continentName(code, "en") : subregionName(code, "en"),
        nameJa,
        reading,
        // A continent's members are the table's own (the three places kuni does not have are placed by Natural Earth's continent), a subregion's are kuni's.
        codes:
          kind === "continent"
            ? table.filter((entry) => entry.group === CONTINENT_NAMES[code]).map((entry) => entry.code)
            : kuniCountries()
                .filter((one) => one.subregion === code && inTable.has(one.alpha2))
                .map((one) => one.alpha2)
                .sort(),
      };
    });
  };
  writeFileSync(
    join(out, "countries.ts"),
    `/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run \`pnpm data\` to make it again.
 * Every country Natural Earth ${NATURAL_EARTH.version} draws at 1:50m (${table.length} of them): its names in English and
 * Japanese, which continent it is in, and which of the maps has it. The names, readings, continents and three-letter
 * codes are kuni's (${KUNI.package} ${KUNI.version}), which are Unicode CLDR's and Wikidata's: see NOTICE.md.
 */
import type { ChizuCountry, ChizuGroup } from "../types.ts";

/**
 * Every country, with its names in English and Japanese, its reading, its continent and which maps have it.
 *
 * @example
 * \`\`\`ts
 * import { CHIZU_COUNTRIES } from "@johnmorrisdotca/chizu/names";
 *
 * const asia = CHIZU_COUNTRIES.filter((country) => country.group === "Asia");
 * console.log(CHIZU_COUNTRIES.length, asia.length, asia.find((country) => country.code === "KR")?.nameJa);
 * // ${table.length} ${table.filter((entry) => entry.group === "Asia").length} 韓国
 * \`\`\`
 */
export const CHIZU_COUNTRIES: readonly ChizuCountry[] = ${literal(table)};

/**
 * The seven continents, as kuni has them (UN M49 by way of CLDR): the Americas are two, and Central America and the
 * Caribbean are in North America. Each with the countries of this table in it; every country is in exactly one.
 *
 * @example
 * \`\`\`ts
 * import { CHIZU_CONTINENTS } from "@johnmorrisdotca/chizu/names";
 *
 * console.log(CHIZU_CONTINENTS.map((continent) => \`\${continent.code} \${continent.nameJa} \${continent.codes.length}\`).join(", "));
 * // ${groupsTable("continent").map((group) => `${group.code} ${group.nameJa} ${group.codes.length}`).join(", ")}
 * \`\`\`
 */
export const CHIZU_CONTINENTS: readonly ChizuGroup[] = ${literal(groupsTable("continent"))};

/**
 * The twenty-two subregions of UN M49, as kuni has them, each with the countries of this table in it.
 *
 * @example
 * \`\`\`ts
 * import { CHIZU_SUBREGIONS } from "@johnmorrisdotca/chizu/names";
 *
 * const southeast = CHIZU_SUBREGIONS.find((group) => group.name === "Southeast Asia")!;
 * console.log(CHIZU_SUBREGIONS.length, southeast.code, southeast.nameJa, southeast.codes.length);
 * // ${groupsTable("subregion").length} 035 東南アジア ${groupsTable("subregion").find((group) => group.code === "035").codes.length}
 * \`\`\`
 */
export const CHIZU_SUBREGIONS: readonly ChizuGroup[] = ${literal(groupsTable("subregion"))};

/**
 * Where the data came from: Natural Earth's release and files, and the version of kuni the names were read from.
 *
 * @example
 * \`\`\`ts
 * import { CHIZU_SOURCE } from "@johnmorrisdotca/chizu/names";
 *
 * console.log(CHIZU_SOURCE.name, CHIZU_SOURCE.version, CHIZU_SOURCE.licence, "·", CHIZU_SOURCE.names.name, CHIZU_SOURCE.names.version);
 * // Natural Earth ${NATURAL_EARTH.version} Public domain · kuni ${KUNI.version}
 * \`\`\`
 */
export const CHIZU_SOURCE = ${literal({
      name: "Natural Earth",
      version: NATURAL_EARTH.version,
      repository: NATURAL_EARTH.repository,
      tag: NATURAL_EARTH.tag,
      retrieved: NATURAL_EARTH.retrieved,
      licence: "Public domain",
      files: Object.keys(NATURAL_EARTH.files),
      names: { name: "kuni", package: KUNI.package, version: KUNI.version, licence: "MIT; its names are Unicode CLDR's (Unicode-3.0) and Wikidata's (CC0)" },
    })};
`,
  );
  const lines = (list, folder) => list.map((file) => `  ${file}: () => import("./${folder}/${file}.ts"),`).join("\n");
  writeFileSync(
    join(out, "loaders.ts"),
    `/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run \`pnpm data\` to make it again.
 * One dynamic import for each country's own map and each country's regions, so that a bundler makes each its own
 * chunk and a page loads only the ones it draws.
 */
import type { ChizuFeatureLayer, ChizuMap } from "../types.ts";

type Load = () => Promise<{ default: ChizuMap }>;

/** Each country alone, by lower-case code. */
export const COUNTRY_LOADERS: Readonly<Record<string, Load>> = {
${lines(loaders.countries, "countries")}
};

/** The world drawn finer, from the 1:50m outlines, on the world's own canvas. */
export const WORLD_DETAIL_LOADER: Load = () => import("./world-detail.ts");

/** The regions of the ${loaders.divisions.length} countries that have them, by lower-case code. */
export const DIVISIONS_LOADERS: Readonly<Record<string, Load>> = {
${lines(loaders.divisions, "divisions")}
};

/** The named physical features drawn on ${loaders.features.length} maps (seas, lakes, rivers, landforms, peaks), by the map's id. */
export const FEATURE_LOADERS: Readonly<Record<string, () => Promise<{ default: ChizuFeatureLayer }>>> = {
${loaders.features.map((id) => `  ${JSON.stringify(id)}: () => import("./features/${id}.ts"),`).join("\n")}
};
`,
  );
  console.log(`world: ${world.regions.length} countries · countries: ${loaders.countries.length} · divisions: ${loaders.divisions.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

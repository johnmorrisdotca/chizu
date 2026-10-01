// Builds every file of map data under src/data/ from Natural Earth: `pnpm data`.
//
//   src/data/world.ts                the world, every country a region (Natural Earth admin-0 at 1:110m)
//   src/data/countries/<xx>.ts       each country alone, finer (admin-0 at 1:50m, and at 1:10m for the small ones), on a canvas of its own
//   src/data/divisions/<xx>.ts       the provinces, states or départements of 31 countries (admin-1 at 1:10m)
//   src/data/countries.ts            the table of every country: names in English and Japanese, and what it has
//   src/data/loaders.ts              one dynamic import for each file above
//
// SOURCE AND LICENCE. Natural Earth (naturalearthdata.com), release 5.1.2, read from the project's own repository at
// that tag, each file checked against the SHA-256 written in data-config.mjs. Natural Earth is in the public domain:
// "No permission is needed to use Natural Earth. Crediting the authors is unnecessary." Its names in other languages
// come from Wikidata, which is CC0. The files are downloaded once into .cache/ (or CHIZU_CACHE) and the build reads
// that copy, so it makes the same files each time and needs the network only the first time.
//
// DETERMINISTIC. No clock, no randomness, no network after the download: the same Natural Earth files and the same
// d3-geo version (pinned by the lockfile) write the same bytes. `pnpm data` twice leaves the working tree clean.
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { geoAlbers, geoArea, geoAzimuthalEqualArea, geoCentroid, geoConicEqualArea, geoDistance, geoPath, geoProjection } from "d3-geo";

import { DIVISION_CONFIGS, EXCLUDED, KANJI_READINGS, NATURAL_EARTH, SHORT_NAMES_JA } from "./data-config.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cache = resolve(root, process.env.CHIZU_CACHE ?? ".cache");
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
const CONTINENTS = ["Asia", "Europe", "Africa", "North America", "South America", "Oceania"];

const round = (value) => Math.round(value * 10 ** PRECISION) / 10 ** PRECISION;

/** Natural Earth's file, from the cache, fetched once and checked against the hash this version of the script was written for. */
async function source(file) {
  const path = join(cache, file);
  if (!existsSync(path)) {
    mkdirSync(cache, { recursive: true });
    const url = `${NATURAL_EARTH.raw}/${file}`;
    console.log(`fetching ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${url}: ${response.status}`);
    writeFileSync(path, Buffer.from(await response.arrayBuffer()));
  }
  const bytes = readFileSync(path);
  const hash = createHash("sha256").update(bytes).digest("hex");
  if (hash !== NATURAL_EARTH.files[file]) throw new Error(`${file} is not the file this script was written for (sha256 ${hash})`);
  return JSON.parse(bytes.toString("utf8"));
}

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
function writeMap(path, header, map) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run \`pnpm data\` to make it again.
 * ${header}
 * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.
 */
import type { ChizuMap } from "${"../".repeat(path.slice(out.length + 1).split("/").length)}types.ts";

const map: ChizuMap = ${literal(map)};

export default map;
`,
  );
}

// ---- The names -------------------------------------------------------------------------------------------------

/** How a name written with kanji is read: from the hand-written table, or null. A katakana name is its own reading. */
function readingOf(name) {
  if (KANJI_READINGS[name]) return KANJI_READINGS[name];
  if (/\p{Script=Han}/u.test(name)) return null;
  return name.replace(/・/g, "");
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

function namesOf(properties, code) {
  const nameJa = properties.NAME_JA;
  const short = SHORT_NAMES_JA[code];
  const shown = short ? short[0] : nameJa;
  const reading = short ? (short[1] ?? readingOf(short[0])) : readingOf(nameJa);
  return {
    name: properties.NAME,
    ...(nameJa ? { nameJa } : {}),
    ...(short ? { nameShortJa: short[0] } : {}),
    ...(reading && shown ? { reading } : {}),
  };
}

// ---- The world --------------------------------------------------------------------------------------------------

/** Miller's cylindrical projection, as d3-geo-projection writes it: nine lines against a dependency. */
function millerRaw(lambda, phi) {
  return [lambda, 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * phi))];
}
millerRaw.invert = (x, y) => [x, 2.5 * Math.atan(Math.exp(0.8 * y)) - 0.625 * Math.PI];

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
      group: p.CONTINENT,
      iso3: p.ISO_A3_EH && p.ISO_A3_EH !== "-99" ? p.ISO_A3_EH : p.ADM0_A3,
      path: "",
      neighbors: near[index],
    });
  });
  // In the order a directory reads them: by continent, then by English name.
  regions.sort((a, b) => CONTINENTS.indexOf(a.group) - CONTINENTS.indexOf(b.group) || a.name.localeCompare(b.name, "en"));
  const [tx, ty] = projection.translate();
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
    projection: { kind: "miller", centre: CENTRE_LONGITUDE, scale: projection.scale(), translate: [tx, ty] },
    insets: [],
    source: `Natural Earth ${NATURAL_EARTH.version} admin-0 countries, 1:110m, Miller cylindrical centred on ${CENTRE_LONGITUDE}°E`,
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
    group: p.CONTINENT,
    iso3: p.ISO_A3_EH && p.ISO_A3_EH !== "-99" ? p.ISO_A3_EH : p.ADM0_A3,
    path: "",
    neighbors: near,
  });
  const names = namesOf(p, code);
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
    projection: { kind: "azimuthal-equal-area", centre: [round(lon * 1e4) / 1e4, round(lat * 1e4) / 1e4], scale: projection.scale(), translate: projection.translate() },
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

function regionsOf(draw, features, config) {
  const near = neighboursBySharedPoints(features, (feature) => feature.properties.__code);
  const regions = features.map((feature, index) => {
    const p = feature.properties;
    const name = p.name_en || p.name || p.__code;
    return regionOf(draw, feature, {
      code: p.__code,
      name,
      ...(p.name_ja ? { nameJa: p.name_ja } : {}),
      group: config.regionFn(feature),
      ...(p.type_en ? { type: p.type_en.toLowerCase() } : {}),
      path: "",
      neighbors: near[index],
    });
  });
  regions.sort((a, b) => a.code.localeCompare(b.code));
  return regions;
}

function buildDivisions(config, rawFeatures, countryNames) {
  const features = withRegionCodes(config, rawFeatures);
  if (features.length === 0) throw new Error(`no regions for ${config.code}`);
  const projection = config.projection().fitSize([config.width, config.height], { type: "FeatureCollection", features });
  const regions = regionsOf(geoPath(projection), features, config);
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
  const regions = states.map((feature, index) => {
    const p = feature.properties;
    const projection = p.__code === "AK" ? alaska : p.__code === "HI" ? hawaii : main;
    return regionOf(geoPath(projection), feature, {
      code: p.__code,
      name: p.name_en || p.name,
      ...(p.name_ja ? { nameJa: p.name_ja } : {}),
      group: config.regionFn(feature),
      ...(p.type_en ? { type: p.type_en.toLowerCase() } : {}),
      path: "",
      neighbors: near[index],
    });
  });
  regions.sort((a, b) => a.code.localeCompare(b.code));
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

// ---- The tables ------------------------------------------------------------------------------------------------

async function main() {
  const worldSource = await source("ne_110m_admin_0_countries.geojson");
  const countriesSource = await source("ne_50m_admin_0_countries.geojson");
  const fineSource = await source("ne_10m_admin_0_countries.geojson");
  const fine = new Map(fineSource.features.map((feature) => [feature.properties.ADM0_A3, feature]));
  const divisionsSource = await source("ne_10m_admin_1_states_provinces.geojson");

  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  const world = buildWorld(worldSource);
  writeMap(join(out, "world.ts"), `The world: ${world.regions.length} countries, ${world.source}.`, world);
  const onWorld = new Set(world.regions.map((r) => r.code));

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
    loaders.countries.push(file);
    table.push({
      code: p.__code,
      iso3: map.regions[0].iso3,
      ...names,
      nameJa: names.nameJa ?? names.name,
      group: p.CONTINENT,
      onWorld: onWorld.has(p.__code),
      hasDivisions: false,
    });
  }

  const configs = [...DIVISION_CONFIGS];
  const divisionCodes = new Set([...configs.map((c) => c.code), "US"]);
  for (const entry of table) entry.hasDivisions = divisionCodes.has(entry.code);
  const missing = [...divisionCodes].filter((code) => !table.some((entry) => entry.code === code));
  if (missing.length > 0) throw new Error(`regions asked for a country that has no map of its own: ${missing.join(" ")}`);
  const builtDivisions = [];
  for (const config of configs) builtDivisions.push(buildDivisions(config, divisionsSource.features, countryNames));
  builtDivisions.push(buildUnitedStates(divisionsSource.features, countryNames));
  for (const map of builtDivisions) {
    const file = map.id.replace("divisions-", "");
    writeMap(join(out, "divisions", `${file}.ts`), `${map.name}: ${map.regions.length} ${map.regionNamePlural.toLowerCase()}, ${map.source}.`, map);
    loaders.divisions.push(file);
  }
  loaders.divisions.sort();

  table.sort((a, b) => a.code.localeCompare(b.code));
  writeFileSync(
    join(out, "countries.ts"),
    `/*
 * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run \`pnpm data\` to make it again.
 * Every country Natural Earth ${NATURAL_EARTH.version} draws at 1:50m (${table.length} of them): its names in English and
 * Japanese, which continent it is in, and which of the maps has it. Names in other languages are Wikidata's, which is CC0.
 */
import type { ChizuCountry } from "../types.ts";

export const CHIZU_COUNTRIES: readonly ChizuCountry[] = ${literal(table)};

/** Where the data came from. */
export const CHIZU_SOURCE = ${literal({
      name: "Natural Earth",
      version: NATURAL_EARTH.version,
      repository: NATURAL_EARTH.repository,
      tag: NATURAL_EARTH.tag,
      retrieved: NATURAL_EARTH.retrieved,
      licence: "Public domain",
      files: Object.keys(NATURAL_EARTH.files),
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
import type { ChizuMap } from "../types.ts";

type Load = () => Promise<{ default: ChizuMap }>;

/** Each country alone, by lower-case code. */
export const COUNTRY_LOADERS: Readonly<Record<string, Load>> = {
${lines(loaders.countries, "countries")}
};

/** The regions of the ${loaders.divisions.length} countries that have them, by lower-case code. */
export const DIVISIONS_LOADERS: Readonly<Record<string, Load>> = {
${lines(loaders.divisions, "divisions")}
};
`,
  );
  console.log(`world: ${world.regions.length} countries · countries: ${loaders.countries.length} · divisions: ${loaders.divisions.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

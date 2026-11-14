// Builds every file of map data under src/data/ from Natural Earth: `pnpm data`.
//
//   src/data/world.data.ts                the world, every country a region (Natural Earth admin-0 at 1:110m)
//   src/data/world-geo.data.ts            the same world in longitude and latitude, unprojected, with the four it leaves out (177); the one table kept unformatted
//   src/data/world-geo-detail.data.ts    the same world from the 1:50m outlines in longitude and latitude, simplified (177)
//   src/data/divisions-geo/<xx>.data.ts   the regions of the 32 countries in longitude and latitude, simplified, shared borders identical
//   src/data/countries/<xx>.data.ts  each country alone, finer (admin-0 at 1:50m, and at 1:10m for the small ones), on a canvas of its own
//   src/data/divisions/<xx>.data.ts  the provinces, states, prefectures or départements of 32 countries (admin-1 at 1:10m)
//   src/data/countries.data.ts            the table of every country: names in English and Japanese, and what it has
//   src/data/loaders.data.ts              one dynamic import for each file above
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
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";

import {
  continentName,
  CONTINENTS as KUNI_CONTINENTS,
  countries as kuniCountries,
  subregionName,
} from "@johnmorrisdotca/kuni";
import { geoDistance } from "d3-geo";
import { buildCountry, buildDivisions, buildUnitedStates, DEGREES } from "./build-data/divisions.mjs";
import { writeDivisionsGeo, writeWorldGeoDetail } from "./build-data/geo-files.mjs";
import { literal, neighboursBySharedPoints, out, writeFeatures, writeMap } from "./build-data/geometry.mjs";
import { buildJapan } from "./build-data/japan.mjs";
import {
  buildWorld,
  buildWorldDetail,
  buildWorldGeo,
  countriesFrom,
  insetProjections,
  namesOf,
  projections,
  regionIso,
  regionNames,
} from "./build-data/world.mjs";
import { featureSources, featuresOn } from "./build-features.mjs";
import {
  CONTINENT_NAMES,
  DIVISION_CONFIGS,
  GROUP_READINGS,
  KANJI_READINGS,
  KUNI,
  NATURAL_EARTH,
  REGION_GROUPS,
} from "./data-config.mjs";
import { root, source } from "./natural-earth.mjs";

export function coordinatesOf(geometry) {
  const points = [];
  const walk = (node) => {
    if (!Array.isArray(node)) return;
    if (typeof node[0] === "number") points.push(node);
    else for (const child of node) walk(child);
  };
  walk(geometry?.coordinates);
  return points;
}

// ---- The names -------------------------------------------------------------------------------------------------

/** kuni is read from node_modules, and must be the version this script was written for: a newer one is a change of names, made on purpose. */
function checkKuni() {
  const installed = JSON.parse(
    readFileSync(join(root, "node_modules", ...KUNI.package.split("/"), "package.json"), "utf8"),
  ).version;
  if (installed !== KUNI.version)
    throw new Error(`${KUNI.package} ${installed} is installed; this script reads ${KUNI.version} (data-config.mjs)`);
}

/** How a name written with kanji is read, for the few places kuni does not know: the hand-written table, or null. A katakana name is its own reading. */
export function readingOf(name) {
  if (KANJI_READINGS[name]) return KANJI_READINGS[name];
  if (/\p{Script=Han}/u.test(name)) return null;
  return name.replace(/・/g, "");
}

/** A name written in kana alone, as it is read: without its middle dots, its spaces and a bracketed second name (ミャンマー (ビルマ) is read ミャンマー). Null for a name with kanji in it. */
export function kanaReading(name) {
  const bare = name.replace(/\s*[(（][^)）]*[)）]\s*/gu, "").replace(/[・\s]/gu, "");
  return /^[\p{Script=Katakana}\p{Script=Hiragana}ー]+$/u.test(bare) ? bare : null;
}

/** The code a Natural Earth country goes by: ISO alpha-2, or its own three letters for a place with none. Each is made unique by the caller. */
export function isoOf(properties) {
  const iso = properties.ISO_A2_EH;
  return iso && iso !== "-99" ? iso : properties.ADM0_A3;
}

/** Each region's ISO code, and whether another region of the same map carries it too. */
export function isoCodes(country, features) {
  const codes = features.map((feature) => regionIso(country, feature));
  const counts = new Map();
  for (const code of codes) if (code) counts.set(code, (counts.get(code) ?? 0) + 1);
  return codes.map((code) => ({ iso: code, shared: code !== null && counts.get(code) > 1 }));
}

// ---- The world --------------------------------------------------------------------------------------------------

/** Miller's cylindrical projection, as d3-geo-projection writes it: nine lines against a dependency. */
export function millerRaw(lambda, phi) {
  return [lambda, 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * phi))];
}
millerRaw.invert = (x, y) => [x, 2.5 * Math.atan(Math.exp(0.8 * y)) - 0.625 * Math.PI];

export function polygonsOf(geometry) {
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
}

/** Roughly how close two pieces come, in degrees, from a sample of their corners. Cheap, and exact enough to tell a neighbouring island from a colony on the far side of the earth. */
export function gapBetween(a, b) {
  const sample = (polygon) => {
    const ring = polygon[0];
    const step = Math.max(1, Math.floor(ring.length / 150));
    return ring.filter((_, i) => i % step === 0);
  };
  let best = Infinity;
  for (const p of sample(a)) for (const q of sample(b)) best = Math.min(best, geoDistance(p, q) * DEGREES);
  return best;
}

// ---- The regions of a country ----------------------------------------------------------------------------------

export function withRegionCodes(config, rawFeatures) {
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
  if (groups?.members && !groups.members[feature.properties.__code])
    throw new Error(`${config.code}:${feature.properties.__code} has no group in REGION_GROUPS`);
  const groupJa = groups?.names[group];
  if (groups && !groupJa) throw new Error(`${config.code}: no Japanese name for the group ${group}`);
  return { group, ...(groupJa ? { groupJa } : {}) };
}

/** The fields a region of a country's map carries before its outline: its codes, names, larger part and kind. */
export function regionFields(config, feature, iso, shared) {
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

// ---- The tables ------------------------------------------------------------------------------------------------

/**
 * The committed tables are in the family's code style, which the project's own Biome settings leave out of
 * `*.data.ts`. The writer therefore formats them here, with those same settings, so `pnpm data` makes the committed
 * bytes. Biome leaves a file over 1 MiB as it is. The world in degrees is written afterwards, unformatted, on
 * purpose: it is shipped as it stands, so its size is the size of the data.
 */
function formatData() {
  const config = mkdtempSync(join(tmpdir(), "chizu-biome-"));
  try {
    writeFileSync(
      join(config, "biome.json"),
      JSON.stringify({
        formatter: { indentStyle: "space", indentWidth: 2, lineWidth: 120 },
        javascript: { formatter: { quoteStyle: "double", semicolons: "always", trailingCommas: "all" } },
        linter: { enabled: false },
        assist: { enabled: false },
      }),
    );
    const biome = join(root, "node_modules", "@biomejs", "biome", "bin", "biome");
    execFileSync(process.execPath, [biome, "format", "--write", `--config-path=${config}`, out], { stdio: "ignore" });
  } finally {
    rmSync(config, { recursive: true, force: true });
  }
}

export async function main() {
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
    join(out, "world.data.ts"),
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
  const worldGeo = buildWorldGeo(worldSource);
  // Unformatted on purpose: formatted, the world in degrees would be about 13,000 lines, larger on disk and in the bundle.
  const writeWorldGeo = () =>
    writeFileSync(
      join(out, "world-geo.data.ts"),
      `/*\n * WRITTEN BY scripts/build-data.mjs, NEVER BY HAND: run \`pnpm data\` to make it again.\n * The world: ${worldGeo.features.length} countries, Natural Earth 5.1.2 admin-0 countries, 1:110m, longitude and latitude.\n * Natural Earth is in the public domain (naturalearthdata.com). See NOTICE.md.\n */\n\ntype WorldGeo = {\n  type: "FeatureCollection";\n  features: Array<{\n    type: "Feature";\n    properties: {\n      code: string;\n      name: string;\n      nameJa: string;\n      iso3: string;\n      group: string;\n      groupJa?: string;\n    };\n    geometry: { type: string; coordinates: unknown };\n  }>;\n  source: string;\n};\n\n/**\n * The world, every country a region, as longitude and latitude in degrees.\n *\n * @example\n * \`\`\`ts\n * import WORLD_GEO from "@johnmorrisdotca/chizu/world-geo";\n *\n * const japan = WORLD_GEO.features.find((feature) => feature.properties.code === "JP")!;\n * console.log(WORLD_GEO.features.length, japan.properties.code, japan.properties.name, japan.properties.nameJa);\n * // ${worldGeo.features.length} JP Japan 日本\n * \`\`\`\n */\nconst worldGeo: WorldGeo = ${literal(worldGeo)};\n\nexport default worldGeo;\n`,
    );
  const onWorld = new Set(world.regions.map((r) => r.code));
  const worldDetail = buildWorldDetail(countriesSource, world);
  writeMap(
    join(out, "world-detail.data.ts"),
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
    writeMap(join(out, "countries", `${file}.data.ts`), `${names.name}, alone: ${map.source}.`, map);
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
  if (missing.length > 0)
    throw new Error(`regions asked for a country that has no map of its own: ${missing.join(" ")}`);
  const builtDivisions = [];
  for (const config of configs) builtDivisions.push(buildDivisions(config, divisionsSource.features, countryNames));
  builtDivisions.push(buildUnitedStates(divisionsSource.features, countryNames));
  builtDivisions.push(buildJapan(divisionsSource.features, countryNames));
  for (const map of builtDivisions) {
    const file = map.id.replace("divisions-", "");
    writeMap(
      join(out, "divisions", `${file}.data.ts`),
      `${map.name}: ${map.regions.length} ${map.regionNamePlural.toLowerCase()}, ${map.source}.`,
      map,
    );
    allMaps.push(map);
    loaders.divisions.push(file);
  }
  loaders.divisions.sort();

  const sources = await featureSources({ divisions: [...divisionCodes] });
  loaders.features = [];
  for (const map of allMaps) {
    const avoid = map.insets.map((inset) => inset.box);
    const country =
      map.id === "world"
        ? null
        : map.kind === "country"
          ? map.regions[0].code
          : map.id.slice("divisions-".length).toUpperCase();
    const features = featuresOn(map, projections.get(map.id), sources, {
      world: map.id === "world",
      avoid,
      country,
      insetProjections: insetProjections.get(map.id),
    });
    if (features.length === 0) continue;
    writeFeatures(join(out, "features", `${map.id}.data.ts`), map, features);
    loaders.features.push(map.id);
  }
  loaders.features.sort();
  console.log(
    `features: ${loaders.features.length} maps · Japanese names ${JSON.stringify(sources.stats.japanese)} · readings ${JSON.stringify(sources.stats.readings)} · rivers ${JSON.stringify(sources.stats.rivers)}`,
  );

  table.sort((a, b) => a.code.localeCompare(b.code));
  const inTable = new Set(table.map((entry) => entry.code));
  const groupsTable = (kind) => {
    const codes =
      kind === "continent"
        ? [...KUNI_CONTINENTS]
        : [
            ...new Set(
              kuniCountries()
                .map((one) => one.subregion)
                .filter(Boolean),
            ),
          ].sort();
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
    join(out, "countries.data.ts"),
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
 * // ${groupsTable("continent")
   .map((group) => `${group.code} ${group.nameJa} ${group.codes.length}`)
   .join(", ")}
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
      names: {
        name: "kuni",
        package: KUNI.package,
        version: KUNI.version,
        licence: "MIT; its names are Unicode CLDR's (Unicode-3.0) and Wikidata's (CC0)",
      },
    })};
`,
  );
  const lines = (list, folder) =>
    list.map((file) => `  ${file}: () => import("./${folder}/${file}.data.ts"),`).join("\n");
  writeFileSync(
    join(out, "loaders.data.ts"),
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
export const WORLD_DETAIL_LOADER: Load = () => import("./world-detail.data.ts");

/** The regions of the ${loaders.divisions.length} countries that have them, by lower-case code. */
export const DIVISIONS_LOADERS: Readonly<Record<string, Load>> = {
${lines(loaders.divisions, "divisions")}
};

/** The named physical features drawn on ${loaders.features.length} maps (seas, lakes, rivers, landforms, peaks), by the map's id. */
export const FEATURE_LOADERS: Readonly<Record<string, () => Promise<{ default: ChizuFeatureLayer }>>> = {
${loaders.features.map((id) => `  ${JSON.stringify(id)}: () => import("./features/${id}.data.ts"),`).join("\n")}
};
`,
  );
  formatData();
  writeWorldGeo();
  const geoTotals = writeDivisionsGeo(out, builtDivisions);
  const worldGeoStats = writeWorldGeoDetail(out, countriesSource);
  console.log(
    `longitude and latitude: regions ${geoTotals.before} to ${geoTotals.after} points (worst ${geoTotals.worstKm.toFixed(2)} km) · world ${worldGeoStats.before} to ${worldGeoStats.after} (worst ${worldGeoStats.worstKm.toFixed(2)} km)`,
  );
  console.log(
    `world: ${world.regions.length} countries · countries: ${loaders.countries.length} · divisions: ${loaders.divisions.length}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

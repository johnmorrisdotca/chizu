import { continentName, country as kuniCountry } from "@johnmorrisdotca/kuni";
import { subdivision as kuniSubdivision } from "@johnmorrisdotca/kuni/subdivisions";
import { geoPath, geoProjection } from "d3-geo";
import { isoOf, kanaReading, millerRaw, readingOf } from "../build-data.mjs";
import {
  CONTINENT_NAMES,
  CONTINENT_OVERRIDES,
  DISPLAY_NAMES,
  EXCLUDED,
  ISO_JOIN,
  KUNI,
  KUNI_NAMES_KEPT_FROM_NATURAL_EARTH,
  NAME_FIXES,
  NATURAL_EARTH,
  SHORT_ENGLISH_NOT_FOR_MAPS,
  SHORT_NAME_READINGS,
  SHORT_NAMES_NOT_EVERYDAY,
} from "../data-config.mjs";
import {
  CENTRE_LONGITUDE,
  CONTINENTS,
  fixed,
  keepScale,
  keepTranslate,
  neighboursBySharedPoints,
  regionOf,
  WORLD_WIDTH,
} from "./geometry.mjs";

export function countriesFrom(collection, keepExcluded = false) {
  const taken = new Set();
  const features = collection.features
    .filter((feature) => keepExcluded || !EXCLUDED.has(isoOf(feature.properties)))
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
export function namesOf(properties, code) {
  const known = kuniCountry(code);
  if (!known) {
    const nameJa = properties.NAME_JA;
    const reading = readingOf(nameJa);
    if (!reading) throw new Error(`${code}: no reading for ${nameJa}; add it to KANJI_READINGS`);
    return { name: properties.NAME, nameJa, reading };
  }
  const display = DISPLAY_NAMES[code] ?? {};
  const short = display.nameShortJa ?? (SHORT_NAMES_NOT_EVERYDAY.has(code) ? undefined : known.shortName?.ja);
  const reading =
    display.reading ??
    (short ? (kanaReading(short) ?? SHORT_NAME_READINGS[short]) : (known.reading ?? kanaReading(known.name.ja)));
  if (!reading) throw new Error(`${code}: no reading for ${short ?? known.name.ja}; add it to SHORT_NAME_READINGS`);
  const name =
    display.name ?? (known.shortName?.en && !SHORT_ENGLISH_NOT_FOR_MAPS[code] ? known.shortName.en : known.name.en);
  return { name, nameJa: known.name.ja, ...(short ? { nameShortJa: short } : {}), reading };
}

/** A country's continent and three-letter code: kuni's, or Natural Earth's for the three places kuni does not have. */
export function identityOf(properties, code) {
  const known = kuniCountry(code);
  const continent = CONTINENT_OVERRIDES[code]?.continent ?? known?.continent;
  return {
    group: known ? CONTINENT_NAMES[continent] : properties.CONTINENT,
    ...(known ? { groupJa: continentName(continent, "ja") } : {}),
    iso3: known
      ? known.alpha3
      : properties.ISO_A3_EH && properties.ISO_A3_EH !== "-99"
        ? properties.ISO_A3_EH
        : properties.ADM0_A3,
  };
}

/**
 * The ISO 3166-2 code of one region of a country: Natural Earth's, when kuni has it, or the line in ISO_JOIN that
 * says what it is instead, or why there is none. A region with neither stops the build, so a new region or a new
 * kuni can never leave a code quietly wrong.
 */
export function regionIso(country, feature) {
  const key = `${country}:${feature.properties.__code}`;
  const join = ISO_JOIN[key];
  const iso = join ? join.iso : feature.properties.iso_3166_2;
  if (!iso) {
    if (join) return null;
    throw new Error(`${key} (${feature.properties.name}) has no ISO 3166-2 code: give it a line in ISO_JOIN`);
  }
  if (!kuniSubdivision(iso))
    throw new Error(
      `${key} (${feature.properties.name}): ${iso} is not in kuni ${KUNI.version}; give it a line in ISO_JOIN`,
    );
  return iso;
}

/**
 * A region's names. One that is exactly one ISO subdivision (no other region of its map shares the code) takes
 * kuni's, but for the few kuni has wrong; the rest keep Natural Earth's; and NAME_FIXES has the last word, for two
 * regions that would otherwise share a name.
 */
export function regionNames(country, feature, iso, shared) {
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

/** The projection the world was fitted with, which its finer drawing is made with too. */
let worldProjection = null;
/** Each map's projection, by its id, for drawing its features on the same canvas (build-features.mjs). */
export const projections = new Map();
/** The projections of the regions a map draws whole in a box of its own, by map and region code: a feature of such a region is projected by its region's, not the map's. */
export const insetProjections = new Map();

export function buildWorld(collection) {
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
  regions.sort(
    (a, b) => CONTINENTS.indexOf(a.group) - CONTINENTS.indexOf(b.group) || a.name.localeCompare(b.name, "en"),
  );
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
    projection: {
      kind: "miller",
      centre: CENTRE_LONGITUDE,
      scale: keepScale(projection.scale()),
      translate: [keepTranslate(tx), keepTranslate(ty)],
    },
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
export function buildWorldDetail(collection, world) {
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

/**
 * The world as longitude and latitude in degrees: every feature of Natural Earth's 1:110m countries a GeoJSON feature,
 * no projection. Unlike the flat world, it keeps Antarctica, the French Southern Lands, Northern Cyprus and
 * Somaliland, so a globe loses nothing: 177 features.
 */
export function buildWorldGeo(collection) {
  const features = countriesFrom(collection, true);
  const oneDecimal = fixed(1);
  const roundCoordinates = (node) => {
    if (typeof node[0] === "number") return node.map(oneDecimal);
    return node.map(roundCoordinates);
  };
  const geoFeatures = features.map((feature) => {
    const p = feature.properties;
    const names = kuniCountry(p.__code) ? namesOf(p, p.__code) : { name: p.NAME, nameJa: p.NAME_JA };
    const identity = identityOf(p, p.__code);
    return {
      type: "Feature",
      properties: {
        code: p.__code,
        name: names.name,
        nameJa: names.nameJa,
        iso3: identity.iso3,
        group: identity.group,
        groupJa: identity.groupJa,
      },
      geometry: { ...feature.geometry, coordinates: roundCoordinates(feature.geometry.coordinates) },
    };
  });
  return {
    type: "FeatureCollection",
    features: geoFeatures,
    source: `Natural Earth ${NATURAL_EARTH.version} admin-0 countries, 1:110m, longitude and latitude`,
  };
}

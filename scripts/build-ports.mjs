// Builds the airports and the harbours under src/ports-data/: `pnpm data:ports`.
//
//   src/ports-data/airports.data.ts   the 600 busiest airports by passengers a year, in that order, with their tier (150, 300, 600)
//   src/ports-data/harbours.data.ts   Natural Earth's 1,081 ports, largest first, with their tier
//
// SOURCES AND LICENCE (the terms pages were read on 2026-11-18; NOTICE.md says what each says).
//   Airports: Wikidata (CC0): the passenger figure (P3872), codes, point, English and Japanese labels, as scripts/wikidata-ports.mjs
//   asked it and kept in scripts/data-wikidata-ports.json.
//   Harbours: Natural Earth 5.1.2 ports at 1:10m (public domain), `ne_10m_ports`, read from the cache like every Natural Earth
//   file (checked against its SHA-256 in data-config.mjs); a harbour's Japanese name is Wikidata's.
//   A country is the Natural Earth 1:50m country that holds the point (or the nearest within SHORE_KM).
//
// DETERMINISTIC. No clock, no randomness, no network: the same files write the same bytes. `pnpm data:ports` twice leaves the
// working tree clean.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";

import { geoContains, geoDistance } from "d3-geo";

import { lowerProperties, root, source } from "./natural-earth.mjs";
import { AIRPORT_TIERS, COUNTRY_FIXES, HARBOUR_TIER_RANKS, PORTS_FILES, SHORE_KM } from "./ports-config.mjs";

const out = join(root, "src", "ports-data");
const EARTH_KM = 6371;
const wikidata = JSON.parse(readFileSync(join(root, "scripts", "data-wikidata-ports.json"), "utf8"));

/** The country (ISO 3166-1 alpha-2) of a point: the one that holds it, else the nearest within SHORE_KM, else "". */
function countryFinder(countries) {
  const list = countries.features.map((feature) => {
    const p = feature.properties;
    // Natural Earth's own three-letter code stands in for Northern Cyprus and Somaliland, which have no ISO code (as in world-geo).
    const code =
      [p.ISO_A2, p.ISO_A2_EH].find((one) => /^[A-Z]{2}$/.test(one ?? "")) ??
      (["CYN", "SOL"].includes(p.ADM0_A3) ? p.ADM0_A3 : "");
    return { code, feature };
  });
  const vertices = (geometry) => geometry.coordinates.flat(geometry.type === "MultiPolygon" ? 2 : 1);
  return (point) => {
    const inside = list.find(({ code, feature }) => code !== "" && geoContains(feature, point));
    if (inside) return inside.code;
    let nearest = { code: "", km: SHORE_KM };
    for (const { code, feature } of list) {
      if (code === "") continue;
      for (const vertex of vertices(feature.geometry)) {
        const km = geoDistance(point, vertex) * EARTH_KM;
        if (km < nearest.km) nearest = { code, km };
      }
    }
    return nearest.code;
  };
}

/** A name as an id: lower case, accents folded, letters and digits joined by hyphens. */
const slug = (name) =>
  name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** A Japanese label without the disambiguation in brackets Wikidata keeps on some (ソロン (インドネシア)). */
const plainJapanese = (label) => label.replace(/\s*[(（][^)）]*[)）]$/, "");

/** An id no other has: the slug, then with the country, then with a number. */
function uniqueIds(records) {
  const taken = new Set();
  for (const record of records) {
    const base = record.id;
    let id = base;
    if (taken.has(id)) id = `${base}-${record.country.toLowerCase()}`;
    for (let n = 2; taken.has(id); n += 1) id = `${base}-${record.country.toLowerCase()}-${n}`;
    taken.add(id);
    record.id = id;
    record.country ||= COUNTRY_FIXES[id] ?? "";
  }
  return records;
}

const round = (value) => Math.round(value * 10000) / 10000;

function airports(countryOf) {
  const tierOf = (index) => AIRPORT_TIERS.findIndex((end) => index < end) + 1;
  const list = wikidata.airports
    .filter((airport) => airport.lat !== undefined && airport.en !== undefined)
    .slice(0, AIRPORT_TIERS.at(-1))
    .map((airport, index) => {
      const code = (airport.iata ?? airport.icao ?? "").toUpperCase();
      return {
        id: slug(code || airport.q),
        kind: "airport",
        ...(code && { code }),
        name: { en: airport.en, ...(airport.ja && { ja: plainJapanese(airport.ja) }) },
        country: countryOf([airport.lon, airport.lat]),
        lat: round(airport.lat),
        lon: round(airport.lon),
        tier: tierOf(index),
        passengers: airport.pax,
        year: airport.year,
      };
    });
  return uniqueIds(list);
}

function harbours(ports, countryOf) {
  const tierOf = (rank) => HARBOUR_TIER_RANKS.findIndex((last) => rank <= last) + 1 || HARBOUR_TIER_RANKS.length + 1;
  const list = ports
    .map((feature) => ({ p: lowerProperties(feature), at: feature.geometry.coordinates }))
    .sort((a, b) => a.p.scalerank - b.p.scalerank || a.p.natlscale - b.p.natlscale || (a.p.name < b.p.name ? -1 : 1))
    .map(({ p, at }) => {
      const ja = wikidata.harbours[String(p.ne_id)]?.ja;
      return {
        id: slug(p.name) || `port-${p.ne_id}`,
        kind: "harbour",
        name: { en: p.name, ...(ja && { ja: plainJapanese(ja) }) },
        country: countryOf(at),
        lat: round(at[1]),
        lon: round(at[0]),
        tier: tierOf(p.scalerank),
      };
    });
  return uniqueIds(list);
}

function write(file, header, list) {
  const path = join(out, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `/*
 * WRITTEN BY scripts/build-ports.mjs, NEVER BY HAND: run \`pnpm data:ports\` to make it again.
 * ${header}
 * See NOTICE.md.
 */
import type { ChizuPort } from "../ports.ts";

const ports: readonly ChizuPort[] = JSON.parse(${JSON.stringify(JSON.stringify(list))});

export default ports;
`,
  );
  console.log(`src/ports-data/${file}: ${list.length} records`);
}

async function main() {
  const countryOf = countryFinder(await source("ne_50m_admin_0_countries.geojson"));
  const airportList = airports(countryOf);
  write(
    "airports.data.ts",
    `The ${airportList.length} busiest airports by passengers a year: Wikidata (CC0), figures of ${wikidata.firstYear} or later, retrieved ${wikidata.retrieved}.`,
    airportList,
  );
  const portFeatures = (await source("ne_10m_ports.geojson", PORTS_FILES)).features;
  const harbourList = harbours(portFeatures, countryOf);
  write(
    "harbours.data.ts",
    `${harbourList.length} harbours: Natural Earth 5.1.2 ports at 1:10m (public domain); Japanese names from Wikidata (CC0), retrieved ${wikidata.retrieved}.`,
    harbourList,
  );
  const lost = [...airportList, ...harbourList].filter((one) => one.country === "");
  if (lost.length > 0) console.log(`no country for: ${lost.map((one) => one.id).join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

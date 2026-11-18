// Asks Wikidata (CC0) for the airports' passenger figures and the names of airports and harbours, and writes the answers
// to scripts/data-wikidata-ports.json, which `pnpm data:ports` reads: `pnpm data:ports-wikidata`.
//
//   - Airports: every airport with a passengers-per-year figure (P3872) from FIRST_YEAR on, its highest, with the year;
//     for the busiest AIRPORT_POOL, the IATA and ICAO codes, the point, the English and Japanese labels.
//   - Harbours: Natural Earth's ports carry no Japanese name. For each, the Wikidata port whose English label (less "Port
//     of") is its name and which lies within PORT_MATCH_KM of its point, else a place of that label within PLACE_MATCH_KM
//     (the one with the most Wikipedia articles); its Japanese label. A harbour with no such item keeps its English name.
//
// The answers are kept in the repository, so the build needs no network for them and makes the same files every time;
// run this on purpose, when the names and figures should be brought up to date. It asks the public query service one
// query at a time, naming itself in the User-Agent as the service asks (see wikidata.mjs).
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

import { geoDistance } from "d3-geo";

import { lowerProperties, root, source } from "./natural-earth.mjs";
import { AIRPORT_POOL, FIRST_YEAR, NOT_TRAFFIC, PLACE_MATCH_KM, PORT_MATCH_KM, PORTS_FILES } from "./ports-config.mjs";
import { chunks, qid, sparql } from "./wikidata.mjs";

const EARTH_KM = 6371;
const AIRPORT = "wd:Q1248784";
const PORT = "wd:Q44782";

const pointOf = (wkt) =>
  wkt
    .replace(/^Point\(|\)$/g, "")
    .split(" ")
    .map(Number);
const kilometres = (a, b) => geoDistance(a, b) * EARTH_KM;
/** A label as harbours are compared: lower case, no accents, no "Port of", "Port", "Harbour", "Harbor" or "Seaport". */
export const plain = (label) =>
  label
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\b(port of|port|harbou?r|seaport|city of)\b/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

async function airports() {
  const years = await sparql(`SELECT ?item ?year (MAX(?pax) AS ?top) WHERE {
    ?item p:P3872 ?st. ?st ps:P3872 ?pax. ?st pq:P585 ?time. BIND(YEAR(?time) AS ?year)
    FILTER(?year >= ${FIRST_YEAR}) ?item wdt:P31/wdt:P279* ${AIRPORT}. } GROUP BY ?item ?year`);
  // Statements about one route or one airline are smaller than the airport's own, so the largest of a year is its total.
  const best = new Map();
  for (const row of years) {
    const id = qid(row.item.value);
    const pax = Number(row.top.value);
    if (!NOT_TRAFFIC[id] && (!best.has(id) || pax > best.get(id).pax))
      best.set(id, { pax, year: Number(row.year.value) });
  }
  const busiest = [...best].sort((a, b) => b[1].pax - a[1].pax || (a[0] < b[0] ? -1 : 1)).slice(0, AIRPORT_POOL);
  const found = new Map(busiest.map(([id, figure]) => [id, { ...figure }]));
  for (const batch of chunks(
    busiest.map(([id]) => id),
    300,
  )) {
    const rows =
      await sparql(`SELECT ?item ?iata ?icao ?coord ?en ?ja WHERE { VALUES ?item { ${batch.map((id) => `wd:${id}`).join(" ")} }
      OPTIONAL { ?item wdt:P238 ?iata } OPTIONAL { ?item wdt:P239 ?icao } OPTIONAL { ?item wdt:P625 ?coord }
      OPTIONAL { ?item rdfs:label ?en FILTER(lang(?en) = "en") } OPTIONAL { ?item rdfs:label ?ja FILTER(lang(?ja) = "ja") } }`);
    // An item may have several codes or points (a border airport has three codes); the first in order is kept.
    const first = (id, key, value) => {
      const own = found.get(id);
      if (own[key] === undefined || value < own[key]) own[key] = value;
    };
    for (const row of rows) {
      const id = qid(row.item.value);
      for (const key of ["iata", "icao", "en", "ja"]) if (row[key]) first(id, key, row[key].value);
      if (row.coord) first(id, "point", row.coord.value);
    }
  }
  return busiest.map(([id]) => {
    const { pax, year, iata, icao, en, ja, point } = found.get(id);
    const [lon, lat] = point === undefined ? [] : pointOf(point);
    return { q: id, pax, year, ...(iata && { iata }), ...(icao && { icao }), en, ...(ja && { ja }), lat, lon };
  });
}

async function harbours() {
  const ports = (await source("ne_10m_ports.geojson", PORTS_FILES)).features.map((feature) => ({
    key: String(lowerProperties(feature).ne_id),
    name: lowerProperties(feature).name,
    at: feature.geometry.coordinates,
  }));
  const names = [...new Set(ports.map((port) => port.name))];
  const named = [];
  for (const batch of chunks(names, 150)) {
    named.push(
      ...(await sparql(`SELECT DISTINCT ?item ?coord ?en ?ja ?links WHERE {
      VALUES ?en { ${batch.map((name) => `${JSON.stringify(name)}@en`).join(" ")} }
      ?item rdfs:label ?en; wdt:P625 ?coord; rdfs:label ?ja FILTER(lang(?ja) = "ja"). ?item wikibase:sitelinks ?links. }`)),
    );
  }
  const portItems = await sparql(`SELECT DISTINCT ?item ?coord ?en ?ja ?links WHERE {
    ?item wdt:P31/wdt:P279* ${PORT}; wdt:P625 ?coord; rdfs:label ?ja FILTER(lang(?ja) = "ja").
    ?item rdfs:label ?en FILTER(lang(?en) = "en"). ?item wikibase:sitelinks ?links. }`);
  const of = (rows) =>
    rows.map((row) => ({
      q: qid(row.item.value),
      en: plain(row.en.value),
      ja: row.ja.value,
      at: pointOf(row.coord.value),
      links: Number(row.links.value),
    }));
  const asPorts = of(portItems);
  const asPlaces = of(named);
  const answer = {};
  for (const port of ports) {
    const want = plain(port.name);
    const near = (list, km) =>
      list
        .filter((item) => item.en === want && kilometres(item.at, port.at) <= km)
        .sort((a, b) => b.links - a.links || (a.q < b.q ? -1 : 1))[0];
    const item = near(asPorts, PORT_MATCH_KM) ?? near(asPlaces, PLACE_MATCH_KM);
    if (item) answer[port.key] = { q: item.q, ja: item.ja };
  }
  console.log(`harbours: ${Object.keys(answer).length} of ${ports.length} have a Japanese name`);
  return answer;
}

async function main() {
  const list = await airports();
  console.log(`airports: ${list.length}, the 600th at ${list[599]?.pax} passengers`);
  const out = {
    source: "Wikidata (wikidata.org), CC0",
    retrieved: new Date().toISOString().slice(0, 10),
    firstYear: FIRST_YEAR,
    airports: list,
    harbours: await harbours(),
  };
  writeFileSync(join(root, "scripts", "data-wikidata-ports.json"), `${JSON.stringify(out, null, 2)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

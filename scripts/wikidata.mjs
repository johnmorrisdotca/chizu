// Asks Wikidata (CC0) what Natural Earth's physical features are called, and writes the answers to
// scripts/data-wikidata.json, which `pnpm data` reads: `pnpm data:wikidata`.
//
//   - For every feature Natural Earth gives a Wikidata id: its English and Japanese labels, its name in kana (P1814),
//     and its Japanese aliases written in hiragana alone, which are readings.
//   - For every river, which Natural Earth's 1:10m river file gives no Wikidata id or Japanese name: the river item
//     whose English label is the river's name (or the name and "River") and whose coordinates lie within MATCH_KM of
//     the river's own line (FAR_KM for an item with at least FAR_LINKS Wikipedia articles, since a long river's one
//     coordinate may be its far-off source); of several, the one with the most articles, which is the river a map means
//     (the Volga, not the stream of the same name near its source). A river with no such item keeps Natural Earth's
//     name and no Japanese one.
//
// The answers are kept in the repository, so `pnpm data` needs no network for them and makes the same files every time;
// this script is run again on purpose, when the names should be brought up to date. It asks the public query service in
// a few large queries, one at a time, naming itself in the User-Agent as the service asks.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

import { geoDistance } from "d3-geo";

import { FEATURE_FILES, HINT_KM, RIVER_LABELS } from "./features-config.mjs";
import { lowerProperties, root, source } from "./natural-earth.mjs";

const ENDPOINT = "https://query.wikidata.org/sparql";
const USER_AGENT = "chizu-data-build/1.2 (https://github.com/johnmorrisdotca/chizu; john@johnmorris.ca)";
/** How close a river item's coordinates must come to Natural Earth's line, in kilometres, for the two to be one river. */
export const MATCH_KM = 120;
export const FAR_KM = 600;
export const FAR_LINKS = 40;
const EARTH_KM = 6371;
/** Wikidata's classes for a river and its kin, which a river item is an instance of. */
const RIVER_CLASSES = ["Q4022", "Q55659167", "Q47521", "Q1437299", "Q159675", "Q12284", "Q573344"];

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sparql(query) {
  for (let attempt = 1; ; attempt += 1) {
    let response;
    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "User-Agent": USER_AGENT, Accept: "application/sparql-results+json", "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ query }).toString(),
      });
    } catch (error) {
      if (attempt >= 4) throw error;
      console.log(`Wikidata did not answer (${error.cause?.code ?? error.message}); trying again in ${10 * attempt} s`);
      await pause(10000 * attempt);
      continue;
    }
    if (response.ok) {
      const json = await response.json();
      await pause(1500);
      return json.results.bindings;
    }
    if (attempt >= 4 || ![429, 500, 502, 503, 504].includes(response.status)) throw new Error(`Wikidata answered ${response.status}: ${(await response.text()).slice(0, 300)}`);
    const wait = Number(response.headers.get("retry-after")) * 1000 || 10000 * attempt;
    console.log(`Wikidata answered ${response.status}; trying again in ${wait / 1000} s`);
    await pause(wait);
  }
}

const qid = (uri) => uri.slice(uri.lastIndexOf("/") + 1);
const chunks = (list, size) => Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, i * size + size));
const hiraganaOnly = (text) => /^[\p{Script=Hiragana}ー]+$/u.test(text);

/** Labels, the name in kana and hiragana aliases, for these items. */
async function itemsOf(ids) {
  const items = {};
  for (const batch of chunks(ids, 300)) {
    const values = batch.map((id) => `wd:${id}`).join(" ");
    const labels = await sparql(`SELECT ?item ?en ?ja ?kana WHERE { VALUES ?item { ${values} }
      OPTIONAL { ?item rdfs:label ?en FILTER(lang(?en) = "en") }
      OPTIONAL { ?item rdfs:label ?ja FILTER(lang(?ja) = "ja") }
      OPTIONAL { ?item wdt:P1814 ?kana } }`);
    const aliases = await sparql(`SELECT ?item ?alias WHERE { VALUES ?item { ${values} } ?item skos:altLabel ?alias FILTER(lang(?alias) = "ja") }`);
    for (const row of labels) {
      const id = qid(row.item.value);
      const item = (items[id] ??= {});
      if (row.en) item.en = row.en.value;
      if (row.ja) item.ja = row.ja.value;
      if (row.kana) item.kana = [...new Set([...(item.kana ?? []), row.kana.value])].sort();
    }
    for (const row of aliases) {
      if (!hiraganaOnly(row.alias.value)) continue;
      const id = qid(row.item.value);
      const item = (items[id] ??= {});
      item.hiragana = [...new Set([...(item.hiragana ?? []), row.alias.value])].sort();
    }
    console.log(`items: ${Object.keys(items).length} of ${ids.length}`);
  }
  return items;
}

function pointsOf(geometry) {
  const points = [];
  const walk = (node) => {
    if (typeof node[0] === "number") points.push(node);
    else for (const child of node) walk(child);
  };
  walk(geometry.coordinates);
  return points;
}

/** The names a river of Natural Earth's may go by on Wikidata. */
function riverLabels(p) {
  const names = [p.name, p.name_en, p.name_alt].filter(Boolean);
  return [...new Set(names.flatMap((name) => [name, `${name} River`, `River ${name}`, `${name} river`]))];
}

/** A key for one of Natural Earth's rivers: its number and its name, which together name one line. */
export const riverKey = (p) => `${p.rivernum}|${p.name}`;

async function matchRivers() {
  const rivers = (await source(FEATURE_FILES.rivers.file)).features.map((feature) => ({ p: lowerProperties(feature), geometry: feature.geometry })).filter(({ p }) => p.featurecla === "River" && p.name);
  const byKey = new Map();
  for (const river of rivers) {
    const key = riverKey(river.p);
    const held = byKey.get(key) ?? { labels: new Set(), points: [], hinted: false };
    if (key in RIVER_LABELS) {
      held.hinted = true;
      if (RIVER_LABELS[key] !== null) held.labels.add(RIVER_LABELS[key]);
    } else for (const label of riverLabels(river.p)) held.labels.add(label);
    held.points.push(...pointsOf(river.geometry));
    byKey.set(key, held);
  }
  const labels = [...new Set([...byKey.values()].flatMap((held) => [...held.labels]))].sort();
  const candidates = new Map();
  for (const batch of chunks(labels, 400)) {
    const values = batch.map((label) => JSON.stringify(label) + "@en").join(" ");
    const rows = await sparql(`SELECT ?item ?label ?coord ?links WHERE { VALUES ?label { ${values} } VALUES ?class { ${RIVER_CLASSES.map((one) => `wd:${one}`).join(" ")} }
      ?item rdfs:label ?label; wdt:P31 ?class; wdt:P625 ?coord; wikibase:sitelinks ?links }`);
    for (const row of rows) {
      const match = /Point\(([-\d.eE]+) ([-\d.eE]+)\)/.exec(row.coord.value);
      if (!match) continue;
      const label = row.label.value;
      const list = candidates.get(label) ?? [];
      list.push({ id: qid(row.item.value), at: [Number(match[1]), Number(match[2])], links: Number(row.links.value) });
      candidates.set(label, list);
    }
    console.log(`river names: ${Math.min(labels.length, candidates.size)} found of ${labels.length} asked so far`);
  }
  const matches = {};
  for (const [key, held] of [...byKey].sort(([a], [b]) => a.localeCompare(b))) {
    const step = Math.max(1, Math.floor(held.points.length / 400));
    const sample = held.points.filter((_, i) => i % step === 0);
    let best = null;
    for (const label of held.labels) {
      for (const candidate of candidates.get(label) ?? []) {
        const km = Math.min(...sample.map((point) => geoDistance(point, candidate.at))) * EARTH_KM;
        if (km > (held.hinted ? HINT_KM : candidate.links >= FAR_LINKS ? FAR_KM : MATCH_KM)) continue;
        const better = best === null || candidate.links > best.links || (candidate.links === best.links && (km < best.km || (km === best.km && candidate.id < best.id)));
        if (better) best = { id: candidate.id, km, links: candidate.links };
      }
    }
    if (best) matches[key] = best.id;
  }
  console.log(`rivers matched: ${Object.keys(matches).length} of ${byKey.size}`);
  return matches;
}

async function main() {
  const ids = new Set();
  for (const [group, spec] of Object.entries(FEATURE_FILES)) {
    if (group === "rivers") continue;
    for (const feature of (await source(spec.file)).features) {
      const p = lowerProperties(feature);
      if (p.wikidataid && spec.kinds[p.featurecla]) ids.add(p.wikidataid);
    }
  }
  const rivers = await matchRivers();
  for (const id of Object.values(rivers)) ids.add(id);
  const items = await itemsOf([...ids].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))));
  const sorted = Object.fromEntries(Object.entries(items).sort(([a], [b]) => Number(a.slice(1)) - Number(b.slice(1))));
  const out = {
    source: "Wikidata (wikidata.org), CC0",
    retrieved: new Date().toISOString().slice(0, 10),
    match: { km: MATCH_KM, farKm: FAR_KM, farLinks: FAR_LINKS },
    rivers,
    items: sorted,
  };
  writeFileSync(join(root, "scripts", "data-wikidata.json"), `${JSON.stringify(out, null, 1)}\n`);
  console.log(`scripts/data-wikidata.json: ${Object.keys(sorted).length} items, ${Object.keys(rivers).length} rivers`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

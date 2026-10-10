// The named physical features of each map, for build-data.mjs: oceans, seas, bays and straits; lakes and reservoirs;
// rivers; deserts, mountain ranges, plains and peninsulas; and peaks. Read from Natural Earth's physical vectors at
// 1:10m (the same release as the outlines), named in English from Natural Earth and in Japanese from Natural Earth or
// Wikidata (scripts/data-wikidata.json, made by wikidata.mjs), drawn on each map's own canvas in the map's own
// projection, cut to the canvas, simplified for its scale, and written one file a map under src/data/features/.
//
// Which features a map has: the world, the highest ranked of each group (WORLD_RANKS); a country, the seas that
// touch its coast and the lakes, rivers, landforms and peaks on its land, as far down the ranks as are big enough to
// see on its canvas (COUNTRY_RANKS, SMALLEST, MOST). Everything is decided on the canvas, from the map's own outlines.
//
// DETERMINISTIC, like the rest of the build: no clock, no network, no randomness.
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { countries as kuniCountries } from "@johnmorrisdotca/kuni";
import { facts as kuniFacts } from "@johnmorrisdotca/kuni/facts";
import { loadSubdivisionFacts } from "@johnmorrisdotca/kuni/subdivision-facts";
import { geoArea, geoBounds, geoDistance, geoPath } from "d3-geo";

import { COUNTRY_RANKS, ENDING_READINGS, FEATURE_FILES, FEATURE_GROUPS, FEATURE_READINGS, LEADING_READINGS, MOST, SEATS_KUNI_LACKS, SMALLEST, TOLERANCE, WORLD_RANKS } from "./features-config.mjs";
import { lowerProperties, root, source } from "./natural-earth.mjs";

const PRECISION = 1;
const round = (value) => Math.round(value * 10 ** PRECISION) / 10 ** PRECISION;

// ---- Names and readings ------------------------------------------------------------------------------------------

/** Katakana as hiragana; the long-vowel mark stays as it is. */
const toHiragana = (text) => text.replace(/[ァ-ヶ]/gu, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
const KANA = /^[\p{Script=Katakana}\p{Script=Hiragana}ー]+$/u;
/** A name with its middle dots, spaces and bracketed asides taken out. */
const bare = (name) => name.replace(/\s*[(（][^)）]*[)）]\s*/gu, "").replace(/[・･＝=\s]/gu, "");

/**
 * How a Japanese name is read, and where the reading came from: a name in kana is its own reading; Wikidata's name in
 * kana (P1814); the table written here; a Japanese alias in hiragana alone; or kana followed by a known ending (カスピ海,
 * かすぴかい), with a direction before it (南シナ海). Null when none of these reads it.
 */
export function featureReading(nameJa, item) {
  if (!nameJa) return null;
  const plain = bare(nameJa);
  if (KANA.test(plain)) return { reading: plain, from: "kana" };
  const kana = item?.kana?.map((one) => toHiragana(bare(one))).find((one) => KANA.test(one));
  if (kana) return { reading: kana, from: "wikidata" };
  if (FEATURE_READINGS[plain]) return { reading: FEATURE_READINGS[plain], from: "table" };
  const alias = item?.hiragana?.map(bare).find((one) => KANA.test(one));
  if (alias) return { reading: alias, from: "wikidata" };
  for (const [ending, said] of ENDING_READINGS) {
    if (!plain.endsWith(ending)) continue;
    let head = plain.slice(0, -ending.length);
    let lead = "";
    const direction = LEADING_READINGS.find(([word]) => head.startsWith(word) && KANA.test(head.slice(word.length)));
    if (direction) {
      lead = direction[1];
      head = head.slice(direction[0].length);
    }
    if (head.length > 0 && KANA.test(head)) return { reading: lead + toHiragana(head) + said, from: "rule" };
  }
  return null;
}

/**
 * A landform's kind, from Natural Earth's class but for its two loose ones: "Pen/cape" is a cape only where the name
 * says so (Cape Zhelaniya, Wilsons Promontory), and a peninsula otherwise (Scandinavia, the Indian subcontinent); and a
 * feature named a peninsula is one, whatever its class (Natural Earth files the Iberian Peninsula as a plateau).
 */
function landformKind(kind, p) {
  const names = `${p.name} ${p.name_en ?? ""} ${p.name_ja ?? ""}`;
  if (/peninsula|\bpen\.|península|半島/iu.test(names)) return "peninsula";
  if (kind === "peninsula" && /\bcape\b|\bcabo\b|\bcap\b|promontory|\bpoint\b|岬/iu.test(names)) return "cape";
  return kind;
}

/** Natural Earth's English names are sometimes in capitals (KYÜSHÜ, SAHARA): written as a name is written. */
const titleCase = (name) => (name === name.toUpperCase() ? name.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, gap, letter) => gap + letter.toUpperCase()) : name);

// ---- The features, as Natural Earth and Wikidata give them -------------------------------------------------------

function polygonsOf(geometry) {
  if (!geometry) return [];
  return geometry.type === "Polygon" ? [geometry.coordinates] : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
}
function linesOf(geometry) {
  if (!geometry) return [];
  return geometry.type === "LineString" ? [geometry.coordinates] : geometry.type === "MultiLineString" ? geometry.coordinates : [];
}

/** A polygon wound the way d3 reads it: a ring that encloses more than half the sphere is the wrong way round. */
function rightWay(polygon) {
  return geoArea({ type: "Polygon", coordinates: polygon }) > 2 * Math.PI ? polygon.map((ring) => [...ring].reverse()) : polygon;
}

/**
 * Every feature any map may draw, as plain geography: one entry a feature, the parts Natural Earth draws apart (the
 * North and South Pacific, a river's several lines) joined under the Wikidata item they share.
 */
export async function featureSources(options = {}) {
  const wikidata = JSON.parse(readFileSync(join(root, "scripts", "data-wikidata.json"), "utf8"));
  const stats = { japanese: { naturalEarth: 0, wikidata: 0, kuni: 0, none: 0 }, readings: { kana: 0, wikidata: 0, table: 0, rule: 0, none: 0 }, rivers: { matched: 0, unmatched: 0 } };
  const byCode = new Map();
  for (const group of FEATURE_GROUPS) {
    const spec = FEATURE_FILES[group];
    if (!spec) continue;
    const collection = await source(spec.file);
    for (const feature of collection.features) {
      const p = lowerProperties(feature);
      const kind = spec.kinds[p.featurecla];
      if (!kind || !p.name || !feature.geometry) continue;
      const riverKey = `${p.rivernum}|${p.name}`;
      const qid = group === "rivers" ? (wikidata.rivers[riverKey] ?? null) : (p.wikidataid ?? null);
      if (group === "rivers") stats.rivers[qid ? "matched" : "unmatched"] += 1;
      const item = qid ? wikidata.items[qid] : null;
      const code = qid ?? (group === "rivers" ? `ne-river-${p.rivernum}` : `ne-${p.ne_id}`);
      // Natural Earth's English for a lake or a river is the bare stem ("Erie", "Ishikari"): Wikidata's label, which Natural
      // Earth's own names were taken from, is the name in full. A sea, a landform or a peak keeps Natural Earth's.
      const name = group === "rivers" || group === "lakes" ? (item?.en ?? titleCase(p.name)) : titleCase(p.name_en ?? item?.en ?? p.name);
      const nameJa = group === "rivers" ? (item?.ja ?? null) : (p.name_ja ?? item?.ja ?? null);
      const fromJa = group !== "rivers" && p.name_ja ? "naturalEarth" : nameJa ? "wikidata" : "none";
      const held = byCode.get(code);
      const geometry = group === "rivers" ? linesOf(feature.geometry) : group === "peaks" ? [] : polygonsOf(feature.geometry).map(rightWay);
      if (held) {
        // A second part of a feature already read: its shape joins the first, and the feature takes the higher rank.
        if (held.group !== group) continue;
        held.parts.push(...geometry);
        held.rank = Math.min(held.rank, p.scalerank ?? 10);
        continue;
      }
      byCode.set(code, {
        code,
        kind: landformKind(kind, p),
        group,
        name,
        nameJa,
        fromJa,
        item,
        rank: p.scalerank ?? 10,
        elevation: group === "peaks" ? p.elevation : undefined,
        point: group === "peaks" ? feature.geometry.coordinates : undefined,
        parts: geometry,
      });
    }
  }
  for (const capital of await capitals(options.divisions ?? [])) byCode.set(capital.code, capital);
  const all = [...byCode.values()];
  for (const one of all) {
    stats.japanese[one.fromJa] += 1;
    const read = featureReading(one.nameJa, one.item);
    one.reading = read?.reading ?? null;
    if (one.nameJa) stats.readings[read?.from ?? "none"] += 1;
    one.geo = one.group === "rivers" ? { type: "MultiLineString", coordinates: one.parts } : one.point ? { type: "Point", coordinates: one.point } : { type: "MultiPolygon", coordinates: one.parts };
    one.bounds = geoBounds(one.geo);
    delete one.parts;
    delete one.item;
  }
  return { features: all, stats, wikidata: { retrieved: wikidata.retrieved } };
}

/**
 * The capitals, from kuni 国 (its /facts and /subdivision-facts, which are Wikidata's): each country's capital, and the
 * seat of each region of the countries that have a map of their regions (`divisions`, their alpha-2 codes). A seat in
 * the same place as its country's capital (Tokyo's, in Shinjuku) is left to the capital's mark.
 */
async function capitals(divisions) {
  const out = [];
  const national = new Map();
  for (const country of kuniCountries()) {
    const point = kuniFacts(country.alpha2)?.capitalPoint;
    if (!point || !country.capital?.en) continue;
    national.set(country.alpha2, [point.lon, point.lat]);
    out.push({ code: `capital-${country.alpha2}`, kind: "capital", group: "capitals", name: country.capital.en, nameJa: country.capital.ja || null, fromJa: country.capital.ja ? "kuni" : "none", item: null, rank: 0, country: country.alpha2, point: [point.lon, point.lat], parts: [] });
  }
  for (const code of [...divisions].sort()) {
    for (const fact of (await loadSubdivisionFacts(code)) ?? []) {
      const lacking = SEATS_KUNI_LACKS[fact.code];
      if (lacking && fact.capital?.en) throw new Error(`${fact.code}: kuni has a capital now (${fact.capital.en}); remove it from SEATS_KUNI_LACKS`);
      const seat = lacking ? { ...fact, capital: { en: lacking.en, ja: lacking.ja }, capitalPoint: lacking.point } : fact;
      if (!seat.capital?.en || !seat.capitalPoint) continue;
      const point = [seat.capitalPoint.lon, seat.capitalPoint.lat];
      const capital = national.get(code);
      if (capital && geoDistance(capital, point) * 6371 < 15) continue;
      out.push({
        code: `seat-${seat.code}`,
        kind: "seat",
        group: "capitals",
        name: seat.capital.en,
        nameJa: seat.capital.ja ?? null,
        fromJa: seat.capital.ja ? "kuni" : "none",
        item: seat.capital.reading ? { kana: [seat.capital.reading] } : null,
        rank: 5,
        country: code,
        subdivision: seat.code,
        point,
        parts: [],
      });
    }
  }
  return out;
}

/**
 * Where a point on a region's land is drawn on a map that draws some of its regions in boxes: carried into the box that
 * holds the region's pieces round it, as `mapRegionPieces` carries them; where it is otherwise. A region drawn whole in a
 * box of its own (Alaska, Hawaii) is drawn in a projection of its own, so its point is projected by that one (`own`, the
 * projection the map's builder used for it) and seated in the box as the map seats the region (`insetTransform`); null
 * where no such projection was handed over, because a point the region's projection did not make would land at sea.
 */
function placedOnMap(map, region, at, own = null) {
  const insets = map.insets.filter((inset) => String(inset.code) === String(region.code));
  if (insets.length === 0) return at;
  const whole = insets.find((one) => one.outlyingBelow === undefined && one.within === undefined);
  if (whole) {
    if (!own) return null;
    // The same move as src/insets.ts's insetTransform: shrink to fit the box, never magnify unless the box says so, centre.
    const [x0, y0, x1, y1] = region.bbox;
    const width = Math.max(x1 - x0, 0.001);
    const height = Math.max(y1 - y0, 0.001);
    const fits = Math.min(whole.box.width / width, whole.box.height / height);
    const scale = whole.magnify ? fits : Math.min(1, fits);
    return [own[0] * scale + whole.box.x + (whole.box.width - width * scale) / 2 - x0 * scale, own[1] * scale + whole.box.y + (whole.box.height - height * scale) / 2 - y0 * scale];
  }
  let rest = piecesOf(region.path).map((piece) => piece.points);
  for (const one of insets) {
    const box = (ring) => [Math.min(...ring.map((p) => p[0])), Math.min(...ring.map((p) => p[1])), Math.max(...ring.map((p) => p[0])), Math.max(...ring.map((p) => p[1]))];
    const takes = (ring) => {
      const [x0, y0, x1, y1] = box(ring);
      return one.within !== undefined ? x0 >= one.within.x && x1 <= one.within.x + one.within.width && y0 >= one.within.y && y1 <= one.within.y + one.within.height : y0 >= one.outlyingBelow;
    };
    const taken = rest.filter(takes);
    rest = rest.filter((ring) => !takes(ring));
    const holds = one.within !== undefined ? at[0] >= one.within.x && at[0] <= one.within.x + one.within.width && at[1] >= one.within.y && at[1] <= one.within.y + one.within.height : at[1] >= one.outlyingBelow;
    if (taken.length === 0 || !holds) continue;
    const boxes = taken.map(box);
    const bounds = [Math.min(...boxes.map((b) => b[0])), Math.min(...boxes.map((b) => b[1])), Math.max(...boxes.map((b) => b[2])), Math.max(...boxes.map((b) => b[3]))];
    const width = Math.max(bounds[2] - bounds[0], 0.001);
    const height = Math.max(bounds[3] - bounds[1], 0.001);
    const fits = Math.min(one.box.width / width, one.box.height / height);
    const scale = one.magnify ? fits : Math.min(1, fits);
    const dx = one.box.x + (one.box.width - width * scale) / 2 - bounds[0] * scale;
    const dy = one.box.y + (one.box.height - height * scale) / 2 - bounds[1] * scale;
    return [at[0] * scale + dx, at[1] * scale + dy];
  }
  return at;
}

// ---- On a canvas ------------------------------------------------------------------------------------------------

/** A projected path as pieces of points: `[[x, y], …]` for each `M`. */
function piecesOf(d) {
  if (!d) return [];
  return d
    .split(/(?=M)/)
    .map((part) => {
      const numbers = part.match(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g)?.map(Number) ?? [];
      const points = [];
      for (let i = 0; i + 1 < numbers.length; i += 2) points.push([numbers[i], numbers[i + 1]]);
      return { points, closed: /Z\s*$/.test(part) };
    })
    .filter((piece) => piece.points.length > 1);
}

/** Douglas–Peucker: the fewest points that stay within `tolerance` of the line. */
function simplify(points, tolerance) {
  if (points.length <= 2) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  const t2 = tolerance * tolerance;
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = points[a];
    const [bx, by] = points[b];
    const dx = bx - ax;
    const dy = by - ay;
    const length2 = dx * dx + dy * dy;
    let worst = -1;
    let far = 0;
    for (let i = a + 1; i < b; i += 1) {
      const [px, py] = points[i];
      let d2;
      if (length2 === 0) d2 = (px - ax) ** 2 + (py - ay) ** 2;
      else {
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / length2));
        d2 = (px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2;
      }
      if (d2 > far) {
        far = d2;
        worst = i;
      }
    }
    if (worst > 0 && far > t2) {
      keep[worst] = 1;
      stack.push([a, worst], [worst, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

/** Rounded, with a point that rounding put on the one before it taken out. */
function rounded(points) {
  const out = [];
  for (const [x, y] of points) {
    const p = [round(x), round(y)];
    const last = out.at(-1);
    if (last && last[0] === p[0] && last[1] === p[1]) continue;
    out.push(p);
  }
  return out;
}

const signedArea = (ring) => {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) sum += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  return sum / 2;
};
const lineLength = (line) => line.reduce((sum, point, i) => (i === 0 ? 0 : sum + Math.hypot(point[0] - line[i - 1][0], point[1] - line[i - 1][1])), 0);

/** The land of a map as a grid of cells one unit square, filled from its regions' outlines (even–odd, like the drawing), with a sum table for asking how much land is near a point. */
function landGrid(map) {
  const width = Math.ceil(map.width);
  const height = Math.ceil(map.height);
  const cells = new Uint8Array(width * height);
  const crossings = Array.from({ length: height }, () => []);
  for (const region of map.regions) {
    for (const piece of piecesOf(region.path)) {
      const ring = piece.points;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
        const [x0, y0] = ring[j];
        const [x1, y1] = ring[i];
        if (y0 === y1) continue;
        const top = Math.max(0, Math.ceil(Math.min(y0, y1) - 0.5));
        const bottom = Math.min(height - 1, Math.floor(Math.max(y0, y1) - 0.5));
        for (let row = top; row <= bottom; row += 1) {
          const y = row + 0.5;
          if ((y < y0) === (y < y1)) continue;
          crossings[row].push(x0 + ((y - y0) / (y1 - y0)) * (x1 - x0));
        }
      }
    }
  }
  for (let row = 0; row < height; row += 1) {
    const xs = crossings[row].sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const from = Math.max(0, Math.ceil(xs[k] - 0.5));
      const to = Math.min(width - 1, Math.floor(xs[k + 1] - 0.5));
      for (let col = from; col <= to; col += 1) cells[row * width + col] = 1;
    }
  }
  const sums = new Uint32Array((width + 1) * (height + 1));
  for (let row = 0; row < height; row += 1) {
    let line = 0;
    for (let col = 0; col < width; col += 1) {
      line += cells[row * width + col];
      sums[(row + 1) * (width + 1) + col + 1] = sums[row * (width + 1) + col + 1] + line;
    }
  }
  const at = (x, y) => {
    const col = Math.floor(x);
    const row = Math.floor(y);
    return col >= 0 && row >= 0 && col < width && row < height && cells[row * width + col] === 1;
  };
  /** Whether any land is within `reach` units of a point. */
  const near = (x, y, reach) => {
    const c0 = Math.max(0, Math.floor(x - reach));
    const c1 = Math.min(width, Math.ceil(x + reach));
    const r0 = Math.max(0, Math.floor(y - reach));
    const r1 = Math.min(height, Math.ceil(y + reach));
    if (c1 <= c0 || r1 <= r0) return false;
    const w = width + 1;
    return sums[r1 * w + c1] - sums[r0 * w + c1] - sums[r1 * w + c0] + sums[r0 * w + c0] > 0;
  };
  return { at, near };
}

/** The distance from a point to the nearest edge of a polygon's rings, negative outside it (even–odd). */
function signedDistance(x, y, rings) {
  let inside = false;
  let best = Infinity;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
      const [ax, ay] = ring[j];
      const [bx, by] = ring[i];
      if (by > y !== ay > y && x < ((ax - bx) * (y - by)) / (ay - by) + bx) inside = !inside;
      const dx = bx - ax;
      const dy = by - ay;
      const length2 = dx * dx + dy * dy;
      const t = length2 === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / length2));
      best = Math.min(best, (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2);
    }
  }
  return (inside ? 1 : -1) * Math.sqrt(best);
}

/**
 * Where an area's name goes: the point inside it farthest from its edges (the pole of inaccessibility, found by
 * halving squares as Mapbox's polylabel does), kept out of the map's boxes so a sea's name is never written over
 * Okinawa's frame.
 */
/** How far a name's point keeps from a map's boxes, in units: room for the name round it. */
const AVOID_MARGIN = 30;

function labelPoint(rings, avoid) {
  const xs = rings.flat().map((p) => p[0]);
  const ys = rings.flat().map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const size = Math.min(maxX - minX, maxY - minY);
  const score = (x, y) => {
    let d = signedDistance(x, y, rings);
    for (const box of avoid) {
      const inside = Math.min(x - box.x, box.x + box.width - x, y - box.y, box.y + box.height - y);
      if (inside > -AVOID_MARGIN) d = Math.min(d, -inside - AVOID_MARGIN);
    }
    return d;
  };
  const cell = (x, y, h) => ({ x, y, h, d: score(x, y), max: score(x, y) + h * Math.SQRT2 });
  if (size <= 0) return [(minX + maxX) / 2, (minY + maxY) / 2];
  let h = size / 2;
  const queue = [];
  for (let x = minX; x < maxX; x += size) for (let y = minY; y < maxY; y += size) queue.push(cell(x + h, y + h, h));
  let best = cell((minX + maxX) / 2, (minY + maxY) / 2, 0);
  for (const candidate of queue) if (candidate.d > best.d) best = candidate;
  const precision = Math.max(0.2, size / 200);
  let guard = 0;
  while (queue.length && guard < 4000) {
    guard += 1;
    queue.sort((a, b) => b.max - a.max);
    const next = queue.shift();
    if (next.d > best.d) best = next;
    if (next.max - best.d <= precision) continue;
    h = next.h / 2;
    queue.push(cell(next.x - h, next.y - h, h), cell(next.x + h, next.y - h, h), cell(next.x - h, next.y + h, h), cell(next.x + h, next.y + h, h));
  }
  return [best.x, best.y];
}

/** Where a river's name goes: half way along its longest stretch on the canvas, and the angle it runs at there, kept upright. */
function riverLabel(lines, avoid) {
  const sorted = [...lines].sort((a, b) => lineLength(b) - lineLength(a));
  for (const line of sorted) {
    const length = lineLength(line);
    for (const share of [0.5, 0.35, 0.65, 0.2, 0.8]) {
      const want = length * share;
      let walked = 0;
      for (let i = 1; i < line.length; i += 1) {
        const step = Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
        if (walked + step >= want) {
          const t = step === 0 ? 0 : (want - walked) / step;
          const x = line[i - 1][0] + t * (line[i][0] - line[i - 1][0]);
          const y = line[i - 1][1] + t * (line[i][1] - line[i - 1][1]);
          if (avoid.some((box) => x > box.x && x < box.x + box.width && y > box.y && y < box.y + box.height)) break;
          // The direction over a stretch either side, a tenth of the river long, so a meander does not tip the name over.
          const span = Math.max(1, length * 0.1);
          const before = pointAlong(line, Math.max(0, want - span));
          const after = pointAlong(line, Math.min(length, want + span));
          let angle = (Math.atan2(after[1] - before[1], after[0] - before[0]) * 180) / Math.PI;
          if (angle > 90) angle -= 180;
          if (angle <= -90) angle += 180;
          return { at: [x, y], angle: Math.round(angle) };
        }
        walked += step;
      }
    }
  }
  return { at: sorted[0][Math.floor(sorted[0].length / 2)], angle: 0 };
}

function pointAlong(line, distance) {
  let walked = 0;
  for (let i = 1; i < line.length; i += 1) {
    const step = Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
    if (walked + step >= distance) {
      const t = step === 0 ? 0 : (distance - walked) / step;
      return [line[i - 1][0] + t * (line[i][0] - line[i - 1][0]), line[i - 1][1] + t * (line[i][1] - line[i - 1][1])];
    }
    walked += step;
  }
  return line.at(-1);
}

/** Whether two longitude–latitude boxes meet; a box that crosses the antimeridian is taken as the whole way round. */
function boundsMeet(a, b) {
  const [[aw, as], [ae, an]] = a;
  const [[bw, bs], [be, bn]] = b;
  if (an < bs || bn < as) return false;
  if (aw > ae || bw > be) return true;
  return !(ae < bw || be < aw);
}

/** The part of the earth a map's canvas shows, from its corners and edges taken back through its projection. */
function canvasBounds(map, projection) {
  if (!projection.invert) return [[-180, -90], [180, 90]];
  const lons = [];
  const lats = [];
  for (let i = 0; i <= 8; i += 1) {
    for (let j = 0; j <= 8; j += 1) {
      const back = projection.invert([(map.width * i) / 8, (map.height * j) / 8]);
      if (!back || !Number.isFinite(back[0]) || !Number.isFinite(back[1])) continue;
      lons.push(back[0]);
      lats.push(back[1]);
    }
  }
  if (lons.length === 0) return [[-180, -90], [180, 90]];
  const west = Math.min(...lons);
  const east = Math.max(...lons);
  const pad = 1;
  // A canvas that shows both sides of the antimeridian reads, naively, as the whole way round: so it is taken.
  return [[east - west > 300 ? -180 : west - pad, Math.max(-90, Math.min(...lats) - pad)], [east - west > 300 ? 180 : east + pad, Math.min(90, Math.max(...lats) + pad)]];
}

const pathOf = (pieces, closed) => pieces.map((points) => `M${points.map(([x, y]) => `${x},${y}`).join("L")}${closed ? "Z" : ""}`).join("");

/**
 * One map's features: each projected onto the canvas, cut to it, simplified, kept if it is the map's (a sea on its
 * coast, a lake or a river on its land) and big enough to see, named, given a point for its name, and joined to the
 * features it touches.
 *
 * `options.world` is true for the world, which takes the top ranks of everything rather than what touches one country;
 * `options.avoid` the boxes a map draws its insets in, where no name is put; `options.insetProjections` the projections
 * of the regions it draws whole in boxes of their own, by region code (`{ AK, HI }` on the United States).
 */
export function featuresOn(map, projection, sources, options = {}) {
  const world = options.world === true;
  const ranks = world ? WORLD_RANKS : COUNTRY_RANKS;
  const tolerances = world ? TOLERANCE.world : TOLERANCE.country;
  const avoid = options.avoid ?? [];
  projection.clipExtent([[-1, -1], [map.width + 1, map.height + 1]]);
  const draw = geoPath(projection);
  const shown = canvasBounds(map, projection);
  const land = landGrid(map);
  const side = Math.max(map.width, map.height);
  const reach = side * 0.015;
  const kept = [];
  const country = options.country ?? null;
  const onWorld = new Set(map.regions.map((region) => region.code));
  const regionByIso = new Map(map.regions.filter((region) => region.iso).map((region) => [region.iso, region]));
  for (const one of sources.features) {
    if (one.group === "capitals") {
      // The world's capitals on the world; a country's own capital on its maps, and on its regions' map the seats of its regions.
      const ours = world ? one.kind === "capital" && onWorld.has(one.country) : one.country === country && (one.kind === "capital" || regionByIso.has(one.subdivision));
      if (!ours) continue;
      const region = one.kind === "seat" ? regionByIso.get(one.subdivision) : null;
      const raw = projection(one.geo.coordinates);
      // A region drawn whole in a box of its own (Alaska, Hawaii) has its seat projected as the region was.
      const own = region ? options.insetProjections?.[region.code]?.(one.geo.coordinates) : null;
      const at = region ? placedOnMap(map, region, raw ?? own, own) : raw;
      if (!at || at[0] < 0 || at[1] < 0 || at[0] > map.width || at[1] > map.height) continue;
      kept.push({ one, pieces: [], size: 0, label: [round(at[0]), round(at[1])], bbox: [round(at[0]), round(at[1]), round(at[0]), round(at[1])] });
      continue;
    }
    if (one.rank > ranks[one.group]) continue;
    if (!world && !boundsMeet(one.bounds, shown)) continue;
    if (one.group === "peaks") {
      const at = projection(one.geo.coordinates);
      if (!at || at[0] < 0 || at[1] < 0 || at[0] > map.width || at[1] > map.height || (!world && !land.at(at[0], at[1]))) continue;
      if (avoid.some((box) => at[0] > box.x && at[0] < box.x + box.width && at[1] > box.y && at[1] < box.y + box.height)) continue;
      kept.push({ one, pieces: [], size: 0, label: [round(at[0]), round(at[1])], bbox: [round(at[0]), round(at[1]), round(at[0]), round(at[1])] });
      continue;
    }
    const line = one.group === "rivers";
    const pieces = piecesOf(draw(one.geo))
      .map((piece) => {
        const ring = line ? piece.points : piece.points.slice(0, piece.points.at(-1)[0] === piece.points[0][0] && piece.points.at(-1)[1] === piece.points[0][1] ? -1 : undefined);
        return rounded(simplify(ring, tolerances[one.group]));
      })
      .filter((points) => (line ? points.length >= 2 && lineLength(points) >= 0.5 : points.length >= 3 && Math.abs(signedArea(points)) >= 0.3));
    if (pieces.length === 0) continue;
    const size = line ? pieces.reduce((sum, points) => sum + lineLength(points), 0) : Math.abs(pieces.reduce((sum, points) => sum + signedArea(points), 0));
    if (size < (line ? SMALLEST.line : SMALLEST.area)) continue;
    const points = pieces.flat();
    if (!world) {
      const step = Math.max(1, Math.floor(points.length / 300));
      const sample = points.filter((_, i) => i % step === 0);
      const onLand = sample.filter(([x, y]) => land.at(x, y)).length / sample.length;
      if (one.group === "marine" && !sample.some(([x, y]) => land.near(x, y, reach))) continue;
      if (one.group === "rivers" && onLand < 0.3) continue;
      if ((one.group === "lakes" || one.group === "landforms") && onLand < 0.3) continue;
    }
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const bbox = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    const label = line ? riverLabel(pieces, avoid) : { at: labelPoint(pieces, avoid) };
    kept.push({ one, pieces, size, label: label.at.map(round), angle: label.angle, bbox });
  }
  // The highest ranked of each group, then the biggest, up to the most a map keeps.
  const chosen = [];
  for (const group of FEATURE_GROUPS) {
    const ofGroup = kept.filter((entry) => entry.one.group === group).sort((a, b) => a.one.rank - b.one.rank || b.size - a.size || a.one.code.localeCompare(b.one.code));
    chosen.push(...ofGroup.slice(0, MOST[group]));
  }
  const neighbours = touching(chosen.filter((entry) => ["marine", "lakes", "rivers"].includes(entry.one.group)), tolerances.marine * 2 + 0.6);
  return chosen.map((entry) => {
    const { one } = entry;
    return {
      code: one.code,
      kind: one.kind,
      group: one.group,
      name: one.name,
      ...(one.nameJa ? { nameJa: one.nameJa } : {}),
      ...(one.reading ? { reading: one.reading } : {}),
      rank: one.rank,
      ...(one.elevation !== undefined && one.elevation !== null ? { elevation: one.elevation } : {}),
      path: pathOf(entry.pieces, one.group !== "rivers"),
      bbox: entry.bbox,
      centroid: entry.label,
      ...(entry.angle ? { angle: entry.angle } : {}),
      neighbors: neighbours.get(one.code) ?? [],
    };
  });
}

/** Which water features touch which: a point of one within `gap` of a point of another, through a grid of cells `gap` square. */
function touching(entries, gap) {
  const cells = new Map();
  const key = (x, y) => `${Math.floor(x / gap)},${Math.floor(y / gap)}`;
  entries.forEach((entry, index) => {
    for (const piece of entry.pieces) {
      for (const [x, y] of piece) {
        const cell = key(x, y);
        const held = cells.get(cell) ?? [];
        held.push([index, x, y]);
        cells.set(cell, held);
      }
    }
  });
  const near = entries.map(() => new Set());
  for (const [cell, held] of cells) {
    const [cx, cy] = cell.split(",").map(Number);
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        const other = cells.get(`${cx + dx},${cy + dy}`);
        if (!other) continue;
        for (const [a, ax, ay] of held) for (const [b, bx, by] of other) if (a !== b && !near[a].has(b) && Math.hypot(ax - bx, ay - by) <= gap) near[a].add(b);
      }
    }
  }
  return new Map(entries.map((entry, index) => [entry.one.code, [...near[index]].map((other) => entries[other].one.code).sort()]));
}

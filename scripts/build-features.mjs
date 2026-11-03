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
import {
  canvasBounds,
  labelPoint,
  landGrid,
  lineLength,
  pathOf,
  piecesOf,
  riverLabel,
  round,
  signedArea,
  simplify,
  touching,
} from "./build-features/geometry.mjs";
import { featureReading, titleCase } from "./build-features/readings.mjs";
import {
  COUNTRY_RANKS,
  FEATURE_FILES,
  FEATURE_GROUPS,
  MOST,
  SEATS_KUNI_LACKS,
  SMALLEST,
  TOLERANCE,
  WORLD_RANKS,
} from "./features-config.mjs";
import { lowerProperties, root, source } from "./natural-earth.mjs";

export { featureReading } from "./build-features/readings.mjs";

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

// ---- The features, as Natural Earth and Wikidata give them -------------------------------------------------------

function polygonsOf(geometry) {
  if (!geometry) return [];
  return geometry.type === "Polygon"
    ? [geometry.coordinates]
    : geometry.type === "MultiPolygon"
      ? geometry.coordinates
      : [];
}
function linesOf(geometry) {
  if (!geometry) return [];
  return geometry.type === "LineString"
    ? [geometry.coordinates]
    : geometry.type === "MultiLineString"
      ? geometry.coordinates
      : [];
}

/** A polygon wound the way d3 reads it: a ring that encloses more than half the sphere is the wrong way round. */
function rightWay(polygon) {
  return geoArea({ type: "Polygon", coordinates: polygon }) > 2 * Math.PI
    ? polygon.map((ring) => [...ring].reverse())
    : polygon;
}

/**
 * Every feature any map may draw, as plain geography: one entry a feature, the parts Natural Earth draws apart (the
 * North and South Pacific, a river's several lines) joined under the Wikidata item they share.
 */
export async function featureSources(options = {}) {
  const wikidata = JSON.parse(readFileSync(join(root, "scripts", "data-wikidata.json"), "utf8"));
  const stats = {
    japanese: { naturalEarth: 0, wikidata: 0, kuni: 0, none: 0 },
    readings: { kana: 0, wikidata: 0, table: 0, rule: 0, none: 0 },
    rivers: { matched: 0, unmatched: 0 },
  };
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
      const name =
        group === "rivers" || group === "lakes"
          ? (item?.en ?? titleCase(p.name))
          : titleCase(p.name_en ?? item?.en ?? p.name);
      const nameJa = group === "rivers" ? (item?.ja ?? null) : (p.name_ja ?? item?.ja ?? null);
      const fromJa = group !== "rivers" && p.name_ja ? "naturalEarth" : nameJa ? "wikidata" : "none";
      const held = byCode.get(code);
      const geometry =
        group === "rivers"
          ? linesOf(feature.geometry)
          : group === "peaks"
            ? []
            : polygonsOf(feature.geometry).map(rightWay);
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
    one.geo =
      one.group === "rivers"
        ? { type: "MultiLineString", coordinates: one.parts }
        : one.point
          ? { type: "Point", coordinates: one.point }
          : { type: "MultiPolygon", coordinates: one.parts };
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
    out.push({
      code: `capital-${country.alpha2}`,
      kind: "capital",
      group: "capitals",
      name: country.capital.en,
      nameJa: country.capital.ja || null,
      fromJa: country.capital.ja ? "kuni" : "none",
      item: null,
      rank: 0,
      country: country.alpha2,
      point: [point.lon, point.lat],
      parts: [],
    });
  }
  for (const code of [...divisions].sort()) {
    for (const fact of (await loadSubdivisionFacts(code)) ?? []) {
      const lacking = SEATS_KUNI_LACKS[fact.code];
      if (lacking && fact.capital?.en)
        throw new Error(`${fact.code}: kuni has a capital now (${fact.capital.en}); remove it from SEATS_KUNI_LACKS`);
      const seat = lacking
        ? { ...fact, capital: { en: lacking.en, ja: lacking.ja }, capitalPoint: lacking.point }
        : fact;
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
    return [
      own[0] * scale + whole.box.x + (whole.box.width - width * scale) / 2 - x0 * scale,
      own[1] * scale + whole.box.y + (whole.box.height - height * scale) / 2 - y0 * scale,
    ];
  }
  let rest = piecesOf(region.path).map((piece) => piece.points);
  for (const one of insets) {
    const box = (ring) => [
      Math.min(...ring.map((p) => p[0])),
      Math.min(...ring.map((p) => p[1])),
      Math.max(...ring.map((p) => p[0])),
      Math.max(...ring.map((p) => p[1])),
    ];
    const takes = (ring) => {
      const [x0, y0, x1, y1] = box(ring);
      return one.within !== undefined
        ? x0 >= one.within.x &&
            x1 <= one.within.x + one.within.width &&
            y0 >= one.within.y &&
            y1 <= one.within.y + one.within.height
        : y0 >= one.outlyingBelow;
    };
    const taken = rest.filter(takes);
    rest = rest.filter((ring) => !takes(ring));
    const holds =
      one.within !== undefined
        ? at[0] >= one.within.x &&
          at[0] <= one.within.x + one.within.width &&
          at[1] >= one.within.y &&
          at[1] <= one.within.y + one.within.height
        : at[1] >= one.outlyingBelow;
    if (taken.length === 0 || !holds) continue;
    const boxes = taken.map(box);
    const bounds = [
      Math.min(...boxes.map((b) => b[0])),
      Math.min(...boxes.map((b) => b[1])),
      Math.max(...boxes.map((b) => b[2])),
      Math.max(...boxes.map((b) => b[3])),
    ];
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

/** Whether two longitude–latitude boxes meet; a box that crosses the antimeridian is taken as the whole way round. */
function boundsMeet(a, b) {
  const [[aw, as], [ae, an]] = a;
  const [[bw, bs], [be, bn]] = b;
  if (an < bs || bn < as) return false;
  if (aw > ae || bw > be) return true;
  return !(ae < bw || be < aw);
}

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
  projection.clipExtent([
    [-1, -1],
    [map.width + 1, map.height + 1],
  ]);
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
      const ours = world
        ? one.kind === "capital" && onWorld.has(one.country)
        : one.country === country && (one.kind === "capital" || regionByIso.has(one.subdivision));
      if (!ours) continue;
      const region = one.kind === "seat" ? regionByIso.get(one.subdivision) : null;
      const raw = projection(one.geo.coordinates);
      // A region drawn whole in a box of its own (Alaska, Hawaii) has its seat projected as the region was.
      const own = region ? options.insetProjections?.[region.code]?.(one.geo.coordinates) : null;
      const at = region ? placedOnMap(map, region, raw ?? own, own) : raw;
      if (!at || at[0] < 0 || at[1] < 0 || at[0] > map.width || at[1] > map.height) continue;
      kept.push({
        one,
        pieces: [],
        size: 0,
        label: [round(at[0]), round(at[1])],
        bbox: [round(at[0]), round(at[1]), round(at[0]), round(at[1])],
      });
      continue;
    }
    if (one.rank > ranks[one.group]) continue;
    if (!world && !boundsMeet(one.bounds, shown)) continue;
    if (one.group === "peaks") {
      const at = projection(one.geo.coordinates);
      if (
        !at ||
        at[0] < 0 ||
        at[1] < 0 ||
        at[0] > map.width ||
        at[1] > map.height ||
        (!world && !land.at(at[0], at[1]))
      )
        continue;
      if (
        avoid.some((box) => at[0] > box.x && at[0] < box.x + box.width && at[1] > box.y && at[1] < box.y + box.height)
      )
        continue;
      kept.push({
        one,
        pieces: [],
        size: 0,
        label: [round(at[0]), round(at[1])],
        bbox: [round(at[0]), round(at[1]), round(at[0]), round(at[1])],
      });
      continue;
    }
    const line = one.group === "rivers";
    const pieces = piecesOf(draw(one.geo))
      .map((piece) => {
        const ring = line
          ? piece.points
          : piece.points.slice(
              0,
              piece.points.at(-1)[0] === piece.points[0][0] && piece.points.at(-1)[1] === piece.points[0][1]
                ? -1
                : undefined,
            );
        return rounded(simplify(ring, tolerances[one.group]));
      })
      .filter((points) =>
        line
          ? points.length >= 2 && lineLength(points) >= 0.5
          : points.length >= 3 && Math.abs(signedArea(points)) >= 0.3,
      );
    if (pieces.length === 0) continue;
    const size = line
      ? pieces.reduce((sum, points) => sum + lineLength(points), 0)
      : Math.abs(pieces.reduce((sum, points) => sum + signedArea(points), 0));
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
    const ofGroup = kept
      .filter((entry) => entry.one.group === group)
      .sort((a, b) => a.one.rank - b.one.rank || b.size - a.size || a.one.code.localeCompare(b.one.code));
    chosen.push(...ofGroup.slice(0, MOST[group]));
  }
  const neighbours = touching(
    chosen.filter((entry) => ["marine", "lakes", "rivers"].includes(entry.one.group)),
    tolerances.marine * 2 + 0.6,
  );
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

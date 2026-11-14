// Regions and countries as longitude and latitude, for a globe: the outlines of a map's regions, rounded to a grid and
// simplified so that the border two regions share is the same line in both. Used by build-data.mjs for the
// `divisions-geo/<code>` files and for `world-geo-detail`.
//
// HOW THE BORDERS STAY ONE LINE. Every point of every ring is first rounded to the grid, so a point two regions share is
// the same point in both. A point is then "pinned" where the set of regions that have it differs from that of the point
// before or after it in its ring (a border begins or ends there), and the ring is cut into chains between pinned points.
// A chain along a shared border is in both regions' rings (one of them reversed), and each chain is simplified once, in a
// direction fixed by its end points, by Douglas-Peucker with a tolerance in kilometres: both regions get the same points.
import process from "node:process";

const KM_PER_DEGREE = 111.195;

const sameXY = (a, b) => a[0] === b[0] && a[1] === b[1];
const compare = (a, b) => a[0] - b[0] || a[1] - b[1];
const keyOf = (p) => `${p[0]},${p[1]}`;

/** The distance in km from `p` to the segment `a`-`b`, on the plane tangent at the chain's mean latitude. */
function distanceToSegment(p, a, b, scaleX) {
  const ax = a[0] * scaleX;
  const ay = a[1];
  const dx = b[0] * scaleX - ax;
  const dy = b[1] - ay;
  const px = p[0] * scaleX - ax;
  const py = p[1] - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, (px * dx + py * dy) / len2));
  return Math.hypot(px - t * dx, py - t * dy) * KM_PER_DEGREE;
}

/** Douglas-Peucker on an open chain; the indexes of the points kept, the end points among them. */
function douglasPeucker(points, toleranceKm) {
  const last = points.length - 1;
  const meanLatitude = points.reduce((sum, p) => sum + p[1], 0) / points.length;
  const scaleX = Math.cos((meanLatitude * Math.PI) / 180);
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[last] = 1;
  const stack = [[0, last]];
  while (stack.length > 0) {
    const [from, to] = stack.pop();
    let worst = -1;
    let at = -1;
    for (let i = from + 1; i < to; i += 1) {
      const d = distanceToSegment(points[i], points[from], points[to], scaleX);
      if (d > worst) {
        worst = d;
        at = i;
      }
    }
    if (at >= 0 && worst > toleranceKm) {
      keep[at] = 1;
      stack.push([from, at], [at, to]);
    }
  }
  const kept = [];
  for (let i = 0; i < points.length; i += 1) if (keep[i]) kept.push(i);
  return kept;
}

/** A ring with its spikes taken out: a point whose two neighbours are the same point (the line goes out and comes back along itself) is no part of the outline. */
function withoutSpikes(ring) {
  let out = ring;
  for (let again = true; again && out.length >= 3; ) {
    again = false;
    const n = out.length;
    for (let i = 0; i < n; i += 1) {
      if (sameXY(out[(i + n - 1) % n], out[(i + 1) % n])) {
        // drop the point and one of the two equal neighbours
        out = out.filter((_, k) => k !== i && k !== (i + 1) % n);
        again = true;
        break;
      }
    }
  }
  return out;
}

/**
 * How many edges there are that no outline shares with the region next to it though that region has both ends of it: a region has the edge between two points, and another region has both points but goes between them another
 * way. A border that is one line in both regions has none of these; a few come from Natural Earth's own outlines (two regions' points that do not quite agree), and simplifying must not add one.
 *
 * @param regions Each region's rings (arrays of points; a ring may or may not repeat its first point at the end).
 */
export function edgesNotShared(regions) {
  const edgeOf = (a, b) => (compare(a, b) <= 0 ? `${keyOf(a)}|${keyOf(b)}` : `${keyOf(b)}|${keyOf(a)}`);
  const points = regions.map(() => new Set());
  const edges = regions.map(() => new Set());
  regions.forEach((rings, f) => {
    for (const ring of rings) {
      const n = ring.length > 1 && sameXY(ring[0], ring[ring.length - 1]) ? ring.length - 1 : ring.length;
      for (let i = 0; i < n; i += 1) {
        points[f].add(keyOf(ring[i]));
        edges[f].add(edgeOf(ring[i], ring[(i + 1) % n]));
      }
    }
  });
  let count = 0;
  edges.forEach((own, f) => {
    for (const edge of own) {
      const [a, b] = edge.split("|");
      for (let g = 0; g < regions.length; g += 1) {
        if (g !== f && points[g].has(a) && points[g].has(b) && !edges[g].has(edge)) {
          count += 1;
          break;
        }
      }
    }
  });
  return count;
}

/** The rings of a geometry: `[polygon index, ring index, points]`, a ring's points without the closing point. */
function ringsOf(geometry, round, despike = true) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map((polygon) =>
    polygon
      .map((ring) => {
        const out = [];
        for (const [x, y] of ring) {
          const p = [round(x), round(y)];
          if (out.length === 0 || !sameXY(out[out.length - 1], p)) out.push(p);
        }
        if (out.length > 1 && sameXY(out[0], out[out.length - 1])) out.pop();
        return despike ? withoutSpikes(out) : out;
      })
      .filter((ring) => ring.length >= 3),
  );
}

/** The area of a ring in square km (equirectangular, good enough to tell an islet from an island). */
function areaKm2(ring) {
  const meanLatitude = ring.reduce((sum, p) => sum + p[1], 0) / ring.length;
  const scaleX = Math.cos((meanLatitude * Math.PI) / 180);
  let sum = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    sum += a[0] * scaleX * b[1] - b[0] * scaleX * a[1];
  }
  return Math.abs(sum / 2) * KM_PER_DEGREE * KM_PER_DEGREE;
}

/**
 * Simplify the polygons of `features` (GeoJSON features whose geometry is a Polygon or MultiPolygon) so that the borders
 * between them stay identical.
 *
 * @param features The features; their properties are carried over by `keep`.
 * @param options `toleranceKm`: the most a simplified line may lie from the original; `precision`: decimals of a degree
 * kept; `minRingKm2`: rings smaller than this are left out (the largest polygon of a feature is always kept whole).
 * @returns The geometries in the order of `features`, and what was done: the points before and after, and the most any
 * original point lies from the simplified line, in km.
 */
export function simplifyShared(features, { toleranceKm, precision = 2, minRingKm2 = 0, check = true }) {
  const factor = 10 ** precision;
  const round = (value) => Math.round(value * factor) / factor;
  const rings = features.map((feature) => ringsOf(feature.geometry, round));
  const roughly = features.map((feature) => ringsOf(feature.geometry, round, false).flat());
  // which regions each point belongs to
  const owners = new Map();
  rings.forEach((polygons, f) => {
    for (const polygon of polygons)
      for (const ring of polygon)
        for (const p of ring) {
          const key = keyOf(p);
          const set = owners.get(key) ?? new Set();
          owners.set(key, set);
          set.add(f);
        }
  });
  const setKeys = new Map();
  const setOf = (p) => {
    const key = keyOf(p);
    let k = setKeys.get(key);
    if (k === undefined) {
      k = [...owners.get(key)].sort((a, b) => a - b).join(",");
      setKeys.set(key, k);
    }
    return k;
  };
  // The points a border begins or ends at: a point is one wherever it is in any ring, where the regions that have it differ from those that have the point before or after it. The same set of points cuts every ring,
  // so two regions that have the same border cut it at the same places, and the chains between are the same in both however the rings go round.
  const pins = new Set();
  for (const polygons of rings)
    for (const polygon of polygons)
      for (const ring of polygon) {
        const n = ring.length;
        const keys = ring.map(setOf);
        for (let i = 0; i < n; i += 1)
          if (keys[i] !== keys[(i + n - 1) % n] || keys[i] !== keys[(i + 1) % n]) pins.add(keyOf(ring[i]));
      }
  const memo = new Map();
  const stats = {
    before: 0,
    after: 0,
    worstKm: 0,
    droppedRings: 0,
    droppedKm2: 0,
    notShared: { before: edgesNotShared(roughly), after: 0 },
  };

  /** A chain simplified once, in the direction its end points fix, and given back in the direction it came in. */
  const simplifyChain = (chain) => {
    let reversed = false;
    const first = chain[0];
    const last = chain[chain.length - 1];
    const order = compare(first, last);
    if (order > 0 || (order === 0 && chain.length > 2 && compare(chain[1], chain[chain.length - 2]) > 0))
      reversed = true;
    const canonical = reversed ? [...chain].reverse() : chain;
    const key = canonical.map(keyOf).join(";");
    let kept = memo.get(key);
    if (kept === undefined) {
      const indexes = chain.length <= 2 ? [0, chain.length - 1] : douglasPeucker(canonical, toleranceKm);
      kept = indexes.map((i) => canonical[i]);
      memo.set(key, kept);
      // the worst distance of an original point from the kept line
      if (indexes.length < canonical.length) {
        const meanLatitude = canonical.reduce((sum, p) => sum + p[1], 0) / canonical.length;
        const scaleX = Math.cos((meanLatitude * Math.PI) / 180);
        for (let s = 0; s + 1 < indexes.length; s += 1)
          for (let i = indexes[s] + 1; i < indexes[s + 1]; i += 1)
            stats.worstKm = Math.max(
              stats.worstKm,
              distanceToSegment(canonical[i], canonical[indexes[s]], canonical[indexes[s + 1]], scaleX),
            );
      }
    }
    return reversed ? [...kept].reverse() : kept;
  };

  const simplifyRing = (ring) => {
    stats.before += ring.length;
    const n = ring.length;
    const pinned = [];
    for (let i = 0; i < n; i += 1) if (pins.has(keyOf(ring[i]))) pinned.push(i);
    let out;
    if (pinned.length === 0) {
      // a ring nothing else touches: cut at its lowest point and the point furthest from it, the same cut for any copy of it
      let lowest = 0;
      for (let i = 1; i < n; i += 1) if (compare(ring[i], ring[lowest]) < 0) lowest = i;
      let far = lowest;
      let best = -1;
      for (let i = 0; i < n; i += 1) {
        const d = (ring[i][0] - ring[lowest][0]) ** 2 + (ring[i][1] - ring[lowest][1]) ** 2;
        if (d > best || (d === best && compare(ring[i], ring[far]) < 0)) {
          best = d;
          far = i;
        }
      }
      pinned.push(lowest, far);
      pinned.sort((a, b) => a - b);
    }
    out = [];
    for (let c = 0; c < pinned.length; c += 1) {
      const from = pinned[c];
      const to = pinned[(c + 1) % pinned.length];
      const chain = [];
      for (let i = from; ; i = (i + 1) % n) {
        chain.push(ring[i]);
        if (i === to && chain.length > 1) break;
        if (chain.length > n + 1) break;
      }
      const simple = simplifyChain(chain);
      out.push(...simple.slice(0, -1));
    }
    stats.after += out.length;
    return out;
  };

  const geometries = rings.map((polygons) => {
    const kept = [];
    let biggest = null;
    for (const polygon of polygons) {
      if (polygon.length === 0) continue;
      const outer = polygon[0];
      const area = areaKm2(outer);
      if (biggest === null || area > biggest.area) biggest = { area, polygon };
    }
    for (const polygon of polygons) {
      if (polygon.length === 0) continue;
      const area = areaKm2(polygon[0]);
      if (polygon !== biggest?.polygon && area < minRingKm2) {
        stats.droppedRings += 1;
        stats.droppedKm2 = Math.max(stats.droppedKm2, area);
        continue;
      }
      const simple = polygon
        .map(simplifyRing)
        .filter((ring, i) => i === 0 || ring.length >= 3)
        .filter((ring) => ring.length >= 3);
      if (simple.length === 0 || polygon[0].length < 3) continue;
      kept.push(simple.map((ring) => [...ring, ring[0]]));
    }
    return kept.length === 1 ? { type: "Polygon", coordinates: kept[0] } : { type: "MultiPolygon", coordinates: kept };
  });
  // no region comes out empty
  geometries.forEach((geometry, index) => {
    if (geometry.coordinates.length === 0) throw new Error(`simplifying left feature ${index} with no outline`);
  });
  stats.notShared.after = edgesNotShared(
    geometries.map((geometry) => (geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates).flat()),
  );
  // simplifying never adds an edge that is not shared: a border is one line in both regions it divides, as it was
  if (check && stats.notShared.after > stats.notShared.before)
    throw new Error(
      `simplifying added edges that the regions do not share: ${stats.notShared.after} where there were ${stats.notShared.before}`,
    );
  return { geometries, stats };
}

if (process.argv[1]?.endsWith("geo.mjs")) console.log("scripts/build-data/geo.mjs is a module of build-data.mjs");

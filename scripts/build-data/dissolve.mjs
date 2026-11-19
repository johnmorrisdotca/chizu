// Regions joined into larger ones along the lines they share: Vietnam's 63 provinces into the 34 of 2025. Natural Earth
// draws a border two regions share as the same points in both, once each way, so an edge that is in one region's ring
// and, reversed, in another's is inside the union and is dropped; what is left is joined back into rings. The union's
// area is checked against the sum of its parts, so a border that did not quite meet stops the build.
import { geoArea } from "d3-geo";

const keyOf = (p) => `${p[0]},${p[1]}`;

/** Twice the signed area of a ring on the plane of longitude and latitude. */
function shoelace(ring) {
  let sum = 0;
  for (let i = 0; i + 1 < ring.length; i += 1) sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return sum;
}

function inside(point, ring) {
  let within = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > point[1] !== yj > point[1] && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi) within = !within;
  }
  return within;
}

/** The union of polygons that meet along shared edges, as a Polygon or MultiPolygon with the winding of its parts. */
export function union(geometries) {
  const polygons = geometries.flatMap((g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates));
  const edges = new Map();
  for (const polygon of polygons)
    for (const ring of polygon)
      for (let i = 0; i + 1 < ring.length; i += 1) {
        const a = keyOf(ring[i]);
        const b = keyOf(ring[i + 1]);
        if (a === b) continue;
        const back = `${b}|${a}`;
        if (edges.get(back)?.length) edges.get(back).pop();
        else edges.set(`${a}|${b}`, [...(edges.get(`${a}|${b}`) ?? []), [ring[i], ring[i + 1]]]);
      }
  const from = new Map();
  for (const list of edges.values()) for (const [a, b] of list) from.set(keyOf(a), [...(from.get(keyOf(a)) ?? []), b]);
  const rings = [];
  for (const [start, ends] of from)
    while (ends.length > 0) {
      const ring = [start.split(",").map(Number)];
      let next = ends.pop();
      while (keyOf(next) !== start) {
        ring.push(next);
        const onward = from.get(keyOf(next));
        if (!onward?.length) throw new Error(`a ring of the union does not close at ${keyOf(next)}`);
        next = onward.pop();
      }
      ring.push(ring[0]);
      rings.push(ring);
    }
  const outward = Math.sign(shoelace(polygons[0][0]));
  const outers = rings.filter((ring) => Math.sign(shoelace(ring)) === outward).map((ring) => [ring]);
  for (const hole of rings.filter((ring) => Math.sign(shoelace(ring)) !== outward)) {
    const holders = outers.filter(([outer]) => inside(hole[0], outer) || inside(hole[1], outer));
    holders.sort((a, b) => Math.abs(shoelace(a[0])) - Math.abs(shoelace(b[0])));
    if (!holders[0]) throw new Error(`a hole of the union at ${keyOf(hole[0])} is in no outer ring`);
    holders[0].push(hole);
  }
  return outers.length === 1
    ? { type: "Polygon", coordinates: outers[0] }
    : { type: "MultiPolygon", coordinates: outers };
}

/**
 * The regions of `features` joined into `units` ({ code, from: codes }), each with the properties of the region whose
 * code it keeps. Every region must be in exactly one unit, and each union's area must be the sum of its parts'.
 */
export function dissolve(features, units, codeOf) {
  const byCode = new Map(features.map((feature) => [codeOf(feature), feature]));
  const used = new Map();
  for (const unit of units)
    for (const code of unit.from) {
      if (!byCode.has(code)) throw new Error(`${unit.code}: no region ${code} to join`);
      if (used.has(code)) throw new Error(`${code} is joined into both ${used.get(code)} and ${unit.code}`);
      used.set(code, unit.code);
    }
  const left = [...byCode.keys()].filter((code) => !used.has(code));
  if (left.length > 0) throw new Error(`regions in no unit: ${left.join(" ")}`);
  return units.map((unit) => {
    const parts = unit.from.map((code) => byCode.get(code));
    const geometry = parts.length === 1 ? parts[0].geometry : union(parts.map((part) => part.geometry));
    const area = geoArea(geometry);
    const sum = parts.reduce((total, part) => total + geoArea(part), 0);
    if (Math.abs(area - sum) > sum * 1e-9)
      throw new Error(`${unit.code}: the union's area ${area} is not its parts' ${sum}`);
    return {
      ...byCode.get(unit.code),
      properties: { ...byCode.get(unit.code).properties, ...unit.properties },
      geometry,
    };
  });
}

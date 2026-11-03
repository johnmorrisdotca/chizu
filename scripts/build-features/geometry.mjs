const PRECISION = 1;
export const round = (value) => Math.round(value * 10 ** PRECISION) / 10 ** PRECISION;

// ---- On a canvas ------------------------------------------------------------------------------------------------

/** A projected path as pieces of points: `[[x, y], …]` for each `M`. */
export function piecesOf(d) {
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
export function simplify(points, tolerance) {
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

export const signedArea = (ring) => {
  let sum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1)
    sum += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  return sum / 2;
};
export const lineLength = (line) =>
  line.reduce(
    (sum, point, i) => (i === 0 ? 0 : sum + Math.hypot(point[0] - line[i - 1][0], point[1] - line[i - 1][1])),
    0,
  );

/** The land of a map as a grid of cells one unit square, filled from its regions' outlines (even–odd, like the drawing), with a sum table for asking how much land is near a point. */
export function landGrid(map) {
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
          if (y < y0 === y < y1) continue;
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

export function labelPoint(rings, avoid) {
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
    queue.push(
      cell(next.x - h, next.y - h, h),
      cell(next.x + h, next.y - h, h),
      cell(next.x - h, next.y + h, h),
      cell(next.x + h, next.y + h, h),
    );
  }
  return [best.x, best.y];
}

/** Where a river's name goes: half way along its longest stretch on the canvas, and the angle it runs at there, kept upright. */
export function riverLabel(lines, avoid) {
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

/** The part of the earth a map's canvas shows, from its corners and edges taken back through its projection. */
export function canvasBounds(map, projection) {
  if (!projection.invert)
    return [
      [-180, -90],
      [180, 90],
    ];
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
  if (lons.length === 0)
    return [
      [-180, -90],
      [180, 90],
    ];
  const west = Math.min(...lons);
  const east = Math.max(...lons);
  const pad = 1;
  // A canvas that shows both sides of the antimeridian reads, naively, as the whole way round: so it is taken.
  return [
    [east - west > 300 ? -180 : west - pad, Math.max(-90, Math.min(...lats) - pad)],
    [east - west > 300 ? 180 : east + pad, Math.min(90, Math.max(...lats) + pad)],
  ];
}

export const pathOf = (pieces, closed) =>
  pieces.map((points) => `M${points.map(([x, y]) => `${x},${y}`).join("L")}${closed ? "Z" : ""}`).join("");

/** Which water features touch which: a point of one within `gap` of a point of another, through a grid of cells `gap` square. */
export function touching(entries, gap) {
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
        for (const [a, ax, ay] of held)
          for (const [b, bx, by] of other)
            if (a !== b && !near[a].has(b) && Math.hypot(ax - bx, ay - by) <= gap) near[a].add(b);
      }
    }
  }
  return new Map(
    entries.map((entry, index) => [entry.one.code, [...near[index]].map((other) => entries[other].one.code).sort()]),
  );
}

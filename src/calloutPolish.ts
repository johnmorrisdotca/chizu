import { CALLOUT_ROOMY, segmentsCross, segmentsGap, type CalloutLand, type CalloutObstacle, type CalloutPlace } from "./calloutSpace.ts";
import { distanceToRing, pointInRing, segmentMeetsRing, type MapRing } from "./outlines.ts";

/**
 * The last pass over a printed sheet's numbers: no two leaders closer than a
 * radius, and no leader through another number's circle.
 *
 * The walk in `placeCallouts` prices a leader running alongside another at
 * part of a crossing and caps the charge, so on the crowded sheets it settled
 * with two leaders nearly touching - forty-six such pairs on a portrait sheet
 * of all forty-seven Japanese prefectures. A price is a preference; here it is a fault, counted the way a
 * crossing is, and the arrangement is annealed until the faults are gone or
 * the search has run its course.
 *
 * Two freedoms the walk does not have. A circle may take any place in reach,
 * not only a free one beside it, and trade with any other circle. And a leader
 * need not start at its region's middle: it may start anywhere well inside the
 * region, which is what a published map does - the line leaves the region
 * from the coast nearest its number rather than from the centre, so a
 * coastal region's leader is a short stroke out to sea and three inland
 * ones no longer leave from three points a few pixels apart. The start is
 * drawn with a dot, so the region it names is never in doubt.
 *
 * Seeded, so a sheet draws the same numbers every time it is drawn.
 */

type Point = readonly [number, number];

/**
 * How close two leaders may come, in radii.
 *
 * @example
 * ```ts
 * import { POLISH_CLOSE_RADII } from "@johnmorrisdotca/chizu";
 *
 * console.log(POLISH_CLOSE_RADII);
 * // 1
 * ```
 */
export const POLISH_CLOSE_RADII = 1;
/**
 * How far a leader keeps from the middle of another number's circle, in radii: past the ring, with air.
 *
 * @example
 * ```ts
 * import { POLISH_CIRCLE_CLEAR_RADII } from "@johnmorrisdotca/chizu";
 *
 * console.log(POLISH_CIRCLE_CLEAR_RADII);
 * // 1.2
 * ```
 */
export const POLISH_CIRCLE_CLEAR_RADII = 1.2;
/** How far inside its region a leader's start sits, in radii, where the region is big enough. */
const START_INSET_RADII = 0.6;
/** The spacing of the starts tried inside a region, in radii. */
const START_STEP_RADII = 0.5;
/** At most this many starts per region, spread over it. */
const START_LIMIT = 28;

/* A crossing outweighs any number of close pairs; a close pair outweighs any leader's length. */
const CROSSING_WEIGHT = 10_000;
const CLOSE_WEIGHT = 200;
/** How many of its nearest places a circle is tried at. */
const POOL = 220;
/** Tries per circle, and how willing the search is to go uphill at the start and at the end. */
const STEPS_PER_CIRCLE = 1600;
const HOT = 60;
const COLD = 0.2;
const MOVE_SHARE = 0.55;
/** How many times the leaders still at fault are each offered every move they have. */
const REPAIR_ROUNDS = 4;
/** How many seeded attempts a sheet with a fault left is given. */
const ATTEMPTS = 4;
const START_SHARE = 0.2;

/**
 * Where a leader may start inside a region: its anchor first, then points
 * spread over the land at least `START_INSET_RADII` in from its coast - or,
 * for a region too small for that, half as far as its own middle is.
 */
export function leaderStarts(anchor: Point, ring: MapRing | null, radius: number): Point[] {
  if (!ring) return [anchor];
  const middle = distanceToRing(anchor[0], anchor[1], ring);
  const inset = Math.min(radius * START_INSET_RADII, middle * 0.5);
  const step = Math.max(radius * 0.15, Math.min(radius * START_STEP_RADII, middle * 0.5));
  const inside: Point[] = [];
  for (let x = ring.minX + step / 2; x < ring.maxX; x += step) {
    for (let y = ring.minY + step / 2; y < ring.maxY; y += step) {
      if (!pointInRing(x, y, ring) || distanceToRing(x, y, ring) < inset) continue;
      inside.push([x, y]);
    }
  }
  /* Spread: each next start is the one furthest from every start already kept. */
  const kept: Point[] = [anchor];
  const nearest = inside.map((point) => Math.hypot(point[0] - anchor[0], point[1] - anchor[1]));
  while (kept.length < START_LIMIT && inside.length > 0) {
    let best = -1;
    for (let k = 0; k < inside.length; k += 1) if (best < 0 || nearest[k]! > nearest[best]!) best = k;
    if (best < 0 || nearest[best]! < step) break;
    const chosen = inside[best]!;
    kept.push(chosen);
    for (let k = 0; k < inside.length; k += 1) {
      nearest[k] = Math.min(nearest[k]!, Math.hypot(inside[k]![0] - chosen[0], inside[k]![1] - chosen[1]));
    }
  }
  return kept;
}

/** Each region's starts, from the ring its anchor is in. */
export function regionStarts(
  entries: ReadonlyArray<{ centroid: Point }>,
  ownRegion: readonly number[],
  land: readonly CalloutLand[],
  radius: number,
): Point[][] {
  return entries.map(({ centroid }, i) => {
    const own = ownRegion[i]!;
    const ring = own < 0 ? null : land[own]!.rings.find((one) => pointInRing(centroid[0], centroid[1], one)) ?? null;
    return leaderStarts(centroid, ring, radius);
  });
}

/**
 * What a leader costs from one of its starts to a place: its length, the
 * regions it crosses, and a tight bay - the walk's own price, with the land
 * measured against the coastline rather than the boxes the walk uses, since a
 * leader leaving from a coast lies inside its neighbour's box without touching
 * its land. Kept once worked out: the polish asks for the same few thousand.
 */
export function coastlineLeaderCost(context: {
  starts: ReadonlyArray<readonly Point[]>;
  spaces: readonly CalloutPlace[];
  land: readonly CalloutLand[];
  ownRegion: readonly number[];
  bounds: readonly CalloutObstacle[];
  landCost: number;
  tightCost: number;
}): (i: number, start: number, place: number) => number {
  const { starts, spaces, land, ownRegion, bounds, landCost, tightCost } = context;
  const known = starts.map(() => new Map<number, number>());
  return (i, start, place) => {
    const key = start * spaces.length + place;
    const held = known[i]!.get(key);
    if (held !== undefined) return held;
    const [ax, ay] = starts[i]![start]!;
    const spot = spaces[place]!;
    let crossed = 0;
    for (let k = 0; k < land.length; k += 1) {
      if (k === ownRegion[i]) continue;
      const box = bounds[k]!;
      if (Math.max(ax, spot.x) < box.minX || Math.min(ax, spot.x) > box.maxX) continue;
      if (Math.max(ay, spot.y) < box.minY || Math.min(ay, spot.y) > box.maxY) continue;
      if (land[k]!.rings.some((ring) => segmentMeetsRing(ax, ay, spot.x, spot.y, ring))) crossed += 1;
    }
    const cost =
      Math.hypot(spot.x - ax, spot.y - ay) + landCost * crossed + tightCost * Math.max(0, (CALLOUT_ROOMY - spot.sea) / CALLOUT_ROOMY);
    known[i]!.set(key, cost);
    return cost;
  };
}

export type PolishContext = {
  /** Where each leader may start, its anchor first. */
  starts: ReadonlyArray<readonly Point[]>;
  spaces: readonly CalloutPlace[];
  /** Which place each circle holds; changed only through `reseat`. */
  at: number[];
  radius: number;
  spacing: number;
  /** Every circle put back at these places at once. */
  reseat: (seats: readonly number[]) => void;
  room: (place: number, mover: number, apart: number) => boolean;
  nearest: (i: number, wanted: number) => number[];
  /** A leader's own price from one of its starts to this place: length, land crossed, a tight bay. */
  leaderCost: (i: number, start: number, place: number) => number;
};

type Faults = { crossings: number; close: number };

/** Which of its starts each leader is drawn from; the seats are left in `at`. */
export function polishCallouts(context: PolishContext): number[] {
  const { starts, spaces, at, radius, spacing, reseat, room, nearest, leaderCost } = context;
  const count = starts.length;
  const from = starts.map(() => 0);
  if (count < 2) return from;
  const closeAt = radius * POLISH_CLOSE_RADII;
  const clearAt = radius * POLISH_CIRCLE_CLEAR_RADII;
  const end = (place: number): Point => [spaces[place]!.x, spaces[place]!.y];
  /* Two regions whose middles sit closer than a radius are owed only the room they had. */
  const owed = starts.map((a) => starts.map((b) => Math.min(closeAt, Math.hypot(a[0]![0] - b[0]![0], a[0]![1] - b[0]![1]))));

  /* The start nearest a place, which is the one a leader to it would leave from. */
  const facing = (i: number, place: number) => {
    const options = starts[i]!;
    const [x, y] = end(place);
    let best = 0;
    let distance = Infinity;
    for (let k = 0; k < options.length; k += 1) {
      const d = Math.hypot(options[k]![0] - x, options[k]![1] - y);
      if (d < distance) {
        distance = d;
        best = k;
      }
    }
    return best;
  };

  const pair = (i: number, si: number, pi: number, j: number, sj: number, pj: number): Faults => {
    const a = starts[i]![si]!;
    const b = end(pi);
    const c = starts[j]![sj]!;
    const d = end(pj);
    if (segmentsCross(a, b, c, d)) return { crossings: 1, close: 0 };
    const apart = Math.hypot(a[0] - c[0], a[1] - c[1]);
    let close = 0;
    /*
     * Two starts never crowd each other for want of trying: they keep what
     * their middles had. And two leaders keep a radius apart, or as far apart
     * as they start, whichever is less.
     */
    if (apart + 1e-9 < owed[i]![j]!) close += 1;
    else if (segmentsGap(a, b, c, d) + 1e-9 < Math.min(closeAt, apart)) close += 1;
    /* And neither line runs through the other's circle. */
    if (pointToSegment(d, a, b) < clearAt || pointToSegment(b, c, d) < clearAt) close += 1;
    return { crossings: 0, close };
  };

  const faultsOf = (i: number, si: number, pi: number, ignoring = -1): Faults => {
    const total = { crossings: 0, close: 0 };
    for (let j = 0; j < count; j += 1) {
      if (j === i || j === ignoring) continue;
      const found = pair(i, si, pi, j, from[j]!, at[j]!);
      total.crossings += found.crossings;
      total.close += found.close;
    }
    return total;
  };
  const weigh = (found: Faults) => CROSSING_WEIGHT * found.crossings + CLOSE_WEIGHT * found.close;
  const own = (i: number, si: number, pi: number) => leaderCost(i, si, pi) / radius;
  const scoreOf = (i: number, si: number, pi: number, ignoring = -1) => weigh(faultsOf(i, si, pi, ignoring)) + own(i, si, pi);
  const totals = () => {
    const found = { crossings: 0, close: 0 };
    let price = 0;
    for (let i = 0; i < count; i += 1) {
      price += own(i, from[i]!, at[i]!);
      for (let j = i + 1; j < count; j += 1) {
        const one = pair(i, from[i]!, at[i]!, j, from[j]!, at[j]!);
        found.crossings += one.crossings;
        found.close += one.close;
      }
    }
    return { ...found, score: weigh(found) + price };
  };

  /* Every leader first leaves from the point of its region nearest its number. */
  const keptSeats = [...at];
  for (let i = 0; i < count; i += 1) from[i] = facing(i, at[i]!);
  const begin = totals();
  const startFrom = [...from];
  const pools = starts.map((_, i) => nearest(i, Math.min(spaces.length, POOL)));
  /*
   * One attempt: the anneal, then the repair. Run again from the same start
   * with another seed while a fault is left, up to `ATTEMPTS`, and the best
   * attempt kept - so a sheet that comes out clean first time costs one run,
   * and one the walk leaves a pair on gets another go rather than a pair.
   */
  const attempt = (seed: number) => {
    reseat(keptSeats);
    startFrom.forEach((option, i) => (from[i] = option));
    let best = { score: begin.score, seats: [...at], from: [...from] };
    let score = begin.score;
    const random = seeded(count * 7919 + spaces.length + seed * 104_729);
    const steps = STEPS_PER_CIRCLE * count;

    for (let step = 0; step < steps; step += 1) {
      const heat = HOT * (COLD / HOT) ** (step / steps);
      const i = Math.floor(random() * count);
      const roll = random();
      let delta: number;
      let apply: () => void;
      if (roll < START_SHARE) {
        const options = starts[i]!;
        if (options.length < 2) continue;
        const option = Math.floor(random() * options.length);
        if (option === from[i]) continue;
        delta = scoreOf(i, option, at[i]!) - scoreOf(i, from[i]!, at[i]!);
        apply = () => {
          from[i] = option;
        };
      } else if (roll < START_SHARE + MOVE_SHARE) {
        const pool = pools[i]!;
        const place = pool[Math.floor(random() * pool.length)]!;
        if (place === at[i] || !room(place, i, spacing)) continue;
        const option = facing(i, place);
        delta = scoreOf(i, option, place) - scoreOf(i, from[i]!, at[i]!);
        apply = () => {
          const seats = [...at];
          seats[i] = place;
          reseat(seats);
          from[i] = option;
        };
      } else {
        const j = Math.floor(random() * count);
        if (j === i) continue;
        const mine = at[i]!;
        const theirs = at[j]!;
        const si = facing(i, theirs);
        const sj = facing(j, mine);
        delta =
          scoreOf(i, si, theirs, j) + scoreOf(j, sj, mine, i) + weigh(pair(i, si, theirs, j, sj, mine)) -
          (scoreOf(i, from[i]!, mine, j) + scoreOf(j, from[j]!, theirs, i) + weigh(pair(i, from[i]!, mine, j, from[j]!, theirs)));
        apply = () => {
          const seats = [...at];
          seats[i] = theirs;
          seats[j] = mine;
          reseat(seats);
          from[i] = si;
          from[j] = sj;
        };
      }
      if (delta > 0 && random() >= Math.exp(-delta / heat)) continue;
      apply();
      score += delta;
      if (score < best.score - 1e-9) best = { score, seats: [...at], from: [...from] };
    }

    /* The best arrangement seen, and only if it is no worse on either fault than where this began. */
    reseat(best.seats);
    best.from.forEach((option, i) => (from[i] = option));

    /*
     * Then every leader is offered every start and every place in its pool,
     * one leader at a time, and takes whichever clears the most and then costs
     * the least. The anneal is a random walk and can stop one move short of a
     * clean sheet, or leave a leader the long way round; this is the last step
     * taken on purpose.
     */
    for (let round = 0; round < REPAIR_ROUNDS; round += 1) {
      let repaired = false;
      for (let i = 0; i < count; i += 1) {
        /*
         * Every leader, not only those at fault: one the anneal left long and
         * raking across the land, when a shorter one beside it is just as
         * clear, takes the shorter. It never takes on a fault to do it.
         */
        const now = faultsOf(i, from[i]!, at[i]!);
        let pick: { start: number; place: number; score: number } | null = null;
        const was = scoreOf(i, from[i]!, at[i]!);
        /*
         * Shortest first: a leader costs at least its own length, so once the
         * length alone costs more than the best found, nothing further along
         * can beat it - which spares the land and fault checks for thousands
         * of candidates on every leader that is already where it should be.
         */
        const candidates: Array<{ place: number; option: number; least: number }> = [];
        for (const place of pools[i]!) {
          if (place !== at[i] && !room(place, i, spacing)) continue;
          const [x, y] = end(place);
          for (let option = 0; option < starts[i]!.length; option += 1) {
            const start = starts[i]![option]!;
            candidates.push({ place, option, least: Math.hypot(x - start[0], y - start[1]) / radius });
          }
        }
        candidates.sort((a, b) => a.least - b.least);
        for (const { place, option, least } of candidates) {
          if (least + 1e-9 >= (pick?.score ?? was)) break;
          const cost = own(i, option, place);
          if (cost + 1e-9 >= (pick?.score ?? was)) continue;
          const found = faultsOf(i, option, place);
          if (found.crossings > now.crossings || (found.crossings === now.crossings && found.close > now.close)) continue;
          const score = weigh(found) + cost;
          if (score + 1e-9 < (pick?.score ?? was)) pick = { start: option, place, score };
        }
        if (!pick) continue;
        const seats = [...at];
        seats[i] = pick.place;
        reseat(seats);
        from[i] = pick.start;
        repaired = true;
      }
      /*
       * Two leaders at fault with each other may need to move together: one
       * takes any start and place, and the other any start where it stands.
       */
      for (let i = 0; i < count; i += 1) {
        for (let j = 0; j < count; j += 1) {
          if (i === j) continue;
          const now = pair(i, from[i]!, at[i]!, j, from[j]!, at[j]!);
          if (now.crossings === 0 && now.close === 0) continue;
          const was = scoreOf(i, from[i]!, at[i]!, j) + scoreOf(j, from[j]!, at[j]!, i) + weigh(now);
          const crossedBefore = faultsOf(i, from[i]!, at[i]!, j).crossings + faultsOf(j, from[j]!, at[j]!, i).crossings + now.crossings;
          const theirs = starts[j]!.map((_, option) => ({ faults: faultsOf(j, option, at[j]!, i), own: own(j, option, at[j]!) }));
          let pick: { si: number; pi: number; sj: number; score: number } | null = null;
          for (const place of pools[i]!) {
            if (place !== at[i] && !room(place, i, spacing)) continue;
            for (let si = 0; si < starts[i]!.length; si += 1) {
              const mine = faultsOf(i, si, place, j);
              const mineScore = weigh(mine) + own(i, si, place);
              if (mineScore >= (pick?.score ?? was)) continue;
              for (let sj = 0; sj < theirs.length; sj += 1) {
                const between = pair(i, si, place, j, sj, at[j]!);
                const crossed = mine.crossings + theirs[sj]!.faults.crossings + between.crossings;
                if (crossed > crossedBefore) continue;
                const score = mineScore + weigh(theirs[sj]!.faults) + theirs[sj]!.own + weigh(between);
                if (score + 1e-9 < (pick?.score ?? was)) pick = { si, pi: place, sj, score };
              }
            }
          }
          if (!pick) continue;
          const seats = [...at];
          seats[i] = pick.pi;
          reseat(seats);
          from[i] = pick.si;
          from[j] = pick.sj;
          repaired = true;
        }
      }
      if (!repaired) break;
    }
    const found = totals();
    return { ...found, seats: [...at], from: [...from] };
  };
  let kept = attempt(0);
  for (let seed = 1; seed < ATTEMPTS && kept.crossings + kept.close > 0; seed += 1) {
    const next = attempt(seed);
    if (next.crossings < kept.crossings || (next.crossings === kept.crossings && (next.close < kept.close || (next.close === kept.close && next.score < kept.score)))) kept = next;
  }
  reseat(kept.seats);
  kept.from.forEach((option, i) => (from[i] = option));
  const finish = totals();
  if (finish.crossings > begin.crossings || (finish.crossings === begin.crossings && finish.close > begin.close)) {
    reseat(keptSeats);
    return starts.map(() => 0);
  }
  return from;
}

function pointToSegment(point: Point, a: Point, b: Point): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length = dx * dx + dy * dy;
  const t = length === 0 ? 0 : Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / length));
  return Math.hypot(point[0] - (a[0] + t * dx), point[1] - (a[1] + t * dy));
}

/* A small seeded generator, so a sheet prints the same numbers every time it is drawn. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The two faults a printed sheet is held to, counted over its placed leaders:
 * pairs that cross, and pairs closer than a radius - or than they start, where
 * two regions start closer than that - counting a line through another
 * number's circle as close too.
 *
 * @example
 * ```ts
 * import { calloutFaults } from "@johnmorrisdotca/chizu";
 *
 * // Two leaders that cross: from (0,0) to a circle at (10,10), and from (10,0) to one at (0,10).
 * console.log(calloutFaults([{ x: 0, y: 0, hx: 10, hy: 10 }, { x: 10, y: 0, hx: 0, hy: 10 }], 1));
 * // { crossings: 1, close: 0 }
 * ```
 */
export function calloutFaults(
  spots: ReadonlyArray<{ x: number; y: number; hx: number; hy: number }>,
  radius: number,
): { crossings: number; close: number } {
  let crossings = 0;
  let close = 0;
  for (let i = 0; i < spots.length; i += 1) {
    for (let j = i + 1; j < spots.length; j += 1) {
      const a = spots[i]!;
      const b = spots[j]!;
      const from: Point = [a.x, a.y];
      const to: Point = [a.hx, a.hy];
      const start: Point = [b.x, b.y];
      const end: Point = [b.hx, b.hy];
      if (segmentsCross(from, to, start, end)) {
        crossings += 1;
        continue;
      }
      const apart = Math.hypot(a.x - b.x, a.y - b.y);
      const near = segmentsGap(from, to, start, end) + 1e-9 < Math.min(radius, apart);
      const through = pointToSegment(end, from, to) < radius || pointToSegment(to, start, end) < radius;
      if (near || through) close += 1;
    }
  }
  return { crossings, close };
}

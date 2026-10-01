/**
 * Where a map's numbered handles go, and what order they are numbered in.
 *
 * Both are geometry rather than rendering, so they live here where they can be
 * checked against real map data instead of by looking at a screenshot.
 */

/** A handle's radius as a share of the framed width, so it holds up at any zoom. */
export const HANDLE_RADIUS_RATIO = 0.045;

/** A handle's radius in the map's own units, for a window this wide and a share of the usual size. */
export function handleRadius(box: { width: number }, scale: number): number {
  return box.width * HANDLE_RADIUS_RATIO * scale;
}

export type HandleSpot = {
  /** The region's own centre, where the stem starts. */
  x: number;
  y: number;
  /** Where the circle and its number sit. */
  hx: number;
  hy: number;
};

/**
 * Positions a handle will try, in order, measured in radii from the centroid.
 *
 * Straight above is the ordinary answer and straight below was the whole of the
 * fallback, which is one position more than none: it was added for two small
 * provinces whose handles landed in the same few pixels, and it fixed exactly
 * that pair. A third crowded region found both taken and
 * went back on top of the first.
 *
 * Every vertical slot is tried before any sideways one, which is not about
 * looks. The handles are numbered west to east so they read as a row, and a
 * handle shoved sideways can cross the one it was supposed to follow - moving
 * it up or down instead keeps the numbers in the order the player reads them.
 * Sideways is still there for the cluster that runs out of column.
 */
export const HANDLE_SLOTS: ReadonlyArray<readonly [number, number]> = [
  [0, -2.1],
  [0, 2.1],
  [0, -4.4],
  [0, 4.4],
  [0, -6.7],
  [0, 6.7],
  [-1.9, -1.5],
  [1.9, -1.5],
  [-1.9, 1.5],
  [1.9, 1.5],
  [-2.6, 0],
  [2.6, 0],
];

/**
 * How far apart two handle centres must be, in radii.
 *
 * Two circles of radius r touch at 2r and overlap below it, so the old rule of
 * 1.9 declared a pair clear while they were already a tenth of a handle into
 * each other - the "minor overlap" that showed up even when the fallback was
 * working. Above 2 by enough to leave a visible gap rather than a tangent.
 */
export const HANDLE_CLEARANCE = 2.35;

/** A box the handles should stay inside, so none is cropped at the frame edge. */
export type HandleBounds = { x: number; y: number; width: number; height: number };

/**
 * Places every handle clear of the ones before it.
 *
 * Greedy and order-dependent by design: the caller has already sorted the marks
 * into the order they are numbered, and a handle that has found a home does not
 * move to make room for a later one. With a handful of choices on a board that
 * is enough, and it keeps the placement stable as tones change mid-question.
 */
export function placeHandles<T>(
  entries: ReadonlyArray<{ item: T; centroid: readonly [number, number] }>,
  radius: number,
  bounds?: HandleBounds,
): Array<HandleSpot & { item: T }> {
  const placed: Array<HandleSpot & { item: T }> = [];

  const isClear = (hx: number, hy: number) =>
    placed.every((other) => Math.hypot(other.hx - hx, other.hy - hy) >= radius * HANDLE_CLEARANCE);

  const inFrame = (hx: number, hy: number) =>
    !bounds
    || (hx - radius >= bounds.x
      && hx + radius <= bounds.x + bounds.width
      && hy - radius >= bounds.y
      && hy + radius <= bounds.y + bounds.height);

  for (const { item, centroid } of entries) {
    const [x, y] = centroid;
    const slots = HANDLE_SLOTS.map(
      ([dx, dy]) => [x + dx * radius, y + dy * radius] as const,
    );
    /*
     * Clear and on the map if possible; clear but overhanging the edge if not,
     * since a handle half off the frame can still be read and tapped while one
     * underneath another cannot. Only if nothing is clear does it stack.
     */
    const spot =
      slots.find(([hx, hy]) => isClear(hx, hy) && inFrame(hx, hy))
      ?? slots.find(([hx, hy]) => isClear(hx, hy))
      ?? slots[0]!;

    placed.push({ item, x, y, hx: spot[0], hy: spot[1] });
  }

  return placed;
}

/**
 * The choices in the order they run across the map, west to east.
 *
 * Handles numbered by the option's place in a shuffled list read 3 2 4 1 from left to right, and the number keys
 * pointed at nothing you could see. Numbering by position makes the handles a row to read and makes `1` mean the
 * leftmost one.
 *
 * It gives nothing away. Where a place sits is the entire question being asked, so ordering the choices by it tells
 * the player only what the map already shows them. Ties break north to south, and anything with no centre keeps its
 * order at the end rather than disappearing. `centreOf` says where an option is: `(option) => region.centroid`.
 */
export function orderByPosition<T>(options: readonly T[], centreOf: (option: T) => readonly [number, number] | null | undefined): T[] {
  const positioned = options.map((option, index) => ({ option, index, centroid: centreOf(option) ?? null }));

  return positioned
    .slice()
    .sort((a, b) => {
      if (!a.centroid || !b.centroid) {
        if (a.centroid) return -1;
        if (b.centroid) return 1;
        return a.index - b.index;
      }
      return a.centroid[0] - b.centroid[0] || a.centroid[1] - b.centroid[1];
    })
    .map((entry) => entry.option);
}

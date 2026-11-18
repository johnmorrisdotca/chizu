import { windowKilometres } from "./cities.ts";
import { type ChizuPort, type ChizuPortOptions, portTierFor } from "./ports.ts";
import { projectPoint } from "./project.ts";
import { num } from "./svgText.ts";
import type { ChizuMap, MapBox } from "./types.ts";

/**
 * RUNWAYS: each runway drawn from its two measured ends, so that on a map of the ground (a local map, or any window that
 * shows a few tens of kilometres) it lies where it lies in a satellite picture, as long as the airport's metres of width.
 * `@johnmorrisdotca/chizu/runways` has them for the airports in `@johnmorrisdotca/chizu/airports`.
 */

/**
 * One runway: the longitude and latitude of its two ends, in degrees, and its width in metres (0 where the source
 * gives none, drawn as a hairline).
 *
 * @example
 * ```ts
 * import type { ChizuRunway } from "@johnmorrisdotca/chizu";
 *
 * const runway: ChizuRunway = [139.78, 35.54, 139.8, 35.57, 60];
 * console.log(runway[4]);
 * // 60
 * ```
 */
export type ChizuRunway = readonly [lon1: number, lat1: number, lon2: number, lat2: number, widthMetres: number];

/**
 * The runways of many airports, by the airport's `id`.
 *
 * @example
 * ```ts
 * import type { ChizuRunways } from "@johnmorrisdotca/chizu";
 *
 * const runways: ChizuRunways = { hnd: [[139.78, 35.54, 139.8, 35.57, 60]] };
 * console.log(Object.keys(runways).join(" "));
 * // hnd
 * ```
 */
export type ChizuRunways = Readonly<Record<string, readonly ChizuRunway[]>>;

/** A runway is drawn once it is at least this share of the window's width long: a 3 km runway in a window under 250 km. */
const RUNWAY_MIN_RATIO = 0.012;
/** The thinnest a runway is drawn, as a share of the window's width, so that a true 45 m is still a line in a wide window. */
const RUNWAY_HAIRLINE_RATIO = 0.0012;

/**
 * The runways a window shows as SVG, for `drawChizu`: a `<g class="cz-runways">` holding a
 * `<line class="cz-runway" data-airport="…">` for each runway of each airport in `ports` that the window's tier shows, the line
 * between its two ends with the stroke as wide as the runway is on the ground (no thinner than a hairline). A runway
 * shorter than 1.2% of the window's width is left out, so none is drawn until the window shows a few hundred
 * kilometres. Empty when none is.
 *
 * @example
 * ```ts
 * import { localMap, runwaysSvg, wholeMapBox, type ChizuPort } from "@johnmorrisdotca/chizu";
 *
 * const map = localMap({ centre: [139.78, 35.55], widthMetres: 6000 });
 * const haneda: ChizuPort = { id: "hnd", kind: "airport", name: { en: "Haneda" }, country: "JP", lat: 35.55, lon: 139.78, tier: 1 };
 * const svg = runwaysSvg(map, [haneda], { hnd: [[139.77, 35.54, 139.79, 35.56, 60]] }, wholeMapBox(map), [0], {});
 * console.log(svg.includes('data-airport="hnd"'));
 * // true
 * ```
 *
 * @param map - The map the runways go on.
 * @param ports - The airports to draw the runways of (a harbour is passed over).
 * @param runways - The runways, by airport id.
 * @param box - The window.
 * @param offsets - The copies of the canvas across a wrapping map (`[0]` for one).
 * @param options - The tier (`portOptions`'s).
 * @returns The SVG text, or "".
 */
export function runwaysSvg(
  map: Pick<ChizuMap, "projection">,
  ports: readonly ChizuPort[],
  runways: ChizuRunways,
  box: MapBox,
  offsets: readonly number[],
  options: ChizuPortOptions,
): string {
  const kilometres = windowKilometres(map, box);
  if (kilometres === null) return "";
  const tier = options.tier ?? portTierFor(kilometres);
  const metresPerUnit = (kilometres * 1000) / box.width;
  const hairline = box.width * RUNWAY_HAIRLINE_RATIO;
  const lines: string[] = [];
  for (const port of ports) {
    if (port.kind !== "airport" || port.tier > tier) continue;
    for (const [lon1, lat1, lon2, lat2, width] of runways[port.id] ?? []) {
      const from = projectPoint(map, lon1, lat1);
      const to = projectPoint(map, lon2, lat2);
      if (!from || !to) continue;
      const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
      if (length < box.width * RUNWAY_MIN_RATIO) continue;
      const stroke = Math.max(width / metresPerUnit, hairline);
      for (const offset of offsets) {
        const x1 = from[0] + offset;
        const x2 = to[0] + offset;
        if (Math.max(x1, x2) < box.x || Math.min(x1, x2) > box.x + box.width) continue;
        if (Math.max(from[1], to[1]) < box.y || Math.min(from[1], to[1]) > box.y + box.height) continue;
        lines.push(
          `<line class="cz-runway" data-airport="${port.id}" x1="${num(x1)}" y1="${num(from[1])}" x2="${num(x2)}" y2="${num(to[1])}" stroke-width="${num(stroke)}"/>`,
        );
      }
    }
  }
  return lines.length === 0 ? "" : `<g class="cz-runways">${lines.join("")}</g>`;
}

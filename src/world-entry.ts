/**
 * The world as one map, every country a region (Natural Earth, 1:110m, Miller's projection centred on 155°E, which
 * keeps Japan and the whole Pacific in the middle and cuts the map in the Atlantic), the 62 too small for 1:110m as
 * dots marked `small: true`. Its own entry, so the 190 kB of
 * outlines load only on the page that draws them. A page loading a country's own map by name wants `/load` instead.
 */

import worldData from "./data/world.data.ts";
import { withSmallStates } from "./smallStates.ts";

/**
 * The world, every country a region: 173 drawn as outlines at 1:110m and the 62 too small for that as dots (Singapore,
 * Malta, Bahrain), each marked `small: true`, on one canvas 1000 wide that wraps round.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 *
 * const singapore = WORLD.regions.find((region) => region.code === "SG")!;
 * console.log(WORLD.regions.length, WORLD.regions.filter((region) => region.small).length, singapore.small, singapore.nameJa);
 * // 235 62 true シンガポール
 * ```
 */
const world = withSmallStates(worldData);

export { world as WORLD };
export default world;

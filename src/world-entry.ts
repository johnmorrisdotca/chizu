/**
 * The world as one map, every country a region (Natural Earth, 1:110m, Miller's projection centred on 155°E, which
 * keeps Japan and the whole Pacific in the middle and cuts the map in the Atlantic). Its own entry, so the 170 kB of
 * outlines load only on the page that draws them. A page loading a country's own map by name wants `/load` instead.
 */
import world from "./data/world.ts";

export { world as WORLD };
export default world;

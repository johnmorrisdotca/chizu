/**
 * Chizu's drawing: a map as SVG text (`drawChizu`) and a city or a venue as SVG text (`drawLocal`), with the style that gives it its look. A separate entry
 * (`@johnmorrisdotca/chizu/draw`), so a page that only needs to know which country is nearest never loads any of it.
 */
export { drawChizu, isChizuColour } from "./draw.ts";
export type { ChizuDrawOptions } from "./draw.ts";
export { CHIZU_STYLE } from "./style.ts";
export { drawLocal } from "./drawLocal.ts";
export type { ChizuLocalDrawOptions, ChizuLocalStyle } from "./drawLocal.ts";
export { CHIZU_LOCAL_STYLE } from "./localStyle.ts";

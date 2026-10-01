/**
 * Chizu in a page: `mountChizu` draws a map into any element and lets a person look around it by touch, mouse and
 * keyboard: drag to move, the buttons, wheel or a pinch to zoom in five steps, a press to choose a region. The world pans
 * round without stopping. A separate entry (`@johnmorrisdotca/chizu/mount`), so a server never loads any of it.
 */
export { ensureChizuMapStyle, mountChizu } from "./mount.ts";
export type { ChizuMount, ChizuMountOptions, ChizuView } from "./mount.ts";
export { CHIZU_MAP_STYLE } from "./mountStyle.ts";

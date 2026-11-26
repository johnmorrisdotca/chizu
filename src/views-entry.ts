/**
 * The points of view on a disputed place (`withView`): Ukraine's, with Crimea and Sevastopol in Ukraine, and Japan's,
 * with the Northern Territories in Japan. A separate entry, so the outlines of a view are fetched only by the page
 * that asks for one.
 */

export type { ChizuViewData, ChizuViewId, ChizuViewInfo, ChizuViewMap } from "./views.ts";
export { withView } from "./views.ts";
export { CHIZU_VIEWS, loadView } from "./viewsLoad.ts";

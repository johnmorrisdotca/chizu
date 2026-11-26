import { VIEW_LOADERS, VIEW_TABLE } from "./data/loaders.data.ts";
import type { ChizuViewData, ChizuViewId, ChizuViewInfo } from "./views.ts";

/**
 * Every point of view, each with its name and note in English and Japanese and the ids of the maps it changes. Small:
 * the outlines of a view are `loadView`'s, fetched when asked for.
 *
 * @example
 * ```ts
 * import { CHIZU_VIEWS } from "@johnmorrisdotca/chizu/views";
 *
 * console.log(CHIZU_VIEWS.map((view) => `${view.id} ${view.nameJa}`).join(", "));
 * // jpn 日本の立場, ukr ウクライナの立場
 * ```
 */
export const CHIZU_VIEWS: readonly ChizuViewInfo[] = VIEW_TABLE;

/**
 * A point of view with its outlines, fetched as a chunk of its own.
 *
 * @example
 * ```ts
 * import { loadView } from "@johnmorrisdotca/chizu/views";
 *
 * const view = await loadView("jpn");
 * console.log(view.id, view.name);
 * // jpn Japan's point of view
 * ```
 *
 * @param id - The point of view: `"ukr"` or `"jpn"`.
 * @returns The view's changes, to give to `withView`; rejects for an id that is not a view.
 */
export async function loadView(id: ChizuViewId): Promise<ChizuViewData> {
  const load = VIEW_LOADERS[id];
  if (!load) throw new Error(`no point of view ${String(id)}: ${CHIZU_VIEWS.map((view) => view.id).join(", ")}`);
  return (await load()).default;
}

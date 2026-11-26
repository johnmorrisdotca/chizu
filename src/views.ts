import type { ChizuMap, ChizuRegion } from "./types.ts";

/**
 * A point of view on a disputed place: `"ukr"` draws Crimea and Sevastopol in Ukraine, as the UN General Assembly and
 * ISO 3166 have them, and `"jpn"` draws the Northern Territories in Japan, as Japan's government has them. Without a
 * view, a map is Natural Earth's de facto lines.
 *
 * @example
 * ```ts
 * import { CHIZU_VIEWS, type ChizuViewId } from "@johnmorrisdotca/chizu/views";
 *
 * const ids: ChizuViewId[] = CHIZU_VIEWS.map((view) => view.id);
 * console.log(ids.join(" "));
 * // jpn ukr
 * ```
 */
export type ChizuViewId = "jpn" | "ukr";

/**
 * What a view changes on one map: the regions it draws again (each replaces the region of the same code), the codes it
 * takes off the map, and any field of the map that goes with them (a country's canvas, when its outline grows).
 *
 * @example
 * ```ts
 * import { loadView } from "@johnmorrisdotca/chizu/views";
 *
 * const view = await loadView("ukr");
 * const change = view.maps["divisions-ru"]!;
 * console.log(change.remove?.join(" "), change.regions.length);
 * // UA-40 UA-43 0
 * ```
 */
export type ChizuViewMap = Partial<Omit<ChizuMap, "id" | "regions" | "source">> & {
  regions: ChizuRegion[];
  remove?: string[];
};

/**
 * What a point of view is, and what it needs to be loaded: its name and note in English and Japanese, which maps it
 * changes, and where its outlines come from. The table `CHIZU_VIEWS` has one of these for each view, without the maps.
 *
 * @example
 * ```ts
 * import { CHIZU_VIEWS, type ChizuViewInfo } from "@johnmorrisdotca/chizu/views";
 *
 * const info: ChizuViewInfo = CHIZU_VIEWS.find((view) => view.id === "jpn")!;
 * console.log(info.name, info.nameJa, info.maps.join(" "));
 * // Japan's point of view 日本の立場 world-detail country-jp country-ru
 * ```
 */
export interface ChizuViewInfo {
  id: ChizuViewId;
  name: string;
  nameJa: string;
  /** What the view does and why, in a sentence or two, to show beside the map. */
  note: string;
  noteJa: string;
  /** The ids of the maps it changes; a map not listed is drawn as it is. */
  maps: readonly string[];
}

/**
 * A point of view with its changes: what `loadView` returns, and `@johnmorrisdotca/chizu/views/<id>` holds.
 *
 * @example
 * ```ts
 * import { loadView, type ChizuViewData } from "@johnmorrisdotca/chizu/views";
 *
 * const view: ChizuViewData = await loadView("ukr");
 * console.log(view.id, Object.keys(view.maps).join(" "));
 * // ukr world world-detail country-ua country-ru divisions-ru
 * ```
 */
export interface ChizuViewData extends Omit<ChizuViewInfo, "maps"> {
  /** Where the changed outlines come from, in a line. */
  source: string;
  /** The changes, by the id of the map they are for. */
  maps: Readonly<Record<string, ChizuViewMap>>;
}

/**
 * The map as a point of view draws it: the same map with the view's regions in place of its own, and the regions the
 * view takes off it gone (and out of the other regions' neighbours). A map the view does not change is returned as it
 * is, and so is any map when there is no view, so a page can pass `null` for the default. Nothing is changed in place.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { loadView, withView } from "@johnmorrisdotca/chizu/views";
 *
 * const ukraine = withView(WORLD, await loadView("ukr"));
 * const path = (map: typeof WORLD) => map.regions.find((region) => region.code === "UA")!.path.length;
 * console.log(ukraine.id, path(ukraine) > path(WORLD), withView(WORLD, null) === WORLD);
 * // world true true
 * ```
 *
 * @param map - The map to draw: `WORLD`, a country's own or a country's regions.
 * @param view - The loaded point of view, or null for Natural Earth's own lines.
 * @returns The map as the view draws it; the very same map when the view changes nothing on it.
 */
export function withView(map: ChizuMap, view: ChizuViewData | null | undefined): ChizuMap {
  const change = view?.maps[map.id];
  if (!view || !change) return map;
  const { regions: redrawn, remove = [], ...fields } = change;
  const byCode = new Map(redrawn.map((region) => [region.code, region]));
  const gone = new Set(remove);
  const regions = map.regions
    .filter((region) => !gone.has(region.code))
    .map((region) => {
      const own = byCode.get(region.code) ?? region;
      return gone.size > 0 && own.neighbors.some((code) => gone.has(code))
        ? { ...own, neighbors: own.neighbors.filter((code) => !gone.has(code)) }
        : own;
    });
  return { ...map, ...fields, regions, source: `${map.source}; ${view.name}: ${view.source}` };
}

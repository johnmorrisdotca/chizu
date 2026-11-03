import type { ChizuDrawOptions } from "./draw.ts";
import type { ChizuFeatureChoice } from "./features.ts";
import type { MapZoom } from "./frame.ts";
import type { ChizuLanguage } from "./strings.ts";
import type { ChizuFeatureLayer, ChizuMap, MapBox } from "./types.ts";

/**
 * What a mounted map is told. Everything but `map` may be changed later with `set`.
 *
 * @example
 * ```ts no-run
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { mountChizu, type ChizuMountOptions } from "@johnmorrisdotca/chizu/mount";
 *
 * const options: ChizuMountOptions = { map: WORLD, language: "ja", selected: "JP", onSelect: (code) => console.log(code) };
 * mountChizu(document.querySelector<HTMLElement>("#map")!, options);
 * ```
 */
export type ChizuMountOptions = {
  /** The map to show: `WORLD`, a country's own, or a country's regions. */
  map: ChizuMap;
  /** The language of the names and of the buttons. Default: the page's `lang`, or English. */
  language?: ChizuLanguage;
  /** The zoom step to start at (1 to 10). Default 1. */
  zoom?: MapZoom;
  /** Tones by code (`drawChizu`'s `tones`). The chosen region is `selected` unless it is given a tone here. */
  tones?: Readonly<Record<string, string>>;
  /** A colour for each region by code (`drawChizu`'s `colors`): two places told apart, or a map coloured your own way. */
  colors?: Readonly<Record<string, string>>;
  /** Numbered callouts (`drawChizu`'s `callouts`), placed for the window as it is after each move. */
  callouts?: ChizuDrawOptions["callouts"];
  /** Print names on the land. */
  labels?: ChizuDrawOptions["labels"];
  /** The chosen region's code, or null. */
  selected?: string | null;
  /** Zoom in on a region when it is chosen. Default true. */
  fit?: boolean;
  /** Whether pressing a region chooses it. Off, a press does nothing and the map is only looked at (a quiz that asks the question itself). Default true. */
  selectable?: boolean;
  /** Show the zoom buttons and the zoom level. Default true. */
  controls?: boolean;
  /** A region was pressed (or its number): its code. Pressing the chosen one again passes null. */
  onSelect?: (code: string | null) => void;
  /**
   * A finer drawing of the same map, drawn from `detailFrom` in, where the map's own outlines would look angular: the
   * world's is `loadWorldDetail` (pass the function, and it is fetched the first time it is wanted). It is used only
   * when its `id` is the map's with `-detail` after it, so a detail left over from another map is never drawn.
   * Framing, choosing and callouts keep to `map`. Default: none.
   */
  detail?: ChizuMap | (() => Promise<ChizuMap>);
  /** The zoom step the finer drawing starts at. Default 4. */
  detailFrom?: MapZoom;
  /** The view changed: after a zoom, and when a drag ends. */
  onView?: (view: ChizuView) => void;
  /** Which named features to draw (`drawChizu`'s `features`): `["water"]`, `["all"]`, a group or a kind. Default none. */
  features?: readonly ChizuFeatureChoice[];
  /**
   * The map's named features: a layer (`loadFeatures(map.id)`), or `loadFeatures` itself, which is called with each
   * map's id the first time its features are wanted, so a page that changes maps fetches each map's once. A feature can
   * then be pressed, chosen (`select`, `selected`) and shown (`show`) by its code, as a region is.
   */
  featureLayer?: ChizuFeatureLayer | null | ((mapId: string) => Promise<ChizuFeatureLayer | null>);
  /** Print the features' names. Default true. */
  featureLabels?: boolean;
};

/**
 * Where a mounted map is looking.
 *
 * @example
 * ```ts no-run
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { mountChizu, type ChizuView } from "@johnmorrisdotca/chizu/mount";
 *
 * const mount = mountChizu(document.querySelector<HTMLElement>("#map")!, { map: WORLD });
 * const view: ChizuView = mount.view();
 * console.log(view.zoom, view.box);
 * ```
 */
export type ChizuView = { zoom: MapZoom; centre: { x: number; y: number }; box: MapBox };

/**
 * The mounted native map’s drawing updates, selected region, framing, loaded features and cleanup handle.
 *
 *
 * @example
 * ```ts no-run
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { mountChizu, type ChizuMount } from "@johnmorrisdotca/chizu/mount";
 *
 * const mount: ChizuMount = mountChizu(document.querySelector<HTMLElement>("#map")!, { map: WORLD });
 * mount.select("FR");
 * mount.destroy();
 * ```
 */
export type ChizuMount = {
  /** Change any of the options but `map`, and redraw. */
  set(patch: Partial<Omit<ChizuMountOptions, "map">>): void;
  /** Show another map, from its whole. */
  setMap(map: ChizuMap): void;
  /** Choose a region (or none), zooming to it unless `fit` is off. */
  select(code: string | null): void;
  /** Look at these regions, as close as will hold them all. */
  show(codes: readonly string[]): void;
  /** One step in or out, about the middle of the window. */
  zoomBy(by: 1 | -1): void;
  /** Back to the whole map. */
  reset(): void;
  /** Where the map is looking now. */
  view(): ChizuView;
  /** The features of the map shown now, once they are here; null before, and for a map with none. */
  featureLayer(): ChizuFeatureLayer | null;
  /** Take it out of the page. */
  destroy(): void;
};

export const DRAG_PIXELS = 5;
export const WHEEL_PAUSE_MS = 140;
/** How far the arrow keys move the window, as a share of it. */
export const KEY_STEP = 0.12;

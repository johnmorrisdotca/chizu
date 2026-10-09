import { drawChizu, type ChizuDrawOptions } from "./draw.ts";
import type { ChizuFeatureChoice } from "./features.ts";
import { boxCentre, focusRegionFit, MAP_ZOOM_LEVELS, stepMapZoom, wholeMapBox, zoomBox, zoomToFit, type MapZoom } from "./frame.ts";
import { CHIZU_MAP_STYLE } from "./mountStyle.ts";
import { chizuSay, nameOf, type ChizuLanguage } from "./strings.ts";
import type { ChizuFeatureLayer, ChizuMap, MapBox } from "./types.ts";
import { mapWrapsAround, wrapAcross, wrapOffsets } from "./wrap.ts";

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

/**
 * Put the style in the page once: in the document's head, or in the shadow root the host is in.
 *
 * @example
 * ```ts no-run
 * import { ensureChizuMapStyle } from "@johnmorrisdotca/chizu/mount";
 *
 * // Put the mounted map's stylesheet in the page (or the shadow root) once, before drawing into it yourself.
 * ensureChizuMapStyle(document.body);
 * ```
 */
export function ensureChizuMapStyle(host: Element): void {
  const root = host.getRootNode();
  const target: Node = root instanceof ShadowRoot ? root : host.ownerDocument.head;
  if ((target as ParentNode).querySelector("style[data-chizu-map]") !== null) return;
  const style = host.ownerDocument.createElement("style");
  style.setAttribute("data-chizu-map", "");
  style.textContent = CHIZU_MAP_STYLE;
  target.appendChild(style);
}

const DRAG_PIXELS = 5;
const WHEEL_PAUSE_MS = 140;
/** How far the arrow keys move the window, as a share of it. */
const KEY_STEP = 0.12;

/**
 * Puts a map in an element, to look at by touch, mouse and keyboard: drag to move it, the buttons, the wheel or a pinch to
 * zoom in ten steps, a press to choose a region, the arrow keys and plus and minus. The world wraps: it pans east and
 * west without stopping. Every part of it is the package's own drawing (`drawChizu`) in the page's own DOM, with no shadow
 * DOM and nothing the page's style cannot reach.
 *
 * @example
 * ```ts no-run
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { mountChizu } from "@johnmorrisdotca/chizu/mount";
 *
 * const mount = mountChizu(document.querySelector<HTMLElement>("#map")!, {
 *   map: WORLD,
 *   onSelect: (code) => console.log("chosen", code),
 * });
 * mount.show(["JP", "KR"]);
 * ```
 */
export function mountChizu(host: HTMLElement, initial: ChizuMountOptions): ChizuMount {
  ensureChizuMapStyle(host);
  let options: ChizuMountOptions = { ...initial };
  let map = options.map;
  let zoom: MapZoom = options.zoom ?? 1;
  let centre = boxCentre(wholeMapBox(map));
  let clampNext = true;
  let drawnOffsets = "";
  const language = (): ChizuLanguage => options.language ?? (host.ownerDocument.documentElement.lang.toLowerCase().startsWith("ja") ? "ja" : "en");

  host.classList.add("chizu-map");
  host.replaceChildren();
  const stage = host.ownerDocument.createElement("div");
  stage.className = "czm-stage";
  stage.tabIndex = 0;
  const controls = host.ownerDocument.createElement("div");
  controls.className = "czm-controls";
  const says = host.ownerDocument.createElement("p");
  says.className = "czm-says";
  says.setAttribute("aria-live", "polite");
  const level = host.ownerDocument.createElement("span");
  level.className = "czm-zoom";
  const button = (name: string, text: string, key: string, press: () => void) => {
    const b = host.ownerDocument.createElement("button");
    b.type = "button";
    b.className = "czm-button";
    b.dataset.action = name;
    b.textContent = text;
    b.addEventListener("click", press);
    controls.append(b);
    return { b, key };
  };
  const zoomIn = button("zoom-in", "+", "zoomIn", () => api.zoomBy(1));
  const zoomOut = button("zoom-out", "−", "zoomOut", () => api.zoomBy(-1));
  const whole = button("zoom-whole", "⌂", "zoomWhole", () => api.reset());
  host.append(stage, says);

  const box = () => zoomBox(map, zoom, centre, clampNext);
  /** Bring the centre back to where the (clamped) window really is, so that a drag past the edge does not leave an overshoot to be dragged back before the map moves again. */
  const settle = () => {
    clampNext = true;
    centre = boxCentre(zoomBox(map, zoom, centre, true));
    if (mapWrapsAround(map)) centre = { x: wrapAcross(centre.x, map.width), y: centre.y };
  };
  const view = (): ChizuView => ({ zoom, centre: { ...centre }, box: box() });

  function tones(): Record<string, string> {
    const out: Record<string, string> = { ...(options.tones ?? {}) };
    if (options.selected && out[options.selected] === undefined) out[options.selected] = "selected";
    return out;
  }

  function words() {
    const lang = language();
    stage.setAttribute("aria-label", chizuSay(lang, "map", { name: lang === "ja" ? (map.nameJa ?? map.name) : map.name }));
    stage.setAttribute("aria-description", chizuSay(lang, "keys"));
    for (const { b, key } of [zoomIn, zoomOut, whole]) {
      b.setAttribute("aria-label", chizuSay(lang, key));
      b.title = chizuSay(lang, key);
    }
    level.textContent = chizuSay(lang, "zoomLevel", { n: zoom });
    const chosen = options.selected ? frameable().regions.find((region) => region.code === options.selected) : undefined;
    says.textContent = chosen ? chizuSay(lang, "selected", { name: nameOf(chosen, lang) }) : chizuSay(lang, "none");
    zoomIn.b.disabled = zoom >= MAP_ZOOM_LEVELS[MAP_ZOOM_LEVELS.length - 1]!;
    zoomOut.b.disabled = zoom <= MAP_ZOOM_LEVELS[0]!;
    whole.b.disabled = zoom <= MAP_ZOOM_LEVELS[0]! && !mapWrapsAround(map);
  }

  /** The finer drawing, once it is here: fetched the first time a zoom wants it, then drawn. */
  let detailed: ChizuMap | null = null;
  let fetching: unknown = null;
  function shown(): ChizuMap {
    const wanted = options.detail;
    if (!wanted || zoom < (options.detailFrom ?? 4)) return map;
    if (typeof wanted !== "function") return wanted.id === `${map.id}-detail` ? wanted : map;
    if (detailed && detailed.id === `${map.id}-detail`) return detailed;
    if (fetching !== wanted) {
      fetching = wanted;
      wanted().then(
        (loaded) => {
          detailed = loaded;
          if (loaded.id === `${map.id}-detail` && zoom >= (options.detailFrom ?? 4)) draw();
        },
        () => {
          fetching = null;
        },
      );
    }
    return map;
  }

  /** Each map's features, by its id, once fetched; and the chosen feature that waits for them to frame it. */
  const layers = new Map<string, ChizuFeatureLayer | null>();
  const asking = new Set<string>();
  let waitingToFrame: string | null = null;
  function layer(): ChizuFeatureLayer | null {
    const wanted = options.featureLayer;
    if (!wanted) return null;
    if (typeof wanted !== "function") return wanted.map === map.id ? wanted : null;
    const id = map.id;
    if (layers.has(id)) return layers.get(id) ?? null;
    const needed = (options.features?.length ?? 0) > 0 || waitingToFrame !== null;
    if (needed && !asking.has(id)) {
      asking.add(id);
      wanted(id).then(
        (loaded) => {
          asking.delete(id);
          layers.set(id, loaded && loaded.map === id ? loaded : null);
          if (map.id !== id) return;
          if (waitingToFrame !== null && options.selected === waitingToFrame) {
            const fit = focusRegionFit(frameable(), waitingToFrame);
            waitingToFrame = null;
            if (fit) {
              zoom = fit.zoom;
              centre = fit.centre;
              clampNext = false;
            }
            changed();
          }
          draw();
        },
        () => asking.delete(id),
      );
    }
    return null;
  }
  /** The map with its features among its regions, for framing, choosing and naming: a feature's code is never a region's. */
  function frameable(): ChizuMap {
    const loaded = layer();
    return loaded ? { ...map, regions: [...map.regions, ...loaded.features] } : map;
  }

  /** The corner the buttons sit in, in the map's own units, so that numbered callouts keep out from under them. */
  function callouts(window_: MapBox): ChizuDrawOptions["callouts"] {
    const wanted = options.callouts;
    if (!wanted) return undefined;
    const request = Array.isArray(wanted) ? { codes: wanted as readonly string[] } : (wanted as Exclude<ChizuDrawOptions["callouts"], readonly string[] | undefined>);
    if (request.keepOut || options.controls === false) return request;
    const pixels = stage.clientWidth > 0 ? stage.clientWidth : 640;
    const unit = window_.width / pixels;
    // Up the right edge as far as the three buttons reach, and along the bottom as far as they are wide.
    return { ...request, keepOut: { bottom: 64 * unit, right: 170 * unit } };
  }

  function draw() {
    const window_ = box();
    drawnOffsets = (mapWrapsAround(map) ? wrapOffsets(window_, map.width) : [0]).join(",");
    const drawing = shown();
    const features = layer();
    stage.innerHTML = drawChizu(drawing, {
      box: window_,
      language: language(),
      tones: tones(),
      callouts: callouts(window_),
      labels: options.labels,
      interactive: true,
      ...(features ? { features: options.features ?? [], featureLayer: { ...features, map: drawing.id }, featureLabels: options.featureLabels } : {}),
    });
    stage.dataset.detail = String(drawing !== map);
    stage.style.aspectRatio = `${map.width} / ${map.height}`;
    stage.dataset.map = map.id;
    stage.dataset.zoom = String(zoom);
    if ((options.controls ?? true) && !stage.contains(controls)) stage.append(controls, level);
    if (options.controls === false) {
      controls.remove();
      level.remove();
    }
    words();
  }

  /** Move the window without redrawing, unless it has gone round the world far enough to need the other copy. */
  function pan() {
    const window_ = box();
    const offsets = (mapWrapsAround(map) ? wrapOffsets(window_, map.width) : [0]).join(",");
    if (offsets !== drawnOffsets) {
      draw();
      return;
    }
    const svg = stage.querySelector("svg");
    if (svg) {
      svg.setAttribute("viewBox", `${window_.x} ${window_.y} ${window_.width} ${window_.height}`);
      for (const rect of svg.querySelectorAll<SVGRectElement>(".cz-sea")) {
        rect.setAttribute("x", String(window_.x));
        rect.setAttribute("y", String(window_.y));
        rect.setAttribute("width", String(window_.width));
        rect.setAttribute("height", String(window_.height));
      }
    }
  }

  const changed = () => options.onView?.(view());

  function setZoom(next: MapZoom, about?: { x: number; y: number; fx: number; fy: number }) {
    if (next === zoom) return;
    if (about) {
      // Keep the point under the cursor where it is.
      const size = { width: map.width / next, height: map.height / next };
      centre = { x: about.x - (about.fx - 0.5) * size.width, y: about.y - (about.fy - 0.5) * size.height };
    }
    zoom = next;
    clampNext = true;
    if (mapWrapsAround(map)) centre = { x: wrapAcross(centre.x, map.width), y: centre.y };
    draw();
    changed();
  }

  const api: ChizuMount = {
    set(patch) {
      options = { ...options, ...patch };
      if (patch.zoom !== undefined) zoom = patch.zoom;
      draw();
    },
    setMap(next) {
      map = next;
      options = { ...options, map: next, selected: null };
      waitingToFrame = null;
      zoom = 1;
      centre = boxCentre(wholeMapBox(map));
      clampNext = true;
      draw();
      changed();
    },
    select(code) {
      options = { ...options, selected: code };
      const where = frameable();
      const fit = (options.fit ?? true) && code !== null ? focusRegionFit(where, code) : null;
      // A feature's code, before the features are here: framed when they come.
      waitingToFrame = code !== null && !fit && (options.fit ?? true) && !map.regions.some((region) => region.code === code) && typeof options.featureLayer === "function" ? code : null;
      if (waitingToFrame !== null) layer();
      if (fit) {
        zoom = fit.zoom;
        centre = fit.centre;
        clampNext = false;
      }
      draw();
      changed();
    },
    show(codes) {
      const where = frameable();
      const rows = where.regions.filter((region) => codes.includes(region.code));
      if (rows.length === 1) {
        const fit = focusRegionFit(where, rows[0]!.code);
        if (fit) {
          zoom = fit.zoom;
          centre = fit.centre;
        }
      } else if (rows.length > 1) {
        const fit = zoomToFit(where, rows.map((region) => region.code));
        zoom = fit.zoom;
        centre = fit.centre;
      }
      clampNext = false;
      draw();
      changed();
    },
    zoomBy(by) {
      setZoom(stepMapZoom(zoom, by));
    },
    reset() {
      zoom = 1;
      centre = boxCentre(wholeMapBox(map));
      clampNext = true;
      draw();
      changed();
    },
    view,
    featureLayer: () => layer(),
    destroy() {
      stage.remove();
      says.remove();
      host.classList.remove("chizu-map");
      stage.removeEventListener("pointerdown", down);
    },
  };

  // ---- pointers: drag to move, press to choose, two fingers to zoom ----
  const pointers = new Map<number, { x: number; y: number }>();
  let dragged = 0;
  let pinch = 0;
  let last = { x: 0, y: 0 };
  let lastWheel = 0;

  const toMap = (clientX: number, clientY: number) => {
    const rect = stage.getBoundingClientRect();
    const window_ = box();
    const fx = rect.width > 0 ? (clientX - rect.left) / rect.width : 0.5;
    const fy = rect.height > 0 ? (clientY - rect.top) / rect.height : 0.5;
    return { x: window_.x + fx * window_.width, y: window_.y + fy * window_.height, fx, fy };
  };

  function down(event: PointerEvent) {
    if ((event.target as Element).closest(".czm-controls")) return;
    stage.setPointerCapture?.(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) {
      dragged = 0;
      last = { x: event.clientX, y: event.clientY };
    }
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()] as [{ x: number; y: number }, { x: number; y: number }];
      pinch = Math.hypot(a.x - b.x, a.y - b.y);
      dragged = DRAG_PIXELS + 1;
    }
  }
  function move(event: PointerEvent) {
    const held = pointers.get(event.pointerId);
    if (!held) return;
    held.x = event.clientX;
    held.y = event.clientY;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()] as [{ x: number; y: number }, { x: number; y: number }];
      const now = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch > 0 && now / pinch > 1.5) {
        setZoom(stepMapZoom(zoom, 1));
        pinch = now;
      } else if (pinch > 0 && now / pinch < 0.66) {
        setZoom(stepMapZoom(zoom, -1));
        pinch = now;
      }
      return;
    }
    const moved = Math.hypot(event.clientX - last.x, event.clientY - last.y);
    dragged += moved;
    if (dragged <= DRAG_PIXELS) return;
    stage.dataset.dragging = "true";
    const rect = stage.getBoundingClientRect();
    const window_ = box();
    const unit = rect.width > 0 ? window_.width / rect.width : 0;
    centre = { x: centre.x - (event.clientX - last.x) * unit, y: centre.y - (event.clientY - last.y) * unit };
    settle();
    last = { x: event.clientX, y: event.clientY };
    // A wrapped map's centre is brought back onto the canvas, so the window never runs off a number's end.
    pan();
  }
  function up(event: PointerEvent) {
    const was = pointers.has(event.pointerId);
    pointers.delete(event.pointerId);
    if (!was) return;
    delete stage.dataset.dragging;
    if (pointers.size > 0) return;
    if (dragged <= DRAG_PIXELS) {
      // The pointer is captured by the stage, so the event's own target is the stage: ask what is under the pointer.
      const hit = host.ownerDocument.elementFromPoint(event.clientX, event.clientY)?.closest?.("[data-code]") as HTMLElement | null;
      const code = hit?.dataset.code ?? null;
      if (code && options.selectable !== false && !hit?.classList.contains("cz-inset")) {
        const next = options.selected === code ? null : code;
        api.select(next);
        options.onSelect?.(next);
      }
      return;
    }
    // A drag ended: callouts are placed for the window as it now is.
    if (options.callouts) draw();
    changed();
  }
  function wheel(event: WheelEvent) {
    // The wheel alone scrolls the page; with Ctrl or ⌘ (which is also what a trackpad's pinch sends) it zooms the map.
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const now = Date.now();
    if (now - lastWheel < WHEEL_PAUSE_MS) return;
    lastWheel = now;
    const at = toMap(event.clientX, event.clientY);
    setZoom(stepMapZoom(zoom, event.deltaY < 0 ? 1 : -1), at);
  }
  function key(event: KeyboardEvent) {
    const window_ = box();
    const step = (dx: number, dy: number) => {
      event.preventDefault();
      centre = { x: centre.x + dx * window_.width * KEY_STEP, y: centre.y + dy * window_.height * KEY_STEP };
      settle();
      pan();
      if (options.callouts) draw();
      changed();
    };
    if (event.key === "ArrowLeft") step(-1, 0);
    else if (event.key === "ArrowRight") step(1, 0);
    else if (event.key === "ArrowUp") step(0, -1);
    else if (event.key === "ArrowDown") step(0, 1);
    else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      api.zoomBy(1);
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      api.zoomBy(-1);
    } else if (event.key === "0") {
      event.preventDefault();
      api.reset();
    }
  }
  stage.addEventListener("pointerdown", down);
  stage.addEventListener("pointermove", move);
  stage.addEventListener("pointerup", up);
  stage.addEventListener("pointercancel", up);
  stage.addEventListener("wheel", wheel, { passive: false });
  stage.addEventListener("keydown", key);

  if (options.selected) {
    const fit = (options.fit ?? true) ? focusRegionFit(frameable(), options.selected) : null;
    if (fit) {
      zoom = fit.zoom;
      centre = fit.centre;
      clampNext = false;
    }
  }
  draw();
  host.dataset.ready = "true";
  return api;
}

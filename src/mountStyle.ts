import type { ChizuTheme } from "./mountTypes.ts";
import { CHIZU_STYLE, PALETTE_DARK, PALETTE_LIGHT } from "./style.ts";

const FRAME_LIGHT = "--czm-ink: #1f2320; --czm-surface: #fbf8f1; --czm-rule: #bdb6a4; --czm-accent: #b5452c;";
const FRAME_DARK = "--czm-ink: #ece8dc; --czm-surface: #1d201e; --czm-rule: #4a4d46; --czm-accent: #ff8a6b;";

/**
 * THE STYLE a mounted map wears, beside the drawing's own (`CHIZU_STYLE`): the frame the map sits in, the zoom buttons
 * over its corner and the line a screen reader is told what was chosen on. Custom properties on `.chizu-map`
 * (`--czm-ink`, `--czm-surface`, `--czm-rule`, `--czm-accent`) with the page's light and dark.
 *
 * @example
 * ```ts
 * import { CHIZU_MAP_STYLE } from "@johnmorrisdotca/chizu/mount";
 *
 * console.log(CHIZU_MAP_STYLE.includes(".chizu-map"));
 * // true
 * ```
 */
export const CHIZU_MAP_STYLE = `${CHIZU_STYLE}
.chizu-map {
  ${FRAME_LIGHT}
  position: relative; display: block; max-width: 100%; box-sizing: border-box; color: var(--czm-ink);
  font-family: system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .chizu-map { ${FRAME_DARK} }
}
:root[data-theme="dark"] .chizu-map { ${FRAME_DARK} }
.chizu-map *, .chizu-map *::before, .chizu-map *::after { box-sizing: border-box; }
.chizu-map .czm-stage { user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; position: relative; overflow: hidden; border: 1px solid var(--czm-rule); border-radius: 10px; touch-action: none; cursor: grab; background: var(--cz-sea, #cfe3ee); }
.chizu-map .czm-stage[data-dragging="true"] { cursor: grabbing; }
.chizu-map .czm-stage:focus-visible { outline: 3px solid var(--czm-accent); outline-offset: 2px; }
.chizu-map .czm-stage [data-interactive]:focus { outline: none; }
.chizu-map .czm-stage [data-interactive]:focus-visible > :not(title) { stroke: var(--czm-accent); stroke-width: 3px; vector-effect: non-scaling-stroke; }
.chizu-map .czm-stage svg { display: block; width: 100%; height: 100%; }
.chizu-map .czm-controls { position: absolute; bottom: 8px; right: 8px; display: grid; gap: 6px; }
.chizu-map .czm-button { width: 44px; height: 44px; min-width: 44px; border-radius: 10px; border: 1px solid var(--czm-rule); background: var(--czm-surface); color: var(--czm-ink); font: inherit; font-size: 1.3rem; line-height: 1; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; }
.chizu-map .czm-button:disabled { opacity: .35; cursor: default; }
.chizu-map .czm-button:focus-visible { outline: 3px solid var(--czm-accent); outline-offset: 2px; }
.chizu-map .czm-says { margin: 6px 0 0; min-height: 1.4em; font-size: .9rem; }
.chizu-map .czm-zoom { position: absolute; left: 8px; bottom: 8px; padding: 2px 8px; border-radius: 8px; background: var(--czm-surface); border: 1px solid var(--czm-rule); font-size: .8rem; font-variant-numeric: tabular-nums; pointer-events: none; }
.chizu-map.chizu-map[data-chizu-theme="light"] { ${FRAME_LIGHT} }
.chizu-map.chizu-map[data-chizu-theme="light"] .chizu { ${PALETTE_LIGHT} }
.chizu-map.chizu-map[data-chizu-theme="dark"] { ${FRAME_DARK} }
.chizu-map.chizu-map[data-chizu-theme="dark"] .chizu { ${PALETTE_DARK} }
/* A pinned palette is a card of its own, so the line under the map reads on a page of the other one. */
.chizu-map[data-chizu-theme="light"], .chizu-map[data-chizu-theme="dark"] { background: var(--czm-surface); border-radius: 10px; }
.chizu-map[data-chizu-theme="light"] .czm-says, .chizu-map[data-chizu-theme="dark"] .czm-says { padding: 0 8px 8px; }
`;

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
 *
 * @param host - The page or shadow-root element that receives the native map and its scoped styles.
 * @returns Nothing; the native scoped map styles are installed for the host.
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

/** The tones a mounted map draws with: the page's own, and the chosen place marked `selected` unless the page tones it. */
export function selectedTones(options: {
  tones?: Record<string, string>;
  selected?: string | null;
}): Record<string, string> {
  const out: Record<string, string> = { ...(options.tones ?? {}) };
  if (options.selected && out[options.selected] === undefined) out[options.selected] = "selected";
  return out;
}

/** Pin the palette of the map in `host` to light or dark (`theme`), or hand it back to the page's own with "auto". */
export function wearTheme(host: Element, theme: ChizuTheme | undefined): void {
  if (theme === "light" || theme === "dark") host.setAttribute("data-chizu-theme", theme);
  else host.removeAttribute("data-chizu-theme");
}

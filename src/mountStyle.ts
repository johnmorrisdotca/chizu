import { CHIZU_STYLE } from "./style.ts";

/**
 * THE STYLE a mounted map wears, beside the drawing's own (`CHIZU_STYLE`): the frame the map sits in, the zoom buttons
 * over its corner and the line a screen reader is told what was chosen on. Custom properties on `.chizu-map`
 * (`--czm-ink`, `--czm-surface`, `--czm-rule`, `--czm-accent`) with the page's light and dark.
 */
export const CHIZU_MAP_STYLE = `${CHIZU_STYLE}
.chizu-map {
  --czm-ink: #1f2320; --czm-surface: #fbf8f1; --czm-rule: #bdb6a4; --czm-accent: #b5452c;
  position: relative; display: block; max-width: 100%; box-sizing: border-box; color: var(--czm-ink);
  font-family: system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .chizu-map { --czm-ink: #ece8dc; --czm-surface: #1d201e; --czm-rule: #4a4d46; --czm-accent: #ff8a6b; }
}
:root[data-theme="dark"] .chizu-map { --czm-ink: #ece8dc; --czm-surface: #1d201e; --czm-rule: #4a4d46; --czm-accent: #ff8a6b; }
.chizu-map *, .chizu-map *::before, .chizu-map *::after { box-sizing: border-box; }
.chizu-map .czm-stage { user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; position: relative; overflow: hidden; border: 1px solid var(--czm-rule); border-radius: 10px; touch-action: none; cursor: grab; background: var(--cz-sea, #cfe3ee); }
.chizu-map .czm-stage[data-dragging="true"] { cursor: grabbing; }
.chizu-map .czm-stage:focus-visible { outline: 3px solid var(--czm-accent); outline-offset: 2px; }
.chizu-map .czm-stage svg { display: block; width: 100%; height: 100%; }
.chizu-map .czm-controls { position: absolute; bottom: 8px; right: 8px; display: grid; gap: 6px; }
.chizu-map .czm-button { width: 44px; height: 44px; min-width: 44px; border-radius: 10px; border: 1px solid var(--czm-rule); background: var(--czm-surface); color: var(--czm-ink); font: inherit; font-size: 1.3rem; line-height: 1; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; }
.chizu-map .czm-button:disabled { opacity: .35; cursor: default; }
.chizu-map .czm-button:focus-visible { outline: 3px solid var(--czm-accent); outline-offset: 2px; }
.chizu-map .czm-says { margin: 6px 0 0; min-height: 1.4em; font-size: .9rem; }
.chizu-map .czm-zoom { position: absolute; left: 8px; bottom: 8px; padding: 2px 8px; border-radius: 8px; background: var(--czm-surface); border: 1px solid var(--czm-rule); font-size: .8rem; font-variant-numeric: tabular-nums; pointer-events: none; }
`;

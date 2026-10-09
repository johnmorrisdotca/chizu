/**
 * THE STYLE a chizu drawing wears: the colours of its land and sea as custom properties, and the one rule that matters
 * for a map pressed with fingers: nothing in the drawing can be selected, dragged or double-tapped.
 *
 * `drawChizu` only writes classes, data attributes and a few custom properties; this is what gives them a look. Every
 * colour is a custom property on `.chizu` (`--cz-sea`, `--cz-land`, `--cz-line`, ...), so a page's own style needs to
 * set only the ones it wants different. The paper follows the page's light or dark. Nothing moves, so there is nothing
 * for reduced motion to still.
 *
 * A region may be given a tone (`drawChizu`'s `tones` option): `selected`, `correct`, `wrong`, `hint`, `muted` or `faint`
 * are looked after here, and any other name `x` is the class `cz-tone-x` for the page to colour.
 *
 * @example
 * ```ts
 * import { CHIZU_STYLE } from "@johnmorrisdotca/chizu/draw";
 *
 * // The drawing's colours as CSS, to put in a page once (drawChizu's `style: true` puts it inside the SVG instead).
 * console.log(CHIZU_STYLE.includes("--cz-sea"));
 * // true
 * ```
 */
export const CHIZU_STYLE = `
.chizu {
  --cz-sea: #cfe3ee; --cz-land: #e9e1c8; --cz-line: #5d5a50; --cz-inset: #7a766a; --cz-ink: #1f2320;
  --cz-selected: #ffd23f; --cz-correct: #9bd6a8; --cz-wrong: #f0a99b; --cz-hint: #b7dcf4; --cz-muted: #d9d5c6; --cz-faint: #f3efe4;
  --cz-callout: #ffffff; --cz-callout-ink: #1f2320; --cz-leader: #3a3d38; --cz-halo: #f7f3e8;
  --cz-marine: #cfe3ee; --cz-water: #a6cde6; --cz-water-ink: #2b5d84; --cz-feature-line: #6b5d45; --cz-feature-selected: #4f9bd6;
  --cz-font: system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif;
  display: block; width: 100%; height: auto;
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .chizu {
    --cz-sea: #18303d; --cz-land: #4a4a3d; --cz-line: #aaa592; --cz-inset: #8f8b7a; --cz-ink: #ece8dc;
    --cz-selected: #a8841a; --cz-correct: #2f6b45; --cz-wrong: #8a3a2c; --cz-hint: #2d5a78; --cz-muted: #3a3a30; --cz-faint: #55554a;
    --cz-callout: #ece8dc; --cz-callout-ink: #1f2320; --cz-leader: #ece8dc; --cz-halo: #1d201e;
    --cz-marine: #18303d; --cz-water: #2f6283; --cz-water-ink: #9fcbe8; --cz-feature-line: #cdbd97; --cz-feature-selected: #3f8cc6;
  }
}
:root[data-theme="dark"] .chizu {
  --cz-sea: #18303d; --cz-land: #4a4a3d; --cz-line: #aaa592; --cz-inset: #8f8b7a; --cz-ink: #ece8dc;
  --cz-selected: #a8841a; --cz-correct: #2f6b45; --cz-wrong: #8a3a2c; --cz-hint: #2d5a78; --cz-muted: #3a3a30; --cz-faint: #55554a;
  --cz-callout: #ece8dc; --cz-callout-ink: #1f2320; --cz-leader: #ece8dc; --cz-halo: #1d201e;
  --cz-marine: #18303d; --cz-water: #2f6283; --cz-water-ink: #9fcbe8; --cz-feature-line: #cdbd97; --cz-feature-selected: #3f8cc6;
}
.chizu * { user-select: none; -webkit-user-select: none; }
.chizu .cz-sea { fill: var(--cz-sea); }
.chizu .cz-land { fill: var(--cz-land); stroke: var(--cz-line); stroke-width: 1px; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.chizu .cz-region[data-interactive="true"] { cursor: pointer; }
.chizu .cz-region[data-interactive="true"]:hover .cz-land { filter: brightness(.94); }
.chizu .cz-tone-selected .cz-land { fill: var(--cz-selected); }
.chizu .cz-tone-correct .cz-land { fill: var(--cz-correct); }
.chizu .cz-tone-wrong .cz-land { fill: var(--cz-wrong); }
.chizu .cz-tone-hint .cz-land { fill: var(--cz-hint); }
.chizu .cz-tone-muted .cz-land { fill: var(--cz-muted); }
.chizu .cz-tone-faint .cz-land { fill: var(--cz-faint); }
.chizu .cz-inset { fill: none; stroke: var(--cz-inset); stroke-width: 1px; stroke-dasharray: 5 4; vector-effect: non-scaling-stroke; pointer-events: none; }
.chizu .cz-leader { stroke: var(--cz-leader); stroke-width: 1.2px; stroke-linecap: round; vector-effect: non-scaling-stroke; pointer-events: none; }
.chizu .cz-start { fill: var(--cz-leader); pointer-events: none; }
.chizu .cz-callout-circle { fill: var(--cz-callout); stroke: var(--cz-leader); stroke-width: 1.2px; vector-effect: non-scaling-stroke; }
.chizu .cz-callout-number { font-family: var(--cz-font); font-weight: 700; fill: var(--cz-callout-ink); text-anchor: middle; dominant-baseline: central; pointer-events: none; font-variant-numeric: tabular-nums; }
.chizu .cz-callout[data-interactive="true"] { cursor: pointer; }
.chizu .cz-label { font-family: var(--cz-font); font-weight: 600; fill: var(--cz-ink); text-anchor: middle; dominant-baseline: central; paint-order: stroke; stroke: var(--cz-halo); stroke-width: 3px; stroke-linejoin: round; pointer-events: none; }
.chizu .cz-region:focus-visible .cz-land { stroke: var(--cz-ink); stroke-width: 2.5px; }
.chizu .cz-region:focus { outline: none; }
.chizu .cz-inset-sea { fill: var(--cz-sea); pointer-events: none; }
.chizu .cz-marine-area { fill: var(--cz-marine); stroke: none; }
.chizu .cz-lake { fill: var(--cz-water); stroke: var(--cz-water-ink); stroke-width: .5px; stroke-opacity: .5; vector-effect: non-scaling-stroke; }
.chizu .cz-river { fill: none; stroke: var(--cz-water); stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; pointer-events: none; }
.chizu .cz-river-hit { fill: none; stroke: transparent; stroke-width: 12px; vector-effect: non-scaling-stroke; pointer-events: stroke; }
.chizu .cz-landform-area { fill: none; stroke: none; pointer-events: none; }
.chizu .cz-peak { fill: var(--cz-feature-line); stroke: var(--cz-halo); stroke-width: 1px; vector-effect: non-scaling-stroke; }
.chizu .cz-feature[data-interactive="true"] { cursor: pointer; }
.chizu .cz-feature[data-interactive="true"]:hover .cz-marine-area, .chizu .cz-feature[data-interactive="true"]:hover .cz-lake { filter: brightness(.93); }
.chizu .cz-feature[data-interactive="true"]:hover .cz-river { stroke: var(--cz-feature-selected); }
.chizu .cz-feature[data-tone] .cz-marine-area, .chizu .cz-feature[data-tone] .cz-lake { fill: var(--cz-feature-selected); stroke: var(--cz-water-ink); stroke-width: 1.5px; stroke-opacity: 1; vector-effect: non-scaling-stroke; }
.chizu .cz-feature[data-tone] .cz-river { stroke: var(--cz-feature-selected); stroke-width: 3.5px; }
.chizu .cz-feature[data-tone] .cz-landform-area { fill: var(--cz-feature-selected); fill-opacity: .28; stroke: var(--cz-feature-line); stroke-width: 1.5px; stroke-dasharray: 5 3; vector-effect: non-scaling-stroke; }
.chizu .cz-feature[data-tone] .cz-peak { fill: var(--cz-feature-selected); }
.chizu .cz-tone-correct .cz-marine-area, .chizu .cz-tone-correct .cz-lake, .chizu .cz-tone-correct .cz-landform-area { fill: var(--cz-correct); }
.chizu .cz-tone-correct .cz-river, .chizu .cz-tone-correct .cz-peak { stroke: var(--cz-correct); fill: var(--cz-correct); }
.chizu .cz-tone-wrong .cz-marine-area, .chizu .cz-tone-wrong .cz-lake, .chizu .cz-tone-wrong .cz-landform-area { fill: var(--cz-wrong); }
.chizu .cz-tone-wrong .cz-river, .chizu .cz-tone-wrong .cz-peak { stroke: var(--cz-wrong); fill: var(--cz-wrong); }
.chizu .cz-tone-muted .cz-marine-area, .chizu .cz-tone-faint .cz-marine-area { fill: var(--cz-marine); stroke: none; }
.chizu .cz-feature-label { font-family: var(--cz-font); text-anchor: middle; dominant-baseline: central; paint-order: stroke; stroke: var(--cz-halo); stroke-width: 2.5px; stroke-linejoin: round; pointer-events: none; }
.chizu .cz-water-label { font-style: italic; font-weight: 500; fill: var(--cz-water-ink); letter-spacing: .02em; }
.chizu .cz-sea-label { stroke: var(--cz-marine); stroke-opacity: .8; }
.chizu .cz-landform-label { font-weight: 600; fill: var(--cz-feature-line); letter-spacing: .12em; text-transform: uppercase; }
.chizu .cz-peak-label { font-weight: 500; fill: var(--cz-feature-line); text-anchor: start; }
`;

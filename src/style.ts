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
 */
export const CHIZU_STYLE = `
.chizu {
  --cz-sea: #cfe3ee; --cz-land: #e9e1c8; --cz-line: #5d5a50; --cz-inset: #7a766a; --cz-ink: #1f2320;
  --cz-selected: #ffd23f; --cz-correct: #9bd6a8; --cz-wrong: #f0a99b; --cz-hint: #b7dcf4; --cz-muted: #d9d5c6; --cz-faint: #f3efe4;
  --cz-callout: #ffffff; --cz-callout-ink: #1f2320; --cz-leader: #3a3d38; --cz-halo: #f7f3e8;
  --cz-font: system-ui, -apple-system, "Segoe UI", "Hiragino Sans", "Noto Sans JP", sans-serif;
  display: block; width: 100%; height: auto;
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .chizu {
    --cz-sea: #18303d; --cz-land: #4a4a3d; --cz-line: #aaa592; --cz-inset: #8f8b7a; --cz-ink: #ece8dc;
    --cz-selected: #a8841a; --cz-correct: #2f6b45; --cz-wrong: #8a3a2c; --cz-hint: #2d5a78; --cz-muted: #3a3a30; --cz-faint: #55554a;
    --cz-callout: #ece8dc; --cz-callout-ink: #1f2320; --cz-leader: #ece8dc; --cz-halo: #1d201e;
  }
}
:root[data-theme="dark"] .chizu {
  --cz-sea: #18303d; --cz-land: #4a4a3d; --cz-line: #aaa592; --cz-inset: #8f8b7a; --cz-ink: #ece8dc;
  --cz-selected: #a8841a; --cz-correct: #2f6b45; --cz-wrong: #8a3a2c; --cz-hint: #2d5a78; --cz-muted: #3a3a30; --cz-faint: #55554a;
  --cz-callout: #ece8dc; --cz-callout-ink: #1f2320; --cz-leader: #ece8dc; --cz-halo: #1d201e;
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
`;

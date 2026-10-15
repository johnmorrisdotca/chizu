/**
 * THE LOOK OF A LOCAL MAP (`drawLocal`), as CSS that goes beside `CHIZU_STYLE`: the ground, and the shapes a caller's
 * GeoJSON draws, in the same custom properties and the same light and dark. A page that draws with `style: true` has it
 * already; a page with its own style sheet puts both in once.
 *
 * A shape is a `<g class="cz-local-shape" data-code data-type>` with the path inside. What it looks like comes from
 * three layers, the last winning: the look of its `kind` (`water`, `building`, `pitch`, `green`, `road` have one,
 * `--cz-local-*`), the page's own CSS on the classes the data gives it, and the `styles` option, which sets
 * `--cz-fill`, `--cz-stroke`, `--cz-stroke-width`, `--cz-opacity` and their `-dark` forms on the group. Any colour may
 * be `var(--yours)`, so a page's own dark mode reaches a shape without a second colour.
 *
 * @example
 * ```ts
 * import { CHIZU_LOCAL_STYLE } from "@johnmorrisdotca/chizu/draw";
 *
 * console.log(CHIZU_LOCAL_STYLE.includes("--cz-local-pitch"), CHIZU_LOCAL_STYLE.includes("prefers-color-scheme: dark"));
 * // true true
 * ```
 */
export const CHIZU_LOCAL_STYLE = `
.chizu {
  --cz-ground: #f3efe3; --cz-local-area: #e6dfc9; --cz-local-building: #d6c9ab; --cz-local-building-line: #8a7d62; --cz-local-green: #cfe3bd; --cz-local-pitch: #b4d995;
  --cz-local-road: #8f8873; --cz-local-point: #1f2320;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .chizu {
    --cz-ground: #26282a; --cz-local-area: #3d3d33; --cz-local-building: #5a5444; --cz-local-building-line: #b5a98c; --cz-local-green: #34503a; --cz-local-pitch: #3f6a3a;
    --cz-local-road: #b0a98f; --cz-local-point: #ece8dc;
  }
}
:root[data-theme="dark"] .chizu {
  --cz-ground: #26282a; --cz-local-area: #3d3d33; --cz-local-building: #5a5444; --cz-local-building-line: #b5a98c; --cz-local-green: #34503a; --cz-local-pitch: #3f6a3a;
  --cz-local-road: #b0a98f; --cz-local-point: #ece8dc;
}
.chizu .cz-ground { fill: var(--cz-ground); }
.chizu .cz-local-shape { --cz-def-fill: var(--cz-local-area); --cz-def-stroke: var(--cz-line); --cz-def-width: 1px; opacity: var(--cz-opacity, 1); }
.chizu .cz-local-shape[data-type="water"] { --cz-def-fill: var(--cz-water); --cz-def-stroke: var(--cz-water-ink); }
.chizu .cz-local-shape[data-type="building"] { --cz-def-fill: var(--cz-local-building); --cz-def-stroke: var(--cz-local-building-line); }
.chizu .cz-local-shape[data-type="green"] { --cz-def-fill: var(--cz-local-green); }
.chizu .cz-local-shape[data-type="pitch"] { --cz-def-fill: var(--cz-local-pitch); }
.chizu .cz-local-shape[data-type="road"] { --cz-def-stroke: var(--cz-local-road); --cz-def-width: 3px; }
.chizu .cz-local-shape.cz-tone-selected { --cz-tone-colour: var(--cz-selected); }
.chizu .cz-local-shape.cz-tone-correct { --cz-tone-colour: var(--cz-correct); }
.chizu .cz-local-shape.cz-tone-wrong { --cz-tone-colour: var(--cz-wrong); }
.chizu .cz-local-shape.cz-tone-hint { --cz-tone-colour: var(--cz-hint); }
.chizu .cz-local-shape.cz-tone-muted { --cz-tone-colour: var(--cz-muted); }
.chizu .cz-local-shape.cz-tone-faint { --cz-tone-colour: var(--cz-faint); }
.chizu .cz-local-shape[data-interactive="true"] { cursor: pointer; }
.chizu .cz-local-shape[data-interactive="true"]:hover .cz-local-area { filter: brightness(.94); }
.chizu .cz-local-shape:focus { outline: none; }
.chizu .cz-local-shape:focus-visible .cz-local-area, .chizu .cz-local-shape:focus-visible .cz-local-line { stroke: var(--cz-ink); stroke-width: 2.5px; }
.chizu .cz-local-area { fill: var(--cz-fill, var(--cz-tone-colour, var(--cz-def-fill))); fill-opacity: var(--cz-fill-opacity, 1); stroke: var(--cz-stroke, var(--cz-def-stroke)); stroke-width: var(--cz-stroke-width, var(--cz-def-width)); fill-rule: evenodd; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.chizu .cz-local-line { fill: none; stroke: var(--cz-stroke, var(--cz-tone-colour, var(--cz-def-stroke))); stroke-width: var(--cz-stroke-width, max(var(--cz-def-width), 1.5px)); stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.chizu .cz-local-hit { fill: none; stroke: transparent; stroke-width: 14px; vector-effect: non-scaling-stroke; pointer-events: stroke; }
.chizu .cz-local-point { fill: var(--cz-fill, var(--cz-tone-colour, var(--cz-local-point))); stroke: var(--cz-halo); stroke-width: 1px; vector-effect: non-scaling-stroke; }
.chizu .cz-local-shape.cz-metric .cz-local-area, .chizu .cz-local-shape.cz-metric .cz-local-line { vector-effect: none; }
.chizu .cz-marker[data-interactive="true"] { cursor: pointer; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .chizu .cz-local-area { fill: var(--cz-fill-dark, var(--cz-fill, var(--cz-tone-colour, var(--cz-def-fill)))); stroke: var(--cz-stroke-dark, var(--cz-stroke, var(--cz-def-stroke))); }
  :root:not([data-theme="light"]) .chizu .cz-local-line { stroke: var(--cz-stroke-dark, var(--cz-stroke, var(--cz-tone-colour, var(--cz-def-stroke)))); }
  :root:not([data-theme="light"]) .chizu .cz-local-point { fill: var(--cz-fill-dark, var(--cz-fill, var(--cz-tone-colour, var(--cz-local-point)))); }
}
:root[data-theme="dark"] .chizu .cz-local-area { fill: var(--cz-fill-dark, var(--cz-fill, var(--cz-tone-colour, var(--cz-def-fill)))); stroke: var(--cz-stroke-dark, var(--cz-stroke, var(--cz-def-stroke))); }
:root[data-theme="dark"] .chizu .cz-local-line { stroke: var(--cz-stroke-dark, var(--cz-stroke, var(--cz-tone-colour, var(--cz-def-stroke)))); }
:root[data-theme="dark"] .chizu .cz-local-point { fill: var(--cz-fill-dark, var(--cz-fill, var(--cz-tone-colour, var(--cz-local-point)))); }
.chizu .cz-local-label-start { text-anchor: start; }
.chizu .cz-scale-line { fill: none; stroke: var(--cz-ink); stroke-width: 1.6px; stroke-linecap: square; vector-effect: non-scaling-stroke; pointer-events: none; }
.chizu .cz-scale-text, .chizu .cz-credit { font-family: var(--cz-font); fill: var(--cz-ink); text-anchor: end; paint-order: stroke; stroke: var(--cz-halo); stroke-width: 2.5px; stroke-linejoin: round; pointer-events: none; }
.chizu .cz-credit { opacity: .85; }
`;

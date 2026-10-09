import { featureLabels, featureShapes } from "./drawFeatures.ts";
import { featuresShown, type ChizuFeatureChoice } from "./features.ts";
import { wholeMapBox } from "./frame.ts";
import { insetTransformAttribute } from "./insets.ts";
import { layoutCallouts, type CalloutRequest } from "./layout.ts";
import { mapOutlines, mapRegionPieces } from "./outlines.ts";
import { chizuSay, nameOf, type ChizuLanguage } from "./strings.ts";
import { CHIZU_STYLE } from "./style.ts";
import type { ChizuFeature, ChizuFeatureGroup, ChizuFeatureLayer, ChizuInset, ChizuMap, MapBox } from "./types.ts";
import { mapWrapsAround, wrapOffsets } from "./wrap.ts";

/**
 * What a drawing shows beyond the map itself. Every part is optional: a map alone is its land on its sea.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { drawChizu, type ChizuDrawOptions } from "@johnmorrisdotca/chizu/draw";
 *
 * const options: ChizuDrawOptions = { language: "ja", tones: { JP: "selected" }, style: true };
 * console.log(drawChizu(WORLD, options).includes('data-tone="selected"'));
 * // true
 * ```
 */
export type ChizuDrawOptions = {
  /** The window to show: a part of the map, as `focusBox`, `zoomBox` or `regionBox` frame it. Default: the whole map. */
  box?: MapBox;
  /** The language of the names a screen reader hears, and of the labels. Default `en`. */
  language?: ChizuLanguage;
  /** A tone for each region, by code: `selected`, `correct`, `wrong`, `hint`, `muted`, `faint`, or any name `x`, which is the class `cz-tone-x` for your own style. */
  tones?: Readonly<Record<string, string>>;
  /**
   * A colour for each region, by code: `{ JP: "#2f6b4f", GB: "#8a3b3b" }`, for two or more places that must be told
   * apart (a comparison, a choropleth you colour yourself). A hex colour (`#2f6b4f`, `#fc0`), a CSS colour name
   * (`teal`), `rgb()`, `hsl()` or a `var(--name)` is drawn as the land's fill, over its tone's; any other text is
   * ignored, so a value from an address or a form cannot put anything else into the drawing. A region not named
   * keeps the theme's land (or its tone's). The colour is the same in the light and dark looks. Default none.
   */
  colors?: Readonly<Record<string, string>>;
  /** Numbered circles in open water with leader lines to these regions (`layoutCallouts`): a list of codes, or a request. */
  callouts?: readonly string[] | Omit<CalloutRequest, "box">;
  /** Print the names on the land: all the regions that are big enough to hold theirs, or just these. */
  labels?: boolean | readonly string[];
  /** Draw a dashed frame round each inset. Default true. */
  insetFrames?: boolean;
  /** Give every region its `data-code` as a thing to press, with a pointer cursor, `role="button"` and `tabindex="-1"`, for a page to hand focus to. */
  interactive?: boolean;
  /** What a screen reader hears of the drawing, instead of "Map of the world". */
  label?: string;
  /** Put `CHIZU_STYLE` inside, so the drawing stands alone as an image. */
  style?: boolean;
  /**
   * Which named features to draw from `featureLayer`: `water` (seas, lakes and rivers), `all`, a group (`marine`,
   * `landforms`, `lakes`, `rivers`, `peaks`) or a kind (`strait`). Default none, so a map without them is drawn as it
   * always was. A feature takes a tone by its code in `tones`, like a region, and may be numbered in `callouts`; a
   * feature given a tone is drawn whether or not its group is chosen.
   */
  features?: readonly ChizuFeatureChoice[];
  /** The map's named features: `loadFeatures(map.id)`. Drawn only when its `map` is this map's id. */
  featureLayer?: ChizuFeatureLayer | null;
  /** Print the features' names. Default true. */
  featureLabels?: boolean;
};

/** A colour a drawing will carry: hex, a CSS name, `rgb()`, `hsl()` (and their `a` forms) or `var(--name)`. Nothing else, so none of it can end the attribute or the style it sits in. */
const SAFE_COLOUR = /^(#[0-9a-f]{3,8}|[a-z]{3,30}|(?:rgb|hsl)a?\([0-9a-z.,%\s/+-]{1,60}\)|var\(--[a-z0-9_-]{1,40}\))$/i;

/**
 * Whether `colour` is one `drawChizu`'s `colors` will draw.
 *
 * @example
 * ```ts
 * import { isChizuColour } from "@johnmorrisdotca/chizu/draw";
 *
 * console.log(isChizuColour("#2f6b4f"), isChizuColour("teal"), isChizuColour("red;x:y"));
 * // true true false
 * ```
 */
export const isChizuColour = (colour: string): boolean => SAFE_COLOUR.test(colour.trim());

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (value: number) => String(Math.round(value * 100) / 100);

/** The label's font size, as a share of the window's width. */
const LABEL_RATIO = 0.016;

/**
 * A map as SVG text: the sea, every region's land with its tone, the frames of its insets, and optionally the names
 * and the numbered callouts. A string, so it works on a server, in a build step, in an email or in `innerHTML`; the
 * look comes from `CHIZU_STYLE` (set `style: true` to carry it inside).
 *
 * Each region is a `<g class="cz-region" data-code="…">` holding a `<path class="cz-land">` for each piece (an inset's
 * region is one piece moved into its box). On a map that wraps, a window that overhangs the cut draws the land again
 * on the other side.
 *
 * @example
 * ```ts
 * import WORLD from "@johnmorrisdotca/chizu/world";
 * import { drawChizu } from "@johnmorrisdotca/chizu/draw";
 * import { focusBox } from "@johnmorrisdotca/chizu";
 *
 * const svg = drawChizu(WORLD, { box: focusBox(WORLD, ["JP"]), tones: { JP: "selected" }, labels: ["JP"], language: "ja" });
 * console.log(svg.startsWith("<svg"), svg.includes("<title>日本</title>"));
 * // true true
 * ```
 */
export function drawChizu(map: ChizuMap, options: ChizuDrawOptions = {}): string {
  const language = options.language ?? "en";
  const box = options.box ?? wholeMapBox(map);
  const outlines = mapOutlines(map);
  const offsets = mapWrapsAround(map) ? wrapOffsets(box, map.width) : [0];
  const interactive = options.interactive === true;
  const tones = options.tones ?? {};
  const colors = options.colors ?? {};
  // The features chosen, and any other that is given a tone: a sea chosen from a list is drawn though its group is off.
  const shown: ChizuFeature[] =
    options.featureLayer && options.featureLayer.map === map.id
      ? (() => {
          const chosen = new Set(featuresShown(options.featureLayer, options.features ?? []));
          return options.featureLayer.features.filter((feature) => chosen.has(feature) || tones[feature.code] !== undefined);
        })()
      : [];
  const layerOf = (group: ChizuFeatureGroup) => {
    if (!shown.some((feature) => feature.group === group)) return "";
    const shapes = featureShapes(shown, group, box, { language, tones, interactive });
    return offsets.map((offset) => `<g class="cz-features" data-group="${group}"${offset === 0 ? "" : ` transform="translate(${num(offset)} 0)"`}>${shapes}</g>`).join("");
  };
  const insetOf = new Map<string, ChizuInset[]>();
  for (const inset of map.insets) insetOf.set(String(inset.code), [...(insetOf.get(String(inset.code)) ?? []), inset]);

  const regionGroup = (index: number) => {
    const region = map.regions[index]!;
    const tone = tones[region.code];
    const colour = Object.hasOwn(colors, region.code) && typeof colors[region.code] === "string" && isChizuColour(colors[region.code]!) ? colors[region.code]!.trim() : undefined;
    const pieces = mapRegionPieces(region, insetOf.get(String(region.code)) ?? null);
    const attributes = `class="cz-region${tone ? ` cz-tone-${escape(tone)}` : ""}" data-code="${escape(region.code)}"${tone ? ` data-tone="${escape(tone)}"` : ""}${colour ? ` data-color="${escape(colour)}" style="--cz-color:${escape(colour)}"` : ""}${interactive ? ` data-interactive="true" role="button" tabindex="-1" aria-label="${escape(nameOf(region, language))}"` : ""}`;
    const paths = pieces.map((piece) => `<path class="cz-land" d="${piece.d}"${piece.transform ? ` transform="${insetTransformAttribute(piece.transform)}"` : ""}/>`).join("");
    return `<g ${attributes}><title>${escape(nameOf(region, language))}</title>${paths}</g>`;
  };
  const land = map.regions.map((_, index) => regionGroup(index)).join("");

  const copies = offsets.map((offset) => (offset === 0 ? `<g class="cz-land-copy">${land}</g>` : `<g class="cz-land-copy" transform="translate(${num(offset)} 0)">${land}</g>`)).join("");

  const frames =
    options.insetFrames === false
      ? ""
      : map.insets
          .map((inset) => `<rect class="cz-inset" data-code="${escape(inset.code)}" x="${num(inset.box.x)}" y="${num(inset.box.y)}" width="${num(inset.box.width)}" height="${num(inset.box.height)}"/>`)
          .join("");

  let labels = "";
  if (options.labels) {
    const size = box.width * LABEL_RATIO;
    const only = options.labels === true ? null : new Set(options.labels.map(String));
    const parts: string[] = [];
    for (const offset of offsets) {
      map.regions.forEach((region, index) => {
        if (only !== null && !only.has(region.code)) return;
        const outline = outlines[index]!;
        const at = outline.anchor ?? region.centroid;
        const name = nameOf(region, language);
        const widest = Math.max(0, ...outline.rings.map((ring) => ring.maxX - ring.minX));
        if (only === null && name.length * size * (language === "ja" ? 1 : 0.55) > widest * 1.15) return;
        const x = at[0] + offset;
        if (x < box.x || x > box.x + box.width || at[1] < box.y || at[1] > box.y + box.height) return;
        parts.push(`<text class="cz-label" x="${num(x)}" y="${num(at[1])}" font-size="${num(size)}" data-code="${escape(region.code)}">${escape(name)}</text>`);
      });
    }
    labels = `<g class="cz-labels">${parts.join("")}</g>`;
  }

  let callouts = "";
  if (options.callouts) {
    const request = Array.isArray(options.callouts) ? { codes: options.callouts as readonly string[] } : (options.callouts as Omit<CalloutRequest, "box">);
    const spots = layoutCallouts(map, { features: shown, ...request, box });
    callouts = `<g class="cz-callouts">${spots
      .map((spot) => {
        const region = map.regions.find((entry) => entry.code === spot.code) ?? shown.find((entry) => entry.code === spot.code) ?? { name: spot.code };
        const dx = spot.circle[0] - spot.start[0];
        const dy = spot.circle[1] - spot.start[1];
        const length = Math.hypot(dx, dy) || 1;
        // The leader ends at the circle's edge, not its middle.
        const endX = spot.circle[0] - (dx / length) * spot.radius;
        const endY = spot.circle[1] - (dy / length) * spot.radius;
        const words = chizuSay(language, "callout", { n: spot.number, name: nameOf(region, language) });
        return (
          `<g class="cz-callout" data-code="${escape(spot.code)}" data-number="${spot.number}"${interactive ? ` data-interactive="true"` : ""}>` +
          `<title>${escape(words)}</title>` +
          `<line class="cz-leader" x1="${num(spot.start[0])}" y1="${num(spot.start[1])}" x2="${num(endX)}" y2="${num(endY)}"/>` +
          `<circle class="cz-start" cx="${num(spot.start[0])}" cy="${num(spot.start[1])}" r="${num(spot.radius * 0.18)}"/>` +
          `<circle class="cz-callout-circle" cx="${num(spot.circle[0])}" cy="${num(spot.circle[1])}" r="${num(spot.radius)}"/>` +
          `<text class="cz-callout-number" x="${num(spot.circle[0])}" y="${num(spot.circle[1])}" font-size="${num(spot.radius * 1.15)}">${spot.number}</text>` +
          `</g>`
        );
      })
      .join("")}</g>`;
  }

  const label = options.label ?? chizuSay(language, "map", { name: language === "ja" ? (map.nameJa ?? map.name) : map.name });
  const style = options.style ? `<style>${CHIZU_STYLE}</style>` : "";
  // A sea is drawn where it is, so the boxes a map draws its far islands in are given the plain sea again over it.
  const boxSea = shown.some((feature) => feature.group === "marine")
    ? map.insets.map((inset) => `<rect class="cz-inset-sea" x="${num(inset.box.x)}" y="${num(inset.box.y)}" width="${num(inset.box.width)}" height="${num(inset.box.height)}"/>`).join("")
    : "";
  const named = shown.length > 0 && options.featureLabels !== false ? featureLabels(shown, box, offsets, { language, tones }) : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="chizu" viewBox="${num(box.x)} ${num(box.y)} ${num(box.width)} ${num(box.height)}" role="${interactive ? "group" : "img"}" aria-label="${escape(label)}" data-map="${escape(map.id)}">` +
    style +
    `<rect class="cz-sea" x="${num(box.x)}" y="${num(box.y)}" width="${num(box.width)}" height="${num(box.height)}"/>` +
    layerOf("marine") +
    boxSea +
    copies +
    layerOf("landforms") +
    layerOf("lakes") +
    layerOf("rivers") +
    layerOf("peaks") +
    layerOf("capitals") +
    frames +
    labels +
    named +
    callouts +
    `</svg>`
  );
}

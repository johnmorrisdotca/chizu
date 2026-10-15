import { isChizuColour } from "./draw.ts";
import { calloutsSvg } from "./drawCallouts.ts";
import { wholeMapBox } from "./frame.ts";
import { layoutCallouts, type CalloutRequest } from "./layout.ts";
import type { ChizuLocalMap } from "./localMap.ts";
import type { ChizuLocalShape } from "./localGeo.ts";
import { CHIZU_LOCAL_STYLE } from "./localStyle.ts";
import { mapOutlines } from "./outlines.ts";
import { chizuSay, nameOf, type ChizuLanguage } from "./strings.ts";
import { CHIZU_STYLE } from "./style.ts";
import type { MapBox } from "./types.ts";

/**
 * How one shape of a local map looks, over the look of its kind: colours as `drawChizu`'s `colors` takes them (hex, a CSS
 * name, `rgb()`, `hsl()` or `var(--name)`, anything else ignored), with a second for the dark look, and the classes
 * and custom properties of your own.
 *
 * @example
 * ```ts
 * import type { ChizuLocalStyle } from "@johnmorrisdotca/chizu/draw";
 *
 * const stand: ChizuLocalStyle = { fill: "#d9a441", dark: { fill: "#7a5a1c" }, stroke: "#5b3b00", strokeWidth: 2, class: "stand" };
 * console.log(Object.keys(stand).join(" "));
 * // fill dark stroke strokeWidth class
 * ```
 */
export type ChizuLocalStyle = {
  fill?: string;
  stroke?: string;
  /** The line's width on the screen, in pixels (0 to 40), the same at every zoom. */
  strokeWidth?: number;
  /** Or its width on the ground, in metres: a road 8 m wide is 8 m wide at every zoom (lines and outlines). */
  widthMetres?: number;
  /** Opacity of the whole shape, 0 to 1. */
  opacity?: number;
  /** Opacity of the fill alone, 0 to 1. */
  fillOpacity?: number;
  /** The colours when the page is dark; they follow the light ones where missing. */
  dark?: { fill?: string; stroke?: string };
  /** Classes added to the shape, for your own CSS: letters, digits, `-` and `_`. */
  class?: string | readonly string[];
  /** Custom properties for your own CSS, `{ "--seat-rows": "12" }`: a name that starts `--`, and a number with its unit or a colour. */
  vars?: Readonly<Record<string, string>>;
};

/**
 * What a drawing of a local map shows beyond the shapes. Every part is optional.
 *
 * @example
 * ```ts
 * import { drawLocal, type ChizuLocalDrawOptions } from "@johnmorrisdotca/chizu/draw";
 * import { localMap } from "@johnmorrisdotca/chizu";
 *
 * const options: ChizuLocalDrawOptions = { style: true, scaleBar: true, credits: ["Shapes made up for this example"] };
 * console.log(drawLocal(localMap({ centre: [139.7, 35.7], widthMetres: 500 }), options).includes("Shapes made up"));
 * // true
 * ```
 */
export type ChizuLocalDrawOptions = {
  /** The window to show, in the canvas's units (as `zoomBox`, `focusBox` and `regionBox` frame a `local` map too). Default: the whole canvas. */
  box?: MapBox;
  language?: ChizuLanguage;
  /** What a screen reader hears of the drawing, instead of "Map of {name}". */
  label?: string;
  /** Put `CHIZU_STYLE` and `CHIZU_LOCAL_STYLE` inside, so the drawing stands alone as an image. */
  style?: boolean;
  /** The look of a shape, by its `kind` (`water`), a class it has, or its id; those that apply are merged in that order, the id last. */
  styles?: Readonly<Record<string, ChizuLocalStyle>>;
  /** A tone for each shape, by id, as `drawChizu`'s `tones`. */
  tones?: Readonly<Record<string, string>>;
  /** Print the names: all that fit, or just these ids. */
  labels?: boolean | readonly string[];
  /** Numbered circles with leader lines to these ids (shapes, pictures), placed by `layoutCallouts` in the open ground. */
  callouts?: readonly string[] | Omit<CalloutRequest, "box">;
  /** Give every shape and picture its `data-code` as a thing to press, with `role="button"` and `tabindex="-1"`. */
  interactive?: boolean;
  /** Draw the pictures. Default true. */
  markers?: boolean;
  /** A scale bar in metres. Default true. */
  scaleBar?: boolean;
  /** More credit lines, after the map's own. */
  credits?: readonly string[];
  /** Begin the credit with chizu's own: the outlines are Natural Earth's (public domain). Say so when the drawing goes beside or over one of its maps. Default false. */
  naturalEarth?: boolean;
};

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (value: number) => String(Math.round(value * 100) / 100);
const LABEL_RATIO = 0.016;
const CREDIT_RATIO = 0.0135;

const safeWord = (value: unknown) => typeof value === "string" && /^[A-Za-z_][\w-]{0,40}$/.test(value);
const safeColour = (value: unknown) => (typeof value === "string" && isChizuColour(value) ? value.trim() : null);
const unit01 = (value: unknown) => (typeof value === "number" && value >= 0 && value <= 1 ? value : null);
const SAFE_VAR_VALUE = /^(?:-?\d{1,6}(?:\.\d{1,4})?(?:px|%|em|rem|deg)?|(#[0-9a-f]{3,8}|[a-z]{3,30}|(?:rgb|hsl)a?\([0-9a-z.,%\s/+-]{1,60}\)|var\(--[a-z0-9_-]{1,40}\)))$/i;

/** A distance in metres in words: 40 m, 1.5 km. */
export function metresText(metres: number): string {
  if (metres >= 1000) return `${Math.round(metres / 100) / 10} km`;
  return `${metres < 10 ? Math.round(metres * 10) / 10 : Math.round(metres)} m`;
}

/** The longest round length (1, 2 or 5 times a power of ten) that is no more than `most`. */
function roundLength(most: number): number {
  const power = 10 ** Math.floor(Math.log10(most));
  return [5, 2, 1].map((step) => step * power).find((length) => length <= most) ?? power;
}

/** The look merged from the styles that apply to a shape, as a style attribute, the classes it adds and whether it is measured in metres. */
function lookOf(shape: ChizuLocalShape, styles: Readonly<Record<string, ChizuLocalStyle>>, metresPerUnit: number): { style: string; classes: string[] } {
  const keys = [...(shape.type ? [shape.type] : []), ...shape.classes, shape.id];
  const merged: ChizuLocalStyle = {};
  const classes: string[] = [];
  for (const key of keys) {
    if (!Object.hasOwn(styles, key)) continue;
    const one = styles[key]!;
    Object.assign(merged, { ...one, dark: { ...merged.dark, ...one.dark }, vars: { ...merged.vars, ...one.vars } });
    classes.push(...(Array.isArray(one.class) ? one.class : typeof one.class === "string" ? one.class.split(/\s+/) : []).filter(safeWord));
  }
  const parts: string[] = [];
  const set = (name: string, value: string | null) => value && parts.push(`${name}:${value}`);
  set("--cz-fill", safeColour(merged.fill));
  set("--cz-stroke", safeColour(merged.stroke));
  set("--cz-fill-dark", safeColour(merged.dark?.fill));
  set("--cz-stroke-dark", safeColour(merged.dark?.stroke));
  if (typeof merged.widthMetres === "number" && merged.widthMetres > 0 && merged.widthMetres <= 100_000) {
    set("--cz-stroke-width", `${Math.round((merged.widthMetres / metresPerUnit) * 1000) / 1000}px`);
    classes.push("cz-metric");
  } else if (typeof merged.strokeWidth === "number" && merged.strokeWidth >= 0 && merged.strokeWidth <= 40) set("--cz-stroke-width", `${merged.strokeWidth}px`);
  set("--cz-opacity", unit01(merged.opacity) === null ? null : String(merged.opacity));
  set("--cz-fill-opacity", unit01(merged.fillOpacity) === null ? null : String(merged.fillOpacity));
  for (const [name, value] of Object.entries(merged.vars ?? {})) if (/^--[A-Za-z][\w-]{0,40}$/.test(name) && typeof value === "string" && SAFE_VAR_VALUE.test(value.trim())) parts.push(`${name}:${value.trim()}`);
  return { style: parts.join(";"), classes };
}

const meets = (bbox: readonly number[], box: MapBox, margin: number) => bbox[2]! >= box.x - margin && bbox[0]! <= box.x + box.width + margin && bbox[3]! >= box.y - margin && bbox[1]! <= box.y + box.height + margin;

/** A name that fits the width given, in characters of its size, else cut with an ellipsis. */
function fitted(text: string, size: number, room: number, ja: boolean): { text: string; size: number } {
  const width = (value: string, s: number) => value.length * s * (ja ? 1 : 0.52);
  let s = size;
  if (width(text, s) > room) s = Math.max(size * 0.7, room / (text.length * (ja ? 1 : 0.52)));
  let out = text;
  while (out.length > 1 && width(out, s) > room) out = `${out.slice(0, Math.max(1, Math.floor(room / (s * (ja ? 1 : 0.52))) - 1))}…`;
  return { text: out, size: s };
}

/**
 * A local map as SVG text: the ground, the caller's shapes in the order given (areas, lines, points), the pictures at
 * their places, true size and bearing, and optionally names, numbered callouts, a scale bar in metres and the credit
 * lines. A string, like `drawChizu`'s, so it works on a server, in a build step and in `innerHTML`; the look is
 * `CHIZU_STYLE` and `CHIZU_LOCAL_STYLE` (`style: true` carries both inside).
 *
 * Nothing is fetched. A unit of the canvas is `data-metres-per-unit` metres, written on the `<svg>`, and the viewBox
 * is in those units, so the window `box` is chosen with the same `zoomBox`, `focusBox` and `regionBox` as any map. The
 * pictures are the caller's own markup, cleaned of scripts and outside references (`ChizuLocalMarkerInput`).
 *
 * @param map - The local map to draw, from `localMap`.
 * @param options - What to draw besides the shapes: labels, callouts, the scale bar, language and `style`.
 * @returns The drawing, as SVG text.
 *
 * @example
 * ```ts
 * import { drawLocal } from "@johnmorrisdotca/chizu/draw";
 * import { localMap } from "@johnmorrisdotca/chizu";
 *
 * const map = localMap({
 *   centre: [139.7006, 35.7004],
 *   widthMetres: 400,
 *   data: { type: "Feature", id: "hall", properties: { name: "Hall", kind: "building" }, geometry: { type: "Polygon", coordinates: [[[139.6998, 35.6999], [139.7014, 35.6999], [139.7014, 35.7009], [139.6998, 35.7009], [139.6998, 35.6999]]] } },
 *   credits: ["Shapes made up for this example"],
 * });
 * const svg = drawLocal(map, { labels: true, style: true });
 * console.log(svg.startsWith("<svg"), svg.includes('data-type="building"'), svg.includes("Shapes made up"));
 * // true true true
 * ```
 */
export function drawLocal(map: ChizuLocalMap, options: ChizuLocalDrawOptions = {}): string {
  const language = options.language ?? "en";
  const ja = language === "ja";
  const box = options.box ?? wholeMapBox(map);
  const projection = map.projection.kind === "local" ? map.projection : null;
  const mpu = projection?.metresPerUnit ?? 1;
  const tones = options.tones ?? {};
  const styles = options.styles ?? {};
  const interactive = options.interactive === true;
  const margin = box.width * 0.02;
  const nameFor = (item: { name?: string; nameJa?: string; id: string }) => nameOf({ name: item.name ?? item.id, nameJa: item.nameJa }, language);

  // The shapes, in the order given.
  const drawn: string[] = [];
  for (const shape of map.shapes) {
    if (!meets(shape.bbox, box, margin)) continue;
    const tone = Object.hasOwn(tones, shape.id) ? tones[shape.id] : undefined;
    const look = lookOf(shape, styles, mpu);
    const name = shape.name || shape.nameJa ? nameFor(shape) : null;
    const attributes =
      `class="cz-local-shape cz-local-${shape.kind}-shape${shape.classes.length ? ` ${shape.classes.join(" ")}` : ""}${look.classes.length ? ` ${[...new Set(look.classes)].join(" ")}` : ""}${tone ? ` cz-tone-${escape(tone)}` : ""}" data-code="${escape(shape.id)}" data-kind="${shape.kind}"` +
      (shape.type ? ` data-type="${shape.type}"` : "") +
      (tone ? ` data-tone="${escape(tone)}"` : "") +
      (look.style ? ` style="${escape(look.style)}"` : "") +
      (interactive ? ` data-interactive="true" role="button" tabindex="-1" aria-label="${escape(name ?? shape.id)}"` : "");
    const title = name ? `<title>${escape(name)}</title>` : "";
    if (shape.kind === "area") drawn.push(`<g ${attributes}>${title}<path class="cz-local-area" d="${shape.path}"/></g>`);
    else if (shape.kind === "line") drawn.push(`<g ${attributes}>${title}${interactive ? `<path class="cz-local-hit" d="${shape.path}"/>` : ""}<path class="cz-local-line" d="${shape.path}"/></g>`);
    else drawn.push(`<g ${attributes}>${title}<circle class="cz-local-point" cx="${num(shape.centroid[0])}" cy="${num(shape.centroid[1])}" r="${num(box.width * 0.006)}"/></g>`);
  }

  // The pictures.
  const pictures: string[] = [];
  if (options.markers !== false) {
    for (const marker of map.markers) {
      if (!meets(marker.bbox, box, margin)) continue;
      const name = marker.name || marker.nameJa ? nameFor(marker) : null;
      const move = `translate(${num(marker.at[0])} ${num(marker.at[1])})${marker.rotation ? ` rotate(${marker.rotation})` : ""} scale(${marker.scale}) translate(${-marker.anchor[0]} ${-marker.anchor[1]})`;
      pictures.push(
        `<g class="cz-marker${marker.classes.length ? ` ${marker.classes.join(" ")}` : ""}" data-code="${escape(marker.id)}" data-bearing="${marker.bearing}" transform="${move}"` +
          (interactive ? ` data-interactive="true" role="button" tabindex="-1" aria-label="${escape(name ?? marker.id)}"` : "") +
          `>${name ? `<title>${escape(name)}</title>` : ""}${marker.markup}</g>`,
      );
    }
  }

  // The credit lines and the scale bar sit in the bottom-right corner, and the callouts keep out of it.
  const cs = box.width * CREDIT_RATIO;
  const gap = box.width * 0.012;
  const creditLines = [...(options.naturalEarth ? [chizuSay(language, "creditNaturalEarth")] : []), ...map.credits, ...(options.credits ?? [])].filter((line) => typeof line === "string" && line.trim() !== "");
  const creditText = creditLines.map((line) => fitted(line, cs, box.width - gap * 2, ja));
  const lineHeight = cs * 1.35;
  const right = box.x + box.width - gap;
  const bottom = box.y + box.height - gap;
  const credits = creditText
    .map((line, i) => `<text class="cz-credit" x="${num(right)}" y="${num(bottom - (creditText.length - 1 - i) * lineHeight - cs * 0.2)}" font-size="${num(line.size)}">${escape(line.text)}</text>`)
    .join("");
  const creditsTop = bottom - creditText.length * lineHeight;
  let scale = "";
  let scaleWidth = 0;
  let scaleHeight = 0;
  if (options.scaleBar !== false && projection) {
    const metres = roundLength(box.width * mpu * 0.22);
    const length = metres / mpu;
    const y = creditsTop - (creditText.length ? cs * 0.5 : 0) - cs * 0.3;
    const tick = cs * 0.55;
    const words = metresText(metres);
    scale =
      `<g class="cz-scale" data-metres="${metres}"><path class="cz-scale-line" d="M${num(right - length)},${num(y - tick)}L${num(right - length)},${num(y)}L${num(right)},${num(y)}L${num(right)},${num(y - tick)}"/>` +
      `<text class="cz-scale-text" x="${num(right)}" y="${num(y - tick - cs * 0.25)}" font-size="${num(cs * 1.05)}">${escape(words)}</text></g>`;
    scaleWidth = Math.max(length, words.length * cs * 0.6);
    scaleHeight = box.y + box.height - (y - tick - cs * 1.4);
  }
  const keepWidth = Math.max(scaleWidth, ...creditText.map((line) => line.text.length * line.size * (ja ? 1 : 0.52))) + gap * 2;
  const keepHeight = Math.max(scaleHeight, creditText.length * lineHeight + gap * 2);
  const crowded = creditText.length > 0 || scaleWidth > 0;

  // The names.
  let labels = "";
  if (options.labels) {
    const size = box.width * LABEL_RATIO;
    const only = options.labels === true ? null : new Set(options.labels.map(String));
    const outlines = mapOutlines(map);
    const placed: Array<[number, number, number, number]> = [];
    const parts: string[] = [];
    type Candidate = { id: string; text: string; x: number; y: number; start: boolean; weight: number; room: number };
    const candidates: Candidate[] = [];
    for (const shape of map.shapes) {
      if (!shape.name && !shape.nameJa) continue;
      if (only !== null && !only.has(shape.id)) continue;
      const text = nameFor(shape);
      if (shape.kind === "area") {
        const index = map.regions.findIndex((region) => region.code === shape.id);
        const outline = outlines[index];
        const at = outline?.anchor ?? shape.centroid;
        const widest = Math.max(0, ...(outline?.rings ?? []).map((ring) => ring.maxX - ring.minX));
        candidates.push({ id: shape.id, text, x: at[0], y: at[1], start: false, weight: widest, room: widest * 1.15 });
      } else if (shape.kind === "line") candidates.push({ id: shape.id, text, x: shape.centroid[0], y: shape.centroid[1], start: false, weight: 0, room: Infinity });
      else candidates.push({ id: shape.id, text, x: shape.centroid[0] + size * 0.9, y: shape.centroid[1], start: true, weight: 0, room: Infinity });
    }
    if (options.markers !== false) {
      for (const marker of map.markers) {
        if (!marker.name && !marker.nameJa) continue;
        if (only !== null && !only.has(marker.id)) continue;
        candidates.push({ id: marker.id, text: nameFor(marker), x: marker.at[0], y: marker.at[1], start: false, weight: 0, room: Infinity });
      }
    }
    // The explicitly asked-for first, then the larger areas.
    candidates.sort((a, b) => b.weight - a.weight);
    for (const c of candidates) {
      const wide = c.text.length * size * (ja ? 1 : 0.55);
      if (only === null && wide > c.room) continue;
      if (c.x < box.x || c.x > box.x + box.width || c.y < box.y || c.y > box.y + box.height) continue;
      const rect: [number, number, number, number] = c.start ? [c.x, c.y - size / 2, c.x + wide, c.y + size / 2] : [c.x - wide / 2, c.y - size / 2, c.x + wide / 2, c.y + size / 2];
      if (only === null && placed.some((other) => rect[0] < other[2] && rect[2] > other[0] && rect[1] < other[3] && rect[3] > other[1])) continue;
      placed.push(rect);
      parts.push(`<text class="cz-label cz-local-label${c.start ? " cz-local-label-start" : ""}" x="${num(c.x)}" y="${num(c.y)}" font-size="${num(size)}" data-code="${escape(c.id)}">${escape(c.text)}</text>`);
    }
    labels = parts.length ? `<g class="cz-labels">${parts.join("")}</g>` : "";
  }

  // The numbered circles.
  let callouts = "";
  if (options.callouts) {
    const request = Array.isArray(options.callouts) ? { codes: options.callouts as readonly string[] } : (options.callouts as Omit<CalloutRequest, "box">);
    const others = [...map.shapes.filter((shape) => shape.kind !== "area"), ...(options.markers === false ? [] : map.markers)].map((one) => ({ code: one.id, centroid: "at" in one ? one.at : one.centroid }));
    const keepOut = crowded ? { bottom: Math.max(request.keepOut?.bottom ?? 0, keepWidth), right: Math.max(request.keepOut?.right ?? 0, keepHeight) } : request.keepOut;
    const spots = layoutCallouts(map, { features: others, ...request, ...(keepOut ? { keepOut } : {}), box });
    const named = (code: string) => {
      const found = map.shapes.find((shape) => shape.id === code) ?? map.markers.find((marker) => marker.id === code);
      return found ? { name: found.name ?? found.id, nameJa: found.nameJa } : undefined;
    };
    callouts = calloutsSvg(spots, named, language, interactive);
  }

  const size = metresText(box.width * mpu);
  const label = options.label ?? (map.name || map.nameJa ? chizuSay(language, "map", { name: ja ? (map.nameJa ?? map.name) : map.name || map.nameJa || "" }) : chizuSay(language, "localMap", { size }));
  const style = options.style ? `<style>${CHIZU_STYLE}${CHIZU_LOCAL_STYLE}</style>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" class="chizu cz-local" viewBox="${num(box.x)} ${num(box.y)} ${num(box.width)} ${num(box.height)}" role="${interactive ? "group" : "img"}" aria-label="${escape(label)}" data-map="${escape(map.id)}" data-metres-per-unit="${mpu}">` +
    style +
    `<rect class="cz-ground" x="${num(box.x)}" y="${num(box.y)}" width="${num(box.width)}" height="${num(box.height)}"/>` +
    drawn.join("") +
    pictures.join("") +
    labels +
    callouts +
    scale +
    credits +
    `</svg>`
  );
}

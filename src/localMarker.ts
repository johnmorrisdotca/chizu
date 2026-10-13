/**
 * A PICTURE PLACED ON A LOCAL MAP: some SVG (a pitch, a court, a rink, a building's plan) drawn in its own units, put at
 * a longitude and latitude, scaled so that its units are real metres on the ground, and turned to a bearing. The picture
 * is the caller's own markup, and it is embedded in the drawing, so it is cleaned on the way in: only the shapes, text,
 * gradients, clips and masks of SVG are kept, and no script, event attribute, style sheet, foreign object, animation,
 * image or reference to anything outside the picture (a `url(...)` or an `href` that is not `#id`). Nothing is fetched.
 */

const ELEMENTS = ["g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "tspan", "defs", "linearGradient", "radialGradient", "stop", "clipPath", "mask", "pattern", "symbol", "title", "desc", "use"];
const CANON = new Map(ELEMENTS.map((name) => [name.toLowerCase(), name]));
/** Elements whose content goes with them. */
const DROPPED = new Set(["script", "style", "foreignobject", "iframe", "object", "embed", "image", "audio", "video", "animate", "animatetransform", "animatemotion", "set", "canvas", "link", "meta"]);
const TEXTUAL = new Set(["text", "tspan", "title", "desc"]);
const REFERENCES = new Set(["href", "xlink:href"]);

const escapeText = (text: string) => text.replace(/&(?!(?:amp|lt|gt|quot|apos);)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const NAMED_ONLY = /&(?!(?:amp|lt|gt|quot|apos);)/;
const BAD_VALUE = /javascript:|vbscript:|data:|@import|expression\s*\(|behavior\s*:|<|>/i;

/** A value kept, or null: no script, no outside reference, no entity but the five named ones; ids prefixed so two pictures cannot meet. */
function cleanValue(name: string, raw: string, prefix: string): string | null {
  if (NAMED_ONLY.test(raw) || BAD_VALUE.test(raw)) return null;
  if (REFERENCES.has(name)) return /^#[\w.:-]{1,80}$/.test(raw.trim()) ? `#${prefix}${raw.trim().slice(1)}` : null;
  if (name === "id") return /^[\w.:-]{1,80}$/.test(raw) ? `${prefix}${raw}` : null;
  let ok = true;
  const referenced = raw.replace(/url\(\s*(['"]?)#([\w.:-]{1,80})\1\s*\)/gi, (_whole, _quote: string, id: string) => `url(#${prefix}${id})`);
  if (/url\s*\(/i.test(referenced.replace(/url\(#[^)]*\)/gi, ""))) ok = false;
  return ok ? referenced.replace(/"/g, "&quot;") : null;
}

/** The markup of a picture, cleaned: `prefix` goes before every id in it. */
export function cleanSvgMarkup(markup: string, prefix: string): string {
  const source = markup.replace(/<!--[\s\S]*?-->/g, "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_whole, text: string) => escapeText(text)).replace(/<![^>]*>/g, "").replace(/<\?[\s\S]*?\?>/g, "");
  const tag = /<(\/?)([A-Za-z][\w:.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  const out: string[] = [];
  const stack: Array<{ name: string; emitted: boolean }> = [];
  let skip: { name: string; depth: number } | null = null;
  let last = 0;
  const text = (end: number) => {
    const piece = source.slice(last, end);
    if (!skip && piece.trim() !== "" && stack.some((entry) => entry.emitted && TEXTUAL.has(entry.name))) out.push(escapeText(piece));
  };
  for (let match = tag.exec(source); match; match = tag.exec(source)) {
    text(match.index);
    last = match.index + match[0].length;
    const closing = match[1] === "/";
    const lower = match[2]!.toLowerCase().replace(/^svg:/, "");
    const selfClosing = match[4] === "/";
    if (skip) {
      if (lower === skip.name) {
        if (closing) skip.depth -= 1;
        else if (!selfClosing) skip.depth += 1;
        if (skip.depth === 0) skip = null;
      }
      continue;
    }
    if (closing) {
      let at = stack.length - 1;
      while (at >= 0 && stack[at]!.name !== lower) at -= 1;
      if (at < 0) continue;
      while (stack.length > at) {
        const entry = stack.pop()!;
        if (entry.emitted) out.push(`</${CANON.get(entry.name)}>`);
      }
      continue;
    }
    if (DROPPED.has(lower)) {
      if (!selfClosing) skip = { name: lower, depth: 1 };
      continue;
    }
    const canonical = CANON.get(lower);
    if (!canonical) {
      // An element of no use here (an `a`, a `switch`, a stray `svg`) goes; what is inside it stays.
      if (!selfClosing) stack.push({ name: lower, emitted: false });
      continue;
    }
    const attributes: string[] = [];
    let hasHref = false;
    for (const attribute of match[3]!.matchAll(/([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
      const name = attribute[1]!;
      if (!/^[A-Za-z][\w:.-]*$/.test(name) || /^on/i.test(name) || /^xmlns/i.test(name)) continue;
      const value = attribute[2] ?? attribute[3] ?? attribute[4] ?? "";
      const kept = cleanValue(name.toLowerCase() === "xlink:href" ? "xlink:href" : name.toLowerCase() === "href" ? "href" : name, value, prefix);
      if (kept === null) continue;
      if (REFERENCES.has(name.toLowerCase())) hasHref = true;
      attributes.push(` ${name}="${kept}"`);
    }
    if (canonical === "use" && !hasHref) {
      if (!selfClosing) stack.push({ name: lower, emitted: false });
      continue;
    }
    out.push(`<${canonical}${attributes.join("")}${selfClosing ? "/>" : ">"}`);
    if (!selfClosing) stack.push({ name: lower, emitted: true });
  }
  text(source.length);
  while (stack.length > 0) {
    const entry = stack.pop()!;
    if (entry.emitted) out.push(`</${CANON.get(entry.name)}>`);
  }
  return out.join("");
}

/** The viewBox of an SVG element's attributes: from `viewBox`, else from `width` and `height` in plain numbers. */
function viewBoxOf(attributes: string): [number, number, number, number] | null {
  const box = /\bviewBox\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attributes);
  const numbers = (box?.[1] ?? box?.[2] ?? "").trim().split(/[\s,]+/).map(Number);
  if (numbers.length === 4 && numbers.every(Number.isFinite) && numbers[2]! > 0 && numbers[3]! > 0) return numbers as [number, number, number, number];
  const w = Number(/\bwidth\s*=\s*"?([\d.]+)(?:px)?"?/i.exec(attributes)?.[1]);
  const h = Number(/\bheight\s*=\s*"?([\d.]+)(?:px)?"?/i.exec(attributes)?.[1]);
  return w > 0 && h > 0 ? [0, 0, w, h] : null;
}

/**
 * A picture split into its markup and its viewBox: a whole `<svg viewBox="…">…</svg>` string, or bare markup with the
 * viewBox given. `null` when neither says how big it is.
 */
export function splitPicture(svg: string, viewBox?: readonly number[]): { markup: string; viewBox: [number, number, number, number] } | null {
  const whole = /^\s*(?:<\?xml[\s\S]*?\?>\s*)?<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/i.exec(svg);
  if (whole) {
    const box = viewBox && viewBox.length === 4 && viewBox.every(Number.isFinite) && viewBox[2]! > 0 && viewBox[3]! > 0 ? (viewBox as [number, number, number, number]) : viewBoxOf(whole[1]!);
    return box ? { markup: whole[2]!, viewBox: box } : null;
  }
  if (viewBox && viewBox.length === 4 && viewBox.every(Number.isFinite) && viewBox[2]! > 0 && viewBox[3]! > 0) return { markup: svg, viewBox: viewBox as [number, number, number, number] };
  return null;
}

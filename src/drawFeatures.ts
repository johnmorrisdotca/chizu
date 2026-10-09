import { chizuSay, featureKindName, nameOf, type ChizuLanguage } from "./strings.ts";
import type { ChizuFeature, ChizuFeatureGroup, MapBox } from "./types.ts";

/**
 * THE FEATURES' PART OF A DRAWING, for `drawChizu`: the seas under the land, the landforms, lakes, rivers and peaks on
 * it, and their names, placed so that no two overlap. Kept apart from draw.ts, which reads only what it is handed.
 */

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (value: number) => String(Math.round(value * 100) / 100);

/** A river's line on the screen, in pixels, by its rank: the great rivers thickest, and the same width at every zoom. */
export function riverWidth(rank: number): number {
  return rank <= 1 ? 2.4 : rank <= 3 ? 1.9 : rank <= 5 ? 1.5 : rank <= 7 ? 1.2 : 0.9;
}

/** The attributes a feature's group carries: its class, code, kind, tone and, when the drawing is to be pressed, its role. */
function attributes(feature: ChizuFeature, tone: string | undefined, interactive: boolean, language: ChizuLanguage): string {
  const pressable = interactive && feature.group !== "landforms";
  return (
    `class="cz-feature cz-${feature.group}${tone ? ` cz-tone-${escape(tone)}` : ""}" data-code="${escape(feature.code)}" data-kind="${feature.kind}" data-group="${feature.group}"` +
    (tone ? ` data-tone="${escape(tone)}"` : "") +
    (pressable ? ` data-interactive="true" role="button" tabindex="-1" aria-label="${escape(chizuSay(language, "feature", { name: nameOf(feature, language), kind: featureKindName(feature.kind, language) }))}"` : "")
  );
}

/** A peak's mark: a small triangle standing on the point, `size` tall. */
const peakMark = (x: number, y: number, size: number) => `M${num(x)},${num(y - size * 0.65)}L${num(x + size * 0.55)},${num(y + size * 0.35)}L${num(x - size * 0.55)},${num(y + size * 0.35)}Z`;

/**
 * The shapes of the features of one group, as SVG: a `<g class="cz-feature" data-code="…">` each, with its `<title>`.
 * Peaks are sized from the window, so they keep their size on the screen as the map is zoomed.
 */
export function featureShapes(features: readonly ChizuFeature[], group: ChizuFeatureGroup, box: MapBox, options: { language: ChizuLanguage; tones: Readonly<Record<string, string>>; interactive: boolean }): string {
  const peak = box.width * 0.012;
  return features
    .filter((feature) => feature.group === group)
    .map((feature) => {
      const open = `<g ${attributes(feature, options.tones[feature.code], options.interactive, options.language)}><title>${escape(nameOf(feature, options.language))}</title>`;
      if (group === "rivers") {
        // A wide, unseen line under the river, so a finger can press a line a pixel or two wide.
        return `${open}<path class="cz-river-hit" d="${feature.path}"/><path class="cz-river" d="${feature.path}" stroke-width="${riverWidth(feature.rank)}"/></g>`;
      }
      if (group === "peaks") return `${open}<path class="cz-peak" d="${peakMark(feature.centroid[0], feature.centroid[1], peak)}"/></g>`;
      const shape = group === "marine" ? "cz-marine-area" : group === "lakes" ? "cz-lake" : "cz-landform-area";
      return `${open}<path class="${shape}" d="${feature.path}"/></g>`;
    })
    .join("");
}

/** The share of the window's width a feature's name is printed at, by its group and rank. */
function labelRatio(feature: ChizuFeature): number {
  if (feature.group === "marine") return feature.rank <= 0 ? 0.021 : feature.rank <= 1 ? 0.016 : feature.rank <= 3 ? 0.014 : 0.012;
  if (feature.group === "peaks") return 0.011;
  return feature.rank <= 2 ? 0.014 : 0.012;
}

type Placed = { x0: number; y0: number; x1: number; y1: number };

/**
 * The features' names, in a window: the toned ones first, then by rank, each only where it fits (a sea's name inside
 * its sea, a river's no longer than the river) and where it overlaps no name already placed. A river's name runs along
 * it; a sea's or a lake's is italic, a landform's spaced out, a peak's beside its mark.
 */
export function featureLabels(features: readonly ChizuFeature[], box: MapBox, offsets: readonly number[], options: { language: ChizuLanguage; tones: Readonly<Record<string, string>> }): string {
  const ja = options.language === "ja";
  const order = [...features].sort((a, b) => Number(options.tones[b.code] !== undefined) - Number(options.tones[a.code] !== undefined) || a.rank - b.rank || a.code.localeCompare(b.code));
  const placed: Placed[] = [];
  const parts: string[] = [];
  for (const feature of order) {
    const toned = options.tones[feature.code] !== undefined;
    const name = nameOf(feature, options.language);
    const [bx0, by0, bx1, by1] = feature.bbox;
    const span = (feature.group === "rivers" ? Math.hypot(bx1 - bx0, by1 - by0) * 0.9 : (bx1 - bx0) * 1.2) || Infinity;
    // A name too long for its feature is printed smaller, down to three-fifths of its size, and left off past that.
    const full = box.width * labelRatio(feature);
    const fit = feature.group === "peaks" || toned ? 1 : Math.min(1, span / (name.length * full * (ja ? 1 : 0.56)));
    if (fit < 0.6) continue;
    const size = full * fit;
    const wide = name.length * size * (ja ? 1 : 0.56);
    for (const offset of offsets) {
      const x = feature.centroid[0] + offset;
      const y = feature.centroid[1];
      if (x < box.x || x > box.x + box.width || y < box.y || y > box.y + box.height) continue;
      const angle = feature.angle ?? 0;
      const radians = (angle * Math.PI) / 180;
      const halfW = (Math.abs(Math.cos(radians)) * wide + Math.abs(Math.sin(radians)) * size) / 2;
      const halfH = (Math.abs(Math.sin(radians)) * wide + Math.abs(Math.cos(radians)) * size) / 2;
      const peak = feature.group === "peaks";
      const at = peak ? { x: x + size * 0.9, y } : { x, y };
      const rect = peak ? { x0: at.x, y0: y - size / 2, x1: at.x + wide, y1: y + size / 2 } : { x0: x - halfW, y0: y - halfH, x1: x + halfW, y1: y + halfH };
      if (!toned && placed.some((other) => rect.x0 < other.x1 && rect.x1 > other.x0 && rect.y0 < other.y1 && rect.y1 > other.y0)) continue;
      placed.push(rect);
      const kind = feature.group === "marine" ? "cz-water-label cz-sea-label" : feature.group === "lakes" || feature.group === "rivers" ? "cz-water-label" : feature.group === "peaks" ? "cz-peak-label" : "cz-landform-label";
      const turn = angle ? ` transform="rotate(${angle} ${num(at.x)} ${num(at.y)})"` : "";
      parts.push(`<text class="cz-feature-label ${kind}" x="${num(at.x)}" y="${num(at.y)}" font-size="${num(size)}" data-code="${escape(feature.code)}"${turn}>${escape(name)}</text>`);
    }
  }
  return parts.length > 0 ? `<g class="cz-feature-labels">${parts.join("")}</g>` : "";
}

import type { CalloutSpot } from "./layout.ts";
import { chizuSay, nameOf, type ChizuLanguage } from "./strings.ts";
import type { ChizuRegion } from "./types.ts";

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const num = (value: number) => String(Math.round(value * 100) / 100);

/**
 * The numbered circles of a drawing as SVG: a `<g class="cz-callout">` for each spot, with its leader, the dot it starts
 * on, its circle and its number. The one place both `drawChizu` and `drawLocal` write them, so they look alike.
 * `named` finds what a spot's code names, for the screen reader's line.
 */
export function calloutsSvg(spots: readonly CalloutSpot[], named: (code: string) => Pick<ChizuRegion, "name" | "nameJa" | "nameShortJa"> | undefined, language: ChizuLanguage, interactive: boolean): string {
  return `<g class="cz-callouts">${spots
    .map((spot) => {
      const region = named(spot.code) ?? { name: spot.code };
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

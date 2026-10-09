import { describe, expect, it } from "vitest";

import de from "./data/divisions/de.ts";
import us from "./data/divisions/us.ts";
import world from "./data/world.ts";
import { drawChizu } from "./draw.ts";
import { regionBox, zoomBox } from "./frame.ts";
import { CHIZU_STYLE } from "./style.ts";

const count = (text: string, pattern: RegExp) => (text.match(pattern) ?? []).length;

describe("a map as SVG text", () => {
  it("is one svg with a sea, and a group of land for each region", () => {
    const svg = drawChizu(de);
    expect(svg.startsWith("<svg ")).toBe(true);
    expect(svg.endsWith("</svg>")).toBe(true);
    expect(svg).toContain('viewBox="0 0 1000 1100"');
    expect(svg).toContain('class="cz-sea"');
    expect(count(svg, /class="cz-region/g)).toBe(de.regions.length);
    expect(svg).toContain('data-code="BY"');
    expect(svg).toContain("<title>Bavaria</title>");
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-label="Map of Germany"');
  });

  it("is well-formed, as far as a parser that only counts tags can tell", () => {
    const svg = drawChizu(world, { labels: true, callouts: ["JP", "BR", "AU"] });
    for (const tag of ["svg", "g", "text", "title"]) expect(count(svg, new RegExp(`<${tag}[ >]`, "g")), tag).toBe(count(svg, new RegExp(`</${tag}>`, "g")));
  });

  it("speaks Japanese when asked, in the names and the label", () => {
    const svg = drawChizu(world, { language: "ja" });
    expect(svg).toContain("<title>アメリカ</title>");
    expect(svg).toContain('aria-label="世界の地図"');
    expect(drawChizu(world)).toContain("<title>United States</title>");
  });

  it("wears a tone on the regions it names, as a class and a data attribute", () => {
    const svg = drawChizu(de, { tones: { BY: "selected", NW: "correct", BE: "faded-out" } });
    expect(svg).toContain('class="cz-region cz-tone-selected" data-code="BY" data-tone="selected"');
    expect(svg).toContain("cz-tone-correct");
    expect(svg).toContain("cz-tone-faded-out");
    expect(count(svg, /data-tone=/g)).toBe(3);
  });

  it("frames a window with its own viewBox, and the sea fills it", () => {
    const box = regionBox(de, "BY", 1.5);
    const svg = drawChizu(de, { box });
    const round = (n: number) => Math.round(n * 100) / 100;
    expect(svg).toContain(`viewBox="${round(box.x)} ${round(box.y)} ${round(box.width)} ${round(box.height)}"`);
    expect(svg).toContain(`<rect class="cz-sea" x="${round(box.x)}"`);
  });

  it("escapes what is written into it", () => {
    const evil = { ...de, regions: [{ ...de.regions[0]!, name: 'A "quoted" <b>name</b> & more', code: 'X"Y' }, ...de.regions.slice(1)] };
    const svg = drawChizu(evil, { label: 'x" onload="y' });
    expect(svg).not.toContain("<b>name");
    expect(svg).toContain("A &quot;quoted&quot; &lt;b&gt;name&lt;/b&gt; &amp; more");
    expect(svg).toContain('data-code="X&quot;Y"');
    expect(svg).toContain('aria-label="x&quot; onload=&quot;y"');
  });

  it("carries its style inside when asked, so it stands alone as an image", () => {
    expect(drawChizu(de, { style: true })).toContain(CHIZU_STYLE.trim().slice(0, 40));
    expect(drawChizu(de)).not.toContain("<style>");
  });

  it("makes a region a thing to press when asked", () => {
    const svg = drawChizu(de, { interactive: true });
    expect(count(svg, /data-interactive="true"/g)).toBe(de.regions.length);
    expect(svg).toContain('role="group"');
    expect(drawChizu(de)).not.toContain("data-interactive");
  });

  it("draws an inset's region in its box, with the box framed with a dashed rect, and the frame can be left off", () => {
    const svg = drawChizu(us);
    expect(svg).toContain('class="cz-inset" data-code="AK"');
    expect(svg).toMatch(/<path class="cz-land" d="[^"]+" transform="translate\([^)]+\) scale\([^)]+\)"\/>/);
    expect(drawChizu(us, { insetFrames: false })).not.toContain("cz-inset");
  });

  it("draws the world once in a window on it, and again on the far side in a window across the seam", () => {
    expect(count(drawChizu(world), /class="cz-land-copy"/g)).toBe(1);
    const across = zoomBox(world, 2, { x: world.width, y: world.height / 2 });
    const svg = drawChizu(world, { box: across });
    expect(count(svg, /class="cz-land-copy"/g)).toBe(2);
    expect(svg).toMatch(/class="cz-land-copy" transform="translate\(1000 0\)"/);
  });

  it("prints names where they fit, in either language", () => {
    const svg = drawChizu(world, { labels: true });
    const big = count(svg, /class="cz-label"/g);
    expect(big).toBeGreaterThan(5);
    expect(big).toBeLessThan(world.regions.length);
    expect(svg).toContain(">Brazil</text>");
    expect(drawChizu(world, { labels: true, language: "ja" })).toContain(">ブラジル</text>");
    // Or exactly the ones asked for, however small.
    expect(count(drawChizu(world, { labels: ["JP", "CY"] }), /class="cz-label"/g)).toBe(2);
  });

  it("numbers callouts: a circle, a leader and a number for each, titled for a screen reader", () => {
    const svg = drawChizu(de, { callouts: ["BY", "NW", "SL"] });
    expect(count(svg, /class="cz-callout"/g)).toBe(3);
    expect(count(svg, /class="cz-leader"/g)).toBe(3);
    expect(count(svg, /class="cz-callout-circle"/g)).toBe(3);
    expect(svg).toContain('data-number="2"');
    expect(svg).toContain("<title>Number 1: Bavaria</title>");
    expect(drawChizu(de, { callouts: ["BY"], language: "ja" })).toContain("1番：バイエルン自由州");
  });

  it("takes a full request for callouts, and draws the same one every time", () => {
    const options = { callouts: { codes: ["BY", "NW", "SL"], numbering: "west-to-east" as const, radiusRatio: 0.04 } };
    expect(drawChizu(de, options)).toBe(drawChizu(de, options));
  });
});

describe("the style", () => {
  it("colours every tone the drawing names, in light and in dark", () => {
    for (const tone of ["selected", "correct", "wrong", "hint", "muted", "faint"]) {
      expect(CHIZU_STYLE).toContain(`.cz-tone-${tone} .cz-land`);
      expect(CHIZU_STYLE).toContain(`--cz-${tone}:`);
    }
    expect(CHIZU_STYLE).toContain("prefers-color-scheme: dark");
    expect(CHIZU_STYLE).toContain(':root[data-theme="dark"] .chizu');
  });

  it("lets nothing in the drawing be selected or dragged", () => {
    expect(CHIZU_STYLE).toContain("user-select: none");
    expect(CHIZU_STYLE).toContain("touch-action: manipulation");
  });
});

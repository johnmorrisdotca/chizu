import { describe, expect, it } from "vitest";
import { drawChizu } from "./draw.ts";
import { wholeMapBox } from "./frame.ts";
import { type ChizuOverlay, overlaysSvg } from "./overlays.ts";
import world from "./world-entry.ts";

const box = wholeMapBox(world);
const count = (text: string, part: string) => text.split(part).length - 1;

describe("overlays", () => {
  it("draw a line across the date line without a gap, the short way round, and at every copy of the world that shows", () => {
    const track: ChizuOverlay = {
      kind: "line",
      points: [
        [0, 150],
        [5, 170],
        [10, -170],
        [15, -150],
      ],
      width: 3,
    };
    const svg = overlaysSvg(world, [track], box);
    const paths = [...svg.matchAll(/class="cz-overlay-line" d="([^"]+)"/g)].map((m) => m[1]!);
    // One unbroken path, drawn here and shifted a world to the left, where its east end shows.
    expect(new Set(paths).size).toBe(1);
    expect(svg).toContain('stroke-width="3"');
    expect(svg).toContain('vector-effect="non-scaling-stroke"');
    const xs = [...paths[0]!.matchAll(/[ML](-?[\d.]+) /g)].map((m) => Number(m[1]));
    // Each step is short: 20 degrees across the date line, not 340 the long way.
    for (let at = 1; at < xs.length; at += 1) expect(Math.abs(xs[at]! - xs[at - 1]!)).toBeLessThan(world.width / 6);
    expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(world.width / 2);
  });

  it("take 350 to 10 as 20 degrees east, and fold a mark given turns round the world", () => {
    const svg = overlaysSvg(
      world,
      [
        {
          kind: "line",
          points: [
            [0, 350],
            [0, 10],
          ],
        },
        { kind: "mark", at: [0, 720 + 10], id: "far" },
      ],
      box,
    );
    const xs = [.../class="cz-overlay-line" d="M(-?[\d.]+) [\d.-]+L(-?[\d.]+)/.exec(svg)!.slice(1)].map(Number);
    expect(Math.abs(xs[1]! - xs[0]!)).toBeLessThan(world.width / 10);
    const plain = overlaysSvg(world, [{ kind: "mark", at: [0, 10], id: "far" }], box);
    expect(svg.slice(svg.indexOf('data-id="far"'))).toBe(plain.slice(plain.indexOf('data-id="far"')));
  });

  it("hold a latitude past a pole to it, rather than leave the point out", () => {
    const ring: ChizuOverlay = {
      kind: "area",
      ring: [
        [60, -180],
        [60, 180],
        [90.0000001, 180],
        [90.0000001, -180],
      ],
    };
    expect(overlaysSvg(world, [ring], box)).toContain("cz-overlay-area");
  });

  it("fill a ring whose longitudes run on (170 to 190) as a narrow shape, and only a jumping one round the map", () => {
    const width = (svg: string) => {
      const xs = [.../class="cz-overlay-area" d="([^"]+)"/.exec(svg)![1]!.matchAll(/[ML](-?[\d.]+) /g)].map((m) =>
        Number(m[1]),
      );
      return Math.max(...xs) - Math.min(...xs);
    };
    const ring = (west: number, east: number): ChizuOverlay => ({
      kind: "area",
      ring: [
        [10, west],
        [10, east],
        [-10, east],
        [-10, west],
      ],
    });
    expect(width(overlaysSvg(world, [ring(170, 190)], box))).toBeLessThan(world.width / 10);
    expect(width(overlaysSvg(world, [ring(170, -170)], box))).toBeGreaterThan(world.width / 2);
  });

  it("draw a mark as a dot of the size asked, whatever the map's scale, with its label escaped", () => {
    const svg = overlaysSvg(
      world,
      [{ kind: "mark", at: [35.68, 139.69], label: "Tokyo <ISS>", size: 10, color: "#c33", id: "iss" }],
      box,
    );
    expect(svg).toContain('class="cz-overlay-mark" data-id="iss" style="--cz-overlay:#c33"');
    expect(svg).toContain('stroke-width="10" stroke-linecap="round"');
    expect(svg).toContain("Tokyo &lt;ISS&gt;");
  });

  it("fill an area as a closed ring, at the opacity asked, so the night side can be shaded", () => {
    const night: ChizuOverlay = {
      kind: "area",
      ring: [
        [60, -180],
        [-60, 0],
        [60, 180],
        [-90, 180],
        [-90, -180],
      ],
      opacity: 0.4,
    };
    const svg = overlaysSvg(world, [night], box);
    expect(count(svg, 'class="cz-overlay-area"')).toBeGreaterThan(0);
    expect(svg).toMatch(/class="cz-overlay-area" d="M[^"]+Z"/);
    // Through a variable the stylesheet reads, so it is not overridden by the style's own default.
    expect(svg).toContain("--cz-overlay-opacity:0.4");
  });

  it("leave out what cannot be drawn: points that are not numbers, a short ring, an unsafe colour", () => {
    const svg = overlaysSvg(
      world,
      [
        { kind: "mark", at: [Number.NaN, 0] },
        { kind: "mark", at: [0, Number.POSITIVE_INFINITY] },
        {
          kind: "area",
          ring: [
            [0, 0],
            [1, 1],
          ],
        },
        { kind: "line", points: [[0, 0]] },
        { kind: "mark", at: [0, 0], color: "red;}<script>" },
      ] as ChizuOverlay[],
      box,
    );
    expect(svg).not.toContain("cz-overlay-area");
    expect(svg).not.toContain("cz-overlay-line");
    expect(count(svg, 'class="cz-overlay-mark"')).toBeGreaterThan(0);
    expect(svg).not.toContain("script");
  });

  it("are drawn by drawChizu over the land, and not at all when none are given", () => {
    const plain = drawChizu(world);
    expect(plain).not.toContain("cz-overlays");
    const svg = drawChizu(world, { overlays: [{ kind: "mark", at: [0, 0] }] });
    expect(svg).toContain('<g class="cz-overlays">');
    expect(svg.indexOf("cz-overlays")).toBeGreaterThan(svg.lastIndexOf("cz-land-copy"));
  });

  it("read well on a 240 by 120 inset: no country names unless asked, and a label sized to the window", () => {
    const svg = drawChizu(world, { overlays: [{ kind: "mark", at: [0, 0], label: "ISS" }] });
    expect(svg).not.toContain('class="cz-label"');
    const size = Number(/<text x="[^"]+" y="[^"]+" font-size="([\d.]+)">ISS/.exec(svg)?.[1]);
    // About 8 pixels tall on a map 240 pixels wide.
    expect((size / box.width) * 240).toBeGreaterThan(7);
  });
});

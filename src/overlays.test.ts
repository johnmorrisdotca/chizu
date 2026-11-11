import { describe, expect, it } from "vitest";
import { drawChizu } from "./draw.ts";
import { wholeMapBox } from "./frame.ts";
import { type ChizuOverlay, overlaysSvg } from "./overlays.ts";
import world from "./world-entry.ts";

const box = wholeMapBox(world);
const count = (text: string, part: string) => text.split(part).length - 1;

describe("overlays", () => {
  it("split a line where it crosses the date line, and draw each part at every copy of the world", () => {
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
    const svg = overlaysSvg(world, [track], box, [0]);
    // Two parts (150 to 170, then -170 to -150), each drawn three times: here and one world either side.
    expect(count(svg, 'class="cz-overlay-line"')).toBe(6);
    expect(svg).toContain('stroke-width="3"');
    expect(svg).toContain('vector-effect="non-scaling-stroke"');
    // No part runs the width of the map, as a line drawn across the date line would.
    for (const [, d] of svg.matchAll(/class="cz-overlay-line" d="([^"]+)"/g)) {
      const xs = [...d!.matchAll(/[ML](-?[\d.]+) /g)].map((m) => Number(m[1]));
      expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(world.width / 4);
    }
  });

  it("draw a mark as a dot of the size asked, whatever the map's scale, with its label escaped", () => {
    const svg = overlaysSvg(
      world,
      [{ kind: "mark", at: [35.68, 139.69], label: "Tokyo <ISS>", size: 10, color: "#c33", id: "iss" }],
      box,
      [0],
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
    const svg = overlaysSvg(world, [night], box, [0]);
    expect(count(svg, 'class="cz-overlay-area"')).toBe(3);
    expect(svg).toMatch(/class="cz-overlay-area" d="M[^"]+Z"/);
    expect(svg).toContain('fill-opacity="0.4"');
  });

  it("leave out what cannot be drawn: points that are not numbers, a short ring, an unsafe colour", () => {
    const svg = overlaysSvg(
      world,
      [
        { kind: "mark", at: [Number.NaN, 0] },
        { kind: "mark", at: [120, 0] },
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
      [0],
    );
    expect(svg).not.toContain("cz-overlay-area");
    expect(svg).not.toContain("cz-overlay-line");
    expect(count(svg, 'class="cz-overlay-mark"')).toBe(3);
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

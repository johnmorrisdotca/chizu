import { describe, expect, it } from "vitest";
import gb from "./data/countries/gb.data.ts";
import world from "./data/world.data.ts";
import { drawLocal } from "./drawLocal.ts";
import { focusBox, regionBox, zoomBox } from "./frame.ts";
import { RAD, vincenty } from "./local.fixture.ts";
import { localCanvasFromBox, localConvergence, mapBoxFromLocal, mapBoxMetres } from "./local.ts";
import { localMap } from "./localMap.ts";
import { cleanSvgMarkup } from "./localMarker.ts";
import { CHIZU_LOCAL_STYLE } from "./localStyle.ts";
import { projectPoint, unprojectPoint } from "./project.ts";
import { CHIZU_STYLE } from "./style.ts";

describe("a picture on the ground", () => {
  const pitch =
    '<svg viewBox="0 0 100 60"><rect width="100" height="60" fill="#9bd18a"/><line x1="50" y1="0" x2="50" y2="60" stroke="#fff"/></svg>';
  const centre: [number, number] = [10, 60];

  it("is scaled so that its units are the metres they say", () => {
    const map = localMap({ centre, widthMetres: 400, metresPerUnit: 0.5, markers: [{ at: centre, svg: pitch }] });
    const [marker] = map.markers;
    // A 100 m pitch on a canvas of half-metres is 200 units across.
    expect(marker!.scale).toBe(2);
    expect(marker!.anchor).toEqual([50, 30]);
    expect(marker!.at).toEqual([400, 400]);
    expect(marker!.bbox).toEqual([300, 340, 500, 460]);
    expect(
      localMap({
        centre,
        widthMetres: 400,
        metresPerUnit: 0.5,
        markers: [{ at: centre, svg: pitch, metresPerUnit: 0.1 }],
      }).markers[0]!.scale,
    ).toBeCloseTo(0.2, 9);
    // Or by how big it is on the ground: 50 m for a window 100 units across.
    expect(
      localMap({ centre, widthMetres: 400, metresPerUnit: 0.5, markers: [{ at: centre, svg: pitch, size: [50, 30] }] })
        .markers[0]!.scale,
    ).toBe(1);
  });

  it("is turned to its bearing from true north, less the grid's own turn at that place", () => {
    const map = localMap({ centre, widthMetres: 20_000, metresPerUnit: 1 });
    // 8 km east of the centre at 60°N: the meridians have drawn in by 0.12°.
    const at: [number, number] = [10 + 8000 / (111_412.84 * Math.cos(60 * RAD)), 60];
    const turned = localMap({
      centre,
      widthMetres: 20_000,
      metresPerUnit: 1,
      markers: [
        { at, svg: pitch, bearing: 90 },
        { at, svg: pitch },
        { at, svg: pitch, bearing: 370 },
      ],
    }).markers;
    const gamma = localConvergence(centre, at[0], at[1]);
    expect(gamma).toBeGreaterThan(0.1);
    expect(turned[0]!.rotation).toBeCloseTo(90 - gamma, 3);
    expect(turned[1]!.rotation).toBeCloseTo(-gamma, 3);
    expect(turned[2]!.bearing).toBe(370);

    // The proof is on the ground: walk 100 m from the marker on a true bearing and see which way that goes on the canvas.
    for (const bearing of [0, 45, 90, 180, 300]) {
      // 100 m on the ellipsoid: the north part over the meridian's radius of curvature, the east part over the prime vertical's.
      const sin2 = Math.sin(at[1] * RAD) ** 2;
      const m = (6378137 * (1 - 0.00669437999014)) / (1 - 0.00669437999014 * sin2) ** 1.5;
      const n = 6378137 / Math.sqrt(1 - 0.00669437999014 * sin2);
      const f2 = at[1] * RAD + (100 * Math.cos(bearing * RAD)) / m;
      const l2 = at[0] * RAD + (100 * Math.sin(bearing * RAD)) / (n * Math.cos(at[1] * RAD));
      const p = projectPoint(map, at[0], at[1])!;
      const q = projectPoint(map, l2 / RAD, f2 / RAD)!;
      const seen = (Math.atan2(q[0] - p[0], p[1] - q[1]) / RAD + 360) % 360;
      const marker = localMap({ centre, widthMetres: 20_000, metresPerUnit: 1, markers: [{ at, svg: pitch, bearing }] })
        .markers[0]!;
      const diff = Math.abs(((((seen - marker.rotation) % 360) + 540) % 360) - 180);
      expect(diff, `bearing ${bearing}`).toBeLessThan(0.01);
    }
  });

  it("is drawn as one group that moves, turns and scales the picture about its anchor", () => {
    const map = localMap({
      centre,
      widthMetres: 400,
      metresPerUnit: 1,
      markers: [
        { at: centre, svg: pitch, bearing: 90, anchor: [0, 0], name: "Pitch", nameJa: "ピッチ", class: "turf" },
      ],
    });
    const svg = drawLocal(map);
    expect(svg).toContain(
      '<g class="cz-marker turf" data-code="marker-1" data-bearing="90" transform="translate(200 200) rotate(90) scale(1) translate(0 0)">',
    );
    expect(svg).toContain("<title>Pitch</title>");
    expect(drawLocal(map, { language: "ja" })).toContain("<title>ピッチ</title>");
    expect(svg).toContain('<rect width="100" height="60" fill="#9bd18a"/>');
    expect(drawLocal(map, { markers: false })).not.toContain("cz-marker");
  });

  it("needs a size, and a place, and says so when it has none", () => {
    const map = localMap({
      centre,
      widthMetres: 400,
      markers: [
        { at: centre, svg: "<rect width='5' height='5'/>" },
        { at: [Number.NaN, 0], svg: pitch },
        { at: centre, svg: pitch, size: [-1, 1] },
        { at: centre, svg: "<rect width='5' height='5'/>", viewBox: [0, 0, 5, 5] },
      ],
    });
    expect(map.markers).toHaveLength(1);
    expect(map.problems).toHaveLength(3);
  });

  it("has everything that could run, fetch or reach outside the picture taken out", () => {
    const dirty =
      '<svg viewBox="0 0 10 10" onload="alert(1)">' +
      "<script>alert(1)</script><style>@import url(https://x.test/a.css);</style><foreignObject><div>hi</div></foreignObject>" +
      '<image href="https://x.test/a.png"/><a href="javascript:alert(1)"><circle id="c" r="2" onclick="alert(2)" fill="url(https://x.test/a)"/></a>' +
      '<use href="https://x.test/a.svg#b"/><use href="#c" x="1"/><animate attributeName="x"/><rect fill="url(#g)" style="fill:url(//x.test/y)" width="4" height="4" data-x="&#106;avascript:1"/>' +
      '<linearGradient id="g"><stop offset="0" stop-color="red"/></linearGradient><text x="1" y="2">Hi <tspan>there</tspan> &amp; <b>you</b></text><!-- comment --></svg>';
    const out = cleanSvgMarkup(dirty.slice(dirty.indexOf(">") + 1, dirty.lastIndexOf("</svg>")), "p-");
    expect(out).not.toMatch(
      /script|alert|foreignObject|<div|<image|<style|@import|https?:|javascript|onclick|onload|<animate|<a[ >]|<b>|comment|data-x/i,
    );
    expect(out).toContain('<use href="#p-c" x="1"/>');
    expect(out).toContain('<circle id="p-c" r="2"/>');
    expect(out).toContain('<rect fill="url(#p-g)" width="4" height="4"/>');
    expect(out).toContain('<linearGradient id="p-g">');
    expect(out).toContain('<text x="1" y="2">Hi <tspan>there</tspan> &amp; you</text>');
    expect(out.match(/<(\w+)/g)!.length).toBeGreaterThan(0);
  });

  it("keeps two pictures' ids apart and the markup balanced", () => {
    const gradient =
      '<svg viewBox="0 0 10 10"><defs><linearGradient id="g"/></defs><rect fill="url(#g)" width="10" height="10"/><g><g>';
    const map = localMap({
      centre,
      widthMetres: 400,
      markers: [
        { at: centre, svg: `${gradient}</g></g></svg>` },
        { at: centre, svg: `${gradient}</svg>` },
      ],
    });
    expect(map.markers[0]!.markup).toContain('id="cz-m1-g"');
    expect(map.markers[1]!.markup).toContain('id="cz-m2-g"');
    for (const marker of map.markers) {
      const opened = (marker.markup.match(/<[A-Za-z][^>]*(?<!\/)>/g) ?? []).length;
      const closed = (marker.markup.match(/<\/[A-Za-z]+>/g) ?? []).length;
      expect(opened).toBe(closed);
    }
  });
});

describe("drawn", () => {
  const centre: [number, number] = [139.7006, 35.7004];
  const data = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: "pond",
        properties: { name: "Pond", kind: "water" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [139.6994, 35.6996],
              [139.6999, 35.6996],
              [139.6999, 35.7001],
              [139.6994, 35.7001],
              [139.6994, 35.6996],
            ],
          ],
        },
      },
      {
        type: "Feature",
        id: "hall",
        properties: { name: "Main hall", nameJa: "本館", kind: "building", class: "stand" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [139.7002, 35.6999],
              [139.7016, 35.6999],
              [139.7016, 35.7009],
              [139.7002, 35.7009],
              [139.7002, 35.6999],
            ],
          ],
        },
      },
      {
        type: "Feature",
        id: "lane",
        properties: { name: "Lane", kind: "road" },
        geometry: {
          type: "LineString",
          coordinates: [
            [139.6985, 35.6992],
            [139.7006, 35.6996],
            [139.7025, 35.6994],
          ],
        },
      },
      {
        type: "Feature",
        id: "gate",
        properties: { name: "Gate" },
        geometry: { type: "Point", coordinates: [139.7009, 35.6999] },
      },
      { type: "Feature", id: "far", geometry: { type: "Point", coordinates: [139.71, 35.71] } },
    ],
  } as const;
  const map = localMap({
    centre,
    widthMetres: 400,
    name: "Made-up ground",
    data,
    credits: ["Shapes made up for the tests", 'Second <line> & "credit"'],
    markers: [
      {
        at: [139.7006, 35.7004],
        svg: '<svg viewBox="0 0 30 20"><rect width="30" height="20"/></svg>',
        bearing: 20,
        name: "Pitch",
      },
    ],
  });
  const count = (text: string, pattern: RegExp) => (text.match(pattern) ?? []).length;

  it("is one svg with the ground, the shapes in the order given and each kind's look, well-formed", () => {
    const svg = drawLocal(map);
    expect(svg.startsWith("<svg ")).toBe(true);
    expect(svg.endsWith("</svg>")).toBe(true);
    expect(svg).toContain('viewBox="0 0 1000 1000"');
    expect(svg).toContain('data-metres-per-unit="0.4"');
    expect(svg).toContain('aria-label="Map of Made-up ground"');
    expect(svg.indexOf('data-code="pond"')).toBeLessThan(svg.indexOf('data-code="hall"'));
    expect(svg).toContain('data-type="water"');
    expect(svg).toContain('class="cz-local-shape cz-local-area-shape stand stand"'.replace(" stand stand", " stand"));
    expect(svg).toContain("<title>Main hall</title>");
    expect(drawLocal(map, { language: "ja" })).toContain("<title>本館</title>");
    expect(count(svg, /class="cz-local-line"/g)).toBe(1);
    expect(count(svg, /class="cz-local-point"/g)).toBe(1);
    for (const tag of ["svg", "g", "text", "title"])
      expect(count(svg, new RegExp(`<${tag}[ >]`, "g")), tag).toBe(count(svg, new RegExp(`</${tag}>`, "g")));
  });

  it("leaves out what the window does not show, and names itself when there is no name", () => {
    const wide = localMap({ centre, widthMetres: 4000, data });
    expect(drawLocal(wide)).toContain('data-code="far"');
    expect(drawLocal(wide)).toContain('aria-label="Map of the area, 4 km across"');
    expect(drawLocal(wide, { language: "ja" })).toContain('aria-label="周辺の地図、幅4 km"');
    const small = drawLocal(wide, { box: zoomBox(wide, 10, { x: 500, y: 500 }) });
    expect(small).not.toContain('data-code="far"');
    expect(small).toContain('viewBox="450 450 100 100"');
    expect(small).toContain('aria-label="Map of the area, 400 m across"');
  });

  it("shows the credit lines, the caller's after chizu's own Natural Earth credit, escaped, and a scale bar in metres", () => {
    const svg = drawLocal(map, { naturalEarth: true, credits: ["Data © Somebody, ODbL"] });
    const credits = [...svg.matchAll(/<text class="cz-credit"[^>]*>([^<]*)<\/text>/g)].map((match) => match[1]);
    expect(credits).toEqual([
      "Map data: Natural Earth, public domain",
      "Shapes made up for the tests",
      "Second &lt;line&gt; &amp; &quot;credit&quot;",
      "Data © Somebody, ODbL",
    ]);
    expect(
      [...drawLocal(map, { naturalEarth: true, language: "ja" }).matchAll(/class="cz-credit"[^>]*>([^<]*)</g)][0]![1],
    ).toBe("地図データ：Natural Earth（パブリックドメイン）");
    // 22% of 400 m is 88 m, so the bar is 50 m: 125 units.
    expect(svg).toMatch(/<g class="cz-scale" data-metres="50">/);
    expect(svg).toContain(">50 m</text>");
    expect(drawLocal(map, { scaleBar: false })).not.toContain("cz-scale");
    // 22% of 40 km is 8.8 km, so the bar is 5 km, and the words say km.
    expect(drawLocal(localMap({ centre, widthMetres: 40_000 }))).toContain(">5 km</text>");
  });

  it("looks as it is styled: by kind, class or id, with a dark colour of its own, in pixels or metres, and nothing unsafe", () => {
    const svg = drawLocal(map, {
      styles: {
        stand: {
          fill: "#d9a441",
          stroke: "var(--stand-line)",
          dark: { fill: "#7a5a1c" },
          class: "grandstand",
          strokeWidth: 2.5,
          opacity: 0.8,
        },
        lane: {
          widthMetres: 8,
          stroke: "#fff;x:y",
          vars: { "--rows": "12", "--bad": "url(https://x.test)", "no-dashes": "1" },
        },
        hall: { fillOpacity: 0.5 },
        pond: { fill: "teal" },
        toString: { fill: "red" },
      },
    });
    expect(svg).toContain(
      'style="--cz-fill:#d9a441;--cz-stroke:var(--stand-line);--cz-fill-dark:#7a5a1c;--cz-stroke-width:2.5px;--cz-opacity:0.8;--cz-fill-opacity:0.5"',
    );
    expect(svg).toMatch(/class="cz-local-shape cz-local-area-shape stand grandstand"/);
    expect(svg).toContain('class="cz-local-shape cz-local-line-shape cz-metric"');
    expect(svg).toContain("--cz-stroke-width:20px;--rows:12");
    expect(svg).not.toContain("x:y");
    expect(svg).not.toContain("--bad");
    expect(svg).not.toContain("no-dashes");
    expect(svg).toContain("--cz-fill:teal");
  });

  it("has a look for light and dark in its style, and carries it inside on request", () => {
    expect(CHIZU_LOCAL_STYLE).toContain("prefers-color-scheme: dark");
    expect(CHIZU_LOCAL_STYLE).toContain(':root[data-theme="dark"] .chizu');
    for (const kind of ["water", "building", "green", "pitch", "road"])
      expect(CHIZU_LOCAL_STYLE).toContain(`data-type="${kind}"`);
    for (const tone of ["selected", "correct", "wrong", "hint", "muted", "faint"])
      expect(CHIZU_LOCAL_STYLE).toContain(`cz-tone-${tone}`);
    expect(drawLocal(map, { style: true })).toContain(CHIZU_STYLE.trim().slice(0, 40));
    expect(drawLocal(map, { style: true })).toContain("--cz-local-pitch");
    expect(drawLocal(map)).not.toContain("<style>");
  });

  it("wears tones, can be pressed, and puts nothing from a name or an id into markup", () => {
    const svg = drawLocal(map, { tones: { hall: "selected", pond: 'x" onload="1' }, interactive: true });
    expect(svg).toContain("cz-tone-selected");
    expect(svg).toContain('data-tone="selected"');
    expect(svg).not.toMatch(/onload="1"/);
    expect(svg).toContain('role="group"');
    expect(count(svg, /data-interactive="true"/g)).toBe(5);
    const mean = localMap({
      centre,
      widthMetres: 400,
      data: {
        type: "Feature",
        id: 'a"><script>',
        properties: { name: "<b>x</b>" },
        geometry: { type: "Point", coordinates: centre },
      },
    });
    const out = drawLocal(mean, { labels: true, interactive: true });
    expect(out).not.toContain("<script>");
    expect(out).not.toContain("<b>");
  });

  it("prints names where they fit and overlap nothing, in either language, or just those asked for", () => {
    const svg = drawLocal(map, { labels: true });
    const labelled = [...svg.matchAll(/class="cz-label[^"]*"[^>]*data-code="([^"]+)"/g)].map((match) => match[1]);
    expect(labelled).toEqual(expect.arrayContaining(["hall", "lane", "gate", "marker-1"]));
    expect(labelled).not.toContain("far");
    expect(drawLocal(map, { labels: true, language: "ja" })).toContain(">本館</text>");
    expect(count(drawLocal(map, { labels: ["gate"] }), /class="cz-label /g)).toBe(1);
  });

  it("numbers shapes, lines, points and pictures with the callout placer, clear of the credit corner, the same every time", () => {
    const options = { callouts: ["hall", "gate", "lane", "marker-1"] };
    const svg = drawLocal(map, options);
    expect(count(svg, /class="cz-callout"/g)).toBe(4);
    expect(svg).toContain("<title>Number 1: Main hall</title>");
    expect(svg).toContain("<title>Number 4: Pitch</title>");
    expect(drawLocal(map, options)).toBe(svg);
    const circles = [...svg.matchAll(/class="cz-callout-circle" cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)].map(
      (match) => match.slice(1).map(Number),
    );
    expect(circles).toHaveLength(4);
    for (const [cx, cy, r] of circles) {
      expect(cx! - r!).toBeGreaterThanOrEqual(0);
      expect(cx! + r!).toBeLessThanOrEqual(1000);
      expect(cy! + r!).toBeLessThanOrEqual(1000);
      // Not in the corner the credits and the bar are in.
      expect(cx! > 600 && cy! > 880).toBe(false);
    }
  });

  it("is not a world map: the same engine frames it, and a world map still draws as it did", () => {
    expect(focusBox(map, ["hall", "pond"]).width).toBeGreaterThan(0);
    expect(regionBox(map, "hall", 1).width).toBeGreaterThan(0);
    const box = zoomBox(map, 4, { x: 500, y: 500 });
    expect(box.width).toBe(250);
    expect(drawLocal(map, { box })).toContain('viewBox="375 375 250 250"');
  });
});

describe("handing over from a country's map to the city and back", () => {
  it("says how much ground a window on a map shows, within a hair of the geodesic", () => {
    const [x, y] = projectPoint(gb, -0.2795, 51.556)!;
    const window = { x: x - 5, y: y - 5, width: 10, height: 10 };
    const metres = mapBoxMetres(gb, window)!;
    const west = unprojectPoint(gb, window.x, y)!;
    const east = unprojectPoint(gb, window.x + window.width, y)!;
    expect(Math.abs(metres.width - vincenty(west, east)) / metres.width).toBeLessThan(0.002);
    expect(mapBoxMetres(gb, window)!.height).toBeGreaterThan(0);
    // The world, at 10×, is some thousands of kilometres across.
    const wide = mapBoxMetres(world, zoomBox(world, 10, { x: 457.5, y: 212.5 }))!;
    expect(wide.width).toBeGreaterThan(3_000_000);
    expect(wide.width).toBeLessThan(5_000_000);
    expect(mapBoxMetres({ projection: { kind: "other", description: "" } }, window)).toBeNull();
  });

  it("makes the local canvas that covers the same ground, and the window back that a local canvas covers", () => {
    const [x, y] = projectPoint(gb, -0.2795, 51.556)!;
    const window = { x: x - 0.5, y: y - 0.4, width: 1, height: 0.8 };
    const canvas = localCanvasFromBox(gb, window)!;
    expect(canvas.centre[0]).toBeCloseTo(-0.2795, 1);
    expect(canvas.centre[1]).toBeCloseTo(51.556, 1);
    expect(canvas.widthMetres / canvas.heightMetres).toBeCloseTo(1.25, 1);
    const city = localMap(canvas);
    expect(city.width).toBeCloseTo(1000, 0);
    // The window comes back to the one it began as, to the little that a map which is not north-up turns it.
    const back = mapBoxFromLocal(gb, city)!;
    expect(back.width / window.width).toBeGreaterThan(0.97);
    expect(back.width / window.width).toBeLessThan(1.05);
    expect(back.height / window.height).toBeGreaterThan(0.97);
    expect(back.height / window.height).toBeLessThan(1.05);
    expect(Math.abs(back.x + back.width / 2 - (window.x + window.width / 2))).toBeLessThan(0.05);
    // A window on the local canvas is a smaller window on the map.
    const inner = mapBoxFromLocal(gb, city, { x: 400, y: 400, width: 200, height: 200 })!;
    expect(inner.width).toBeLessThan(back.width / 4);
    expect(mapBoxFromLocal(gb, gb)).toBeNull();
  });
});

# The city scale

Natural Earth stops at about a kilometre. Chizu's local mode goes past it: down to a city, a campus or a single venue,
drawn from GeoJSON and pictures the caller passes in. Nothing is fetched, no tiles are used, and no map data comes with the
package. Chizu is not OpenStreetMap: it draws the small slice you give it, in a projection that is true to the metre.

```ts
import { localMap } from "@johnmorrisdotca/chizu";
import { drawLocal } from "@johnmorrisdotca/chizu/draw";

const map = localMap({
  centre: [139.7006, 35.7004],      // longitude, latitude of the middle
  widthMetres: 400,                 // how much ground the canvas shows (heightMetres defaults to the same)
  name: "A made-up ground",
  data: geojson,                    // a Feature, a FeatureCollection, a geometry, or a list of them
  markers: [{ at: [139.7, 35.701], svg: pitchSvg, bearing: 30, name: "Pitch" }],
  credits: ["Data © OpenStreetMap contributors, ODbL"],   // say what you drew from; Chizu adds none
});
const svg = drawLocal(map, { style: true, labels: true, callouts: ["hall", "pitch"] });
```

## The projection

A transverse Mercator on the WGS 84 ellipsoid centred on the place (Krüger's series, scale one on the central meridian):
closed-form both ways, conformal (a square stays a square, so a pitch keeps its angles) and true to the ellipsoid's own
distances. The tests hold two points up to 50 km apart to within 0.5% of Vincenty's geodesic, anywhere from the equator
to 70° north and south, and in practice the difference is under 0.02%. It answers `null` rather than a guess a quarter of
the earth away.

- The canvas is `0 0 width height` in **units**, and a unit is `projection.metresPerUnit` metres. Pass `metresPerUnit` to
  choose (`1` for a canvas in metres); by default it is the longer side over 1,000, so a local canvas is 1,000 across like
  every other map's. The SVG states it as `data-metres-per-unit`.
- North is up, east is right. The centre is the middle of the canvas.
- `projectPoint(map, lon, lat)` and `unprojectPoint(map, x, y)` work on a local map as on any other.
- `groundDistance([lon, lat], [lon, lat])` is the distance in metres between two places by the same projection.
- `localConvergence(centre, lon, lat)` is how many degrees the grid's up is turned from true north at a place.

## Handing over from a country's map

`mapBoxMetres(map, box)` says how many metres of ground a window on a world or country map shows. When that is smaller than
the place you have data for, `localCanvasFromBox(map, box)` gives the local canvas that covers the same ground (pass it to
`localMap`), so at its own 1× the city map shows what the window showed and nothing jumps. `mapBoxFromLocal(map, local, box?)`
is the way back: the window on the country map that a local window covers, to draw as a frame (the demo does). Both are
`null` for a map that cannot be read back to longitude and latitude (a country's regions).

## Shapes

`data` is GeoJSON: Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon and GeometryCollection, in
`[longitude, latitude]`. A shape that cannot be drawn is left out and named in `map.problems`.

| From the Feature | Becomes |
| --- | --- |
| `id` (or `properties.id`, else `f1`, `f2` in order) | the shape's `id` and `data-code`; a repeated id gets a number added |
| `properties.name`, `properties.nameJa` (or `name:ja`) | its name, its `<title>`, its label |
| `properties.kind` | `data-type`: `water`, `building`, `green`, `pitch` and `road` have a look of their own |
| `properties.class` | classes on the shape, for your own CSS (letters, digits, `-`, `_`) |

Shapes are painted in the order given, so list water first and buildings after. A polygon's rings are filled with the
even-odd rule, so a courtyard is a hole whichever way it was wound. The polygons are also the map's `regions`: `focusBox`,
`regionBox`, `zoomBox`, `layoutCallouts` and the rest of the engine take a local map as they take any other.

## Styling

By kind, by class or by id, in `drawLocal`'s `styles` (those that apply are merged in that order, the id last):

```ts
drawLocal(map, {
  styles: {
    road: { widthMetres: 8, stroke: "#b9b09a", dark: { stroke: "#6f6a5a" } },   // 8 m wide at every zoom
    stand: { fill: "#d9a441", dark: { fill: "#8a6a24" }, strokeWidth: 2, class: "grandstand" },
    pond: { fill: "var(--water)" },                                             // your page's own variable
  },
  tones: { hall: "selected" },
});
```

Colours are hex, a CSS name, `rgb()`, `hsl()` or `var(--name)`; anything else is ignored. `dark` is used when the page is
dark (`prefers-color-scheme`, or `data-theme="dark"` on `<html>`). `strokeWidth` is pixels on the screen, `widthMetres` metres
on the ground, `opacity` and `fillOpacity` 0 to 1, `vars` custom properties of your own for your CSS. The look comes from
`CHIZU_LOCAL_STYLE`, which `style: true` carries inside: `--cz-ground`, `--cz-local-area`, `--cz-local-building`,
`--cz-local-building-line`, `--cz-local-green`, `--cz-local-pitch`, `--cz-local-road` and `--cz-local-point`, each with a
dark value, beside the base `--cz-*` properties (water is `--cz-water`).

## Pictures at a place

A marker puts SVG at a longitude and latitude, scaled to real metres and turned to a bearing:

```ts
{
  at: [139.7, 35.701],
  svg: '<svg viewBox="0 0 60 40">…</svg>',   // or bare markup with viewBox: [0, 0, 60, 40]
  metresPerUnit: 1,                           // a unit of the picture is a metre (the default)
  // size: [60, 40],                          // or: its window is 60 m by 40 m on the ground
  bearing: 30,                                // its top points 30° east of true north
  anchor: [30, 20],                           // the point of the picture that sits on `at` (default: its middle)
}
```

The turn is the bearing less the grid convergence at that place, so the picture lies along the true direction even a long
way from the centre. The picture is the caller's own markup and it is embedded in the drawing, so it is cleaned on the
way in: only shapes, text, gradients, clips, masks and `use` of SVG remain, no script, event attribute, style sheet,
foreign object, animation or image, and no reference to anything outside the picture (`url(...)` and `href` must be
`#id`). Ids inside it are prefixed so two pictures cannot meet. A picture that says no size, or whose place cannot be
drawn, is left out and named in `map.problems`.

## Names, numbers, scale and credits

- `labels: true` (or a list of ids) prints names where they fit and overlap nothing; `language: "ja"` uses `nameJa`.
- `callouts: ["hall", "pitch"]` numbers shapes, lines, points and pictures with the same placer as the country maps, in open
  ground and clear of the corner the scale bar and credits use.
- `scaleBar` (default on) draws a bar of a round length in metres.
- **Credits** are the caller's: `credits` on `localMap`, more in `drawLocal`'s `credits`, printed bottom right, shrunk or
  cut to fit. `naturalEarth: true` puts Chizu's own line ("Map data: Natural Earth, public domain", 地図データ：Natural Earth（パブリックドメイン）)
  first, for a drawing that sits beside or over one of its maps. Chizu never adds an OpenStreetMap credit: if your data is
  OpenStreetMap's, its licence (ODbL, "© OpenStreetMap contributors") is yours to meet and say.

## Limits

- Fit for places up to a few tens of kilometres across; the distance test is 50 km. Past 400 km `groundDistance` uses the
  great circle.
- Only what is passed in is drawn: no streets, labels or water come with it. There is no tile layer and no pan-and-zoom
  mount for a local map yet; `zoomBox`, `focusBox` and `regionBox` give the windows, and `drawLocal(map, { box })` draws one.
- Screen text and points are sized from the window, so they keep their size on the screen as the window is zoomed.

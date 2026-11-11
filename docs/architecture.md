# The source tree

Every file under `src/`, with what it holds. The README's [Architecture](../README.md#architecture) section says how the parts fit; `src/architecture.test.js` checks that this tree names every source file and nothing that is not one.

```text
src/
├── index.ts            the engine's entry
├── draw-entry.ts       the drawing's entry
├── mount-entry.ts      the page's entry
├── names-entry.ts      the table of countries' entry
├── cities-entry.ts     the cities' entry: kuni's cities for the city layer
├── element.ts          the map, locator and quiz as custom elements
├── element-base.ts     the shared element: loading a map and drawing it
├── element-define.ts   registers them as tags
├── load-entry.ts       loadCountry and loadDivisions
├── world-entry.ts      the world's entry
├── world-geo-entry.ts  the world as longitude and latitude, for a spherical projection
├── types.ts            ChizuMap, ChizuRegion, MapBox and the rest
├── frame.ts            windows, zoom steps, fits
├── insets.ts           regions drawn in boxes of their own
├── wrap.ts             the world that goes round
├── outlines.ts         paths as rings, land under a point, a point on a region's land
├── ringGeometry.ts     rings: the point in a ring, the distance to one, a circle or a segment meeting one
├── handles.ts          numbers beside regions, and in order across the map
├── callouts.ts         numbered circles in open water
├── calloutCosts.ts     the costs and limits the callout placer weighs a place by
├── calloutSpace.ts     where a circle may sit
├── calloutPolish.ts    the slow pass for a printed sheet
├── calloutStarts.ts    where the slow pass starts each leader from
├── layout.ts           layoutCallouts over a whole map
├── distractors.ts      the wrong answers
├── quiz.ts             a question and its choices
├── groups.ts           continents and other groups: cut, framed, toned
├── features.ts         seas, lakes, rivers and the rest: chosen, searched, made a map
├── cities.ts           city names: the ground a window shows, the floor, the placing, the layer
├── fromText.ts         pasted names to places
├── countries.ts        the table of countries, looked up
├── project.ts          longitude and latitude on a canvas
├── local.ts            the city scale's projection and the hand-over
├── localMap.ts         a local map from GeoJSON and pictures
├── localGeo.ts         GeoJSON on the canvas
├── localMarker.ts      a picture placed and cleaned
├── localStyle.ts       the city scale's look
├── strings.ts          the words, in English and Japanese
├── style.ts            the drawing's colours
├── draw.ts             a map as SVG text
├── drawFeatures.ts     the features in a drawing, and their names
├── drawLocal.ts        a local map as SVG text
├── drawCallouts.ts     the numbered circles, as SVG
├── mount.ts            a map in a page
├── mountTypes.ts       what a mounted map is told and what it gives back
├── mountStyle.ts       the page's colours
├── random.ts           the seeded stream
├── version.ts          the version
└── data/               generated, never edited
    ├── world.data.ts            the world
    ├── world-geo.data.ts        the world as longitude and latitude
    ├── world-detail.data.ts     the world drawn finer, for a map zoomed in
    ├── countries.data.ts        the table of every country
    ├── loaders.data.ts          one import for each country's map
    ├── countries/<code>.data.ts   238 countries, each alone
    ├── divisions/<code>.data.ts   32 countries' regions
    └── features/<map>.data.ts     268 maps' named features
```

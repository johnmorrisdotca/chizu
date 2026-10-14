# The source tree

Every file under `src/`, with what it holds. The README's [Architecture](../README.md#architecture) section says how the parts fit; `src/architecture.test.js` checks that this tree names every source file and nothing that is not one.

```text
src/
├── index.ts            the engine's entry
├── draw-entry.ts       the drawing's entry
├── mount-entry.ts      the page's entry
├── names-entry.ts      the table of countries' entry
├── load-entry.ts       loadCountry and loadDivisions
├── world-entry.ts      the world's entry
├── types.ts            ChizuMap, ChizuRegion, MapBox and the rest
├── frame.ts            windows, zoom steps, fits
├── insets.ts           regions drawn in boxes of their own
├── wrap.ts             the world that goes round
├── outlines.ts         paths as rings, land under a point, a point on a region's land
├── handles.ts          numbers beside regions, and in order across the map
├── callouts.ts         numbered circles in open water
├── calloutSpace.ts     where a circle may sit
├── calloutPolish.ts    the slow pass for a printed sheet
├── layout.ts           layoutCallouts over a whole map
├── distractors.ts      the wrong answers
├── quiz.ts             a question and its choices
├── groups.ts           continents and other groups: cut, framed, toned
├── features.ts         seas, lakes, rivers and the rest: chosen, searched, made a map
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
├── mountStyle.ts       the page's colours
├── random.ts           the seeded stream
├── version.ts          the version
└── data/               generated, never edited
    ├── world.ts            the world
    ├── world-detail.ts     the world drawn finer, for a map zoomed in
    ├── countries.ts        the table of every country
    ├── loaders.ts          one import for each country's map
    ├── countries/<code>.ts   238 countries, each alone
    ├── divisions/<code>.ts   32 countries' regions
    └── features/<map>.ts     268 maps' named features
```

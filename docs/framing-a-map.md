# Framing a map

A window is a `MapBox`, `{ x, y, width, height }` in the map's units, which is what an SVG `viewBox` says (`boxToViewBox`).

```ts no-check
import { focusBox, regionBox, shapeGlyphBox, zoomBox, zoomToFit, MAP_ZOOM_LEVELS } from "@johnmorrisdotca/chizu";

zoomBox(map, 3, { x: 500, y: 300 });          // the window three times in, about that point, kept on the map
zoomBox(WORLD, 3, { x: 1200, y: 244 });       // on the world it is not kept east and west: it goes round
focusBox(map, ["BY", "BW"]);                  // a window that frames these regions with room round them
regionBox(map, "BY", 2.5);                    // tight on one shape, in a frame 2.5 times as wide as tall
shapeGlyphBox(region.bbox);                   // a square every shape fills, for an icon
zoomToFit(map, ["NY", "PA", "NJ"]);           // { zoom, centre }: the closest step that holds them all
MAP_ZOOM_LEVELS;                              // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

**Insets.** A map's `insets` list the regions it draws in a box of its own, with the box. Alaska and Hawaii are in two boxes under the lower forty-eight on the United States' map, and an inset may hold only a region's outlying islands (`outlyingBelow`) and magnify them (`magnify`). Everything that frames, outlines or numbers a map reads the list, so a region is found where it is drawn.

**The world goes round.** `wrapOffsets(box, width)` says how many copies of the canvas a window sees, `wrapIntoBox` finds the copy of a point that is on screen, and `nearestWrappedBox` slides a destination onto the nearest copy so that travelling from Japan to Hawaii is a short hop east.


# Numbered callouts

`layoutCallouts(map, request)` puts a numbered circle for each region asked for in the open space between and around the land, and gives back where each leader starts and where its circle sits:

```ts no-check
const spots = layoutCallouts(map, {
  codes: ["BY", "NW", "SL"],   // the regions, numbered in this order
  box,                         // the window the map is drawn in; default the whole map
  radiusRatio: 0.03,           // the circle's radius as a share of the window's width
  polish: true,                // finish with the slow pass for a printed sheet
  keepOut: { bottom: 200, right: 40 },   // a corner to keep clear, for a credit line
  numbering: "west-to-east",   // or "given", the default
});
// [{ code: "BY", number: 1, start: [x, y], circle: [x, y], radius }, …]
```

Three things are weighed, in this order: a circle sits in water; no two leaders cross; a leader crosses as little land as it can. A circle goes to the nearest place it fits (the sea off its own coast, the gap between two islands, the empty half of the frame) and not to one of four sides. The numbers are checked against the coastline itself and not the box round it, so an inland sea or a bay is room. Where a frame has less room than it has circles, they close up rather than some going undrawn. A start is a point on the region's own land, not its centre, which for a chain or a crescent is in the sea.

`polish: true` adds a seeded annealing pass that leaves no two leaders closer than a circle's radius and none through another number, and lets a leader leave its region from the coast nearest its number. It takes a few seconds on a crowded sheet.

`placeCallouts`, `calloutSpaces` and `calloutFaults` are the lower levels: the placement over any list of centroids and rings, the places a circle may sit, and the count of crossings and near-misses a sheet is held to.

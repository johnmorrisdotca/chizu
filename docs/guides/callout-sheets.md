---
title: Make numbered callout sheets
section: how-to
order: 5
description: Place native callout circles and keep numbering reproducible for printed worksheets.
---

## Supply codes in lesson order

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { layoutCallouts, calloutFaults } from "@johnmorrisdotca/chizu";
const spots=layoutCallouts(WORLD,{codes:["JP","CA","GB"],numbering:"given",polish:false});
console.log(spots.map(spot=>[spot.code,spot.number]),calloutFaults(spots.map(spot=>({x:spot.circle[0],y:spot.circle[1],hx:spot.start[0],hy:spot.start[1]})),spots[0]?.radius??0));
```

`numbering:"given"` follows the supplied codes. `west-to-east` uses drawn positions. Keep the same map, code order and layout options when reusing an answer sheet. Insets and wrapped copies use their drawn positions, while leader anchors stay on the native region’s land.

## Preview and final output

The polishing pass searches for a better layout and can take longer than a live preview. Use the normal fast preview settings during interaction; choose `polish:true` when preparing the final sheet. It improves crossing/clearance faults without promising that every dense map can fit all requested circles. Reduce the selected set or enlarge the drawing when a worksheet becomes crowded.

The [README examples](../../README.md#number-twenty-places-for-a-printed-sheet) and preserved [framing guide](../framing-a-map.md) explain the native geometry. The SVG output can carry its style for printing or saving.

import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";

const svg = drawChizu(WORLD, {
  style: true,
  overlays: [
    { kind: "area", ring: [[66, -180], [-66, 0], [66, 180], [-90, 180], [-90, -180]], opacity: 0.35 },
    { kind: "line", points: [[0, 150], [20, 175], [30, -160]], color: "#c0392b", width: 2 },
    { kind: "mark", at: [35.68, 139.69], label: "Tokyo", id: "here" },
  ],
});
console.log(svg.includes('class="cz-overlays"'), svg.includes('data-id="here"'));
// true true

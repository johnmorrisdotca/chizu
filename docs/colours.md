# A colour for each region

`drawChizu` and `mountChizu` take `colors`, a colour for each region by code, for two or more places that must be told
apart: two countries side by side, a region of your own colouring, a map coloured by something the library does not know.

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";
import { focusBox } from "@johnmorrisdotca/chizu";

const svg = drawChizu(WORLD, {
  box: focusBox(WORLD, ["JP", "KR"]),
  colors: { JP: "#2f6b4f", KR: "#8a3b3b" },
  style: true,
});
console.log(svg.includes('data-color="#2f6b4f"'), svg.includes("--cz-color:#8a3b3b"));
// true true
```

A mounted map takes the same option, and `mount.set({ colors })` changes it later.

## What a colour is

A hex colour (`#2f6b4f`, `#fc0`, with an alpha too), a CSS colour name (`teal`), `rgb()`, `hsl()` (and their `a`
forms) or `var(--name)`, so a colour can follow the page's own theme. Anything else is left out of the drawing, not
repaired: a value that came from an address or a form cannot end the attribute it is written into, or add a style.
`isChizuColour(text)`, from `@johnmorrisdotca/chizu/draw`, says whether a value will be drawn, so a colour picker or a
link can check before it asks. A name that is no colour (`tealish`) is drawn, and the browser then fills the region with
its default black: check a name you do not control with `isChizuColour` and a list of your own.

## How it is drawn

A region with a colour carries `data-color="…"` and `style="--cz-color:…"` on its `<g class="cz-region">`, and the style
fills its land with that colour. The colour is the same in the light and the dark look, and it wins over the region's
tone's fill. A region with both a colour and the `selected` tone keeps a heavier outline, so the choice still shows. A
region with no colour is drawn as it always was, and a map drawn without `colors` is byte for byte what it was before.

The `style` attribute is a custom property on the element, set by the drawing, so a page whose Content Security Policy
refuses inline styles can set `--cz-color` itself from `[data-color]` in its own stylesheet.

## Capitals

The capital's mark is not an option of its own: capitals are one of the named features, drawn as a ring round a dot and
named beside it, and they are off until chosen. Turn them on with `features: ["capitals"]` (and the map's `featureLayer`,
`loadFeatures(map.id)`), off by leaving them out. See [features.md](./features.md).

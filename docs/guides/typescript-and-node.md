---
title: TypeScript and Node
section: how-to
order: 16
description: Use the package's types, and draw the same map as SVG text on a server with no DOM.
---

The package ships its own types, for each entry point. Drawing is pure: map data goes in and SVG text comes out, so the same call gives the same answer in Node, Deno, Bun, a worker and a browser. This file type-checks, then runs under Node 22.18 or later, which strips the types.

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu, type ChizuDrawOptions } from "@johnmorrisdotca/chizu/draw";

const options: ChizuDrawOptions = { language: "ja", style: true, colors: { JP: "#2f6b4f" } };
const svg: string = drawChizu(WORLD, options);
console.log(svg.startsWith("<svg"), WORLD.regions.length);

// @ts-expect-error "neon" is not a language
const language: ChizuDrawOptions["language"] = "neon";
console.log(language);
```

`@ts-expect-error` is there to show that `"neon"` is not a language the map has names for; the compiler refuses it.

## On a server

A server draws the same SVG a browser does. There is no DOM, so the page is a string.

```mjs
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";

// A server draws the same SVG a browser does: pure, no DOM, no browser globals.
const svg = drawChizu(WORLD, { language: "ja", style: true, colors: { JP: "#2f6b4f" } });
const page = `<!doctype html><title>The world</title>${svg}`;
console.log(page.length > 1000, WORLD.regions.length);
```

See [getting started](getting-started.md) for mounting the map in a page and [loading maps](loading-maps.md) for the other maps.

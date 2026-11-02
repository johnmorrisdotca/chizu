---
title: Vite and webpack
section: how-to
order: 14
description: Install the package and import the map element in a Vite or webpack project.
---

Install it.

```sh
npm install @johnmorrisdotca/chizu
# or: pnpm add @johnmorrisdotca/chizu
# or: yarn add @johnmorrisdotca/chizu
```

Everything is an ES module with its own entry point, so a bundler keeps only what you import: `@johnmorrisdotca/chizu`, `/draw` (map data in, SVG text out), `/mount`, `/world`, `/element` and `/element/define`, which registers the tags once.

## Vite

The page.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Chizu with Vite</title>
  </head>
  <body>
    <chizu-map region="world" highlight="JP CA" labels></chizu-map>
    <script type="module" src="./main.ts"></script>
  </body>
</html>
```

The script. Vite builds this entry with no configuration.

```ts no-run
import "@johnmorrisdotca/chizu/element/define";

const map = document.querySelector("chizu-map")!;
map.addEventListener("chizu-load", (event) => console.log((event as CustomEvent<{ region: string }>).detail.region));
```

## webpack

The entry.

```js no-run
import "@johnmorrisdotca/chizu/element/define";

const map = document.createElement("chizu-map");
map.setAttribute("region", "world");
map.setAttribute("highlight", "JP CA");
map.setAttribute("labels", "");
document.body.append(map);
```

`webpack.config.mjs`. webpack 5 needs nothing special for a package with `exports`.

```mjs no-run
import { fileURLToPath } from "node:url";

export default {
  mode: "production",
  entry: "./src/index.js",
  output: { path: fileURLToPath(new URL("./dist", import.meta.url)), filename: "main.js" },
};
```

Run `npx webpack` and load the `dist/main.js` it makes from a page.

## Other tools

Anything that reads `exports` in `package.json` works the same way: Rollup, esbuild, Parcel, Bun, Deno (`npm:@johnmorrisdotca/chizu/element/define`). The only entry with a side effect is `element/define`, which `package.json` says in `sideEffects`, so tree shaking removes the rest.

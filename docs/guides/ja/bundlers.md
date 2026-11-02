---
title: Vite と webpack
section: how-to
order: 14
description: パッケージをインストールして、Vite や webpack のプロジェクトで地図の要素を import します。
---

インストールします。

```sh
npm install @johnmorrisdotca/chizu
# または: pnpm add @johnmorrisdotca/chizu
# または: yarn add @johnmorrisdotca/chizu
```

すべて ES モジュールで、エントリーポイントごとに分かれています。バンドラーは import したものだけを含めます。`@johnmorrisdotca/chizu`、`/draw` (地図データから SVG の文字列を作る)、`/mount`、`/world`、`/element`、そしてタグを1回だけ登録する `/element/define` があります。

## Vite

ページです。

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

スクリプトです。Vite は設定なしでこのエントリーをビルドします。

```ts no-run
import "@johnmorrisdotca/chizu/element/define";

const map = document.querySelector("chizu-map")!;
map.addEventListener("chizu-load", (event) => console.log((event as CustomEvent<{ region: string }>).detail.region));
```

## webpack

エントリーです。

```js no-run
import "@johnmorrisdotca/chizu/element/define";

const map = document.createElement("chizu-map");
map.setAttribute("region", "world");
map.setAttribute("highlight", "JP CA");
map.setAttribute("labels", "");
document.body.append(map);
```

`webpack.config.mjs` です。webpack 5 は、`exports` を持つパッケージに特別な設定が要りません。

```mjs no-run
import { fileURLToPath } from "node:url";

export default {
  mode: "production",
  entry: "./src/index.js",
  output: { path: fileURLToPath(new URL("./dist", import.meta.url)), filename: "main.js" },
};
```

`npx webpack` を実行し、できた `dist/main.js` をページから読み込みます。

## ほかのツール

`package.json` の `exports` を読めるツールなら、同じように使えます。Rollup、esbuild、Parcel、Bun、Deno (`npm:@johnmorrisdotca/chizu/element/define`) などです。副作用があるのは `element/define` だけで、`package.json` の `sideEffects` に書いてあるので、ツリーシェイキングで残りは取り除かれます。

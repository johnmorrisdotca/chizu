---
title: TypeScript と Node
section: how-to
order: 16
description: パッケージの型を使います。DOM のないサーバーでも、同じ地図を SVG の文字列として描けます。
---

パッケージは、エントリーポイントごとに自分の型を持っています。描画は純粋で、地図データを渡すと SVG の文字列が返ります。なので、Node でも Deno でも Bun でもワーカーでもブラウザでも、同じ呼び出しは同じ答えを返します。このファイルは型を検査したあと、型を取り除いてくれる Node 22.18 以降でそのまま実行します。

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

`@ts-expect-error` は、`"neon"` が地図の名前を持つ言語ではなく、コンパイラが断ることを示すためのものです。

## サーバーで

サーバーでも、ブラウザと同じ SVG を描けます。DOM がないので、ページは文字列です。

```mjs
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";

// A server draws the same SVG a browser does: pure, no DOM, no browser globals.
const svg = drawChizu(WORLD, { language: "ja", style: true, colors: { JP: "#2f6b4f" } });
const page = `<!doctype html><title>The world</title>${svg}`;
console.log(page.length > 1000, WORLD.regions.length);
```

ページに地図をマウントする方法は [はじめに](getting-started.md)、ほかの地図は [地図の読み込み](loading-maps.md) を見てください。

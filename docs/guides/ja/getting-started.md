---
title: はじめに
section: tutorial
order: 1
description: 地図を1枚描き、計算・データ・ページへの表示の役割を確かめます。
---

## ページを使わずに地図を描く

Chizuの計算部分は、通常の地図データを受け取ります。描画の結果はSVGの文字列なので、サーバーの応答やビルド処理でも使えます。世界、国の輪郭、行政区画、地物の各データには、それぞれのimportがあります。計算部分だけを読み込んでも、地図データは取得しません。

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";
const svg=drawChizu(WORLD,{language:"ja",style:true,colors:{JP:"#2f6b4f"}});
console.log(WORLD.id,WORLD.regions.length,svg.startsWith("<svg"));
```

`style:true`は、画像の中に標準の描画スタイルを含めます。操作できる地図は、表示先に必要なスタイルを設定します。地図内の座標は、その地図のキャンバス上の値です。経度と緯度には、投影の関数を使います。

## ページに表示する

```ts no-run
import WORLD from "@johnmorrisdotca/chizu/world";
import { mountChizu } from "@johnmorrisdotca/chizu/mount";
const host=document.createElement("div");
document.body.append(host);
const mounted=mountChizu(host,{map:WORLD,onSelect:code=>console.log(code)});
mounted.select("JP");
console.log(mounted.view().zoom);
mounted.destroy();
```

表示先を取り除くときは`destroy()`を呼びます。[読み込み](loading-maps.md)、[表示範囲](framing-insets.md)、[フレームワークの例](../../frameworks.md)へ進めます。

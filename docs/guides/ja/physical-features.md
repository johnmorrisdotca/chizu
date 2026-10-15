---
title: 地物を描いて検索する
section: how-to
order: 7
description: 地物レイヤーを対応する地図に合わせ、水域・首都・種類を選びます。
---

## 地図とレイヤーをそろえる

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { loadFeatures } from "@johnmorrisdotca/chizu/load";
import { findFeatures, featureMap } from "@johnmorrisdotca/chizu";
const layer=await loadFeatures(WORLD);
if(layer){
 console.log(layer.map,findFeatures(layer.features,"Caspian").map(one=>one.name));
 console.log(featureMap(WORLD,layer,["water"]).regions.length);
}
```

`drawChizu`は、レイヤーの地図IDが表示する地図と一致した場合に描きます。`features`には`water`、`all`、`marine`、`lakes`、`rivers`、`peaks`、`capitals`、または地物の種類を指定できます。標準の描画では地物を追加しません。埋め込みビルダーの首都スイッチは、ビルダー側で明示的な初期値を指定します。

## 元の名前を変えずに検索する

英語・日本語の名前、読み、コードで検索できます。元のデータに日本語名や読みのない地物もあります。その場合は標準の代替表示を使い、名前を作って補いません。`featureMap`を使うと、同じキャンバスで地物を地域として扱い、表示範囲、クイズ、貼り付けた名前の道具を使えます。

[地物の出典と名前のリファレンス](../../features.md)と[上流データの既知の問題](../../upstream-name-issues.md)は、そのまま残しています。

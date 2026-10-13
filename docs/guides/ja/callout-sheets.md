---
title: 番号付きの注記を作る
section: how-to
order: 5
description: 標準の番号付きの円を配置し、教材の番号を再現できるようにします。
---

## 教材の順にコードを指定する

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { layoutCallouts, calloutFaults } from "@johnmorrisdotca/chizu";
const spots=layoutCallouts(WORLD,{codes:["JP","CA","GB"],numbering:"given",polish:false});
console.log(spots.map(spot=>[spot.code,spot.number]),calloutFaults(spots.map(spot=>({x:spot.circle[0],y:spot.circle[1],hx:spot.start[0],hy:spot.start[1]})),spots[0]?.radius??0));
```

`numbering:"given"` はコードの指定順です。`west-to-east` は描画位置から順を決めます。解答用紙を再利用する場合は、地図、コードの順序、配置の設定をそろえます。別枠や横につながる世界地図では、円の配置に描画位置を使い、引き出し線は地域の陸地に向けます。

## プレビューと完成用の出力

仕上げの処理は、よりよい配置を探すため、プレビューより時間がかかる場合があります。操作中は通常の軽い設定を使い、完成した教材を作るときに `polish:true` を選べます。線の交差や間隔を改善しますが、密集した地図で全ての円を置けるとは限りません。混み合うときは地域を減らすか、描画を大きくします。

[README の例](../../../README.md#number-twenty-places-for-a-printed-sheet)と[表示範囲のガイド](../../framing-a-map.md)に、形の扱いを残しています。保存や印刷には、スタイルを含めた SVG を使えます。

---
title: シード付きの地理クイズを作る
section: how-to
order: 6
description: 地図・正解・候補・乱数をそろえて、問題を再現します。
---

## 標準の問題を作る

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { findQuestion, seededRandom } from "@johnmorrisdotca/chizu";
const question=findQuestion(WORLD,"JP",seededRandom(42),{count:3});
console.log(question?.target,question?.choices,question?.answerIndex);
```

`count`は誤答の数です。並べ替えた選択肢には正解も含まれます。`answerIndex`は、その選択肢の中の正解位置です。不明な地域や、名前のない地域として明示されたものは`null`になります。候補が少なければ、選択肢も少なくなります。誤答の得点は、隣接する地域、同じグループ、近い位置などを考慮します。

## 小さな国も出題されます

世界地図は1:110mの輪郭を使うため、238か国のうち62か国（シンガポール、マルタ、バーレーン、カリブ海や太平洋の多くの国）は輪郭で描けず、`WORLD`は173地域です。クイズでは、この62か国を点（`small: true`の地域）として加えます。`findQuestion`と`pickDistractors`は世界地図で標準でこれらを出題し、選択肢にも入れます。`<chizu-quiz>`も同じです。173か国だけにするには`smallStates: false`（要素では`small-states="off"`）を渡します。地図に点を描くには、`withSmallStates(WORLD)`を使うか、`drawChizu`と`mountChizu`に`smallStates: true`を渡します。

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { findQuestion, seededRandom, withSmallStates } from "@johnmorrisdotca/chizu";
console.log(WORLD.regions.length, withSmallStates(WORLD).regions.length, findQuestion(WORLD, "SG", seededRandom(1))?.target);
```

## 入力を固定する

同じシードから乱数を作り直すと、同じ問題を再現できます。1つの乱数を続けて使うと、値は先へ進みます。シードだけでなく、データの版、候補の制限、正解の順序、誤答の数もそろえます。地物のクイズには、対応するキャンバス上で地物を地域として扱う地図を作ります。点数や解答の保存はアプリ側の役割です。

[地物レイヤー](physical-features.md)と[API](api:findQuestion)は、デモと埋め込みでも使う同じ規則です。

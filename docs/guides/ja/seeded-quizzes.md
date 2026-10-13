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

`count` は誤答の数です。並べ替えた選択肢には正解も含まれます。`answerIndex` は、その選択肢の中の正解位置です。不明な地域や、名前のない地域として明示されたものは `null` になります。候補が少なければ、選択肢も少なくなります。誤答の得点は、隣接する地域、同じグループ、近い位置などを考慮します。

## 入力を固定する

同じシードから乱数を作り直すと、同じ問題を再現できます。1つの乱数を続けて使うと、値は先へ進みます。シードだけでなく、データの版、候補の制限、正解の順序、誤答の数もそろえます。地物のクイズには、対応するキャンバス上で地物を地域として扱う地図を作ります。点数や解答の保存はアプリ側の役割です。

[地物レイヤー](physical-features.md)と[API](api:findQuestion)は、デモと埋め込みでも使う同じ規則です。

---
title: 地図を色分けして名前を表示する
section: how-to
order: 4
description: 地域コード、安全な色指定、表示名を使って地図を色分けします。
---

## 地域を色分けする

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu, isChizuColour } from "@johnmorrisdotca/chizu/draw";
console.log(isChizuColour("rgb(20, 80, 140)"),isChizuColour("red;position:fixed"));
const svg=drawChizu(WORLD,{colors:{JP:"#2f6b4f",CA:"#8a3b3b"},labels:["JP","CA"],language:"ja",style:true});
console.log(svg.includes('data-code="JP"'));
```

描画に指定するキーは、その地図の地域コードです。東京都は`13`、対応するISOコードは`JP-13`です。外部のISOコードを描画に直接渡すときは、先に対応する地域コードへ変換します。要素とビルダーの色指定は、埋め込みの仕様に記載したISOコードの対応にも従います。数値による色分けには有限の`data`値を、地域ごとの固定色には`colors`を使います。

## 読み上げる名前を保つ

`nameOf`は表示名を選び、日本語では用意されている短い日常の名前も使います。ラベルと地域の読み上げ名は、選んだ言語に従います。独自のトーンは、記載されたCSSの変数やクラスで定義できます。地域の固定色はトーンの塗りに優先しますが、選択を示す輪郭は残ります。色は明るい表示と暗い表示の両方で確認してください。

[色のAPI](../../colours.md)、[ISOコードの対応](../../iso-codes.md)、[埋め込みの色設定](../../embed-colours-ja.md)に、詳しい仕様があります。

---
title: 地図・場所の表示・クイズを埋め込む
section: how-to
order: 8
description: 標準の要素・フレーム・モジュールを選び、ページ側でイベントを扱います。
---

## 埋め込み形式を選ぶ

ビルダーは、実際の地図、場所の表示、クイズをプレビューします。出力には要素、版を指定したiframe、モジュール、フレームワークの例があります。地図を選び、言語、大きさ、地物や首都、色、その表示形式の設定を決めます。場所の表示は、地物の名前や経度・緯度を受け取ります。利用者の端末から現在地を取得する処理はありません。

```ts no-run
import "@johnmorrisdotca/chizu/element/define";
import { ChizuMapElement } from "@johnmorrisdotca/chizu/element";
const map=new ChizuMapElement();
map.setAttribute("region","world");
map.setAttribute("lang","ja");
map.setAttribute("colors","JP:#2f6b4f,CA:#8a3b3b");
document.body.append(map);
console.log(map.tagName,map.getAttribute("region"));
map.remove();
```

## ページ側のイベントと入力の扱い

仕様に記載したコールバックやイベントを使います。フレームのメッセージは`event.origin`と`event.source`を確認してから扱います。公開メッセージは表示やゲームの情報を伝えます。入力の保存はページ側で管理します。標準の要素登録は既存の定義を保ちます。独自のタグを登録するときは`/element`を読み込みます。

[埋め込みの仕様](../../embeds.md)、[フレームワークの例](../../frameworks.md)、[色と首都の設定](../../embed-colours-ja.md)に、全ての設定とイベントを残しています。デモとビルダーのDocsは、最初の言語と途中の切り替えに従います。APIのリンク先には既存のアンカーが残ります。

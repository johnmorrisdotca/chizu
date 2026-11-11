---
title: 地図・場所の表示・クイズを埋め込む
section: how-to
order: 8
description: 標準の要素・フレーム・モジュールを選び、ページ側でイベントを扱います。
---

## 埋め込み形式を選ぶ

ビルダーは、実際の地図、場所の表示、クイズをプレビューします。出力には要素、版を指定したiframe、モジュール、フレームワークの例があります。地図を選び、言語、大きさ、地物や首都、色、その表示形式の設定を決めます。場所の表示は、地物の名前や経度・緯度を受け取ります。利用者の端末から現在地を取得する処理はありません。

コードは、ファミリー共通の埋め込みパネルに出ます。ページへの入れ方ごとのタブ（カスタム要素、iframe、ESモジュール、React 19、Vue、Svelte、Angular、プレーンなHTML、iframeのアドレス）、コピー、選んだ設定で埋め込みページを開くリンク、このガイド、輪郭と地名のクレジットがあります。コードに入るのは、初期値と異なる選択だけです。「この設定へのリンクをコピー」と「最初からやり直す」はコピーの隣にあり、選んだタブはアドレスに残ります。

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

## iframe

埋め込みページの iframe には、自分のコードが要りません。アドレスで、地図 (`region`)、色をつける場所 (`highlight`)、名前の表示 (`labels`)、言語 (`lang`)、テーマ (`theme`) を選びます。枠のキーは、上の属性の名前と同じです。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Chizu in an iframe</title>
  </head>
  <body>
    <iframe
      src="https://johnmorrisdotca.github.io/chizu/embed/?region=world&highlight=JP%20CA&labels=on"
      title="The world, with Japan and Canada lit"
      width="480"
      height="320"
      loading="lazy"
      style="border: 0"
    ></iframe>
  </body>
</html>
```

## ページ側のイベントと入力の扱い

仕様に記載したコールバックやイベントを使います。フレームのメッセージは`event.origin`と`event.source`を確認してから扱います。公開メッセージは表示やゲームの情報を伝えます。入力の保存はページ側で管理します。標準の要素登録は既存の定義を保ちます。独自のタグを登録するときは`/element`を読み込みます。

[埋め込みの仕様](../../embeds.md)、[フレームワークの例](../../frameworks.md)、[色と首都の設定](../../embed-colours-ja.md)に、全ての設定とイベントを残しています。デモとビルダーのDocsは、最初の言語と途中の切り替えに従います。APIのリンク先には既存のアンカーが残ります。

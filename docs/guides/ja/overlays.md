---
title: 緯度・経度から線、点、塗りつぶした範囲を描く
section: how-to
order: 18
description: 軌跡、場所、夜の側などを数値で渡すと、世界地図の陸の上に描きます。小さな挿入図でも読める大きさです。
---

## 地図に数値を渡す

`drawChizu`の`overlays`には、`[緯度, 経度]`（度）で指定した図形のリストを渡します。Chizu は図形の意味を知りません。人工衛星の軌跡、都市、夜の側などは、別のコードが計算した数値です。種類は3つです。

- `line`：`points`を順に結ぶ線。点から点へは近いほうの向きに進むので、日付変更線をまたいでも途切れません（170 から -170 は東へ20度、350 から 10 も20度です）。地球を一周する軌跡も1本の線になります。部分ごとに色を変えるには、部分ごとに線を分けて渡します（通った部分と、これから通る部分など）。
- `mark`：`at`の位置の点。`label`で名前を付けられます。
- `area`：`ring`の点で囲んだ範囲を`opacity`（0〜1）で塗りつぶします。渡したとおりに描くので、経度は途中で飛ばずに続けてください（170 から 190。170 から -170 にすると、地図を一周する帯を塗ります）。極を囲む範囲は、縁に沿って経度 -180 から 180 まで進み、極に沿って戻ります。

色は CSS の色、または`var(--name)`です。`width`と`size`はピクセル単位なので、幅240ピクセルの地図でも大きな地図と同じように読めます。`id`は図形の`data-id`として残ります。

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";

const svg = drawChizu(WORLD, {
  style: true,
  overlays: [
    { kind: "area", ring: [[66, -180], [-66, 0], [66, 180], [-90, 180], [-90, -180]], opacity: 0.35 },
    { kind: "line", points: [[0, 150], [20, 175], [30, -160]], color: "#c0392b", width: 2 },
    { kind: "mark", at: [35.68, 139.69], label: "Tokyo", id: "here" },
  ],
});
console.log(svg.includes('class="cz-overlays"'), svg.includes('data-id="here"'));
// true true
```

## 表示中の地図で入れ替える

`mountChizu`の地図も同じ`overlays`を受け取ります。`map.set({ overlays })`だけを呼ぶと、陸は描き直さず、拡大と表示範囲もそのままで図形だけを描き直すので、軌跡を数秒ごとに動かせます。`<chizu-map>`要素には同じ働きの`overlays`プロパティがあります（`element.overlays = [...]`）。`options`を設定すると地図を作り直します。

```ts no-run
import WORLD from "@johnmorrisdotca/chizu/world";
import { mountChizu } from "@johnmorrisdotca/chizu/mount";

const map = mountChizu(document.querySelector("#inset")!, { map: WORLD, controls: false, selectable: false });
map.set({ overlays: [{ kind: "mark", at: [51.6, -0.1], size: 10 }] });
```

## 小さな挿入図

240×120ピクセルの世界地図には陸と海が表示されます。国名は`labels`で指定したときだけ描きます。場所を示すだけの地図では、拡大・縮小ボタン（`controls: false`）と場所の選択（`selectable: false`）をオフにします。

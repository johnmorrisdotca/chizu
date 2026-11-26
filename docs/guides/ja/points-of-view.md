---
title: 領土が争われている場所を、ある国の立場のとおりに描く
section: how-to
order: 19
description: Natural Earthの線は、いま実際に支配している国を示します。立場を選ぶと、クリミアをウクライナに、北方領土を日本に描きます。
---

## 標準の描き方

どの地図も、Natural Earthの**実効支配**の線です。いま実際に支配している国の側に描きます。そのため、クリミアとセヴァストポリは、ロシア側に描かれます。択捉島、国後島、色丹島、歯舞群島（北方領土）も、ロシア側に描かれます。国連総会決議68/262とISO 3166は、クリミアとセヴァストポリをウクライナの一部として扱っています。日本政府は、北方領土を日本の領土としています。ページが立場を選ばないかぎり、Chizuは標準のまま描き、どちらの側にも立ちません。

## 2つの立場

| ID | 名前 | 変わるもの |
| --- | --- | --- |
| `ukr` | ウクライナの立場 | クリミアとセヴァストポリがウクライナの領土になります。世界、細かい世界、ウクライナの地図、ロシアの地図が変わり、ロシアの行政区画の地図から`UA-40`と`UA-43`が除かれます |
| `jpn` | 日本の立場 | 北方領土が日本の領土になります。細かい世界、日本の地図、ロシアの地図が変わります。最も粗い世界地図（1:110m）では島が小さすぎて描けないため、変わりません |

立場は、標準の輪郭の一部を動かすだけで、ほかは変えません。コード、名前、グループ、隣の国、キャンバスは同じです（ただし、ウクライナと日本の地図は、加わる部分が入るように大きくなります）。動かす部分は、Natural Earthが立場ごとに用意している線（`ne_10m_admin_0_countries_ukr`と`_jpn`）を物差しにして見つけます。動かす輪郭は標準のものなので、標準にない海岸線を描くことはありません。ロシアを除く行政区画の地図（日本など）は変わりません。

## 地図をページに表示する

`mountChizu`の`view`を指定すると、はじめて必要になったときに、その立場の輪郭を別のファイルとして読み込みます。地図はまず標準のまま表示し、読み込みが終わると立場に従って描き直します。`set({ view: null })`で標準に戻ります。

```ts no-run
import WORLD from "@johnmorrisdotca/chizu/world";
import { mountChizu } from "@johnmorrisdotca/chizu/mount";
import { CHIZU_VIEWS } from "@johnmorrisdotca/chizu/views";

const mount = mountChizu(document.querySelector("#map")!, { map: WORLD, view: "ukr" });
console.log(CHIZU_VIEWS.map((view) => view.name)); // 選択肢に使えます。それぞれ日本語と英語の説明があります
mount.set({ view: null });
```

## SVGを描く

`withView(map, view)`は、立場のとおりに描く地図を返します。`drawChizu`などに渡せます。`loadView(id)`は立場の輪郭を読み込みます。

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";
import { loadView, withView } from "@johnmorrisdotca/chizu/views";

const ukraine = withView(WORLD, await loadView("ukr"));
const svg = drawChizu(ukraine, { style: true });
console.log(svg.includes('data-code="UA"'), ukraine.regions.length === WORLD.regions.length);
// true true
```

どの立場で描いたかは、読む人に伝えてください。各立場には、地図の横に表示するための説明（`note`と`noteJa`）があります。デモの「領土の立場」の行が例です。

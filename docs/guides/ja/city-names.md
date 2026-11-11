---
title: 地図に都市の名前を表示する
section: how-to
order: 17
description: kuniのデータから、世界の都市の点と名前を描きます。拡大すると表示する都市が増え、名前どうしは重なりません。
---

## `drawChizu`に都市のリストを渡す

Chizuは都市のデータを持っていません。`drawChizu`の`cities`に、都市のリストを渡します。各都市には`id`、`name`（`en`と、あれば`ja`）、`lat`、`lon`、`population`が必要です。`capital`が`national`の都市は、点のまわりに輪を描きます。`country`のコードがあると、一つの国だけの地図ではその国の都市だけを表示します。

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";

const cities = [
  { id: "Q1490", name: { en: "Tokyo", ja: "東京都" }, lat: 35.69, lon: 139.69, population: 14_000_000, capital: "national", country: "JP" },
  { id: "Q35765", name: { en: "Osaka", ja: "大阪市" }, lat: 34.69, lon: 135.5, population: 2_750_000, country: "JP" },
];
const svg = drawChizu(WORLD, { cities, language: "ja", style: true });
console.log(svg.includes('data-city="Q1490"'));
// true
```

## kuniの都市を使う

`@johnmorrisdotca/chizu/cities`は、kuni 国（`@johnmorrisdotca/kuni` 1.6.0以降）の都市を読み込みます。kuniは任意のピア依存関係なので、使うときはChizuと一緒にインストールしてください。`loadKuniCities()`は、すべての首都と、人口10万人以上の都市（合わせて約9,000都市）を返します。少なくしたり増やしたりするときは、階層（`"capitals"`、`"1m"`、`"100k"`、`"15k"`）を指定します。階層ごとに別のファイルで、はじめて必要になったときに読み込みます。

```ts no-run
import WORLD from "@johnmorrisdotca/chizu/world";
import { mountChizu } from "@johnmorrisdotca/chizu/mount";
import { loadKuniCities } from "@johnmorrisdotca/chizu/cities";

// 地図をはじめて描くときに、一度だけ呼ばれます。拡大すると表示する都市が増えます。
mountChizu(document.querySelector("#map")!, { map: WORLD, cities: loadKuniCities });
```

`<chizu-map>`では、同じように`options.cities`を設定します。埋め込みビルダーには、まだ都市の設定がありません。ビルダーは都市のデータを読み込まないためです。

## 表示する都市と、名前の位置

- **拡大すると増えます。** 世界全体を表示しているときは、人口500万人以上の都市だけを表示します。範囲が狭くなるほど人口の下限が下がり、幅400 kmの範囲では15,000人になります。`cityOptions.minPopulation`を指定すると、基準を固定できます。
- **大きい都市から順に置きます。** 人口の多い順（国の首都は人口を2倍として数えます）に置き、名前は点の右に置き、入らなければ左、上、下の順に置きます。名前がどこにも収まらない都市は、点ごと表示しません。そのため、名前がほかの都市の名前や点に重なることはなく、点どうしも重なりません。ただし、地域の名前、地物の名前、番号つきの目印は避けません。
- **名前は英語か日本語です。** 描画の`language`に合わせます。日本語の名前がない都市は、日本語のページでも英語の名前で表示します。名前を作って補うことはしません。
- **緯度・経度から位置を求められる地図だけです。** 世界地図、一つの国だけの地図、一か所の地図（ローカル地図）に都市を表示します。地方に分けた地図は、逆算できない投影で作っているため、都市を表示しません。
- **地物の首都との関係。** 都市を一つでも表示すると、首都は都市として表示するため、地物の`capitals`は重ねて描きません。都市を表示しない地図（地方に分けた地図など）では、地物の首都をそのまま描きます。

`@johnmorrisdotca/chizu`の`placeCities`、`cityPopulationFloor`、`windowKilometres`を使うと、描画せずに、同じ基準で選んだ都市とその配置を得られます。地図の横に一覧を出すときや、自分のテストに使えます。

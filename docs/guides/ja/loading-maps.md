---
title: 必要な地図だけを読み込む
section: how-to
order: 2
description: 国・行政区画・地物のデータを選び、対応するキャンバスで使います。
---

## データを選ぶ

`/countries/jp`は、日本全体を1つの地域として描く輪郭です。`/divisions/jp`は都道府県です。コード、キャンバスの大きさ、投影、別枠は、用途に合わせて異なります。世界地図の輪郭は粗めですが、拡大表示には細かい世界地図を読み込めます。国名とグループは`/names`だけで使えます。

```ts
import { loadCountry, loadDivisions, loadFeatures, COUNTRY_CODES, DIVISIONS_CODES } from "@johnmorrisdotca/chizu/load";
const country=await loadCountry("JP");
const divisions=await loadDivisions("jp");
const features=divisions?await loadFeatures(divisions):null;
console.log(COUNTRY_CODES.length,DIVISIONS_CODES.length,country?.id,divisions?.regions.length,features?.map);
```

国と行政区画の読み込みでは、大文字と小文字を区別しません。存在しないデータは`null`です。動的import自体に失敗した場合は、アプリ側でエラーを扱います。`FEATURE_MAPS`は用意されている地物レイヤーのID一覧です。レイヤーは`map`フィールドで指定された地図に対応します。

## イギリス：gb と gb-2025

イギリスの行政区画の地図は2つあります。今の区画は`gb-2025`（`/divisions/gb-2025`、`loadDivisions("gb-2025")`）です。イングランド、スコットランド、ウェールズの2025年の区画を英国国家統計局（ONS）のデータで描きます。Cumberland、Westmorland and Furness、North Northamptonshire などが入っています。北アイルランドは`gb`と同じです。`gb`（`/divisions/gb`）はNatural Earthの地図で、2019年から2023年の再編より前の区画のままです。コードが消えないように、`gb`は変えていません。次のメジャーリリースで既定の地図が入れ替わり、`gb`が2025年の区画になります。

```ts
import { loadDivisions, DIVISIONS_CODES } from "@johnmorrisdotca/chizu/load";
const uk=await loadDivisions("gb-2025");
console.log(DIVISIONS_CODES.includes("GB-2025"),uk?.id,uk?.regions.some((region)=>region.name==="Cumberland"));
```

経度・緯度のデータは`/divisions-geo/gb-2025`、地物は`/features/divisions-gb-2025`です。ISO 3166-2のコードがまだない2つの区画は、ONSのコード（`E06000063`、`E06000064`）を`code`に使い、`iso`はありません。

その境界の出典は`CHIZU_SOURCE`（`@johnmorrisdotca/chizu/names`）です。Natural Earthと英国国家統計局（Office for National Statistics）の両方が入っています。Open Government Licence v3.0が求める表示は、データの提供者が指定した次の2行で、`CHIZU_SOURCE.ons.attribution`に英文のまま入っています。「Source: Office for National Statistics licensed under the Open Government Licence v.3.0」「Contains OS data © Crown copyright and database right 2025」。この英文は訳さずに載せてください。

## 固定のimportと動的な読み込み

いつも同じ地図を描くページでは、データを直接importできます。利用者が選ぶ場合は`loadCountry`、`loadDivisions`、`loadFeatures`を使います。今回一覧に加えた名前付きのエクスポートは、既存のワイルドカードと同じパスです。データと並び順は変えていません。

## ベトナム：63の省と2025年の34の省・市

ベトナムには行政区画の地図が2つあります。`/divisions/vn`はNatural Earthの63の省・市で、2025年6月30日までの区分です。`/divisions/vn-2025`は決議202/2025/QH15による34の省・市で、こちらが今の法律に合っています（新しい省・市は2025年7月1日から動いています）。同じ輪郭を古い境界でつないで作っているので、2つの地図のキャンバスと投影は同じです。

```ts
import { loadDivisions } from "@johnmorrisdotca/chizu/load";
const now = (await loadDivisions("vn-2025"))!;
const before = (await loadDivisions("vn"))!;
console.log(now.regions.length, before.regions.length);
// 34 63
```

`vn`は次のメジャーバージョンまで63のままで、そこで34に変わります。ISO 3166-2はまだ63のままなので、34のうち合併した23には、ISOが更新されるまで`iso`がありません。ISOコードで結びつけたデータでは、この23は色がつきません。このようなデータは`code`で結びつけてください。合併した省・市は、名前を受け継いだ元の省のコードを`code`として使います（トゥエンクアン省は`07`）。一覧は[ISOコード](../../iso-codes.md)にあります。

[地図データ](../../map-data.md)、[ISOコード](../../iso-codes.md)、[国名の扱い](../../names.md)も参照してください。

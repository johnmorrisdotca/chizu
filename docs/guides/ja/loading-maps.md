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

## 固定のimportと動的な読み込み

いつも同じ地図を描くページでは、データを直接importできます。利用者が選ぶ場合は`loadCountry`、`loadDivisions`、`loadFeatures`を使います。今回一覧に加えた名前付きのエクスポートは、既存のワイルドカードと同じパスです。データと並び順は変えていません。

[地図データ](../../map-data.md)、[ISOコード](../../iso-codes.md)、[国名の扱い](../../names.md)も参照してください。

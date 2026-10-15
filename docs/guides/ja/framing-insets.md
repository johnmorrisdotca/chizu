---
title: 地域と別枠を表示範囲に収める
section: how-to
order: 3
description: 地域コードを使って表示範囲を決め、地理上の位置と別枠の描画位置を区別します。
---

## 選んだ地域を収める

```ts
import JAPAN from "@johnmorrisdotca/chizu/divisions/jp";
import { focusRegionFit, regionCentre, wholeMapBox, boxToViewBox } from "@johnmorrisdotca/chizu";
console.log(focusRegionFit(JAPAN,"47")?.zoom,regionCentre(JAPAN,"47"));
console.log(boxToViewBox(wholeMapBox(JAPAN)),focusRegionFit(JAPAN,"unknown"));
```

沖縄などの離島は別枠に描かれます。表示範囲の関数は、地域が描かれた位置を使うので、別枠を選んでも画面内に収まります。`focusRegionFit`と`regionCentre`は、コードが`null`または不明なら`null`を返します。`focusBox`と`zoomToFit`は、一致する地域がなければ地図全体に戻ります。この結果だけでは、入力したコードが一致したとは判断できません。

## 世界地図を横につなぐ

`MAP_ZOOM_LEVELS`は10段階です。`stepMapZoom`は両端で止まります。世界地図の東西はつながっているため、`zoomBox`は横の継ぎ目を越えられます。必要な地図の複製は`wrapOffsets`で求めます。国の地図は通常、キャンバス内に収まります。経度・緯度には`projectPoint`と`unprojectPoint`を使います。別枠の位置は描画上の位置です。

詳しい形と表示範囲の例は、[表示範囲のリファレンス](../../framing-a-map.md)に残しています。

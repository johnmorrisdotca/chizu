---
title: 通常の HTML と CDN
section: how-to
order: 13
description: jsDelivr や unpkg の script タグ1つで、通常のページに地図を載せます。
---

ビルドは要りません。`element/define` を読み込むと `<chizu-map>`、`<chizu-locator>`、`<chizu-quiz>` のタグが登録されます。CDN の script タグで読み込めば、タグが自分で地図を描きます。地図のデータはパッケージに入っているので、ほかに読み込むものはありません。

## jsDelivr

jsDelivr は、`/+esm` を付けるとパッケージをブラウザ用のモジュールにしてくれます。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Chizu from jsDelivr</title>
    <script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/chizu/element/define/+esm"></script>
  </head>
  <body>
    <chizu-map region="world" highlight="JP CA" labels></chizu-map>
  </body>
</html>
```

## unpkg

unpkg はパッケージのファイルをそのまま配ります。`?module` を付けると、中の import を書き換えてくれます。

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Chizu from unpkg</title>
    <script type="module" src="https://unpkg.com/@johnmorrisdotca/chizu/dist/element-define.js?module"></script>
  </head>
  <body>
    <chizu-map region="world" highlight="JP CA" labels></chizu-map>
  </body>
</html>
```

## 注意

- `<script type="module">` を使います。普通の script では `import` できません。
- ページを変えたくないときは、アドレスにメジャーバージョンを書きます (`@johnmorrisdotca/chizu@1`)。
- 属性は [地図・ロケーター・クイズの埋め込み](embed-maps.md) にあります。何も表示されないときは、[困ったとき](troubleshooting.md) を見てください。

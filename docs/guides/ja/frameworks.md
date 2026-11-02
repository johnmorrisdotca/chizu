---
title: React・Vue・Svelte・Angular で使う
section: how-to
order: 15
description: React、Vue、Svelte、Angular で地図の要素を使います。サーバーでの描画でも動く import の仕方も説明します。
---

`<chizu-map>` は Web コンポーネントなので、どのフレームワークでも使えます。共通のことが2つあります。

1. **タグを登録するエントリー** (`@johnmorrisdotca/chizu/element/define`) を import します。サーバーで import しても何も登録しないので安全です。地図はブラウザで描かれます。
2. **フレームワークにそのタグがあることを伝えます。** React は型、Vue はコンパイラーのオプション、Angular はスキーマが要ります。Svelte は何も要りません。

マウントを細かく自分で制御したいときは、[マウントして使う方法](../../frameworks.md) を見てください。

## React

`WorldMap.tsx` です。React 19 は属性をそのままカスタム要素に渡します。

```tsx
import "@johnmorrisdotca/chizu/element/define";

export function WorldMap({ highlight = "JP CA" }: { highlight?: string }) {
  return <chizu-map region="world" highlight={highlight} labels />;
}
```

TypeScript では、React にそのタグがあることを教えます (`chizu-map.d.ts` のようなファイル)。

```ts no-run
import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "chizu-map": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & { region?: string; highlight?: string; labels?: boolean; lang?: string; theme?: string };
    }
  }
}
```

いつもどおりにマウントします。コンポーネントはサーバーでも文字列に描画できます (`renderToString`)。パッケージのテストで確かめています。タグは出力され、地図はブラウザで描かれます。

```tsx
import { createRoot } from "react-dom/client";
import { WorldMap } from "./WorldMap";

createRoot(document.getElementById("root")!).render(<WorldMap />);
```

## Vue

```vue
<script setup lang="ts">
import "@johnmorrisdotca/chizu/element/define";

withDefaults(defineProps<{ highlight?: string }>(), { highlight: "JP CA" });
</script>

<template>
  <chizu-map region="world" :highlight="highlight" labels></chizu-map>
</template>
```

`main.ts` で、`chizu-` で始まるタグがカスタム要素であることを Vue のコンパイラーに伝えます。

```ts no-check
import { createApp } from "vue";
import WorldMap from "./WorldMap.vue";

const app = createApp(WorldMap);
app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith("chizu-");
app.mount("#app");
```

Vite では、同じオプションを `vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("chizu-") } } })` に書きます。

## Svelte

```svelte
<script lang="ts">
  import "@johnmorrisdotca/chizu/element/define";

  let { highlight = "JP CA" }: { highlight?: string } = $props();
</script>

<chizu-map region="world" {highlight} labels></chizu-map>
```

```ts no-check
import { mount } from "svelte";
import WorldMap from "./WorldMap.svelte";

mount(WorldMap, { target: document.getElementById("app")! });
```

## Angular

スタンドアロンで、テンプレートに知らないタグを書けるよう `CUSTOM_ELEMENTS_SCHEMA` を付けます。要素は属性を読むので、`[attr.highlight]` で属性を結びます。

```ts no-check
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from "@angular/core";
import "@johnmorrisdotca/chizu/element/define";

@Component({
  selector: "app-world-map",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<chizu-map region="world" [attr.highlight]="highlight" labels></chizu-map>`,
})
export class WorldMapComponent {
  @Input() highlight = "JP CA";
}
```

```ts no-check
import "@angular/compiler";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideZonelessChangeDetection } from "@angular/core";
import { WorldMapComponent } from "./world-map.component";

void bootstrapApplication(WorldMapComponent, { providers: [provideZonelessChangeDetection()] });
```

## Next.js、Nuxt、SvelteKit

最初にサーバーで描画されますが、上の import はサーバーでも安全なので、コンポーネントはそのまま動きます。Next.js の App Router では、コンポーネントのファイルの先頭に `"use client"` を書きます。

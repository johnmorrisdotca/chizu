---
title: In React, Vue, Svelte and Angular
section: how-to
order: 15
description: Use the map element in React, Vue, Svelte and Angular, with the import that keeps a server render working.
---

`<chizu-map>` is a web component, so every framework can use it. Two things apply everywhere:

1. **Import the entry that registers the tag** (`@johnmorrisdotca/chizu/element/define`). It is safe to import on a server, where it registers nothing; the map is drawn in the browser.
2. **Tell the framework the tag exists.** React needs a type for it, Vue a compiler option, Angular a schema. Svelte needs nothing.

For code that wants full control of the mount, see [the mounted-map recipes](../frameworks.md).

## React

`WorldMap.tsx`; React 19 passes attributes through to a custom element.

```tsx
import "@johnmorrisdotca/chizu/element/define";

export function WorldMap({ highlight = "JP CA" }: { highlight?: string }) {
  return <chizu-map region="world" highlight={highlight} labels />;
}
```

With TypeScript, tell React the tag exists (a file such as `chizu-map.d.ts`):

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

Mount it as usual. The component renders to a string on a server (`renderToString`), as the package's tests check: the tag is there, the map is drawn in the browser.

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

Tell Vue's compiler that `chizu-*` tags are custom elements, in `main.ts`:

```ts no-check
import { createApp } from "vue";
import WorldMap from "./WorldMap.vue";

const app = createApp(WorldMap);
app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith("chizu-");
app.mount("#app");
```

With Vite, the same option goes in `vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith("chizu-") } } })`.

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

Standalone, with `CUSTOM_ELEMENTS_SCHEMA` so the template may hold an unknown tag. Bind an attribute with `[attr.highlight]`, since the element reads attributes:

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

## Next.js, Nuxt, SvelteKit

They render on a server first, and the import above is safe there, so the components work unchanged. In Next.js's App Router the component file starts with `"use client"`.

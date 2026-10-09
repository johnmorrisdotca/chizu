# Chizu in a framework

A map is drawn by one call that takes an element and hands back an object with `destroy()`, so every framework does the same three things: make the element, mount into it when the page has it, and destroy the mount when the page lets it go. The package has no tag and no framework code of its own.

## React

```jsx
import { useEffect, useRef } from "react";
import WORLD from "@johnmorrisdotca/chizu/world";
import { mountChizu } from "@johnmorrisdotca/chizu/mount";

export function WorldMap({ onSelect }) {
  const host = useRef(null);
  useEffect(() => {
    const map = mountChizu(host.current, { map: WORLD, onSelect });
    return () => map.destroy();
  }, [onSelect]);
  return <div ref={host} style={{ height: "70vh" }} />;
}
```

## Vue

```vue
<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import WORLD from "@johnmorrisdotca/chizu/world";
import { mountChizu } from "@johnmorrisdotca/chizu/mount";

const emit = defineEmits(["select"]);
const host = ref(null);
let map;
onMounted(() => { map = mountChizu(host.value, { map: WORLD, onSelect: (code) => emit("select", code) }); });
onBeforeUnmount(() => map?.destroy());
</script>

<template><div ref="host" style="height: 70vh"></div></template>
```

## Svelte

```svelte
<script>
  import { onMount } from "svelte";
  import WORLD from "@johnmorrisdotca/chizu/world";
  import { mountChizu } from "@johnmorrisdotca/chizu/mount";

  export let onSelect = () => {};
  let host;
  onMount(() => {
    const map = mountChizu(host, { map: WORLD, onSelect });
    return () => map.destroy();
  });
</script>

<div bind:this={host} style="height: 70vh"></div>
```

## Angular

```ts no-check
import { Component, ElementRef, OnDestroy, AfterViewInit, ViewChild } from "@angular/core";
import WORLD from "@johnmorrisdotca/chizu/world";
import { mountChizu } from "@johnmorrisdotca/chizu/mount";

@Component({ selector: "world-map", standalone: true, template: `<div #host style="height: 70vh"></div>` })
export class WorldMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild("host") host!: ElementRef<HTMLElement>;
  private map?: { destroy(): void };
  ngAfterViewInit() { this.map = mountChizu(this.host.nativeElement, { map: WORLD }); }
  ngOnDestroy() { this.map?.destroy(); }
}
```

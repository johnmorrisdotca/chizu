<script setup lang="ts">
import "@johnmorrisdotca/chizu/element/define";

withDefaults(defineProps<{ highlight?: string }>(), { highlight: "JP CA" });
</script>

<template>
  <chizu-map region="world" :highlight="highlight" labels></chizu-map>
</template>

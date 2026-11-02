<script lang="ts">
  import "@johnmorrisdotca/chizu/element/define";

  let { highlight = "JP CA" }: { highlight?: string } = $props();
</script>

<chizu-map region="world" {highlight} labels></chizu-map>

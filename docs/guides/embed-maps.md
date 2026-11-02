---
title: Embed maps, locators and quizzes
section: how-to
order: 8
description: Choose a native custom element, frame or module mount and handle events at the host.
---

## Choose an embedding format

The builder previews the real map, locator or quiz. Its output includes the custom element, a version-pinned iframe, module and framework recipes. Choose the map first, then language, sizing, feature/capital display, colours and the native options for that maker. A locator accepts a named feature or geographic point; it does not ask the browser for a visitor’s location.

```ts no-run
import "@johnmorrisdotca/chizu/element/define";
import { ChizuMapElement } from "@johnmorrisdotca/chizu/element";
const map=new ChizuMapElement();
map.setAttribute("region","world");
map.setAttribute("lang","ja");
map.setAttribute("colors","JP:#2f6b4f,CA:#8a3b3b");
document.body.append(map);
console.log(map.tagName,map.getAttribute("region"));
map.remove();
```

## An iframe

An iframe of the embed page needs no code of your own: the address chooses the map (`region`), the lit places (`highlight`), the names (`labels`), the language (`lang`) and the theme (`theme`). The frame's keys are the attribute names above.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Chizu in an iframe</title>
  </head>
  <body>
    <iframe
      src="https://johnmorrisdotca.github.io/chizu/embed/?region=world&highlight=JP%20CA&labels=on"
      title="The world, with Japan and Canada lit"
      width="480"
      height="320"
      loading="lazy"
      style="border: 0"
    ></iframe>
  </body>
</html>
```

## Host events and privacy

Use the documented native callbacks/events. For a frame, check `event.origin` and `event.source` before trusting its message. The public messages carry display/game metadata rather than storing personal inputs. Host code owns any persistence. The built-in element registration respects an existing definition; import `/element` when registering your own tags.

The full [embed contract](../embeds.md), [framework recipes](../frameworks.md) and [colour/capital controls](../embed-colours-ja.md) retain every option and event. Docs follows the demo/builder’s initial and live language selection; API keeps its export anchors.

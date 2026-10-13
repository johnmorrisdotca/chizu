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

## Host events and privacy

Use the documented native callbacks/events. For a frame, check `event.origin` and `event.source` before trusting its message. The public messages carry display/game metadata rather than storing personal inputs. Host code owns any persistence. The built-in element registration respects an existing definition; import `/element` when registering your own tags.

The full [embed contract](../embeds.md), [framework recipes](../frameworks.md) and [colour/capital controls](../embed-colours-ja.md) retain every option and event. Docs follows the demo/builder’s initial and live language selection; API keeps its export anchors.

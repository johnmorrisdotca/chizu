---
title: Build seeded geography quizzes
section: how-to
order: 6
description: Keep the map, target, candidate pool and random stream stable for reproducible questions.
---

## Ask a native question

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { findQuestion, seededRandom } from "@johnmorrisdotca/chizu";
const question=findQuestion(WORLD,"JP",seededRandom(42),{count:3});
console.log(question?.target,question?.choices,question?.answerIndex);
```

`count` requests wrong answers; the shuffled choices include the correct target. `answerIndex` indexes that shuffled list. An unknown or explicitly unnamed target yields `null`, and so does a `territoryPart` (Siachen Glacier, which is no country): such a region is drawn but never asked about or offered as a choice. A smaller candidate pool gives fewer choices. The distractor score favours neighbours, members of the same group and nearby shapes.

## Small countries are asked too, when you ask for them

The world is drawn from 1:110m outlines, which are too coarse for 62 of the 238 countries drawn at 1:50m (Singapore, Malta, Bahrain, most of the Caribbean and the Pacific), so `WORLD` has 173 regions and a quiz never asks for the other 62. `withSmallStates(WORLD)` from `@johnmorrisdotca/chizu/small-states` adds them as dots, regions with `small: true`, and `findQuestion` and `pickDistractors` ask and offer them as any other country. Nothing adds them by itself, so a seed gives the questions it always gave until you pass the new map: with it, the same seed gives different rounds, because there are 62 more countries to ask. `drawChizu` takes the same map; `mountChizu` has `smallStates: true`, and `<chizu-map>` and `<chizu-quiz>` have `small-states`, which fetch the table only when it is on.

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { withSmallStates } from "@johnmorrisdotca/chizu/small-states";
import { findQuestion, seededRandom } from "@johnmorrisdotca/chizu";
const withDots = withSmallStates(WORLD);
console.log(WORLD.regions.length, withDots.regions.length, findQuestion(withDots, "SG", seededRandom(1))?.target);
```

## Pin the inputs

Recreate the random source from the same seed to recreate the question. Reusing one source for several questions advances its stream. Pin the resource version, candidate restrictions, target sequence and count as well as the seed. A feature quiz first makes a native feature map on the corresponding canvas. Host applications own scores and answer submission; the pure engine does not store them.

[Feature layers](physical-features.md) and [the API](api:findQuestion) show the same native rules used by the demo and embeds.

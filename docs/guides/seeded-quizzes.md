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

`count` requests wrong answers; the shuffled choices include the correct target. `answerIndex` indexes that shuffled list. An unknown or explicitly unnamed target yields `null`. A smaller candidate pool gives fewer choices. The distractor score favours neighbours, members of the same group and nearby shapes.

## Pin the inputs

Recreate the random source from the same seed to recreate the question. Reusing one source for several questions advances its stream. Pin the resource version, candidate restrictions, target sequence and count as well as the seed. A feature quiz first makes a native feature map on the corresponding canvas. Host applications own scores and answer submission; the pure engine does not store them.

[Feature layers](physical-features.md) and [the API](api:findQuestion) show the same native rules used by the demo and embeds.

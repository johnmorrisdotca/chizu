---
name: Fix a translation
about: A Japanese name or string that reads wrongly or unnaturally, or a better reading for a kanji name
title: "Translation: "
labels: translation
---

Every string of the board is listed beside its English in `docs/strings-ja.md`. The demo page's words are in `demo/demo.js` (`WORDS.ja`), beside its English (`WORDS.en`); the board's own are in `src/strings.ts` (`CHIZU_STRINGS`). The names of countries and regions are Natural Earth's (Wikidata's): a wrong one is best fixed at [Wikidata](https://www.wikidata.org/) itself, and the everyday short names and the readings written for this package are in `scripts/data-config.mjs` (`SHORT_NAMES_JA`, `KANJI_READINGS`).

**Which string, or which country or region** (its name in that table, or its code, such as `ZA` or `divisions/de` `BY`):

**What it says now:**

**What it should say:**

**Why** (wrong meaning, unnatural, not the name a Japanese school's atlas uses, a reading that is wrong):

Are you a native reader of Japanese? (It helps to know; every correction is welcome either way.)

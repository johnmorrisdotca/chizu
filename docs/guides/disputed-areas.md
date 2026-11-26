---
title: Disputed areas and how chizu draws them
section: explanation
order: 20
description: For each place whose status is disputed, Natural Earth's rule, the UN or ISO position, and what chizu draws, with its code and whether it has a point of view.
---

## The rule

Chizu draws **Natural Earth's lines**, and Natural Earth's rule is **de facto**: a place is drawn in the country that holds it today, and the border between two claimants is the line each holds. It is a rule about who controls a place and not a ruling on who owns it, and the package takes no side. Two places have a point of view you can choose ([points of view](./points-of-view.md)); every region whose status is disputed carries `disputed: true` and a one-line `disputedNote` (`disputedNoteJa` in Japanese) that a page can show beside it.

The table says, for each place, what Natural Earth does, what the UN or ISO 3166 says, and what chizu draws, with the code. Codes are the region's own `code` on the map named. A place that is only part of a country's outline (Crimea inside Russia, the Golan inside Israel) cannot be marked on a region that is not its own, so only the regions listed under "The regions that carry the flag" carry `disputed`. The UN and ISO columns are positions on record and are not legal advice; where a position is not a vote of the General Assembly or the Security Council the cell says whose it is.

## The thirteen places

| Place | Natural Earth (the default) | UN or ISO position | What chizu draws |
| --- | --- | --- | --- |
| Crimea and Sevastopol | In Russia, which holds them (since 2014) | General Assembly resolution 68/262 (2014) affirms Ukraine's territorial integrity; ISO 3166-2 has `UA-43` and `UA-40` in Ukraine | In Russia on the world and on Russia's own map; on Russia's regions map as the regions `UA-43` and `UA-40` (flagged). **View `ukr`** draws them in Ukraine and takes the two regions off Russia's map |
| Northern Territories (北方領土: Etorofu, Kunashiri, Shikotan, the Habomai islets) | In Russia (Sakhalin Oblast), which holds them (since 1945) | No UN resolution. Japan's government holds them to be Japan's; ISO 3166-2:RU has them in Sakhalin | In Russia. At 1:110m they are too small to draw. **View `jpn`** draws them in Japan on the finer world and on Japan's and Russia's own maps |
| Kashmir (the valley, Jammu and Kashmir, Gilgit-Baltistan) | The line of control is the border between India and Pakistan; the valley is India's and Gilgit-Baltistan Pakistan's | UN Security Council resolution 47 (1948) and later ones call the status undetermined, to be settled by the people; ISO 3166-2 lists `IN-JK` and `IN-LA` for India and `PK-JK` and `PK-GB` for Pakistan | India's regions map has `JK` (flagged) and `LA` (flagged); the world has India and Pakistan meeting on the line of control |
| Aksai Chin | In China, which administers it | India claims it as part of Ladakh; no UN resolution | In China, so inside no region of India; India's `LA` (flagged) does not include it |
| Arunachal Pradesh | In India, which administers it | China claims it as South Tibet (藏南); no UN resolution; ISO 3166-2 has `IN-AR` in India | India's regions map has `AR` (flagged) |
| Golan Heights | In Israel, which has held it since 1967 | Security Council resolution 497 (1981) declared Israel's annexation null and void; most states, and the UN, count it as Syrian; the United States recognised Israel's sovereignty in 2019 | In Israel (`IL`) on the world; no region of its own |
| Western Sahara | A region of its own (`EH`) for the part Natural Earth draws apart from Morocco, about a third of the territory; the rest is inside Morocco's outline | The UN lists it as a non-self-governing territory whose status is not settled; ISO 3166-1 has its own code `EH` | `EH` (flagged) on the world and on its own map, beside Morocco's `MA` |
| Northern Cyprus | A separate admin-0 polygon (`CYN`), with the UN buffer zone | Security Council resolutions 541 (1983) and 550 (1984) call the declaration of independence legally invalid; only Turkey recognises it; ISO 3166-1 has Cyprus as one country | Left off every map. The 1:50m outline of Cyprus (`CY`) is the south only, so the finer world and Cyprus's own map have no north |
| Somaliland | A separate admin-0 polygon (`SOL`) | Declared independence in 1991; the UN and African Union count it as part of Somalia; ISO 3166-1 has Somalia as one country | Left off every map, as Northern Cyprus is. The 1:110m world has Somalia whole; the finer world and Somalia's own map have no Somaliland |
| Kosovo | A country of its own (`XK`) | Under Security Council resolution 1244 (1999) it was administered by the UN; it declared independence in 2008, and many states recognise it and Serbia and others do not. ISO 3166-1 has no code for it: `XK` is user-assigned | `XK` (flagged) on the world and on its own map, a country like any other |
| Taiwan | A country of its own (`TW`) | General Assembly resolution 2758 (1971) seated the People's Republic of China; ISO 3166-1 lists "Taiwan, Province of China" (`TW`) | `TW` (flagged) on the world and on its own map, with its regions map |
| Abkhazia and South Ossetia | Inside Georgia (`GE`) | General Assembly resolutions affirm Georgia's territorial integrity; Russia and a few states recognise them; ISO 3166-2 has `GE-AB` for Abkhazia and South Ossetia lies in `GE-SK` | Inside Georgia; no region of their own (chizu has no map of Georgia's regions) |
| Transnistria | Inside Moldova (`MD`) | General Assembly resolution 72/282 (2018) calls for the withdrawal of foreign forces from Moldova; unrecognised; ISO 3166-2 has `MD-SN` | Inside Moldova; no region of their own |

## The regions that carry the flag

Eight regions say `disputed: true`, on every map that draws them: `XK`, `TW` and `EH` on the world, the finer world and each one's own map; `UA-43` and `UA-40` on Russia's regions map; and `AR`, `JK` and `LA` on India's. Nothing else is marked, and the flag is three fields added to eight regions, and no map's drawing changes.

```ts
import WORLD from "@johnmorrisdotca/chizu/world";

const disputed = WORLD.regions.filter((region) => region.disputed);
console.log(disputed.map((region) => region.code).sort().join(" "));
// EH TW XK
console.log(disputed.find((region) => region.code === "XK")!.disputedNote);
// Kosovo declared independence in 2008 and many states recognise it, but Serbia and others do not; XK is a user-assigned code, not an ISO 3166-1 one.
```

## What is not covered

Palestine (`PS`) is drawn as a country of its own, as the General Assembly's non-member observer state (2012), and is not flagged here. The disputed seas (the sea between Japan and Korea, the Persian Gulf) are named as the sources have them ([features](../features.md)). The Senkaku islets (China calls them Diaoyu) and Takeshima (Korea calls it Dokdo) are too small to appear at 1:50m. The regions maps of Russia, Japan and India are Natural Earth's and take no view except that `ukr` removes two regions of Russia's.

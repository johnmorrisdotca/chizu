# Continents and other groups

A group of places is a list of codes, and four functions show any of them: a continent, a UN M49 subregion, the eight regions of Japan, Canada's five, the four Census regions of the United States, or a list a page names itself (the G7, the countries a class has studied). `groupMap` cuts a map down to the group, so a quiz asks African look-alikes for an African country and callouts number only the group; `groupBox` frames it, each member on its mainland, so France's overseas departments do not stretch Europe's window to South America; `groupTones` fades the rest of the map round it.

```ts
import WORLD from "@johnmorrisdotca/chizu/world";
import { CHIZU_CONTINENTS } from "@johnmorrisdotca/chizu/names";
import { drawChizu } from "@johnmorrisdotca/chizu/draw";
import { findQuestion, groupBox, groupMap, groupTones, layoutCallouts, seededRandom } from "@johnmorrisdotca/chizu";

const africa = CHIZU_CONTINENTS.find((continent) => continent.code === "AF")!;
const box = groupBox(WORLD, africa.codes, 4 / 3);
const svg = drawChizu(WORLD, { box, tones: groupTones(WORLD, africa.codes), callouts: ["EG", "KE", "NG", "ZA"] });
const question = findQuestion(groupMap(WORLD, africa.codes), "KE", seededRandom(1))!;
console.log(africa.nameJa, svg.length > 0, question.choices.every((code) => africa.codes.includes(code)));
```

```text
アフリカ true true
```

**The continents** (`CHIZU_CONTINENTS` in `/names`) are kuni's seven, from UN M49 by way of CLDR: Africa, Antarctica, Asia, Europe, North America (with Central America and the Caribbean), Oceania and South America, each with its English and Japanese names, its reading and its countries. Every one of the 235 countries the world can ask (with its small states as dots) is in exactly one; Antarctica, like the French Southern Lands, is not on the world, and holds none. The table holds 253 places. Fifteen are drawn alone only, each on its own country map and on no world (Antarctica, the French Southern Lands, French Guiana, Réunion, Gibraltar and the rest in [Notes on the maps](maps.md)): they have `kind: "country"` and their continent in `group`, and are in no continent's or subregion's `codes`, so a group is still the places a world quiz can ask. The other three are there because Natural Earth draws three leftover polygons that have no ISO 3166-1 code and are not countries: Siachen Glacier (`KAS`), Ashmore and Cartier Islands (`ATC`) and the Indian Ocean Territories (`IOA`). Each has `kind: "territory-part"` in `CHIZU_COUNTRIES` (the other 250 have `kind: "country"`, Kosovo, `XK`, among them) and is in no continent's `codes`. They are drawn as before, each on its own country map (`countries/kas`, `countries/atc`, `countries/ioa`), whose region carries `territoryPart: true`; `findQuestion` and `pickDistractors` never ask about such a region or offer it, so a quiz on any map that holds them never meets them. A continent is a list for quizzes, so drawing is unchanged: a page that draws the table's `group` still finds them in Asia and Oceania. A country's `group` is its continent's English name and `groupJa` its Japanese. **The subregions** (`CHIZU_SUBREGIONS`) are the twenty-two of UN M49 (Eastern Asia, Western Europe, the Caribbean…), kuni's too. **A map's own groups** are `regionGroups(map)`: the continents on the world, the eight regions on Japan's prefectures (北海道地方 to 九州地方, Okinawa in Kyushu), Canada's Atlantic, Central, Prairies, West Coast and North, and the Census regions of the United States, each named in English and Japanese. Named groupings beyond these (the EU, ASEAN, the G7) are kuni's to keep, with their dates and sources; until it has one, pass its codes.

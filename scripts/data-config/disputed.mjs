/*
 * DISPUTED PLACES THAT ARE A REGION OF THEIR OWN. A region of a map whose status is disputed carries `disputed: true`
 * and a one-line note in English and Japanese, on every map it is drawn on. Places that are only a part of a region
 * (Crimea inside Russia on the world, the Golan inside Israel) cannot be marked on a region that is not theirs, and are
 * in docs/guides/disputed-areas.md only. `maps` are the ids of the maps that have the region, `code` its code on them.
 */
export const DISPUTED_REGIONS = [
  {
    code: "XK",
    maps: ["world", "world-detail", "country-xk"],
    note: "Kosovo declared independence in 2008 and many states recognise it, but Serbia and others do not; XK is a user-assigned code, not an ISO 3166-1 one.",
    noteJa:
      "コソボは2008年に独立を宣言しました。多くの国が承認していますが、セルビアなどは承認していません。XKはISO 3166-1に載っておらず、ユーザー割り当てコードです。",
  },
  {
    code: "TW",
    maps: ["world", "world-detail", "country-tw"],
    note: 'Taiwan is governed on its own, and the People\'s Republic of China claims it as a province; ISO 3166-1 lists it as "Taiwan, Province of China".',
    noteJa:
      "台湾は独自の政府が統治していますが、中華人民共和国は自国の省だと主張しています。ISO 3166-1では「Taiwan, Province of China」として載っています。",
  },
  {
    code: "EH",
    maps: ["world", "world-detail", "country-eh"],
    note: "Western Sahara is a territory whose status the UN has not settled, and Morocco administers most of it; this region is the part Natural Earth draws apart from Morocco.",
    noteJa:
      "西サハラは、国連が非自治地域に挙げており、最終的な地位が決まっていない地域です。大部分をモロッコが統治しています。この地域は、Natural Earthがモロッコとは別に描いている部分です。",
  },
  {
    code: "UA-43",
    maps: ["divisions-ru"],
    note: "Crimea: Natural Earth draws it in Russia, which holds it; the UN General Assembly and ISO 3166 have it in Ukraine (the `ukr` view takes it off this map).",
    noteJa:
      "クリミア：Natural Earthは、実際に支配しているロシア側に描きます。国連総会はウクライナの領土保全を確認しており、ISO 3166-2はウクライナに含めています（`ukr`の立場では、この地図から除かれます）。",
  },
  {
    code: "UA-40",
    maps: ["divisions-ru"],
    note: "Sevastopol: Natural Earth draws it in Russia, which holds it; the UN General Assembly and ISO 3166 have it in Ukraine (the `ukr` view takes it off this map).",
    noteJa:
      "セヴァストポリ：Natural Earthは、実際に支配しているロシア側に描きます。国連総会はウクライナの領土保全を確認しており、ISO 3166-2はウクライナに含めています（`ukr`の立場では、この地図から除かれます）。",
  },
  {
    code: "AR",
    maps: ["divisions-in"],
    note: "Arunachal Pradesh is administered by India, and China claims it as South Tibet.",
    noteJa:
      "アルナーチャル・プラデーシュ州はインドが統治していますが、中国は「南チベット」として領有を主張しています。",
  },
  {
    code: "JK",
    maps: ["divisions-in"],
    note: "Jammu and Kashmir: India and Pakistan each claim all of Kashmir; Natural Earth draws the line of control as the border.",
    noteJa:
      "ジャンムー・カシミール：インドとパキスタンは、それぞれカシミール全体の領有を主張しています。Natural Earthは、実効支配線を境界線として描きます。",
  },
  {
    code: "LA",
    maps: ["divisions-in"],
    note: "Ladakh: India claims Aksai Chin as part of it, but China administers Aksai Chin, and Natural Earth draws it in China.",
    noteJa:
      "ラダック：インドはアクサイチンもラダックの一部だと主張していますが、アクサイチンは中国が統治しており、Natural Earthは中国側に描きます。",
  },
];

// What the features build (build-features.mjs) and the Wikidata fetch (wikidata.mjs) are told: which of Natural
// Earth's physical files are read, what kind of feature each class of theirs is, how far each map reaches down the
// ranks, and the readings of the names a source does not give one for. Read by nothing but those scripts.

/*
 * THE FILES AND THEIR CLASSES. Natural Earth's physical vectors at 1:10m, the same release as the outlines. Each class
 * Natural Earth gives a feature (`featurecla`) is a `kind` here, and each kind belongs to a `group`: what a caller
 * turns on (`features: ["water"]`, `["lakes"]`, `["river"]`). A class left out is not drawn or searched, with the reason.
 */
export const FEATURE_FILES = {
  marine: {
    file: "ne_10m_geography_marine_polys.geojson",
    kinds: { ocean: "ocean", sea: "sea", gulf: "gulf", bay: "bay", strait: "strait", channel: "channel", sound: "sound", fjord: "fjord", inlet: "inlet", lagoon: "lagoon", reef: "reef" },
    leftOut: {
      generic: "Natural Earth's unnamed pieces of sea, which are there to fill the gaps between the named ones",
      river: "the mouths of the Amazon, the Yangtze and the Columbia, drawn as sea and named as the river, which the rivers file draws",
    },
  },
  lakes: {
    file: "ne_10m_lakes.geojson",
    kinds: { Lake: "lake", "Alkaline Lake": "lake", Reservoir: "reservoir" },
    leftOut: {},
  },
  rivers: {
    file: "ne_10m_rivers_lake_centerlines.geojson",
    kinds: { River: "river" },
    leftOut: { "Lake Centerline": "the line Natural Earth draws through a lake to carry a river's name across it; the lake itself is drawn" },
  },
  landforms: {
    file: "ne_10m_geography_regions_polys.geojson",
    kinds: {
      Desert: "desert",
      "Range/mtn": "range",
      Plateau: "plateau",
      Plain: "plain",
      Peninsula: "peninsula",
      "Pen/cape": "peninsula",
      Basin: "basin",
      Delta: "delta",
      Valley: "valley",
      Wetlands: "wetland",
      Tundra: "tundra",
      Isthmus: "isthmus",
      Depression: "depression",
      Lowland: "lowland",
      Gorge: "gorge",
      Foothills: "foothills",
    },
    leftOut: {
      Island: "an island is land a country map already draws and names",
      "Island group": "the same, for a group of islands",
      Continent: "the continents are the world's own groups (CHIZU_CONTINENTS)",
      Coast: "a stretch of coast drawn as an area of land, which reads as a region of the country it is in",
      Geoarea: "historical and cultural regions (Brittany, Karelia), which are not physical features",
      Lake: "three lakes, which ne_10m_lakes draws",
      "Dragons-be-here": "a joke of Natural Earth's, in the Southern Ocean",
    },
  },
  peaks: {
    file: "ne_10m_geography_regions_elevation_points.geojson",
    kinds: { mountain: "peak" },
    leftOut: {
      "spot elevation": "heights with no name",
      depression: "points of low ground, most with no name",
      plateau: "research stations on the Antarctic plateau",
      pass: "two mountain passes",
      cape: "one cape",
    },
  },
};

/** The groups a caller turns on, in the order they are drawn: seas under the land, the rest on it. */
export const FEATURE_GROUPS = ["marine", "landforms", "lakes", "rivers", "peaks", "capitals"];

/*
 * HOW FAR DOWN THE RANKS EACH MAP GOES. Natural Earth ranks every feature (`scalerank`, 0 the Pacific, 9 or 10 a
 * small lake), for the scale it is shown at. The world, a thousand units across, takes the top of each list; a
 * country takes everything big enough to see on its own canvas.
 */
export const WORLD_RANKS = { marine: 2, lakes: 2, rivers: 3, landforms: 1, peaks: 3 };
export const COUNTRY_RANKS = { marine: 9, lakes: 9, rivers: 10, landforms: 7, peaks: 9 };
/**
 * A feature must be at least this big on the canvas, after it is cut to the canvas, to be kept: an area in square
 * units, a line in units of length. Smaller would be a speck nobody could press.
 */
export const SMALLEST = { area: 6, line: 14 };
/** At most this many of a group on one map, the highest ranked first, so a country of ten thousand lakes stays a file a page can fetch. */
export const MOST = { marine: 50, lakes: 70, rivers: 100, landforms: 40, peaks: 40, capitals: 300 };
/**
 * How far a line may stray from the original when it is simplified, in units of the canvas (1,000 across). A sea's
 * edge is mostly under the land it meets and a landform is drawn only when it is chosen, so both are simplified harder
 * than a lake's shore or a river's course, which are seen.
 */
export const TOLERANCE = {
  world: { marine: 0.5, landforms: 0.5, lakes: 0.15, rivers: 0.2 },
  country: { marine: 0.4, landforms: 0.4, lakes: 0.2, rivers: 0.25 },
};

/*
 * READINGS. A name in kana is its own reading. A name that is kana and a known ending (カスピ海, メキシコ湾) is read as its
 * kana and the ending's reading. Wikidata's "name in kana" (P1814), or a Japanese alias written in hiragana alone, reads
 * a name with kanji in it. These are the rest: names with kanji that the world map shows and no source reads, written
 * here for review by a native reader. A name none of these reads has no reading, and the build says how many.
 */
export const ENDING_READINGS = [
  ["海峡", "かいきょう"],
  ["海溝", "かいこう"],
  ["運河", "うんが"],
  ["山脈", "さんみゃく"],
  ["山地", "さんち"],
  ["山系", "さんけい"],
  ["高原", "こうげん"],
  ["高地", "こうち"],
  ["平原", "へいげん"],
  ["平野", "へいや"],
  ["盆地", "ぼんち"],
  ["低地", "ていち"],
  ["砂漠", "さばく"],
  ["半島", "はんとう"],
  ["地峡", "ちきょう"],
  ["峡谷", "きょうこく"],
  ["渓谷", "けいこく"],
  ["湿地", "しっち"],
  ["諸島", "しょとう"],
  ["貯水池", "ちょすいち"],
  ["ダム湖", "だむこ"],
  ["塩湖", "えんこ"],
  ["海", "かい"],
  ["湾", "わん"],
  ["湖", "こ"],
  ["川", "がわ"],
  ["江", "こう"],
  ["洋", "よう"],
  ["山", "さん"],
  ["岳", "だけ"],
  ["峠", "とうげ"],
  ["岬", "みさき"],
  ["礁", "しょう"],
  ["市", "し"],
  ["区", "く"],
  ["郡", "ぐん"],
  ["潟", "かた"],
];

/** A direction word before kana, as in 南シナ海 and 東シベリア海. */
export const LEADING_READINGS = [
  ["北", "きた"],
  ["南", "みなみ"],
  ["東", "ひがし"],
  ["西", "にし"],
];

/** Names with kanji that no source reads, read by hand. */
export const FEATURE_READINGS = {
  太平洋: "たいへいよう",
  大西洋: "たいせいよう",
  北極海: "ほっきょくかい",
  南極海: "なんきょくかい",
  日本海: "にほんかい",
  東シナ海: "ひがししなかい",
  南シナ海: "みなみしなかい",
  黄海: "こうかい",
  渤海: "ぼっかい",
  紅海: "こうかい",
  黒海: "こっかい",
  地中海: "ちちゅうかい",
  北海: "ほっかい",
  珊瑚海: "さんごかい",
  白海: "はくかい",
  死海: "しかい",
  長江: "ちょうこう",
  黄河: "こうが",
  瀬戸内海: "せとないかい",
  津軽海峡: "つがるかいきょう",
  宗谷海峡: "そうやかいきょう",
  対馬海峡: "つしまかいきょう",
  内浦湾: "うちうらわん",
  琵琶湖: "びわこ",
  富士山: "ふじさん",
  能登半島: "のとはんとう",
  桜島: "さくらじま",
  雲仙岳: "うんぜんだけ",
  岩手山: "いわてさん",
  久住山: "くじゅうさん",
  カナダ楯状地: "かなだたてじょうち",
  インド亜大陸: "いんどあたいりく",
  西部高原: "せいぶこうげん",
  東南アジア本土: "とうなんあじあほんど",
  中央アメリカ: "ちゅうおうあめりか",
  天山山脈: "てんざんさんみゃく",
  華北平原: "かほくへいげん",
  ルイビンスク人造湖: "るいびんすくじんぞうこ",
  白ナイル川: "しろないるがわ",
  青ナイル川: "あおないるがわ",
  朝鮮半島: "ちょうせんはんとう",
  東朝鮮湾: "ひがしちょうせんわん",
  台湾海峡: "たいわんかいきょう",
  杭州湾: "こうしゅうわん",
  四川盆地: "しせんぼんち",
  黄土高原: "こうどこうげん",
  山東半島: "さんとうはんとう",
  遼東半島: "りょうとうはんとう",
  洞庭湖: "どうていこ",
  鄱陽湖: "はようこ",
  青海湖: "せいかいこ",
  太湖: "たいこ",
  鴨緑江: "おうりょくこう",
  豆満江: "とまんこう",
  松花江: "しょうかこう",
  淮河: "わいが",
  東京: "とうきょう",
  北京: "ぺきん",
  平壌: "ぴょんやん",
  台北: "たいぺい",
  山口市: "やまぐちし",
  "ワシントンD.C.": "わしんとんでぃーしー",
};

/*
 * RIVERS NAMED ANOTHER WAY. Natural Earth names a stretch of a river by the name it has there (Rhein, Huang, Firat,
 * Chang Jiang), which no Wikidata label is, or draws a delta's arms as a river of their own: these are the river they are
 * on Wikidata, by its English label, for every river the world map or a large country shows (rank 5 and up). A label
 * here is looked for anywhere within HINT_KM of the line, and the item with the most Wikipedia articles taken. `null`
 * refuses a match the names alone would make: Natural Earth gives the Mur "Drava" as its other name, which is the river
 * it flows into.
 */
export const RIVER_LABELS = {
  "0|Irrawaddy Delta": "Irrawaddy River",
  "1|Yangtze": "Yangtze River",
  "18|Chang Jiang": "Yangtze River",
  "14|Bahr el Jebel": "Bahr al Jabal",
  "16|Bahr el Jebel": "White Nile",
  "29|Ertis": "Irtysh",
  "37|Lualaba": "Lualaba River",
  "41|Congo": "River Congo",
  "47|Dihang": "Brahmaputra River",
  "65|Firat": "Euphrates",
  "69|Al Furat": "Euphrates",
  "66|Huang": "Yellow River",
  "67|Abay": "Blue Nile",
  "78|Negro": "Rio Negro",
  "84|Argun’": "Argun River",
  "94|Shatt al Arab": "Shatt al-Arab",
  "104|São  Francisco": "São Francisco River",
  "105|Rhein": "Rhine",
  "140|Rhin": "Rhine",
  "113|Yenisey": "Yenisei",
  "119|Bénoué": "Benue River",
  "120|Dicle": "Tigris",
  "121|Dnepre": "Dnieper",
  "132|Sénégal": "Senegal River",
  "146|Nu": "Salween River",
  "156|Mississippi": "Mississippi River",
  "165|Tajo": "Tagus River",
  "170|Syr  Darya": "Syr Darya",
  "179|Godävari": "Godavari River",
  "184|Caquetá": "Japurá River",
  "194|Bío-Bío": "Bío Bío River",
  "199|Amu  Darya": "Amu Darya",
  "208|Mur": null,
};
/** How far a river named in RIVER_LABELS may be from its item's coordinates: a long river's one coordinate may be its source, two thousand kilometres off. */
export const HINT_KM = 2500;

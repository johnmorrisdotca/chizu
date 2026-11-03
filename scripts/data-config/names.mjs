/*
 * How the three places Natural Earth draws that kuni does not have (they have no ISO 3166 code) are read, in
 * hiragana: every other country's names and reading are kuni's. Hand-written, for review by a native reader.
 */
export const KANJI_READINGS = {
  "アシュモア・カルティエ諸島": "あしゅもあかるてぃえしょとう",
  オーストラリア領インド洋地域: "おーすとらりありょういんどようちいき",
  シアチェン氷河: "しあちぇんひょうが",
};

/** kuni's continents, by the English names chizu's `group` has always used. */
export const CONTINENT_NAMES = {
  AF: "Africa",
  AN: "Antarctica",
  AS: "Asia",
  EU: "Europe",
  NA: "North America",
  OC: "Oceania",
  SA: "South America",
};

/*
 * How the short Japanese names kuni gives in kanji are read, where kuni's reading is of the long name (香港 for
 * 中華人民共和国香港特別行政区). A katakana name is its own reading.
 */
/*
 * kuni's short Japanese names that are not the everyday name chizu's `nameShortJa` means: CLDR's short form for the
 * United Kingdom is 英国, the written abbreviation, where a Japanese reader says イギリス, which is kuni's name.
 */
export const SHORT_NAMES_NOT_EVERYDAY = new Set(["GB"]);

/*
 * THE NAME A MAP PRINTS. A country is printed with kuni's short English name where kuni has one (Bosnia, Hong Kong,
 * Myanmar, Palestine), but for these two, whose short forms are abbreviations rather than names a map prints.
 */
export const SHORT_ENGLISH_NOT_FOR_MAPS = {
  US: "kuni's short form is “US”, an abbreviation; the map prints United States",
  GB: "kuni's short form is “UK”, an abbreviation; the map prints United Kingdom",
};

/*
 * Names kuni writes for a list rather than a map, with no short form to use instead: the name the map prints (`name`,
 * and `nameShortJa` with its `reading`), and why. Empty since kuni 1.1.0, which gives DR Congo, Congo, ミャンマー and
 * ココス諸島 as short names; kept for the next such name, which goes to kuni once it is written here.
 */
export const DISPLAY_NAMES = {};

/*
 * CONTINENTS kuni places where UN M49 does not. Empty since kuni 1.1.0, which follows M49 (Russia in Europe, Cyprus and
 * Timor-Leste in Asia); kept for the next disagreement, with its reason.
 */
export const CONTINENT_OVERRIDES = {};

/** How the names of continents and subregions that kuni writes with kanji are read. */
export const GROUP_READINGS = {
  南極: "なんきょく",
  北アメリカ大陸: "きたあめりかたいりく",
  南アメリカ: "みなみあめりか",
  北アメリカ: "きたあめりか",
  西アフリカ: "にしあふりか",
  東アフリカ: "ひがしあふりか",
  北アフリカ: "きたあふりか",
  中部アフリカ: "ちゅうぶあふりか",
  南部アフリカ: "なんぶあふりか",
  中央アメリカ: "ちゅうおうあめりか",
  東アジア: "ひがしあじあ",
  南アジア: "みなみあじあ",
  東南アジア: "とうなんあじあ",
  中央アジア: "ちゅうおうあじあ",
  西アジア: "にしあじあ",
  南ヨーロッパ: "みなみよーろっぱ",
  東ヨーロッパ: "ひがしよーろっぱ",
  北ヨーロッパ: "きたよーろっぱ",
  西ヨーロッパ: "にしよーろっぱ",
};

export const SHORT_NAME_READINGS = {
  香港: "ほんこん",
  コンゴ民主共和国: "こんごみんしゅきょうわこく",
  コンゴ共和国: "こんごきょうわこく",
  ココス諸島: "ここすしょとう",
};

/*
 * NAMES FROM KUNI. A region that is exactly one ISO subdivision takes its names from kuni, so a map and a form
 * name a place alike. Where kuni's name is wrong or tells two places apart worse than Natural Earth's, Natural Earth's
 * is kept here (`en`, `ja`: which of the two), with the reason. Empty since kuni 1.1.0, which corrected the twelve
 * chizu 1.1.0 kept (Peterborough, Marlborough, Chiayi, Bogotá, Davao de Oro, five Russian republics and Cần Thơ).
 */
export const KUNI_NAMES_KEPT_FROM_NATURAL_EARTH = {};

/*
 * NAMES WRITTEN HERE, where two regions of one map would otherwise share a name (a quiz cannot ask for “Cork” when
 * there are two) or where the region is not the ISO subdivision kuni names. Keyed like ISO_JOIN.
 */
export const NAME_FIXES = {
  // Drawn, so the coast has no hole, but not named: no quiz asks about it and no list shows it (`unnamed`).
  "RU:X01~": { name: "Unnamed piece of the Yamal coast", unnamed: true },
  // County Dublin's four councils and the county councils that share a code with a city: kuni names Ireland's counties 州.
  "IE:D": { name: "Dublin City", nameJa: "ダブリン市" },
  "IE:D_3": { nameJa: "フィンガル" },
  "IE:CO": { nameJa: "コーク州" },
  "IE:G": { nameJa: "ゴールウェイ州" },
  "IE:LK": { nameJa: "リムリック州" },
  "IE:WD": { nameJa: "ウォーターフォード州" },
  "IE:CO_2": { name: "Cork City", nameJa: "コーク市" },
  "IE:G_2": { name: "Galway City", nameJa: "ゴールウェイ市" },
  "IE:LK_2": { name: "Limerick City", nameJa: "リムリック市" },
  "IE:WD_2": { name: "Waterford City", nameJa: "ウォーターフォード市" },
  "IE:TA": { name: "North Tipperary", nameJa: "ノース・ティペラリー" },
  "IE:TA_2": { name: "South Tipperary", nameJa: "サウス・ティペラリー" },
  "PH:SUN": { name: "Surigao del Norte", nameJa: "北スリガオ州" },
};

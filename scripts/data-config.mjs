// What the data builder (build-data.mjs) is told: where each country's regions are in Natural Earth, which
// projection draws them, and the few facts about names that Natural Earth does not carry. Read by nothing
// but that script; the package itself ships the data it makes.
//
// The division configs are the ones a Japanese study app by the same author drew its country maps with: the same filters
// on Natural Earth's admin-1 file, the same codes and the same projections, so a map drawn here is the map
// drawn there. They are projections of the d3-geo family, used here at build time only (a dev dependency):
// the data they make is plain paths on a fixed canvas, and the package depends on nothing.
import { geoAlbers, geoConicConformal, geoConicEqualArea, geoConicEquidistant, geoTransverseMercator } from "d3-geo";

/** Where Natural Earth is read from: a release tag of its own repository, and the file's SHA-256 at that tag. */
export const NATURAL_EARTH = {
  version: "5.1.2",
  tag: "v5.1.2",
  repository: "https://github.com/nvkelso/natural-earth-vector",
  raw: "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson",
  /** The day these files were fetched, written here rather than read from a clock so that the data is made the same each time. */
  retrieved: "2026-10-01",
  files: {
    "ne_110m_admin_0_countries.geojson": "6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f",
    "ne_10m_admin_0_countries.geojson": "239eec57ac17f100a11e2536cffc56752c318b50ae765b0918ff7aab4ce8f255",
    "ne_50m_admin_0_countries.geojson": "3e458fc036ad0a66411f2c1e6cac49c5d7bfb81cb1123bc513b22511a2b7fdeb",
    "ne_10m_admin_1_states_provinces.geojson": "22d0e3ad85eb3e27f17cabf8ba2d50e554fbc27a87796ff891d958185da62fb5",
    "ne_10m_geography_marine_polys.geojson": "53f865e8ffa966cdd402145c82c5cd14ee7ce974cd0eb9a3f59f03a4cfd2d66c",
    "ne_10m_lakes.geojson": "2d036f53dedec578001c5c30c2959ee7d4eebc1306900fa4367c49929ec8f2d9",
    "ne_10m_rivers_lake_centerlines.geojson": "bb854a900ecbd3b408df46d5e16e3e0f974ba55993f9d8b5c26e855273c0905a",
    "ne_10m_geography_regions_polys.geojson": "b7b26e50ea917d3696aec87f932def2bf5f890f5770e441d59c162c6f4c92a77",
    "ne_10m_geography_regions_elevation_points.geojson": "f98a16867867146ec4146d6d4b18c823eeedb2825947de666116cf9a4e3f43cb",
  },
};

/*
 * Left off every map. Antarctica is a continent and not a country (drawn whole it is a band the width of the
 * map); the French Southern Lands are uninhabited islands off it; Northern Cyprus and Somaliland are not on
 * the maps a school uses.
 */
export const EXCLUDED = new Set(["AQ", "TF", "CYN", "SOL"]);

/*
 * How the three places Natural Earth draws that kuni does not have (they have no ISO 3166 code) are read, in
 * hiragana: every other country's names and reading are kuni's. Hand-written, for review by a native reader.
 */
export const KANJI_READINGS = {
  アシュモア・カルティエ諸島: "あしゅもあかるてぃえしょとう",
  オーストラリア領インド洋地域: "おーすとらりありょういんどようちいき",
  シアチェン氷河: "しあちぇんひょうが",
};

export const DIVISION_CONFIGS = [
  {
    code: "CA",
    countryName: "Canada",
    divisionTypeName: "Province / territory",
    divisionTypePlural: "Provinces and territories",
    width: 1000,
    height: 720,
    filter: (f) => f.properties.iso_a2 === "CA" || f.properties.admin === "Canada",
    codeFn: (f) => f.properties.postal || f.properties.iso_3166_2?.replace(/^CA-/, ""),
    projection: () => geoConicConformal().parallels([49, 77]).rotate([96, 0]),
    regionFn: (f) => f.properties.region || "Canada",
    divisionType: "province",
  },
  {
    code: "GB",
    countryName: "United Kingdom",
    divisionTypeName: "Administrative division",
    divisionTypePlural: "Administrative divisions",
    width: 1000,
    height: 1100,
    filter: (f) => f.properties.iso_a2 === "GB",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^GB-/, "") || f.properties.postal || f.properties.adm1_code,
    projection: () => geoTransverseMercator().rotate([2, -54]),
    regionFn: (f) => f.properties.geonunit || f.properties.region || "United Kingdom",
    divisionType: "district",
  },
  {
    code: "FR",
    countryName: "France",
    divisionTypeName: "Department",
    divisionTypePlural: "Departments",
    width: 1000,
    height: 950,
    filter: (f) => f.properties.iso_a2 === "FR" && f.properties.type_en === "Metropolitan department",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^FR-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^FR\./, ""),
    projection: () => geoConicConformal().parallels([44, 49]).rotate([-3, 0]),
    regionFn: (f) => f.properties.region || "Metropolitan France",
    divisionType: "department",
  },
  {
    code: "DE",
    countryName: "Germany",
    divisionTypeName: "State",
    divisionTypePlural: "States",
    width: 1000,
    height: 1100,
    filter: (f) => f.properties.iso_a2 === "DE",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^DE-/, "") || f.properties.postal,
    projection: () => geoConicConformal().parallels([48, 54]).rotate([-10.5, 0]),
    regionFn: (f) => f.properties.region || "Germany",
    divisionType: "state",
  },
  {
    code: "IT",
    countryName: "Italy",
    divisionTypeName: "Province",
    divisionTypePlural: "Provinces",
    width: 1000,
    height: 1150,
    filter: (f) => f.properties.iso_a2 === "IT",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^IT-/, "") || f.properties.code_hasc?.replace(/^IT\./, ""),
    projection: () => geoTransverseMercator().rotate([-12.5, -42]),
    regionFn: (f) => f.properties.region || "Italy",
    divisionType: "province",
  },
  {
    code: "ES",
    countryName: "Spain",
    divisionTypeName: "Province",
    divisionTypePlural: "Provinces",
    width: 1000,
    height: 850,
    filter: (f) => f.properties.iso_a2 === "ES",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^ES-/, "") || f.properties.code_hasc?.replace(/^ES\./, ""),
    projection: () => geoConicConformal().parallels([36, 43]).rotate([3.5, 0]),
    regionFn: (f) => f.properties.region || "Spain",
    divisionType: "province",
  },
  {
    code: "MX",
    countryName: "Mexico",
    divisionTypeName: "State",
    divisionTypePlural: "States",
    width: 1000,
    height: 650,
    filter: (f) => f.properties.iso_a2 === "MX" && Boolean(f.properties.name),
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^MX-/, "") || f.properties.postal,
    projection: () => geoConicConformal().parallels([17.5, 29.5]).rotate([102, 0]),
    regionFn: (f) => f.properties.region || "Mexico",
    divisionType: "state",
  },
  {
    code: "CN",
    countryName: "China",
    divisionTypeName: "Province / municipality",
    divisionTypePlural: "Provinces and municipalities",
    width: 1000,
    height: 750,
    filter: (f) => f.properties.iso_a2 === "CN" && f.properties.name !== "Paracel Islands",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^CN-/, "") || f.properties.postal,
    projection: () => geoAlbers().parallels([25, 47]).rotate([-105, 0]),
    regionFn: (f) => f.properties.region || "China",
    divisionType: "province",
  },
  {
    code: "KR",
    countryName: "South Korea",
    divisionTypeName: "Province / city",
    divisionTypePlural: "Provinces and cities",
    width: 1000,
    height: 1200,
    filter: (f) => f.properties.iso_a2 === "KR",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^KR-/, "") || f.properties.code_hasc?.replace(/^KR\./, ""),
    projection: () => geoTransverseMercator().rotate([-127.5, -36]),
    regionFn: (f) => f.properties.region || "South Korea",
    divisionType: "province",
  },
  {
    code: "AU",
    countryName: "Australia",
    divisionTypeName: "State / territory",
    divisionTypePlural: "States and territories",
    width: 1000,
    height: 800,
    filter: (f) => f.properties.iso_a2 === "AU" && ["State", "Territory"].includes(f.properties.type_en),
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^AU-/, "") || f.properties.postal,
    projection: () => geoConicEqualArea().parallels([-18, -36]).rotate([-134, 0]),
    regionFn: (f) => f.properties.region || "Australia",
    divisionType: "state",
  },
  {
    code: "BR",
    countryName: "Brazil",
    divisionTypeName: "State",
    divisionTypePlural: "States",
    width: 1000,
    height: 1000,
    filter: (f) => f.properties.iso_a2 === "BR",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^BR-/, "") || f.properties.postal,
    projection: () => geoConicEqualArea().parallels([-5, -25]).rotate([52, 0]),
    regionFn: (f) => f.properties.region || "Brazil",
    divisionType: "state",
  },
  {
    code: "VN",
    countryName: "Vietnam",
    divisionTypeName: "Province / municipality",
    divisionTypePlural: "Provinces and municipalities",
    width: 1000,
    height: 1300,
    filter: (f) => f.properties.iso_a2 === "VN",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^VN-/, "") || f.properties.code_hasc?.replace(/^VN\./, ""),
    projection: () => geoTransverseMercator().rotate([-106.5, -16]),
    regionFn: (f) => f.properties.region || "Vietnam",
    divisionType: "province",
  },
  {
    code: "TW",
    countryName: "Taiwan",
    divisionTypeName: "County / city",
    divisionTypePlural: "Counties and cities",
    width: 1000,
    height: 1400,
    filter: (f) => f.properties.iso_a2 === "TW",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^TW-/, "") || f.properties.code_hasc?.replace(/^TW\./, ""),
    projection: () => geoTransverseMercator().rotate([-121, -23.7]),
    regionFn: (f) => f.properties.region || "Taiwan",
    divisionType: "county",
  },
  {
    code: "PH",
    countryName: "Philippines",
    divisionTypeName: "Province",
    divisionTypePlural: "Provinces",
    width: 1000,
    height: 1400,
    filter: (f) => f.properties.iso_a2 === "PH" && f.properties.type_en === "Province",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^PH-/, "") || f.properties.code_hasc?.replace(/^PH\./, ""),
    projection: () => geoTransverseMercator().rotate([-122, -13]),
    regionFn: (f) => f.properties.region || "Philippines",
    divisionType: "province",
  },
  {
    code: "TH",
    countryName: "Thailand",
    divisionTypeName: "Province",
    divisionTypePlural: "Provinces",
    width: 1000,
    height: 1400,
    filter: (f) => f.properties.iso_a2 === "TH",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^TH-/, "") || f.properties.code_hasc?.replace(/^TH\./, ""),
    projection: () => geoTransverseMercator().rotate([-101, -15]),
    regionFn: (f) => f.properties.region || "Thailand",
    divisionType: "province",
  },
  {
    code: "MY",
    countryName: "Malaysia",
    divisionTypeName: "State / territory",
    divisionTypePlural: "States and federal territories",
    width: 1000,
    height: 500,
    filter: (f) => f.properties.iso_a2 === "MY",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^MY-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^MY\./, ""),
    projection: () => geoConicConformal().parallels([2.5, 6]).rotate([-109, 0]),
    regionFn: (f) => f.properties.region || "Malaysia",
    divisionType: "state",
  },
  {
    code: "NL",
    countryName: "Netherlands",
    divisionTypeName: "Province",
    divisionTypePlural: "Provinces",
    width: 1000,
    height: 1100,
    filter: (f) => f.properties.iso_a2 === "NL" && f.properties.type_en === "Province",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^NL-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^NL\./, ""),
    projection: () => geoTransverseMercator().rotate([-5.3, -52.2]),
    regionFn: (f) => f.properties.region || "Netherlands",
    divisionType: "province",
  },
  {
    code: "RU",
    countryName: "Russia",
    divisionTypeName: "Federal subject",
    divisionTypePlural: "Federal subjects",
    width: 1000,
    height: 600,
    filter: (f) => f.properties.iso_a2 === "RU",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^RU-/, "") || f.properties.code_hasc?.replace(/^RU\./, ""),
    projection: () => geoConicEquidistant().parallels([50, 70]).rotate([-100, 0]),
    regionFn: (f) => f.properties.region || "Russia",
    divisionType: "federal subject",
  },
  {
    code: "NZ",
    countryName: "New Zealand",
    divisionTypeName: "Region",
    divisionTypePlural: "Regions",
    width: 1000,
    height: 1300,
    filter: (f) =>
      (f.properties.iso_a2 === "NZ" || f.properties.adm0_a3 === "NZL") &&
      ["Regional Council", "Unitary Authority", "Special Island Authority"].includes(f.properties.type_en),
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^NZ-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^NZ\./, ""),
    projection: () => geoTransverseMercator().rotate([-173, -41]),
    regionFn: (f) => f.properties.region || "New Zealand",
    divisionType: "region",
  },
  {
    code: "CO",
    countryName: "Colombia",
    divisionTypeName: "Department",
    divisionTypePlural: "Departments",
    width: 1000,
    height: 1200,
    filter: (f) => f.properties.iso_a2 === "CO" && f.properties.name !== "San Andrés y Providencia" && Boolean(f.properties.name),
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^CO-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^CO\./, ""),
    projection: () => geoTransverseMercator().rotate([73, -4]),
    regionFn: (f) => f.properties.region || "Colombia",
    divisionType: "department",
  },
  {
    code: "AR",
    countryName: "Argentina",
    divisionTypeName: "Province",
    divisionTypePlural: "Provinces",
    width: 1000,
    height: 1400,
    filter: (f) => f.properties.iso_a2 === "AR",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^AR-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^AR\./, ""),
    projection: () => geoTransverseMercator().rotate([65, -38]),
    regionFn: (f) => f.properties.region || "Argentina",
    divisionType: "province",
  },
  {
    code: "IE",
    countryName: "Ireland",
    divisionTypeName: "County",
    divisionTypePlural: "Counties",
    width: 1000,
    height: 1100,
    filter: (f) => f.properties.iso_a2 === "IE",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^IE-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^IE\./, ""),
    projection: () => geoTransverseMercator().rotate([8, -53.5]),
    regionFn: (f) => f.properties.region || "Ireland",
    divisionType: "county",
  },
  {
    code: "CH",
    countryName: "Switzerland",
    divisionTypeName: "Canton",
    divisionTypePlural: "Cantons",
    width: 1000,
    height: 650,
    filter: (f) => f.properties.iso_a2 === "CH",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^CH-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^CH\./, ""),
    projection: () => geoConicConformal().parallels([46, 47.5]).rotate([-8.2, 0]),
    regionFn: (f) => f.properties.region || "Switzerland",
    divisionType: "canton",
  },
  {
    code: "AT",
    countryName: "Austria",
    divisionTypeName: "State",
    divisionTypePlural: "States",
    width: 1000,
    height: 600,
    filter: (f) => f.properties.iso_a2 === "AT",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^AT-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^AT\./, ""),
    projection: () => geoConicConformal().parallels([47, 49]).rotate([-13.5, 0]),
    regionFn: (f) => f.properties.region || "Austria",
    divisionType: "state",
  },
  {
    code: "BE",
    countryName: "Belgium",
    divisionTypeName: "Province",
    divisionTypePlural: "Provinces",
    width: 1000,
    height: 900,
    filter: (f) => f.properties.iso_a2 === "BE",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^BE-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^BE\./, ""),
    projection: () => geoTransverseMercator().rotate([-4.5, -50.5]),
    regionFn: (f) => f.properties.region || "Belgium",
    divisionType: "province",
  },
  {
    code: "PL",
    countryName: "Poland",
    divisionTypeName: "Voivodeship",
    divisionTypePlural: "Voivodeships",
    width: 1000,
    height: 900,
    filter: (f) => f.properties.iso_a2 === "PL",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^PL-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^PL\./, ""),
    projection: () => geoConicConformal().parallels([50, 54]).rotate([-19, 0]),
    regionFn: (f) => f.properties.region || "Poland",
    divisionType: "voivodeship",
  },
  {
    code: "SE",
    countryName: "Sweden",
    divisionTypeName: "County",
    divisionTypePlural: "Counties",
    width: 1000,
    height: 1400,
    filter: (f) => f.properties.iso_a2 === "SE",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^SE-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^SE\./, ""),
    projection: () => geoTransverseMercator().rotate([-15, -62]),
    regionFn: (f) => f.properties.region || "Sweden",
    divisionType: "county",
  },
  {
    code: "NO",
    countryName: "Norway",
    divisionTypeName: "County",
    divisionTypePlural: "Counties",
    width: 1000,
    height: 1400,
    filter: (f) => f.properties.iso_a2 === "NO",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^NO-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^NO\./, ""),
    projection: () => geoTransverseMercator().rotate([-15, -65]),
    regionFn: (f) => f.properties.region || "Norway",
    divisionType: "county",
  },
  {
    code: "CL",
    countryName: "Chile",
    divisionTypeName: "Region",
    divisionTypePlural: "Regions",
    width: 1000,
    height: 1600,
    filter: (f) => f.properties.iso_a2 === "CL",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^CL-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^CL\./, ""),
    projection: () => geoTransverseMercator().rotate([71, -38]),
    regionFn: (f) => f.properties.region || "Chile",
    divisionType: "region",
  },
  {
    code: "PE",
    countryName: "Peru",
    divisionTypeName: "Department",
    divisionTypePlural: "Departments",
    width: 1000,
    height: 1300,
    filter: (f) => f.properties.iso_a2 === "PE",
    codeFn: (f) => f.properties.iso_3166_2?.replace(/^PE-/, "") || f.properties.postal || f.properties.code_hasc?.replace(/^PE\./, ""),
    projection: () => geoTransverseMercator().rotate([75, -9]),
    regionFn: (f) => f.properties.region || "Peru",
    divisionType: "department",
  },
];


/*
 * KUNI: WHO A PLACE IS. The names, readings, continents and ISO codes of the countries and their subdivisions are
 * read from kuni 国 (@johnmorrisdotca/kuni, MIT, its names from Unicode CLDR and Wikidata) at build time, so that the
 * two packages never disagree about a name. It is a development dependency of this script only, pinned to one
 * version: the package itself imports nothing of kuni's, and a newer kuni changes chizu's names only when this pin
 * and the data are moved together.
 */
export const KUNI = { package: "@johnmorrisdotca/kuni", version: "1.0.0" };

/** kuni's continents, by the English names chizu's `group` has always used. */
export const CONTINENT_NAMES = { AF: "Africa", AN: "Antarctica", AS: "Asia", EU: "Europe", NA: "North America", OC: "Oceania", SA: "South America" };

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
 * Names kuni 1.0.0 writes for a list rather than a map, with no short form to use instead: the name the map prints
 * (`name`, and `nameShortJa` with its `reading`), and why. Kept here until kuni has short forms for them.
 */
export const DISPLAY_NAMES = {
  CD: {
    name: "DR Congo",
    nameShortJa: "コンゴ民主共和国",
    reading: "こんごみんしゅきょうわこく",
    why: "kuni 1.0.0 (CLDR) writes “Congo - Kinshasa” and コンゴ民主共和国(キンシャサ), names that tell the two Congos apart in a list, and has no short form",
  },
  CG: {
    name: "Republic of the Congo",
    nameShortJa: "コンゴ共和国",
    reading: "こんごきょうわこく",
    why: "kuni 1.0.0 (CLDR) writes “Congo - Brazzaville” and コンゴ共和国(ブラザビル), names that tell the two Congos apart in a list, and has no short form",
  },
  MM: {
    nameShortJa: "ミャンマー",
    reading: "ミャンマー",
    why: "kuni 1.0.0 (CLDR) writes ミャンマー (ビルマ) with the old name in brackets, and has no short Japanese form",
  },
  CC: {
    nameShortJa: "ココス諸島",
    reading: "ここすしょとう",
    why: "kuni 1.0.0 (CLDR) writes ココス(キーリング)諸島 with the second name in brackets; its short English form is Cocos Islands, and this is that name in Japanese",
  },
};

/*
 * CONTINENTS kuni 1.0.0 places where UN M49 does not, kept where M49 and Chizu 1.0 put them until a kuni that follows
 * M49 can be pinned (kuni 1.1.0 is to): Russia in Europe (M49's Eastern Europe, and where a Japanese school teaches
 * it), Cyprus in Asia (Western Asia), Timor-Leste in Asia (South-eastern Asia).
 */
export const CONTINENT_OVERRIDES = {
  RU: { continent: "EU", why: "UN M49 places Russia in Eastern Europe; kuni 1.0.0 has Asia" },
  CY: { continent: "AS", why: "UN M49 places Cyprus in Western Asia; kuni 1.0.0 has Europe" },
  TL: { continent: "AS", why: "UN M49 places Timor-Leste in South-eastern Asia; kuni 1.0.0 has Oceania" },
};

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
};

/*
 * ISO 3166-2 FOR THE REGIONS OF A COUNTRY. Natural Earth writes an ISO 3166-2 code on each of its regions; the build
 * keeps it when kuni has the same code, and this table answers for every region where it does not, keyed by the
 * country and the region's chizu code. `iso` is the code to use instead, or null with the reason there is none.
 * Where Natural Earth draws one ISO subdivision as several regions (County Dublin's four councils, a Northern Ireland
 * district from before 2015), each carries the code of the subdivision it lies in, and `why` says so: a test
 * holds every region to having a code or a line here, and every code two regions share to a line here.
 */
const NI_2015 = (code, name) => ({ iso: `GB-${code}`, why: `a district of Northern Ireland before 2015, now part of ${name}` });
export const ISO_JOIN = {
  // Codes ISO 3166-2 has changed since Natural Earth wrote them.
  "FR:75": { iso: "FR-75C", why: "Paris has been FR-75C, the city as a collectivity, since 2019" },
  "MX:DIF": { iso: "MX-CMX", why: "the Distrito Federal has been Mexico City, MX-CMX, since 2016" },
  "TW:TPQ": { iso: "TW-NWT", why: "New Taipei has been TW-NWT since 2022" },
  "IT:AO": { iso: "IT-23", why: "the Aosta Valley has no provinces; IT-AO was withdrawn and the region is IT-23" },
  ...Object.fromEntries(
    Object.entries({ DS: "02", KP: "04", LU: "06", LB: "08", LD: "10", MA: "12", MZ: "14", OP: "16", PK: "18", PD: "20", PM: "22", SL: "24", SK: "26", WN: "28", WP: "30", ZP: "32" }).map(
      ([letters, number]) => [`PL:${letters}`, { iso: `PL-${number}`, why: `ISO 3166-2 numbered Poland's voivodeships in 2018 (PL-${letters} became PL-${number})` }],
    ),
  ),
  // One ISO subdivision drawn as several regions: each lies in it.
  "IE:D": { iso: "IE-D", why: "Dublin City, one of the four councils of County Dublin (IE-D)" },
  "IE:D_2": { iso: "IE-D", why: "Dún Laoghaire–Rathdown, one of the four councils of County Dublin (IE-D)" },
  "IE:D_3": { iso: "IE-D", why: "Fingal, one of the four councils of County Dublin (IE-D)" },
  "IE:D_4": { iso: "IE-D", why: "South Dublin, one of the four councils of County Dublin (IE-D)" },
  "IE:CO": { iso: "IE-CO", why: "the county council's part of County Cork (IE-CO); the city's council is drawn apart" },
  "IE:CO_2": { iso: "IE-CO", why: "Cork City, drawn apart from the county it lies in (IE-CO)" },
  "IE:G": { iso: "IE-G", why: "the county council's part of County Galway (IE-G); the city's council is drawn apart" },
  "IE:G_2": { iso: "IE-G", why: "Galway City, drawn apart from the county it lies in (IE-G)" },
  "IE:LK": { iso: "IE-LK", why: "the county's part of County Limerick (IE-LK); the city, merged with it in 2014, is drawn apart" },
  "IE:LK_2": { iso: "IE-LK", why: "Limerick City, merged with the county (IE-LK) in 2014 and drawn apart" },
  "IE:WD": { iso: "IE-WD", why: "the county's part of County Waterford (IE-WD); the city, merged with it in 2014, is drawn apart" },
  "IE:WD_2": { iso: "IE-WD", why: "Waterford City, merged with the county (IE-WD) in 2014 and drawn apart" },
  "IE:TA": { iso: "IE-TA", why: "North Tipperary, merged with South Tipperary into County Tipperary (IE-TA) in 2014" },
  "IE:TA_2": { iso: "IE-TA", why: "South Tipperary, merged with North Tipperary into County Tipperary (IE-TA) in 2014" },
  "AU:NSW": { iso: "AU-NSW", why: "New South Wales, drawn without Lord Howe Island, which Natural Earth draws apart and which is part of it" },
  "AU:NSW_2": { iso: "AU-NSW", why: "Lord Howe Island, part of New South Wales (AU-NSW), drawn apart by Natural Earth" },
  "GB:ANT": NI_2015("ANN", "Antrim and Newtownabbey"),
  "GB:NTA": NI_2015("ANN", "Antrim and Newtownabbey"),
  "GB:ARD": NI_2015("AND", "Ards and North Down"),
  "GB:NDN": NI_2015("AND", "Ards and North Down"),
  "GB:ARM": NI_2015("ABC", "Armagh, Banbridge and Craigavon"),
  "GB:BNB": NI_2015("ABC", "Armagh, Banbridge and Craigavon"),
  "GB:CGV": NI_2015("ABC", "Armagh, Banbridge and Craigavon"),
  "GB:BLY": NI_2015("CCG", "Causeway Coast and Glens"),
  "GB:CLR": NI_2015("CCG", "Causeway Coast and Glens"),
  "GB:LMV": NI_2015("CCG", "Causeway Coast and Glens"),
  "GB:MYL": NI_2015("CCG", "Causeway Coast and Glens"),
  "GB:DRY": NI_2015("DRS", "Derry and Strabane"),
  "GB:STB": NI_2015("DRS", "Derry and Strabane"),
  "GB:FER": NI_2015("FMO", "Fermanagh and Omagh"),
  "GB:OMH": NI_2015("FMO", "Fermanagh and Omagh"),
  "GB:LSB": NI_2015("LBC", "Lisburn and Castlereagh"),
  "GB:CSR": NI_2015("LBC", "Lisburn and Castlereagh"),
  "GB:BLA": NI_2015("MEA", "Mid and East Antrim"),
  "GB:CKF": NI_2015("MEA", "Mid and East Antrim"),
  "GB:LRN": NI_2015("MEA", "Mid and East Antrim"),
  "GB:CKT": NI_2015("MUL", "Mid Ulster"),
  "GB:DGN": NI_2015("MUL", "Mid Ulster"),
  "GB:MFT": NI_2015("MUL", "Mid Ulster"),
  "GB:DOW": NI_2015("NMD", "Newry, Mourne and Down"),
  "GB:NYM": NI_2015("NMD", "Newry, Mourne and Down"),
  "GB:BMH": { iso: "GB-BCP", why: "Bournemouth, part of Bournemouth, Christchurch and Poole (GB-BCP) since 2019" },
  "GB:POL": { iso: "GB-BCP", why: "Poole, part of Bournemouth, Christchurch and Poole (GB-BCP) since 2019" },
  "IT:CI": { iso: "IT-SU", why: "Carbonia-Iglesias, abolished in 2016 and now part of Sud Sardegna (IT-SU)" },
  "IT:VS": { iso: "IT-SU", why: "Medio Campidano, abolished in 2016 and now part of Sud Sardegna (IT-SU)" },
  "IT:OT": { iso: "IT-SS", why: "Olbia-Tempio, abolished in 2016 and now part of Sassari (IT-SS)" },
  "IT:SS": { iso: "IT-SS", why: "Sassari as it was before 2016, when Olbia-Tempio joined it" },
  "IT:OG": { iso: "IT-NU", why: "Ogliastra, abolished in 2016 and now part of Nuoro (IT-NU)" },
  "IT:NU": { iso: "IT-NU", why: "Nuoro as it was before 2016, when Ogliastra joined it" },
  // Natural Earth's code belongs to another region of the same name.
  "CO:CUN": { iso: "CO-DC", why: "Bogotá, the Capital District (CO-DC); Natural Earth writes Cundinamarca's code on it" },
  "PE:LIM_2": { iso: "PE-LMA", why: "the Province of Lima (PE-LMA); Natural Earth writes the Lima Region's code on it" },
  // No code.
  "AU:X02~": { iso: null, why: "Jervis Bay Territory has no ISO 3166-2 code of its own" },
  "GB:NTH": { iso: null, why: "Northamptonshire was split in 2021 into North (GB-NNH) and West Northamptonshire (GB-WNH)" },
  "NO:X01~": { iso: null, why: "Bouvet Island is a country code of its own in ISO 3166-1 (BV), with no subdivision code" },
  ...Object.fromEntries(
    [
      ["01", "Østfold", "Viken (NO-30)"],
      ["02", "Akershus", "Viken (NO-30)"],
      ["06", "Buskerud", "Viken (NO-30)"],
      ["04", "Hedmark", "Innlandet (NO-34)"],
      ["05", "Oppland", "Innlandet (NO-34)"],
      ["07", "Vestfold", "Vestfold og Telemark (NO-38)"],
      ["08", "Telemark", "Vestfold og Telemark (NO-38)"],
      ["09", "Aust-Agder", "Agder (NO-42)"],
      ["10", "Vest-Agder", "Agder (NO-42)"],
      ["12", "Hordaland", "Vestland (NO-46)"],
      ["14", "Sogn og Fjordane", "Vestland (NO-46)"],
      ["16", "Sør-Trøndelag", "Trøndelag (NO-50)"],
      ["17", "Nord-Trøndelag", "Trøndelag (NO-50)"],
      ["19", "Troms", "Troms og Finnmark (NO-54)"],
      ["20", "Finnmark", "Troms og Finnmark (NO-54)"],
    ].map(([code, name, into]) => [
      `NO:${code}`,
      { iso: null, why: `${name}, a county before Norway's 2020 reform; kuni ${"1.0.0"} has the counties of 2020 to 2023, where it is part of ${into}, and not yet the codes of 2024` },
    ]),
  ),
  "PH:MAG": { iso: null, why: "Maguindanao was split in 2022 into Maguindanao del Norte (PH-MGN) and del Sur (PH-MGS)" },
  "PH:MNL": { iso: null, why: "Mandaluyong, a city of Metro Manila (PH-00), which ISO 3166-2 does not code on its own" },
  "PH:SUN": { iso: null, why: "Surigao del Norte as it was before 2006, with the Dinagat Islands (now PH-DIN) in it" },
  "RU:X01~": { iso: null, why: "a piece of the Yamal coast, 38 km², that Natural Earth draws without a name or a code" },
};

/*
 * NAMES FROM KUNI. A region that is exactly one ISO subdivision takes its names from kuni, so a map and a form
 * name a place alike. These are the few where kuni 1.0.0's name is wrong or tells two places apart worse than
 * Natural Earth's, and Natural Earth's is kept (`en`, `ja`: which of the two), with the reason.
 */
export const KUNI_NAMES_KEPT_FROM_NATURAL_EARTH = {
  "GB-PTE": { en: true, why: "kuni 1.0.0 writes Peterborough as “Peter”" },
  "NZ-MBH": { en: true, why: "kuni 1.0.0 writes Marlborough as “Marl”" },
  "TW-CYQ": { en: true, ja: true, why: "kuni 1.0.0 swaps Chiayi County (TW-CYQ) and Chiayi City (TW-CYI)" },
  "TW-CYI": { en: true, ja: true, why: "kuni 1.0.0 swaps Chiayi County (TW-CYQ) and Chiayi City (TW-CYI)" },
  "CO-DC": { en: true, why: "kuni 1.0.0 calls Bogotá “Capital District”, which names no place on a map" },
  "PH-COM": { en: true, ja: true, why: "kuni 1.0.0 has the name Davao de Oro gave up in 2019, Compostela Valley" },
  "RU-BU": { en: true, why: "kuni 1.0.0 (CLDR) writes the adjective, “Buryat”, for the Republic of Buryatia" },
  "RU-CE": { en: true, why: "kuni 1.0.0 (CLDR) writes the adjective, “Chechen”, for the Chechen Republic" },
  "RU-CU": { en: true, why: "kuni 1.0.0 (CLDR) writes the adjective, “Chuvash”, for the Chuvash Republic" },
  "RU-UD": { en: true, why: "kuni 1.0.0 (CLDR) writes the adjective, “Udmurt”, for the Udmurt Republic" },
  "RU-KB": { en: true, why: "kuni 1.0.0 (CLDR) writes the adjective, “Kabardino-Balkar”, for Kabardino-Balkaria" },
  "VN-CT": { en: true, why: "kuni 1.0.0 writes Cần Thơ without its marks, unlike every other province of Vietnam" },
};

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
  "TW:CYQ": { name: "Chiayi County" },
  "TW:CYI": { name: "Chiayi City" },
  "PH:SUN": { name: "Surigao del Norte", nameJa: "北スリガオ州" },
};

/*
 * JAPAN'S PREFECTURES, from Natural Earth's admin-1 file like every other country's regions, named from kuni.
 *
 * The eight regions (地方) a Japanese school teaches, by prefecture number, for `group`: the look-alikes a quiz
 * offers come from the same region first. Okinawa is counted in Kyushu, as the eight-region division counts it.
 * Kinki (近畿) is the region's official name; Kansai (関西), the name it goes by in speech, is carried beside it in
 * `groupAliases`, so a search or an answer finds it by either.
 */
export const JAPAN_GROUPS = [
  ["Hokkaido", "北海道地方", 1, 1],
  ["Tohoku", "東北地方", 2, 7],
  ["Kanto", "関東地方", 8, 14],
  ["Chubu", "中部地方", 15, 23],
  ["Kinki", "近畿地方", 24, 30, ["Kansai", "関西地方", "関西", "近畿"]],
  ["Chugoku", "中国地方", 31, 35],
  ["Shikoku", "四国地方", 36, 39],
  ["Kyushu", "九州地方", 40, 47],
];

/*
 * The larger parts of a country that its regions are grouped in, in English and Japanese, where Natural Earth's own
 * grouping is not the one people use. Canada's five regions, as Statistics Canada and every Canadian atlas name them,
 * in place of Natural Earth's three; the United States' four Census regions, which are Natural Earth's own, given
 * their Japanese names. By the region's chizu code.
 */
export const REGION_GROUPS = {
  CA: {
    names: { Atlantic: "大西洋沿岸諸州", Central: "中部カナダ", Prairies: "プレーリー諸州", "West Coast": "西海岸", North: "北部地域" },
    members: { NL: "Atlantic", PE: "Atlantic", NS: "Atlantic", NB: "Atlantic", QC: "Central", ON: "Central", MB: "Prairies", SK: "Prairies", AB: "Prairies", BC: "West Coast", YT: "North", NT: "North", NU: "North" },
  },
  US: {
    names: { Northeast: "北東部", Midwest: "中西部", South: "南部", West: "西部" },
  },
};

/*
 * Natural Earth 5.1.2 draws the Amami Islands (Amami Ōshima, Kikai, Tokunoshima, Okinoerabu, Yoron) inside Okinawa;
 * they are Kagoshima's. A piece of Okinawa east of this longitude and north of this latitude is moved to Kagoshima.
 * Iheya and Izena (127.9°E) and Iōtorishima (128.2°E), north of 27° but Okinawa's, stay where they are.
 */
export const AMAMI = { eastOf: 128.3, northOf: 27 };

/*
 * The mainland a map of Japan is framed to, and what goes in boxes. Okinawa is drawn in a box of its own; Kagoshima's
 * islands south of Yakushima (the Tokara and Amami Islands) and Tokyo's south of Torishima (the Ogasawara and Volcano
 * Islands and Minamitorishima) are drawn in boxes of theirs, the rest of each prefecture where it is: the way a
 * Japanese school atlas draws the country on one page.
 */
export const JAPAN_OUTLYING = {
  /** Kagoshima's pieces whose northern edge is south of this are its outlying islands. Yakushima's is 30.47°N, the Tokara Islands' at most 30.00°N. */
  kagoshimaSouthOf: 30.2,
  /** Tokyo's: Torishima reaches 30.49°N, the Ogasawara Islands 27.73°N. */
  tokyoSouthOf: 29,
};
